import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})({
  // Turbopack 대신 webpack 사용
  turbo: {
    enabled: false,
  },
});

export default nextConfig;
