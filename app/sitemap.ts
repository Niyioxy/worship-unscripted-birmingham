import {blogDb} from "@/lib/blog-manager";
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
  { path: "/contact", priority: 0.6, frequency: "monthly" },
  { path: "/blog", priority: 0.7, frequency: "monthly" },
  { path: "/blog/why-worship-unscripted-birmingham-exists", priority: 0.8, frequency: "monthly" }
];

export const dynamic="force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages=pages.map(page=>({
    url:SITE_URL+page.path,
    changeFrequency:page.frequency,
    priority:page.priority
  }));
  if(process.env.BLOG_CMS_ENABLED!=="true"||!process.env.DATABASE_URL)return staticPages;
  try {
    const result=await blogDb().query("SELECT slug,updated_at FROM public.wu_blog_posts WHERE status='published' LIMIT 200");
    return [...staticPages,...result.rows.map((p:{slug:string;updated_at:Date})=>({
      url:SITE_URL+"/blog/"+p.slug,changeFrequency:"monthly" as const,priority:0.6,lastModified:p.updated_at
    }))];
  }catch{return staticPages}
}
