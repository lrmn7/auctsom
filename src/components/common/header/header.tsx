import React, { useState, useEffect } from "react";
import { Wallet, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/authcontext";
import SideDrawer from "../sidedrawer/sidedrawer";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");
  const {
    isAuthenticated,
    walletAddress,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useAuth();
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const handleWalletButtonClick = async () => {
    if (isAuthenticated) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };
  const handleLogoClick = () => {
    router.push("/");
  };

  const toggleSideDrawer = () => {
    setIsSideDrawerOpen(!isSideDrawerOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 p-4 bg-[#212121]/80 backdrop-blur-md text-white shadow-md shadow-[#ffffff]/50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={handleLogoClick}
          >
            <h1 className="text-3xl font-bold">
              <span className="text-white text-shadow-glow">AuctSom</span>
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <NavLink href="/explore" label="Explore" />
            <NavLink href="/auctions" label="Live AuctSom" />
            <NavLink href="/create" label="Create" />
            <NavLink href="/my_nfts" label="My NFTs" />
            <NavLink href="/my_ended_auctions" label="Ended AuctSom" />
            <NavLink href="/activity" label="Activity" />
            <NavLink href="/airdrop" label="Airdrop" />
          </nav>

          <div className="flex items-center space-x-4">
            <a
              href="https://x.com/Somnia_Network"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg border-2 border-gray-300 transition duration-300 transform hover:scale-105 focus:outline-none shadow-lg bg-transparent hover:bg-transparent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 512 512"
                className="w-5 h-5"
              >
                <path d="M216.1 211.3L9.4 0h117.2l142.4 149.6L390.1 0h112.4L327.7 186.6 512 407.3H395.1L266.3 246.4 98.3 512H0L216.1 211.3z" />
              </svg>
            </a>
            <button
              onClick={handleWalletButtonClick}
              disabled={isConnecting}
              className={`hidden md:flex items-center px-4 py-2 rounded-lg border-2 border-gray-300 transition duration-300 transform hover:scale-105 focus:outline-none shadow-lg ${
                isAuthenticated
                  ? "bg-transparent hover:bg-transparent"
                  : "bg-transparent hover:bg-transparent"
              }`}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isAuthenticated
                ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
                : isConnecting
                ? "Connecting..."
                : "Connect Wallet"}
            </button>
            {/* x/twitter button */}

            {/* menu button for mobile */}
            <button
              onClick={toggleSideDrawer}
              className="md:hidden p-2 hover:bg-purple-800/50 rounded-full transition duration-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      <SideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        walletAddress={walletAddress ?? undefined}
        isConnecting={isConnecting}
        onWalletClick={handleWalletButtonClick}
      />
    </>
  );
};

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      className="relative py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-gray-200 hover:text-white transition duration-300">
        {label}
      </span>
      <span
        className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 to-gray-500 transform origin-left transition-transform duration-300 ${
          isHovered ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </a>
  );
};

export default Header;
