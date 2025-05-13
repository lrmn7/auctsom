"use client";

import React from "react";
import { AuthProvider, useAuth } from "../../context/authcontext";
import Header from "../../components/common/header/header";

export default function Airdrop() {
  return (
    <AuthProvider>
      <AirdropContent />
    </AuthProvider>
  );
}

function AirdropContent() {
  const { isAuthenticated, isConnecting } = useAuth();

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212121]/80 backdrop-blur-md">
        <p className="text-white text-lg">Connecting...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
        <Header onMenuClick={() => {}} />
        <main className="container mx-auto px-4 py-8">
          <p className="text-white text-center">
            Please connect your wallet to view airdrop details.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]/80 backdrop-blur-md">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Airdrop
        </h1>

        <div className="text-white text-center">
          <p className="text-lg">Airdrop is currently unavailable.</p>
          {/* Gambar GIF Troll */}
          <img
            src="/images/rickroll.gif"
            alt="Troll GIF"
            className="mx-auto mt-4"
          />

          {/* Tambahan teks NEED FAUCET */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">NEED FAUCET?</h2>
            <p className="mt-2 text-white text-center">
              Please tag me in the{" "}
              <a
                href="https://discord.com/channels/1209923224620761088/1306988055135256738"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                <strong>#send-receive-tokens</strong>
              </a>{" "}
              channel on Discord.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
