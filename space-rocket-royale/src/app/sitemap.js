export const dynamic = "force-static";

export default function sitemap() {
  return [
    {
      url: "https://space-rocket-royale.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
