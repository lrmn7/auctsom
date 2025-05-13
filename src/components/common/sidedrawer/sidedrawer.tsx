import React from 'react';
import { X, Wallet } from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  walletAddress?: string;
  isConnecting: boolean;
  onWalletClick: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ 
  isOpen, 
  onClose, 
  isAuthenticated, 
  walletAddress, 
  isConnecting, 
  onWalletClick 
}) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-[#212121]/80 backdrop-blur-md text-white z-50 transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            Hello World
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-800">
          <button
            onClick={onWalletClick}
            disabled={isConnecting}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none shadow-lg ${
              isAuthenticated
                ? 'bg-transparent hover:bg-transparent'
                : 'bg-transparent hover:bg-transparent'
            }`}
          >
            <Wallet className="w-5 h-5" />
            {isAuthenticated ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem label="Explore" href="/explore" />
          <NavItem label="Live AuctSom" href="/auctions" />
          <NavItem label="Create" href="/create" />
          <NavItem label="My NFTs" href="/my_nfts" />
          <NavItem label="Activity" href="/activity" />
          <NavItem label="Airdrop" href="/airdrop" />
        </nav>
      </div>
    </>
  );
};

interface NavItemProps {
  label: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ label, href }) => {
  return (
    <a 
      href={href}
      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
    >
      <span>{label}</span>
    </a>
  );
};

export default SideDrawer;