import type { Metadata } from "next";
import { Josefin_Sans, Manrope, Poppins } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClickSoundProvider } from "@/components/ClickSoundProvider";
import { AmbientVisibilityController } from "@/components/AmbientVisibilityController";
import { NeuralFieldBackground } from "@/components/neural-field/NeuralFieldBackground";
import { cn } from "@/lib/utils";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Poppins is the UI face. Only the 500 weight (nav links, buttons) is
// preloaded; 400 and 600 load on demand so first paint fetches 3 font files
// (Josefin 300, Manrope, Poppins 500) instead of 5. The 500 and the 400/600
// declarations are separate next/font families that share the --font-poppins
// variable, so the browser resolves 400/500/600 across both.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

const poppinsSecondary = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

// Poppins 700 is only used by the /services step titles (.step-title), so it
// gets its own family and variable and is never preloaded.
const poppinsBold = Poppins({
  variable: "--font-poppins-bold",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  preload: false,
});

function resolveSiteUrl(): URL {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3004");
  try {
    return new URL(configured);
  } catch {
    return new URL("http://localhost:3004");
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: "GN Labs | AI Integration for Business",
  description:
    "GN Labs helps teams design and ship practical AI integrations and automations. Book a consultation to scope your project.",
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", josefin.variable, manrope.variable, poppins.variable, poppinsSecondary.variable, poppinsBold.variable, "font-sans")}
    >
      <body className="min-h-full bg-ink text-mist">
        <ClickSoundProvider />
        <AmbientVisibilityController />
        <div aria-hidden="true" className="gn-splash">
          <span className="gn-splash-title">GN Labs</span>
        </div>
        <div aria-hidden="true" className="ambient-bg">
          <span className="ambient-blob ambient-blob-lime" />
          <span className="ambient-blob ambient-blob-cyan" />
          <span className="ambient-blob ambient-blob-amber" />
          <span className="ambient-grid" />
        </div>
        <NeuralFieldBackground />
        <div className="gn-content-guard flex min-h-full flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
