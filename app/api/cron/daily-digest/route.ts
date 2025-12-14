// 每日产品日报推送 API (Vercel Cron Job)
// 每天早上 9:00 (UTC+8) 自动执行
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import DailyDigestEmail from "@/emails/DailyDigestEmail";

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 验证 Cron Secret（防止未授权调用）
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // 如果没有设置 CRON_SECRET，跳过验证（开发环境）
  if (!cronSecret) {
    return true;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // 验证请求来源
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("📧 开始发送每日产品日报...");

    // 1. 获取所有活跃订阅者
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("status", "active");

    if (subError) {
      console.error("获取订阅者失败:", subError);
      return NextResponse.json(
        { error: "获取订阅者失败" },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("没有活跃订阅者");
      return NextResponse.json({
        success: true,
        message: "没有活跃订阅者",
        sent: 0,
      });
    }

    console.log(`找到 ${subscribers.length} 个活跃订阅者`);

    // 2. 获取最新的产品（最近24小时内更新的，或者随机选取）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 获取有深度拆解的产品作为推荐
    const { data: featuredProducts } = await supabase
      .from("products")
      .select("name, slug, tagline, category, logo_url, has_deep_dive")
      .eq("has_deep_dive", true)
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1);

    // 获取其他最新产品
    const { data: recentProducts } = await supabase
      .from("products")
      .select("name, slug, tagline, category, logo_url, has_deep_dive")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5);

    const featuredProduct = featuredProducts?.[0] || null;
    const products = recentProducts?.filter(
      (p) => p.slug !== featuredProduct?.slug
    ).slice(0, 4) || [];

    // 如果没有产品，跳过发送
    if (!featuredProduct && products.length === 0) {
      console.log("没有可推送的产品");
      return NextResponse.json({
        success: true,
        message: "没有可推送的产品",
        sent: 0,
      });
    }

    // 3. 检查是否配置了 Resend API Key
    if (!process.env.RESEND_API_KEY) {
      console.log("未配置 RESEND_API_KEY，跳过邮件发送");
      return NextResponse.json({
        success: true,
        message: "未配置邮件服务",
        sent: 0,
        subscribers: subscribers.length,
      });
    }

    // 4. 批量发送邮件
    const date = new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let successCount = 0;
    let failCount = 0;

    // Resend 批量发送（每批最多 100 封）
    const batchSize = 100;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const promises = batch.map(async (subscriber) => {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "srcent <onboarding@resend.dev>",
            to: subscriber.email,
            subject: `srcent AI 产品日报 - ${date}`,
            react: DailyDigestEmail({
              email: subscriber.email,
              date,
              featuredProduct: featuredProduct || undefined,
              products,
            }),
          });
          successCount++;
        } catch (error) {
          console.error(`发送给 ${subscriber.email} 失败:`, error);
          failCount++;
        }
      });

      await Promise.all(promises);

      // 批次间延迟，避免触发速率限制
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ 日报发送完成: 成功 ${successCount}, 失败 ${failCount}`);

    return NextResponse.json({
      success: true,
      message: `日报发送完成`,
      sent: successCount,
      failed: failCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("日报发送错误:", error);
    return NextResponse.json(
      { error: "日报发送失败" },
      { status: 500 }
    );
  }
}

// 手动触发（用于测试）
export async function POST(request: NextRequest) {
  // 验证管理员权限（简单的密钥验证）
  const { searchParams } = new URL(request.url);
  const adminKey = searchParams.get("key");

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 调用 GET 方法执行发送
  return GET(request);
}
