// 邮箱订阅 API
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

// 邮箱格式验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 检查是否已订阅
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "该邮箱已订阅" },
          { status: 400 }
        );
      }

      // 重新激活已取消的订阅
      await supabase
        .from("subscribers")
        .update({
          status: "active",
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq("id", existing.id);
    } else {
      // 新订阅
      const { error: insertError } = await supabase
        .from("subscribers")
        .insert({
          email: email.toLowerCase(),
          status: "active",
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: "订阅失败，请稍后重试" },
          { status: 500 }
        );
      }
    }

    // 获取今日推荐产品（用于弹窗展示和邮件发送）
    // 优先获取有深度拆解的产品
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
    const otherProducts = recentProducts?.filter(
      (p) => p.slug !== featuredProduct?.slug
    ).slice(0, 4) || [];

    // 发送首期日报邮件（替代欢迎邮件）
    if (process.env.RESEND_API_KEY && (featuredProduct || otherProducts.length > 0)) {
      const date = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Srcent <onboarding@resend.dev>",
          to: email.toLowerCase(),
          subject: `欢迎订阅！这是你的首期 AI 产品日报 - ${date}`,
          react: DailyDigestEmail({
            email: email.toLowerCase(),
            date,
            featuredProduct: featuredProduct || undefined,
            products: otherProducts,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // 邮件发送失败不影响订阅成功
      }
    }

    return NextResponse.json({
      success: true,
      message: "订阅成功！首期日报已发送到你的邮箱。",
      featuredProduct,
      otherProductsCount: otherProducts.length,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
