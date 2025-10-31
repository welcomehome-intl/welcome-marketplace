import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Explicitly pass environment variables to client
  env: {
    ACCESS_CONTROL_ADDRESS: process.env.ACCESS_CONTROL_ADDRESS,
    OWNERSHIP_REGISTRY_ADDRESS: process.env.OWNERSHIP_REGISTRY_ADDRESS,
    PROPERTY_FACTORY_ADDRESS: process.env.PROPERTY_FACTORY_ADDRESS,
    MARKETPLACE_ADDRESS: process.env.MARKETPLACE_ADDRESS,
    PAYMENT_TOKEN_ADDRESS: process.env.PAYMENT_TOKEN_ADDRESS,
    NEXT_PUBLIC_HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK,
    NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL: process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL,
    NEXT_PUBLIC_HEDERA_MAINNET_RPC_URL: process.env.NEXT_PUBLIC_HEDERA_MAINNET_RPC_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
