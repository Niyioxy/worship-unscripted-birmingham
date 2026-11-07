import type { MetadataRoute } from "next";
const BASE = "https://worship-unscripted-birmingham.vercel.app";
// Only public, substantive pages. The registration and draft privacy
// pages are intentionally excluded until they are approved for launch.
const pages: { path: string; priority: number; frequency: "weekly"|"monthly" }[] = [
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
  return pages.map(p=>({
    url: BASE + p.path,
    changeFrequency: p.frequency,
    priority: p.priority
  }));
}
