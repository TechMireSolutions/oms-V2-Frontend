/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages that ship raw TS/TSX.
  transpilePackages: ["@oms/ui", "@oms/dto"],
  experimental: { typedRoutes: true }
};
export default nextConfig;
