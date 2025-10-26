/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['udloynzfnktwoaanfjzo.supabase.co'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
