"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/common/header/header";
import Homepage from "../components/common/homepage/homepage";
import { AuthProvider, useAuth } from "../context/authcontext";
import SideDrawer from "../components/common/sidedrawer/sidedrawer";

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

function MainContent() {
  const {
    isAuthenticated,
    walletAddress,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/explore");
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


