// app/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

function clamp(s: string, n: number) {
  return (s ?? "").toString().slice(0, n);
}

function accentByType(type: string) {
  const t = (type ?? "").toLowerCase();
  if (t === "casino") return { accent: "#f5c26b", badgeBg: "#111", badgeBorder: "#333" }; // gold
  if (t === "country") return { accent: "#64b5ff", badgeBg: "#0b1020", badgeBorder: "#1f2a44" }; // blue
  if (t === "guide") return { accent: "#c084fc", badgeBg: "#130a1a", badgeBorder: "#2a1634" }; // purple
  return { accent: "#f5c26b", badgeBg: "#111", badgeBorder: "#333" };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = clamp(searchParams.get("type") ?? "page", 24);
  const title = clamp(searchParams.get("title") ?? "Gold Star", 90);
  const subtitle = clamp(searchParams.get("subtitle") ?? "", 140);

  // optional
  const rating = clamp(searchParams.get("rating") ?? "", 8); // e.g. "4.8"
  const flag = clamp(searchParams.get("flag") ?? "", 6); // e.g. "🇦🇺"
  const icon = clamp(searchParams.get("icon") ?? "", 4); // e.g. "🎰" (future)

  const { accent, badgeBg, badgeBorder } = accentByType(type);

  const ratingLine =
    rating && !Number.isNaN(Number(rating)) ? `⭐ ${Number(rating).toFixed(1)} / 5` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0b0b0b 0%, #000 100%)",
          color: "#fff",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>
              ⭐ Gold Star
            </div>

            {/* optional icon */}
            {icon ? (
              <div style={{ fontSize: 24, opacity: 0.9 }}>{icon}</div>
            ) : null}
          </div>

          <div
            style={{
              fontSize: 18,
              padding: "8px 18px",
              borderRadius: 999,
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              color: accent,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {type}
          </div>
        </div>

        {/* CENTER */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            {flag ? (
              <div style={{ fontSize: 44, lineHeight: 1 }}>{flag}</div>
            ) : null}

            <div
              style={{
                fontSize: 68,
                fontWeight: 950,
                lineHeight: 1.05,
                maxWidth: 980,
              }}
            >
              {title}
            </div>
          </div>

          {/* rating */}
          {ratingLine ? (
            <div style={{ fontSize: 28, color: accent, fontWeight: 800 }}>
              {ratingLine}
            </div>
          ) : null}

          {/* subtitle */}
          {subtitle ? (
            <div
              style={{
                fontSize: 30,
                color: "#d1d1d1",
                maxWidth: 980,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* BOTTOM */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#999",
          }}
        >
          <div>Trusted casino reviews & guides</div>
          <div style={{ color: accent, fontWeight: 700 }}>gold-star.reviews</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
