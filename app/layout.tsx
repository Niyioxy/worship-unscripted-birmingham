import type { Metadata } from "next";import "./globals.css";import MotionExperience from "./motion-experience";
const SITE_URL = "https://worship-unscripted-birmingham.vercel.app";
const description = "Discover Worship Unscripted Birmingham, an emerging interdenominational Christian worship initiative centred on live praise, prayer, Scripture and fellowship.";
const isPreview = process.env.VERCEL_ENV === "preview";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Christian Worship in Birmingham | Worship Unscripted",
  description,
  applicationName: "Worship Unscripted Birmingham",
  verification: { google: "x8gQWazbPelLaTqUx3QiaGxomneQ1qmDUowDGMsAc80" },
  alternates: { canonical: "/" },
  robots: isPreview ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Worship Unscripted Birmingham",
    title: "Worship Unscripted Birmingham | No Script. Just His Presence.",
    description,
    url: SITE_URL
  },
  twitter: { card: "summary_large_image", title: "Worship Unscripted Birmingham", description }
};
const structuredData = [
  { "@context": "https://schema.org", "@type": "Organization", "@id": SITE_URL + "/#organization", name: "Worship Unscripted Birmingham", url: SITE_URL, description, email: "adeniyi.tosin@harvestflows.com", areaServed: { "@type": "City", name: "Birmingham" }, founder: { "@type": "Person", name: "Adeniyi Owolabi" } },
  { "@context": "https://schema.org", "@type": "WebSite", "@id": SITE_URL + "/#website", name: "Worship Unscripted Birmingham", url: SITE_URL, inLanguage: "en-GB", description, publisher: { "@id": SITE_URL + "/#organization" } }
];
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/><MotionExperience/>{children}</body></html>}