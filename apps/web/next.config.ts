import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  reactCompiler: true,
};

export default nextConfig;
