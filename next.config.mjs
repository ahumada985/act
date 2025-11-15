import withPWA from 'next-pwa';

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
  // Optimizaciones de performance
  swcMinify: true,
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    'recharts': {
      transform: 'recharts/es6/{{member}}',
    },
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'leaflet'],
  },
};

export default withPWA({
  dest: 'public',
  register: false, // NO auto-register, lo hacemos manual
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  sw: 'sw.js',
  swSrc: 'public/sw.js', // Usar nuestro SW personalizado
})(nextConfig);
