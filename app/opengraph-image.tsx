import { ImageResponse } from "next/og";

// Route segment config: static generation of the OG image at build time.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GN Labs: AI Integration for Business";

// GN Labs brand tokens (mirrored from app/globals.css :root, not
// re-derived — see the "gn LABS" wordmark comment there for why lime
// leads and the cyan->amber gradient is the sparing accent).
const INK = "#050605";
const LIME = "#caf14a";
const CYAN = "#17c9e2";
const AMBER = "#f5dc2c";
const MIST = "#eef3f5";
const MIST_DIM = "#97a2a8";

async function loadGoogleFontTTF(family: string, weight: number, text?: string) {
  const textParam = text ? `&text=${encodeURIComponent(text)}` : "";
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}${textParam}`;

  // Google's CSS2 endpoint serves woff2 to modern browser UAs and eot
  // to very old (IE6-era) ones; a bare "Mozilla/5.0 (Windows NT ...)"
  // UA with no browser token reliably gets back a `format('truetype')`
  // URL, which satori can parse directly.
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  }).then((res) => res.text());

  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not find font URL for ${family} ${weight}`);
  }

  const fontUrl = match[1];
  const fontRes = await fetch(fontUrl);
  return fontRes.arrayBuffer();
}

export default async function OpengraphImage() {
  const eyebrowText = "AUTOMATION & AI CONSULTING";
  const wordmarkText = "gn LABS";
  const subtitleText = "AI Integration for Business.";

  const [outfitBold, geistBold, geistMedium] = await Promise.all([
    loadGoogleFontTTF("Outfit", 800, wordmarkText),
    loadGoogleFontTTF("Geist", 700, eyebrowText),
    loadGoogleFontTTF("Geist", 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: INK,
        }}
      >
        {/* Radial brand glow behind the centered content, lime-led per
            the site's primary accent with a cyan/amber whisper. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `radial-gradient(circle at 50% 45%, ${LIME}26 0%, ${CYAN}14 38%, ${AMBER}0d 60%, transparent 75%)`,
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 7,
            height: "100%",
            backgroundColor: LIME,
          }}
        />

        {/* Centered content column */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 96px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Geist",
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: LIME,
            }}
          >
            {eyebrowText}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Outfit",
              fontWeight: 800,
              fontSize: 104,
              color: MIST,
              marginTop: 26,
              lineHeight: 1,
            }}
          >
            {wordmarkText}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Geist",
              fontWeight: 500,
              fontSize: 30,
              color: MIST_DIM,
              marginTop: 24,
              maxWidth: 720,
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            {subtitleText}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: outfitBold, weight: 800, style: "normal" },
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
        { name: "Geist", data: geistMedium, weight: 500, style: "normal" },
      ],
    },
  );
}
