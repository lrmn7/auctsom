import React from "react";
import { Wallet, Gem, Clock } from "lucide-react";
import { useAuth } from "../../../context/authcontext";

const Homepage = () => {
  const {
    connectWallet,
    disconnectWallet,
    walletAddress,
    isAuthenticated,
    isConnecting,
  } = useAuth();

  const handleWalletClick = () => {
    if (isAuthenticated) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <h1 className="text-6xl font-bold mb-4 text-white">AuctSom NFT</h1>
        <p className="text-2xl mb-8 text-purple-200">
          Turn your art into NFT. Let the bidding begin!
        </p>
        <div className="flex gap-4 mb-12">
          <button
            onClick={handleWalletClick}
            className={`px-8 py-3 border-2 border-gray-300 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none shadow-lg ${
              isAuthenticated
                ? "bg-transparent hover:bg-transparent"
                : "bg-transparent hover:bg-transparent"
            }`}
          >
            {isConnecting
              ? "Connecting..."
              : isAuthenticated
              ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Why Choose AuctSom Auctions
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Wallet className="w-8 h-8 text-gray-400" />}
            title="Own It, For Real"
            description="Blockchain-backed transactions mean your NFT is 100% yours — no middlemen."
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8 text-gray-400" />}
            title="Auction It Live"
            description="Drop your NFT, let the world bid in real-time. No delays, no drama."
          />
          <FeatureCard
            icon={<Gem className="w-8 h-8 text-gray-400" />}
            title="Art You Can’t Ignore"
            description="Explore rare, curated pieces that stand out from the noise."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#212121] py-16 shadow-2xl shadow-[#ffffff]/70">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join the Community on Discord!
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            connect with creators, builders, and pioneers in the Somnia Network
            and let’s shape the future together.
          </p>
          <button
      onClick={() => window.open("https://discord.gg/somnia", "_blank")}
            className="px-8 py-3 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition duration-300 font-bold"
          >
            Discord Server
          </button>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="p-6 bg-gray-800/20 rounded-lg hover:bg-gray-700/30 transition duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-200">{description}</p>
  </div>
);

interface StatCardProps {
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => (
  <div className="p-4">
    <div className="text-3xl font-bold mb-2 text-purple-400">{number}</div>
    <div className="text-purple-200">{label}</div>
  </div>
);

export default Homepage;
