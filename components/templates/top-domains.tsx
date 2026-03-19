"use client"

import type { AspectRatio, BgColor, TopDomainsData } from "@/lib/types"
import { ASPECT_DIMENSIONS } from "@/lib/types"

const BG_IMAGES: Record<BgColor, string> = {
  black: "/black.jpg",
  blue: "/blue.jpg",
}

const LOGOS: Record<BgColor, string> = {
  black: "/logo-blue.svg",
  blue: "/logo-white.svg",
}

const BAR_COLORS: Record<BgColor, string> = {
  black: "#557AF7",
  blue: "#FFFFFF",
}

const DEFAULT_DATA: TopDomainsData = {
  title: "Top Domains Cited\nIn AI Overviews",
  items: [
    { domain: "reddit.com", share: 23.29 },
    { domain: "youtube.com", share: 21.45 },
    { domain: "wikipedia.org", share: 18.72 },
    { domain: "amazon.com", share: 17.85 },
    { domain: "quora.com", share: 16.31 },
    { domain: "linkedin.com", share: 9.67 },
    { domain: "medium.com", share: 8.01 },
    { domain: "yelp.com", share: 6.16 },
    { domain: "github.com", share: 5.32 },
    { domain: "stackoverflow.com", share: 4.86 },
  ],
}

export function TopDomainsTemplate({
  data = DEFAULT_DATA,
  aspectRatio = "square",
  bgColor = "black",
  onLogoClick,
}: {
  data?: TopDomainsData
  aspectRatio?: AspectRatio
  bgColor?: BgColor
  onLogoClick?: (index: number) => void
}) {
  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const maxShare = Math.max(...data.items.map((d) => d.share))
  const barColor = BAR_COLORS[bgColor]
  // Match Figma: 56px padding
  const padding = 56

  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background */}
      <img
        src={BG_IMAGES[bgColor]}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding,
          minHeight: 0,
        }}
      >
        {/* Title — top left */}
        <h1
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            margin: 0,
            fontFamily: "'Inter Display', 'Inter', sans-serif",
            whiteSpace: "pre-line",
            flexShrink: 0,
          }}
        >
          {data.title}
        </h1>

        {/* Chart area — starts 56px below title */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 56,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Domain column — 240px wide */}
          <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: 400, height: 20, lineHeight: "20px" }}>
              Domain
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {data.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 28,
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.logo || `https://img.logo.dev/${item.domain}?token=${process.env.NEXT_PUBLIC_LOGODEV_TOKEN}&size=128&format=png`}
                      alt=""
                      title={onLogoClick ? "Click to change logo" : undefined}
                      onClick={onLogoClick ? (e) => { e.stopPropagation(); onLogoClick(i) } : undefined}
                      style={{
                        width: 16,
                        height: 16,
                        objectFit: "cover",
                        ...(onLogoClick ? { cursor: "pointer" } : {}),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: "28px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.domain}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Share column — fills remaining */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: 400, height: 20, lineHeight: "20px" }}>
              Share
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {data.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 28,
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      height: 28,
                      borderRadius: 4,
                      backgroundColor: barColor,
                      width: `${(item.share / maxShare) * 71}%`,
                      flexShrink: 0,
                      minWidth: 16,
                    }}
                  />
                  <span
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: "28px",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.share.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            paddingTop: padding / 2,
          }}
        >
          <img
            src={LOGOS[bgColor]}
            alt="GetMentioned"
            style={{ height: 32, width: 163 }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            getmentioned.co
          </span>
        </div>
      </div>
    </div>
  )
}
