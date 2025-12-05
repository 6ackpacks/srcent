// TTS 服务模块 - Coze 播客工作流
// 使用 Coze API 将文本转换为双人播客音频

import { createClient } from '@supabase/supabase-js';

// Supabase 客户端初始化
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export interface AudioResult {
  url: string;      // 音频文件 URL
  duration: number; // 时长 (秒)
}

// Coze API 配置
const COZE_API_URL = 'https://api.coze.cn/v1/workflow/stream_run';
const COZE_WORKFLOW_ID = '7579302257063575602';

/**
 * 生成播客音频
 * @param text 要转换的文本内容 (播客文稿，最多15000字)
 * @param slug 产品的 slug，用于命名音频文件
 * @returns 音频 URL 和时长
 */
export async function generateAudio(text: string, slug: string): Promise<AudioResult> {
  const apiKey = process.env.COZE_API_KEY;

  // 如果配置了 Coze API Key，使用真实 API
  if (apiKey) {
    return generatePodcastWithCoze(text, slug, apiKey);
  }

  // 否则使用 Mock 模式
  return generateMockAudio(text, slug);
}

/**
 * 使用 Coze 工作流生成播客音频
 */
async function generatePodcastWithCoze(
  text: string,
  slug: string,
  apiKey: string
): Promise<AudioResult> {
  console.log(`  🔊 [TTS] 调用 Coze 播客工作流 API...`);
  console.log(`  📝 [TTS] 文本长度: ${text.length} 字符`);

  // 文本长度限制 (15000字)
  const maxLength = 15000;
  if (text.length > maxLength) {
    console.warn(`  ⚠️ [TTS] 文本超过 ${maxLength} 字，将被截断`);
    text = text.slice(0, maxLength);
  }

  const requestBody = {
    workflow_id: COZE_WORKFLOW_ID,
    parameters: {
      input: text
    }
  };

  try {
    const response = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coze API HTTP error: ${response.status} - ${errorText}`);
    }

    // 处理流式响应
    const result = await parseStreamResponse(response);

    if (!result.podcastUrl) {
      throw new Error('未获取到播客音频 URL');
    }

    console.log(`  ✓ [TTS] 播客生成成功`);
    console.log(`  🔗 [TTS] 音频 URL: ${result.podcastUrl.slice(0, 80)}...`);

    // 估算时长 (中文约 200 字/分钟 for podcast dialogue)
    const estimatedDuration = Math.ceil((text.length / 200) * 60);

    return {
      url: result.podcastUrl,
      duration: result.duration || estimatedDuration
    };

  } catch (error) {
    console.error(`  ✗ [TTS] Coze API 调用失败:`, error);
    throw error;
  }
}

/**
 * 解析 Coze 流式响应
 */
async function parseStreamResponse(response: Response): Promise<{
  podcastUrl: string | null;
  duration: number | null;
}> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let podcastUrl: string | null = null;
  let duration: number | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按行处理 SSE 数据
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留未完成的行

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // 解析 SSE 事件
        if (trimmedLine.startsWith('data:')) {
          const dataStr = trimmedLine.slice(5).trim();
          if (!dataStr || dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);

            // 检查是否有错误
            if (data.error_code) {
              console.error(`  ✗ [TTS] Coze 返回错误:`, data.error_message || data.msg);
              continue;
            }

            // Coze 工作流响应格式: { content: "{\"output\":\"url...\"}", node_is_finish: true }
            if (data.content && typeof data.content === 'string' && data.content !== '{}') {
              try {
                const contentData = JSON.parse(data.content);

                // 直接检查 output 字段 (可能是 URL 字符串)
                if (contentData.output) {
                  const outputValue = contentData.output;

                  // output 可能直接是 URL 字符串
                  if (typeof outputValue === 'string' && outputValue.startsWith('http')) {
                    podcastUrl = outputValue;
                    console.log(`  ✓ [TTS] 获取到播客 URL (从 content.output)`);
                  }
                  // 或者是包含 podcast_url 的对象
                  else if (typeof outputValue === 'object') {
                    if (outputValue.podcast_url) {
                      podcastUrl = outputValue.podcast_url;
                      console.log(`  ✓ [TTS] 获取到播客 URL (从 content.output.podcast_url)`);
                    }
                    if (outputValue.data?.content?.podcast_url) {
                      podcastUrl = outputValue.data.content.podcast_url;
                      console.log(`  ✓ [TTS] 获取到播客 URL (从 content.output.data.content.podcast_url)`);
                    }
                  }
                }

                // 也检查 output2
                if (contentData.output2) {
                  const output2Value = contentData.output2;

                  if (!podcastUrl && typeof output2Value === 'string' && output2Value.startsWith('http')) {
                    podcastUrl = output2Value;
                    console.log(`  ✓ [TTS] 获取到播客 URL (从 content.output2)`);
                  }
                  else if (!podcastUrl && typeof output2Value === 'object') {
                    if (output2Value.podcast_url) {
                      podcastUrl = output2Value.podcast_url;
                      console.log(`  ✓ [TTS] 获取到播客 URL (从 content.output2.podcast_url)`);
                    }
                  }
                }
              } catch {
                // content 解析失败，忽略
              }
            }

            // 备用: 检查 data 字段 (旧格式)
            if (!podcastUrl && data.data) {
              try {
                const outputData = typeof data.data === 'string'
                  ? JSON.parse(data.data)
                  : data.data;

                if (outputData.output) {
                  const output = typeof outputData.output === 'string'
                    ? (outputData.output.startsWith('http') ? outputData.output : JSON.parse(outputData.output))
                    : outputData.output;

                  if (typeof output === 'string' && output.startsWith('http')) {
                    podcastUrl = output;
                    console.log(`  ✓ [TTS] 获取到播客 URL (从 data.output)`);
                  } else if (output.data?.content?.podcast_url) {
                    podcastUrl = output.data.content.podcast_url;
                    console.log(`  ✓ [TTS] 获取到播客 URL`);
                  }
                }
              } catch {
                // 解析失败，忽略
              }
            }
          } catch {
            // JSON 解析失败，忽略
          }
        }

        // 检查事件类型
        if (trimmedLine.startsWith('event:')) {
          const eventType = trimmedLine.slice(6).trim();
          if (eventType === 'Done') {
            console.log(`  ✓ [TTS] 工作流执行完成`);
          } else if (eventType === 'Error') {
            console.error(`  ✗ [TTS] 工作流执行出错`);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { podcastUrl, duration };
}

/**
 * Mock 模式 - 不调用真实 API
 */
async function generateMockAudio(text: string, slug: string): Promise<AudioResult> {
  console.log(`  🔊 [TTS Mock] 生成播客音频: ${slug}`);
  console.log(`  🔊 [TTS Mock] 文本长度: ${text.length} 字符`);

  // 估算音频时长 (中文约 200 字/分钟 for podcast dialogue)
  const estimatedDuration = Math.ceil((text.length / 200) * 60);

  // 创建一个最小的有效 MP3 文件头 (用于测试)
  const mockMp3Header = Buffer.from([
    0xFF, 0xFB, 0x90, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00
  ]);

  // 尝试上传到 Supabase Storage
  const supabase = getSupabaseClient();
  const fileName = `podcasts/${slug}-${Date.now()}.mp3`;

  const { error } = await supabase.storage
    .from('product-assets')
    .upload(fileName, mockMp3Header, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (error) {
    console.warn(`  ⚠️  请确保 Supabase Storage 中已创建 "product-assets" bucket`);
    return {
      url: `https://placeholder.supabase.co/podcasts/${slug}.mp3`,
      duration: estimatedDuration
    };
  }

  const { data } = supabase.storage
    .from('product-assets')
    .getPublicUrl(fileName);

  console.log(`  ✓ [TTS Mock] 播客已上传: ${data.publicUrl}`);
  console.log(`  ✓ [TTS Mock] 预估时长: ${estimatedDuration} 秒`);

  return {
    url: data.publicUrl,
    duration: estimatedDuration
  };
}

/**
 * 检查 TTS 配置状态
 */
export function checkTTSConfig(): { available: boolean; mode: 'coze' | 'mock' } {
  if (process.env.COZE_API_KEY) {
    return { available: true, mode: 'coze' };
  }
  return { available: true, mode: 'mock' };
}
