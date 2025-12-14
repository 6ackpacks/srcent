// 每日产品拆解日报邮件模板
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
  Row,
  Column,
} from "@react-email/components";

interface Product {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  logo_url?: string;
  has_deep_dive?: boolean;
}

interface DailyDigestEmailProps {
  email?: string;
  date?: string;
  products?: Product[];
  featuredProduct?: Product;
}

const SITE_URL = "https://srcent.top";

export default function DailyDigestEmail({
  email,
  date = new Date().toLocaleDateString("zh-CN"),
  products = [],
  featuredProduct,
}: DailyDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Srcent AI 产品日报 · {date}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={logo}>Srcent</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={dateText}>{date}</Text>
              </Column>
            </Row>
          </Section>

          {/* Featured Product */}
          {featuredProduct && (
            <Section style={featuredSection}>
              <Text style={featuredLabel}>今日推荐</Text>
              <Heading style={featuredTitle}>{featuredProduct.name}</Heading>
              <Text style={featuredTagline}>{featuredProduct.tagline}</Text>
              <Text style={featuredCategory}>{featuredProduct.category}</Text>

              <Section style={featuredActions}>
                <Link
                  href={`${SITE_URL}/product/${featuredProduct.slug}`}
                  style={primaryButton}
                >
                  查看详情
                </Link>
                {featuredProduct.has_deep_dive && (
                  <Link
                    href={`${SITE_URL}/product/${featuredProduct.slug}/deep-dive`}
                    style={secondaryButton}
                  >
                    收听播客拆解
                  </Link>
                )}
              </Section>
            </Section>
          )}

          {/* Product List */}
          {products.length > 0 && (
            <Section style={productListSection}>
              <Text style={sectionLabel}>更多精选</Text>

              {products.map((product, index) => (
                <Link
                  key={index}
                  href={`${SITE_URL}/product/${product.slug}`}
                  style={productCardLink}
                >
                  <Section style={productCard}>
                    <Row>
                      <Column style={{ width: "100%" }}>
                        <Text style={productName}>
                          {product.name}
                          {product.has_deep_dive && (
                            <span style={podcastBadge}>播客</span>
                          )}
                        </Text>
                        <Text style={productTagline}>{product.tagline}</Text>
                        <Text style={productMeta}>{product.category}</Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>想发现更多 AI 产品？</Text>
            <Link href={`${SITE_URL}/directory`} style={ctaButton}>
              浏览全部产品
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              你收到这封邮件是因为你订阅了 Srcent AI 产品日报
            </Text>
            <Text style={footerLinks}>
              <Link href={`${SITE_URL}/api/unsubscribe?email=${email}`} style={footerLink}>
                取消订阅
              </Link>
              <span style={footerDivider}>·</span>
              <Link href={SITE_URL} style={footerLink}>
                访问网站
              </Link>
            </Text>
            <Text style={copyright}>© 2025 Srcent · AI 产品拆解平台</Text>
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
  padding: "20px 0",
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
  padding: "24px 32px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #eee",
};

const logo = {
  fontSize: "22px",
  fontWeight: "700" as const,
  margin: "0",
  color: "#1a1a1a",
  letterSpacing: "-0.5px",
};

const dateText = {
  fontSize: "13px",
  color: "#888",
  margin: "0",
};

const featuredSection = {
  padding: "32px",
  backgroundColor: "#fffbf7",
  borderBottom: "1px solid #fee2cc",
};

const featuredLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#f97316",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const featuredTitle = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#1a1a1a",
  margin: "0 0 8px",
  lineHeight: "1.3",
};

const featuredTagline = {
  fontSize: "15px",
  color: "#555",
  margin: "0 0 8px",
  lineHeight: "1.5",
};

const featuredCategory = {
  fontSize: "12px",
  color: "#888",
  margin: "0 0 20px",
};

const featuredActions = {
  marginTop: "4px",
};

const primaryButton = {
  backgroundColor: "#f97316",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "10px 20px",
  display: "inline-block",
  marginRight: "10px",
};

const secondaryButton = {
  backgroundColor: "#fff",
  border: "1px solid #f97316",
  borderRadius: "6px",
  color: "#f97316",
  fontSize: "13px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "9px 16px",
  display: "inline-block",
};

const productListSection = {
  padding: "28px 32px",
  backgroundColor: "#fff",
};

const sectionLabel = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const productCardLink = {
  textDecoration: "none",
  display: "block",
};

const productCard = {
  padding: "16px",
  backgroundColor: "#f8f8f8",
  borderRadius: "8px",
  marginBottom: "10px",
  border: "1px solid #eee",
};

const productName = {
  fontSize: "15px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 4px",
};

const podcastBadge = {
  fontSize: "10px",
  fontWeight: "500" as const,
  color: "#f97316",
  backgroundColor: "#fff7ed",
  padding: "2px 6px",
  borderRadius: "4px",
  marginLeft: "8px",
};

const productTagline = {
  fontSize: "13px",
  color: "#666",
  margin: "0 0 6px",
  lineHeight: "1.4",
};

const productMeta = {
  fontSize: "11px",
  color: "#999",
  margin: "0",
};

const divider = {
  borderColor: "#eee",
  margin: "0",
};

const ctaSection = {
  padding: "28px 32px",
  textAlign: "center" as const,
  backgroundColor: "#fff",
};

const ctaText = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 16px",
};

const ctaButton = {
  backgroundColor: "#1a1a1a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "10px 24px",
  display: "inline-block",
};

const footer = {
  padding: "24px 32px",
  backgroundColor: "#fafafa",
  borderTop: "1px solid #eee",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#888",
  margin: "0 0 8px",
  lineHeight: "1.5",
};

const footerLinks = {
  fontSize: "12px",
  margin: "0 0 12px",
};

const footerLink = {
  color: "#f97316",
  textDecoration: "none",
};

const footerDivider = {
  color: "#ccc",
  margin: "0 8px",
};

const copyright = {
  fontSize: "11px",
  color: "#aaa",
  margin: "0",
};
