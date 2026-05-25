/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from trying to bundle native Node modules
  serverExternalPackages: ['pg', 'bcryptjs'],
  // Configure path aliases similar to vite config
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
      '@shared': require('path').resolve(__dirname, './shared'),
    };
    return config;
  },
};

module.exports = nextConfig;
