'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/common/header/header';
import Homepage from '../components/common/homepage/homepage';
import { AuthProvider, useAuth } from '../context/authcontext';
import SideDrawer from '../components/common/sidedrawer/sidedrawer';
import { TrendingUp, Clock, Flame } from 'lucide-react';

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

function MainContent() {
  const { isAuthenticated, walletAddress, connectWallet, disconnectWallet, isConnecting } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/explore');
    }
  }, [isAuthenticated, router]);

  const handleWalletClick = async () => {
    if (isAuthenticated) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => setIsDrawerOpen(true)} />
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        walletAddress={walletAddress ?? undefined}
        isConnecting={isConnecting}
        onWalletClick={handleWalletClick}
      />
      <Homepage />
    </div>
  );
}

const NFTCard = ({ compact = false }) => {
  return (
    <div className={`bg-gray-800/50 rounded-xl overflow-hidden hover:shadow-lg transition duration-300 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="aspect-square w-full bg-purple-900/50 rounded-lg mb-3">
        <img 
          src="/api/placeholder/400/400" 
          alt="NFT" 
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">Crypto Art #1234</h3>
        <div className="flex justify-between items-center">
          <span className="text-purple-400">Current Bid</span>
          <span className="text-white font-bold">2.5 ETH</span>
        </div>
        {!compact && (
          <div className="mt-3 flex justify-between items-center text-sm">
            <span className="text-gray-400">Ends in: 12h 30m</span>
            <button className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition duration-300">
              Place Bid
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface CollectionItemProps {
  rank: number;
  name: string;
  volume: string;
  change: string;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ rank, name, volume, change }) => {
  const isPositive = change.startsWith('+');
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition duration-300">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">#{rank}</span>
        <div>
          <h4 className="text-white font-medium">{name}</h4>
          <span className="text-sm text-gray-400">Volume: {volume}</span>
        </div>
      </div>
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {change}
      </span>
    </div>
  );
};