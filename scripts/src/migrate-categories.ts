// 分类迁移脚本 - 将旧分类映射到新分类
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量（从项目根目录）
dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 旧分类 -> 新分类的映射关系
const categoryMapping: Record<string, string> = {
  // 旧分类映射
  '文本': '写作辅助',
  '图像': '图像生成',
  '视频': '视频创作',
  '音频': '音频处理',
  '代码': '编程开发',
  '数据': '效率工具',
  '设计': '图像生成',
  '效率': '效率工具',
  '综合': '通用助手',
  // 可能的其他旧分类
  'AI助手': '通用助手',
  '聊天': '通用助手',
  '搜索': '智能搜索',
  '知识': '知识管理',
  '学习': '知识管理',
  '写作': '写作辅助',
  '硬件': '智能硬件',
  '陪伴': '虚拟陪伴',
  'Agent': 'Agent构建',
  '3D': '3D生成',
  '科研': '科研辅助',
};

// 新分类列表（用于验证）
const validCategories = [
  '通用助手',
  '图像生成',
  '视频创作',
  '音频处理',
  '编程开发',
  '智能搜索',
  '知识管理',
  '写作辅助',
  '智能硬件',
  '虚拟陪伴',
  'Agent构建',
  '效率工具',
  '3D生成',
  '科研辅助',
  '其他类型',
];

async function migrateCategories() {
  console.log('开始分类迁移...\n');

  // 1. 获取所有产品
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category');

  if (error) {
    console.error('获取产品失败:', error);
    return;
  }

  console.log(`找到 ${products.length} 个产品\n`);

  let updated = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const product of products) {
    const oldCategory = product.category;

    // 如果已经是新分类，跳过
    if (validCategories.includes(oldCategory)) {
      unchanged++;
      continue;
    }

    // 查找映射
    let newCategory = categoryMapping[oldCategory];

    // 如果没有找到映射，设为"其他类型"
    if (!newCategory) {
      if (oldCategory) {
        console.log(`⚠️  "${product.name}" 的分类 "${oldCategory}" 未找到映射，设为"其他类型"`);
      }
      newCategory = '其他类型';
    }

    // 更新数据库
    const { error: updateError } = await supabase
      .from('products')
      .update({ category: newCategory })
      .eq('id', product.id);

    if (updateError) {
      console.error(`❌ 更新 "${product.name}" 失败:`, updateError);
      skipped++;
    } else {
      console.log(`✅ "${product.name}": ${oldCategory || '(空)'} -> ${newCategory}`);
      updated++;
    }
  }

  console.log('\n迁移完成！');
  console.log(`- 已更新: ${updated}`);
  console.log(`- 未变更: ${unchanged}`);
  console.log(`- 跳过/失败: ${skipped}`);
}

// 运行迁移
migrateCategories().catch(console.error);
