export const dynamic = "force-static";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: "https://space-rocket-royale.vercel.app",
  };
}
