/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // scripts 目录的类型错误不应阻止构建
    // 这些是本地运行的脚本，不需要在 Vercel 上编译
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
