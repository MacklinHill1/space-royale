const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://space-rocket-royale.vercel.app";

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
