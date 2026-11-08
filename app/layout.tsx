import type { Metadata } from "next";
import "./globals.css";
import MotionExperience from "./motion-experience";

const SITE_URL = "https://worship-unscripted-birmingham.vercel.app";
const preview = process.env.VERCEL_ENV === "preview";
const description = "Discover Worship Unscripted Birmingham, an emerging interdenominational Christian worship initiative centred on live praise, prayer, Scripture and fellowship.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Christian Worship in Birmingham | Worship Unscripted",
  description,
  applicationName: "Worship Unscripted Birmingham",
  verification: { google: "x8gQWazbPelLaTqUx3QiaGxomneQ1qmDUowDGMsAc80" },
  alternates: { canonical: "/" },
  robots: preview ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Worship Unscripted Birmingham",
    title: "Worship Unscripted Birmingham | No Script. Just His Presence.",
    description,
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Worship Unscripted Birmingham | One City. One Sound. One Encounter." }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Worship Unscripted Birmingham",
    description,
    images: ["/opengraph-image"]
  },
  category: "community"
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": SITE_URL + "/#organization",
  name: "Worship Unscripted Birmingham",
  url: SITE_URL,
  logo: SITE_URL + "/worship-unscripted-logo.svg",
  description,
  email: "adeniyi.tosin@harvestflows.com",
  areaServed: { "@type": "City", name: "Birmingham" },
  knowsAbout: ["Christian worship", "Prayer", "Interdenominational worship", "Christian fellowship"],
  founder: { "@type": "Person", name: "Adeniyi Owolabi" }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_URL + "/#website",
  name: "Worship Unscripted Birmingham",
  url: SITE_URL,
  inLanguage: "en-GB",
  description,
  publisher: { "@id": SITE_URL + "/#organization" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en-GB"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(schema).replace(/</g, "\\u003c")
    }}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c")
    }}/>
    <MotionExperience/>{children}
  </body></html>;
}
