import type { MetadataRoute } from "next";

const SITE_URL = "https://worship-unscripted-birmingham.vercel.app";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/register", "/privacy"]
    }],
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL
  };
}
