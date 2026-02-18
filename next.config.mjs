/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pdf-parse', 'pdfkit', '@google/generative-ai'],
}

export default nextConfig
