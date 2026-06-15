import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://space-rocket-royale.vercel.app";

const siteName = "Space Rocket Royale";
const defaultTitle = "Space Rocket Royale — Free Browser Space Shooter";
const defaultDescription =
  "Play Space Rocket Royale free in your browser. Survive enemy waves, fight epic bosses, unlock roguelite upgrades, and master Boss Rush in this indie arcade space shooter.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "space rocket royale",
    "browser game",
    "free browser game",
    "play online free",
    "no download game",
    "space shooter",
    "arcade shooter",
    "bullet hell",
    "wave survival",
    "enemy waves",
    "boss fights",
    "boss rush",
    "boss rush mode",
    "roguelike",
    "roguelite",
    "roguelite shooter",
    "upgrade survival game",
    "spaceship combat",
    "spaceship shooter",
    "indie game",
    "indie browser game",
    "HTML5 game",
    "web game",
    "top-down shooter",
    "survival shooter",
    "arcade action",
    "progression game",
    "skill abilities",
    "upgrade shop",
    "endless survival mode",
    "hardcore mode",
    "time attack",
  ],
  applicationName: siteName,
  category: "game",
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Space Rocket Royale — free browser space shooter with boss fights and roguelite upgrades",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#7c3aed",
  colorScheme: "dark",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: siteName,
    description: defaultDescription,
    url: siteUrl,
    image: `${siteUrl}/og-image.png`,
    genre: ["Action", "Shooter", "Arcade", "Roguelite"],
    gamePlatform: ["Web Browser", "HTML5"],
    playMode: "SinglePlayer",
    applicationCategory: "Game",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Space Rocket Royale free to play?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Space Rocket Royale is completely free to play in your browser with no download or account required.",
        },
      },
      {
        "@type": "Question",
        name: "What kind of game is Space Rocket Royale?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It is a free browser space shooter with wave survival, roguelite upgrades, epic boss fights, and a dedicated Boss Rush mode.",
        },
      },
      {
        "@type": "Question",
        name: "How do I play Space Rocket Royale?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use WASD or arrow keys to move, mouse to aim, and click to shoot. Press Shift to dash, Q for bomb, F for magnet, and E to open the upgrade shop.",
        },
      },
      {
        "@type": "Question",
        name: "Can I play on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The game supports touch controls on mobile browsers and can be added to your home screen for quick access.",
        },
      },
      {
        "@type": "Question",
        name: "What game modes are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Endless Survival, Boss Rush, Speed Farm, Hardcore, and Time Attack — each offering a different arcade space shooter challenge.",
        },
      },
    ],
  },
];

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
