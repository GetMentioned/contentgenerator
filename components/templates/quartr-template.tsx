"use client"

import type { AspectRatio, QuartrData } from "@/lib/types"
import { ASPECT_DIMENSIONS } from "@/lib/types"

const DEFAULT_DATA: QuartrData = {
  title: "Title",
  imageUrl: "",
  overlay: true,
  textPosition: "bottom",
  tagLeft: "MARKET REPORT",
  tagRight: "STREAMING",
}

const LOGOS: Record<string, string> = {
  black: "/logo-white.svg",
  blue: "/logo-white.svg",
}

const TEXT_ALIGN: Record<QuartrData["textPosition"], string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
}

export function QuartrTemplate({
  data = DEFAULT_DATA,
  aspectRatio = "square",
}: {
  data?: QuartrData
  aspectRatio?: AspectRatio
}) {
  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const padding = 56

  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Suisse Intl', sans-serif",
        backgroundColor: "#000",
      }}
    >
      {/* Background image */}
      {data.imageUrl && (
        <img
          src={data.imageUrl}
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
      )}

      {/* Overlay */}
      {data.overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding,
        }}
      >
        {/* Top tags */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {data.tagLeft}
          </span>
          <span
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {data.tagRight}
          </span>
        </div>

        {/* Title area — positioned by textPosition */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: TEXT_ALIGN[data.textPosition],
            minHeight: 0,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: 64,
              fontWeight: 500,
              letterSpacing: "-1.2px",
              lineHeight: 1.15,
              margin: 0,
              fontFamily: "'Suisse Intl', sans-serif",
              overflowWrap: "break-word",
              width: "100%",
              textAlign: "center",
              textWrap: "balance",
            }}
          >
            {data.title}
          </h1>
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
            src={LOGOS["black"]}
            alt="GetMentioned"
            style={{ height: 32, width: 163 }}
          />
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
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
