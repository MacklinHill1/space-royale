import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Space Rocket Royale",
  description: "Fast-paced space shooter game",
  keywords: ["space game", "shooter", "arcade", "online game"],
  openGraph: {
    title: "Space Rocket Royale",
    description: "Survive waves of enemies in space",
    url: "https://space-rocket-royale.vercel.app",
    siteName: "Space Rocket Royale",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
