import type { MetadataRoute } from "next";

const SITE_URL = "https://worship-unscripted-birmingham.vercel.app";

// Public information pages only. Registration and the draft privacy page
// are excluded until their launch approvals are completed.
const pages: { path: string; priority: number; frequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, frequency: "weekly" },
  { path: "/vision", priority: 0.9, frequency: "monthly" },
  { path: "/experience", priority: 0.9, frequency: "monthly" },
  { path: "/our-story", priority: 0.8, frequency: "monthly" },
  { path: "/get-involved", priority: 0.8, frequency: "monthly" },
  { path: "/community", priority: 0.7, frequency: "monthly" },
  { path: "/gatherings", priority: 0.9, frequency: "weekly" },
  { path: "/contact", priority: 0.6, frequency: "monthly" }
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(page => ({
    url: SITE_URL + page.path,
    changeFrequency: page.frequency,
    priority: page.priority
  }));
}
