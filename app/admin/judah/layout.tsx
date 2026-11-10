import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "JUDAH Studio | Worship Unscripted Admin",
  robots: { index: false, follow: false }
};

export default function JudahLayout({ children }: { children: React.ReactNode }) {
  // Do not publish this admin-facing studio on the public production environment.
  if (process.env.VERCEL_ENV !== "preview") notFound();
  return children;
}
