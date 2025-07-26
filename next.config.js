/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle optional dependencies that may not be available in serverless environments
    config.externals = config.externals || [];
    
    if (isServer) {
      config.externals.push({
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
        'encoding': 'commonjs encoding'
      });
    }
    
    // Fallback for missing optional dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'encoding': false,
      'bufferutil': false,
      'utf-8-validate': false,
    };
    
    return config;
  },
}

module.exports = nextConfig 