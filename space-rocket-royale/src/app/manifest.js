const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://space-rocket-royale.vercel.app";

export default function manifest() {
  return {
    name: "Space Rocket Royale",
    short_name: "SRR",
    description:
      "Free browser space shooter with wave survival, boss fights, and roguelite upgrades.",
    start_url: "/",
    scope: "/",
    id: siteUrl,
    display: "standalone",
    orientation: "any",
    background_color: "#030712",
    theme_color: "#7c3aed",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
