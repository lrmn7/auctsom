import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import Footer from "../components/common/footer/footer";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const timesNewRoman = localFont({
  src: "../../public/fonts/TimesNewRoman.woff",
  variable: "--font-times-new-roman",
  weight: "100 900",
});

const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMonoNerdFont-Medium.ttf",
  variable: "--font-nerd-jetbrains",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AuctSom NFT",
  description: "Turn your art into NFT. Let the bidding begin!",
  keywords: [
    "NFT",
    "NFT marketplace",
    "Web3",
    "crypto art",
    "Somnia Network",
    "mint NFT",
    "AuctSom",
    "digital collectibles",
    "NFT auctions"
  ],
  authors: [{ name: "AuctSom Team", url: "https://auctsom.vercel.app" }],
  creator: "AuctSom",
  publisher: "AuctSom",
  metadataBase: new URL("https://auctsom.vercel.app"),
  openGraph: {
    title: "AuctSom NFT",
    description: "Turn your art into NFT. Let the bidding begin!",
    url: "https://auctsom.vercel.app",
    siteName: "AuctSom NFT",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AuctSom NFT Marketplace",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuctSom NFT",
    description: "Turn your art into NFT. Let the bidding begin!",
    creator: "@romanromannya",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/icons/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${timesNewRoman.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">{children}</main>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                border: "1px solid #374151",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
