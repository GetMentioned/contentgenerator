"use client"

import type { RankingData, AspectRatio, BgColor } from "@/lib/types"
import { ASPECT_DIMENSIONS } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const BG_COLORS: Record<BgColor, string> = {
  black: "#050711",
  blue: "#0A1628",
  "gradient-1": "#1a3a8a",
  "gradient-2": "#1a3a8a",
  "gradient-3": "#1a3a8a",
  "gradient-4": "#1a3a8a",
  "gradient-5": "#1a3a8a",
  "gradient-6": "#1a3a8a",
}

const BG_IMAGES: Record<BgColor, string> = {
  black: "/black.jpg",
  blue: "/blue.jpg",
  "gradient-1": "/gradient-1.webp",
  "gradient-2": "/gradient-2.webp",
  "gradient-3": "/gradient-3.webp",
  "gradient-4": "/gradient-4.webp",
  "gradient-5": "/gradient-5.webp",
  "gradient-6": "/gradient-6.webp",
}

const LOGOS: Record<BgColor, string> = {
  black: "/logo-blue.svg",
  blue: "/logo-white.svg",
  "gradient-1": "/logo-white.svg",
  "gradient-2": "/logo-white.svg",
  "gradient-3": "/logo-white.svg",
  "gradient-4": "/logo-white.svg",
  "gradient-5": "/logo-white.svg",
  "gradient-6": "/logo-white.svg",
}

const DEFAULT_DATA: RankingData = {
  title: "Title",
  items: [
    { rank: 1, name: "JetBlue", domain: "jetblue.com", visibility: 66.2, visibilityChange: -4.3, position: 1.6, positionChange: -0.1 },
    { rank: 2, name: "Delta Air Lines", domain: "delta.com", visibility: 35.0, visibilityChange: -5.0, position: 2.1, positionChange: -0.1 },
    { rank: 3, name: "Alaska Airlines", domain: "alaskaair.com", visibility: 33.1, visibilityChange: 9.7, position: 2.6, positionChange: 0.2 },
    { rank: 4, name: "Southwest Airlines", domain: "southwest.com", visibility: 32.9, visibilityChange: -2.6, position: 2.4, positionChange: 0.2 },
    { rank: 5, name: "American Airlines", domain: "aa.com", visibility: 25.0, visibilityChange: -2.2, position: 2.4, positionChange: 0.3 },
  ],
}

function ChangeIndicator({ value, suffix = "%", showSign = true }: { value: number; suffix?: string; showSign?: boolean }) {
  const isPositive = value > 0
  const isNeutral = value === 0
  const color = isPositive ? "#16a34a" : isNeutral ? "#6b7280" : "#dc2626"
  const bgColor = isPositive ? "#dcfce7" : isNeutral ? "#f3f4f6" : "#fee2e2"
  const arrow = isPositive ? "\u2191" : isNeutral ? "" : "\u2193"
  const sign = isPositive && showSign ? "+" : ""

  return (
    <span
      style={{
        color,
        backgroundColor: bgColor,
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.75em",
        fontWeight: 400,
        marginLeft: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {arrow} {sign}{Math.abs(value).toFixed(1)}{suffix}
    </span>
  )
}

export function RankingTable({
  data = DEFAULT_DATA,
  aspectRatio = "square",
  bgColor = "black",
  onLogoClick,
}: {
  data?: RankingData
  aspectRatio?: AspectRatio
  bgColor?: BgColor
  onLogoClick?: (index: number) => void
}) {
  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const tableWidth = "79%"
  const padding = Math.round(dims.width * 0.052)

  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        backgroundColor: BG_COLORS[bgColor],
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Suisse Intl', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background image */}
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

      {/* Content wrapper */}
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
        {/* Title + Table — centered together */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: padding * 0.75,
            minHeight: 0,
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: `80px`,
              fontWeight: 500,
              letterSpacing: "-1.6px",
              lineHeight: 1.15,
              margin: 0,
              fontFamily: "'Suisse Intl', sans-serif",
              textAlign: "center",
              overflowWrap: "break-word",
              width: "100%",
              flexShrink: 0,
            }}
          >
            {data.title}
          </h1>

          <div style={{ width: tableWidth }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 180px 140px",
                  padding: "14px 24px",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: `14px`,
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                <span>#</span>
                <span>Name</span>
                <span style={{ textAlign: "right" }}>Visibility</span>
                <span style={{ textAlign: "right" }}>Position</span>
              </div>

              {/* Rows */}
              {data.items.map((item) => (
                <div
                  key={item.rank}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 180px 140px",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: "1px solid #f3f4f6",
                    fontSize: `16px`,
                  }}
                >
                  <span style={{ color: "#6b7280", fontWeight: 400, fontVariantNumeric: "tabular-nums" }}>{item.rank}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {(item.logo || item.domain) && (() => {
                      const logoImg = (
                        <img
                          src={item.logo || `https://img.logo.dev/${item.domain}?token=${process.env.NEXT_PUBLIC_LOGODEV_TOKEN}&size=128&format=png`}
                          alt=""
                          onClick={onLogoClick ? (e) => { e.stopPropagation(); onLogoClick(data.items.indexOf(item)) } : undefined}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            objectFit: "cover",
                            ...(onLogoClick ? { cursor: "pointer" } : {}),
                          }}
                        />
                      )
                      return onLogoClick ? (
                        <TooltipProvider delay={0}>
                          <Tooltip>
                            <TooltipTrigger render={logoImg} />
                            <TooltipContent>Click to change logo</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : logoImg
                    })()}
                    <span style={{ fontWeight: 400, color: "#111827" }}>{item.name}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontVariantNumeric: "tabular-nums" }}>
                    <strong style={{ color: "#111827" }}>{item.visibility.toFixed(1)}%</strong>
                    <ChangeIndicator value={item.visibilityChange} />
                  </span>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontVariantNumeric: "tabular-nums" }}>
                    <strong style={{ color: "#111827" }}>{item.position.toFixed(1)}</strong>
                    <ChangeIndicator value={item.positionChange} suffix="" showSign={false} />
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
              fontSize: `20px`,
              fontFamily: "'Suisse Intl', sans-serif",
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
