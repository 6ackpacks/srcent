// 取消订阅 API
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "缺少邮箱参数" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Unsubscribe error:", error);
      return NextResponse.json(
        { error: "取消订阅失败" },
        { status: 500 }
      );
    }

    // 重定向到取消订阅成功页面
    return NextResponse.redirect(new URL("/unsubscribe/success", request.url));
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "缺少邮箱参数" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Unsubscribe error:", error);
      return NextResponse.json(
        { error: "取消订阅失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "已成功取消订阅",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
