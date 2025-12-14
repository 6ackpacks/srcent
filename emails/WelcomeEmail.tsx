// 欢迎邮件模板
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  email?: string;
}

const SITE_URL = "https://srcent.top";

export default function WelcomeEmail({ email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>欢迎加入 Srcent - 你的 AI 产品探索之旅开始了</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Srcent</Text>
            <Text style={tagline}>AI 产品拆解平台</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>欢迎加入 Srcent！</Heading>
            <Text style={heroText}>
              感谢你的订阅，你已成功加入 AI 产品拆解日报。
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Content */}
          <Section style={content}>
            <Text style={sectionTitle}>你将获得什么？</Text>

            <Section style={featureCard}>
              <Text style={featureIcon}>📬</Text>
              <Text style={featureTitle}>每日精选推送</Text>
              <Text style={featureDesc}>
                每天早上 9:00，精选 1 款重点产品 + 4 款热门产品送达邮箱
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureIcon}>🎙️</Text>
              <Text style={featureTitle}>播客深度拆解</Text>
              <Text style={featureDesc}>
                双人对话形式的 AI 语音播客，轻松了解产品精髓
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureIcon}>🧠</Text>
              <Text style={featureTitle}>AI 智能分析</Text>
              <Text style={featureDesc}>
                设计理念、目标用户、核心功能、竞品对比一目了然
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              第一封日报将在明天早上 9:00 准时送达
            </Text>
            <Text style={ctaSubtext}>
              现在就去探索已收录的 AI 产品吧
            </Text>
            <Link href={`${SITE_URL}/directory`} style={button}>
              浏览产品目录
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              如需取消订阅，请点击
              <Link href={`${SITE_URL}/api/unsubscribe?email=${email}`} style={link}>
                这里
              </Link>
            </Text>
            <Text style={copyright}>
              © 2025 Srcent · AI 产品拆解平台
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// 样式
const main = {
  backgroundColor: "#fafafa",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "560px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const header = {
  padding: "32px 40px 24px",
  textAlign: "center" as const,
  backgroundColor: "#fff",
};

const logo = {
  fontSize: "28px",
  fontWeight: "700" as const,
  margin: "0",
  color: "#1a1a1a",
  letterSpacing: "-0.5px",
};

const tagline = {
  fontSize: "13px",
  color: "#f97316",
  margin: "4px 0 0",
  fontWeight: "500" as const,
};

const heroSection = {
  padding: "24px 40px 32px",
  textAlign: "center" as const,
  backgroundColor: "#fff",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "26px",
  fontWeight: "700" as const,
  margin: "0 0 12px",
  lineHeight: "1.3",
};

const heroText = {
  color: "#666",
  fontSize: "15px",
  margin: "0",
  lineHeight: "1.5",
};

const divider = {
  borderColor: "#eee",
  margin: "0",
};

const content = {
  padding: "32px 40px",
  backgroundColor: "#fafafa",
};

const sectionTitle = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 20px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const featureCard = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "12px",
  border: "1px solid #eee",
};

const featureIcon = {
  fontSize: "24px",
  margin: "0 0 8px",
};

const featureTitle = {
  fontSize: "15px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 6px",
};

const featureDesc = {
  fontSize: "13px",
  color: "#666",
  margin: "0",
  lineHeight: "1.5",
};

const ctaSection = {
  padding: "32px 40px 40px",
  textAlign: "center" as const,
  backgroundColor: "#fff",
};

const ctaText = {
  fontSize: "15px",
  color: "#1a1a1a",
  margin: "0 0 4px",
  fontWeight: "500" as const,
};

const ctaSubtext = {
  fontSize: "14px",
  color: "#888",
  margin: "0 0 24px",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 28px",
};

const footer = {
  padding: "24px 40px",
  backgroundColor: "#fafafa",
  borderTop: "1px solid #eee",
};

const footerText = {
  color: "#888",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const copyright = {
  color: "#aaa",
  fontSize: "11px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#f97316",
  textDecoration: "underline",
};
