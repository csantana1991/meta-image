import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm",
});

const display = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-news",
});

export const metadata: Metadata = {
  title: "meta-image",
  description:
    "33,000 free medical images — chest X-ray, CT, MRI, and PET — CC0 and CC BY, indexed for Vercel Blob.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
