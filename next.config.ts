import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle ADK-TS and other server-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        util: false,
        buffer: false,
        events: false,
        child_process: false,
        dns: false,
        http2: false,
        'fs/promises': false,
        'diagnostics_channel': false,
      };
    }

    // Exclude ADK-TS and related packages from client-side bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        '@iqai/adk': 'commonjs @iqai/adk',
        '@grpc/grpc-js': 'commonjs @grpc/grpc-js',
        '@google-cloud/storage': 'commonjs @google-cloud/storage',
        'google-auth-library': 'commonjs google-auth-library',
        'gcp-metadata': 'commonjs gcp-metadata',
        'gtoken': 'commonjs gtoken',
      });
    }

    return config;
  },
  serverExternalPackages: [
    '@iqai/adk',
    '@grpc/grpc-js',
    '@google-cloud/storage',
    'google-auth-library',
    'gcp-metadata',
    'gtoken',
  ],
};

export default nextConfig;
