/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SEED_PHRASE: process.env.SEED_PHRASE,
    NEXT_PUBLIC_USER_RECORDS_ADDRESS: process.env.NEXT_PUBLIC_USER_RECORDS_ADDRESS,
    NEXT_PUBLIC_NFT_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_NFT_REGISTRY_ADDRESS,
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS,
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    NEXT_PUBLIC_THIRDWEB_SECRET_KEY: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY,
    NEXT_PUBLIC_NFT_AUCTION_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_NFT_AUCTION_REGISTRY_ADDRESS,
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
