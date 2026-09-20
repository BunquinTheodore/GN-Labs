import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClickSoundProvider } from "@/components/ClickSoundProvider";
import { cn } from "@/lib/utils";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Outfit: a bold, rounded, geometric sans that echoes the single-story
// "gn" wordmark's rounded terminals better than the previous display
// face (Space Grotesk), which reads more angular/technical.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GN Labs: AI Integration for Business",
  description:
    "GN Labs helps teams design and ship practical AI integrations and automations. Book a consultation to scope your project.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geist.variable, outfit.variable, "font-sans")}
    >
      <body className="min-h-full bg-ink text-mist">
        <ClickSoundProvider />
        <div aria-hidden="true" className="gn-splash">
          <span className="gn-splash-title">GN Labs</span>
        </div>
        <div aria-hidden="true" className="ambient-bg">
          <span className="ambient-blob ambient-blob-lime" />
          <span className="ambient-blob ambient-blob-cyan" />
          <span className="ambient-blob ambient-blob-amber" />
          <span className="ambient-grid" />
        </div>
        <div className="gn-content-guard flex min-h-full flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
