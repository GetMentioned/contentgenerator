"use client"

import { useRef, useCallback, useState } from "react"
import type { AspectRatio, BgColor, ImageTemplateData } from "@/lib/types"
import { ASPECT_DIMENSIONS } from "@/lib/types"

const BG_IMAGES: Record<BgColor, string> = {
  black: "/black.jpg",
  blue: "/blue.jpg",
}

const LOGOS: Record<BgColor, string> = {
  black: "/logo-blue.svg",
  blue: "/logo-white.svg",
}

const DEFAULT_DATA: ImageTemplateData = {
  title: "Title",
  imageUrl: "",
  imageX: 114,
  imageY: 340,
  imageWidth: 852,
  imageHeight: 400,
}

export function ImageTemplate({
  data = DEFAULT_DATA,
  aspectRatio = "square",
  bgColor = "black",
  previewScale = 1,
  onUpdate,
}: {
  data?: ImageTemplateData
  aspectRatio?: AspectRatio
  bgColor?: BgColor
  previewScale?: number
  onUpdate?: (updates: Partial<ImageTemplateData>) => void
}) {
  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const padding = 56
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; corner: string } | null>(null)
  const [snapH, setSnapH] = useState(false)
  const [snapV, setSnapV] = useState(false)

  const SNAP_THRESHOLD = 10

  const snap = useCallback((x: number, y: number, w: number, h: number) => {
    const centerX = x + w / 2
    const centerY = y + h / 2
    const frameCenterX = dims.width / 2
    const frameCenterY = dims.height / 2
    const snappedH = Math.abs(centerX - frameCenterX) < SNAP_THRESHOLD
    const snappedV = Math.abs(centerY - frameCenterY) < SNAP_THRESHOLD
    setSnapH(snappedH)
    setSnapV(snappedV)
    return {
      x: snappedH ? Math.round(frameCenterX - w / 2) : x,
      y: snappedV ? Math.round(frameCenterY - h / 2) : y,
    }
  }, [dims])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onUpdate) return
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: data.imageX,
      origY: data.imageY,
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = (ev.clientX - dragRef.current.startX) / previewScale
      const dy = (ev.clientY - dragRef.current.startY) / previewScale
      const rawX = Math.round(dragRef.current.origX + dx)
      const rawY = Math.round(dragRef.current.origY + dy)
      const snapped = snap(rawX, rawY, data.imageWidth, data.imageHeight)
      onUpdate({ imageX: snapped.x, imageY: snapped.y })
    }

    const handleMouseUp = () => {
      dragRef.current = null
      setSnapH(false)
      setSnapV(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }, [onUpdate, data.imageX, data.imageY, data.imageWidth, data.imageHeight, previewScale, snap])

  const handleResizeDown = useCallback((e: React.MouseEvent, corner: string) => {
    if (!onUpdate) return
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: data.imageWidth,
      origH: data.imageHeight,
      origX: data.imageX,
      origY: data.imageY,
      corner,
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const dx = (ev.clientX - resizeRef.current.startX) / previewScale
      const dy = (ev.clientY - resizeRef.current.startY) / previewScale
      const c = resizeRef.current.corner
      const updates: Partial<ImageTemplateData> = {}

      if (c.includes("r")) {
        updates.imageWidth = Math.max(100, Math.round(resizeRef.current.origW + dx))
      }
      if (c.includes("l")) {
        const newW = Math.max(100, Math.round(resizeRef.current.origW - dx))
        updates.imageWidth = newW
        updates.imageX = Math.round(resizeRef.current.origX + (resizeRef.current.origW - newW))
      }
      if (c.includes("b")) {
        updates.imageHeight = Math.max(60, Math.round(resizeRef.current.origH + dy))
      }
      if (c.includes("t")) {
        const newH = Math.max(60, Math.round(resizeRef.current.origH - dy))
        updates.imageHeight = newH
        updates.imageY = Math.round(resizeRef.current.origY + (resizeRef.current.origH - newH))
      }

      onUpdate(updates)
    }

    const handleMouseUp = () => {
      resizeRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }, [onUpdate, data.imageWidth, data.imageHeight, data.imageX, data.imageY, previewScale])

  const interactive = !!onUpdate

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
        {/* Title */}
        <h1
          style={{
            color: "white",
            fontSize: 80,
            fontWeight: 500,
            letterSpacing: "-1.6px",
            lineHeight: 1.15,
            margin: 0,
            fontFamily: "'Inter Display', 'Inter', sans-serif",
            textAlign: "center",
            overflowWrap: "break-word",
            width: "100%",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {data.title}
        </h1>

        {/* Spacer to push footer down */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            paddingTop: padding / 2,
            position: "relative",
            zIndex: 1,
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

      {/* Image — absolutely positioned, draggable/resizable */}
      {data.imageUrl ? (
        <div
          style={{
            position: "absolute",
            left: data.imageX,
            top: data.imageY,
            width: data.imageWidth,
            height: data.imageHeight,
            borderRadius: 12,
            overflow: "hidden",
            cursor: interactive ? "move" : "default",
            ...(interactive ? { outline: "2px solid rgba(85, 122, 247, 0.5)" } : {}),
          }}
          onMouseDown={interactive ? handleMouseDown : undefined}
        >
          <img
            src={data.imageUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* Resize handles */}
          {interactive && (
            <>
              {["tl", "tr", "bl", "br"].map((corner) => (
                <div
                  key={corner}
                  onMouseDown={(e) => {
                    const map: Record<string, string> = { tl: "tl", tr: "tr", bl: "bl", br: "br" }
                    handleResizeDown(e, map[corner])
                  }}
                  style={{
                    position: "absolute",
                    width: 12,
                    height: 12,
                    backgroundColor: "#557AF7",
                    borderRadius: 2,
                    border: "2px solid white",
                    ...(corner.includes("t") ? { top: -6 } : { bottom: -6 }),
                    ...(corner.includes("l") ? { left: -6 } : { right: -6 }),
                    cursor: corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize",
                  }}
                />
              ))}
              {/* Edge handles */}
              <div
                onMouseDown={(e) => handleResizeDown(e, "r")}
                style={{ position: "absolute", top: 0, right: -4, width: 8, height: "100%", cursor: "ew-resize" }}
              />
              <div
                onMouseDown={(e) => handleResizeDown(e, "l")}
                style={{ position: "absolute", top: 0, left: -4, width: 8, height: "100%", cursor: "ew-resize" }}
              />
              <div
                onMouseDown={(e) => handleResizeDown(e, "b")}
                style={{ position: "absolute", bottom: -4, left: 0, width: "100%", height: 8, cursor: "ns-resize" }}
              />
              <div
                onMouseDown={(e) => handleResizeDown(e, "t")}
                style={{ position: "absolute", top: -4, left: 0, width: "100%", height: 8, cursor: "ns-resize" }}
              />
            </>
          )}
        </div>
      ) : interactive ? (
        <div
          style={{
            position: "absolute",
            left: data.imageX,
            top: data.imageY,
            width: data.imageWidth,
            height: data.imageHeight,
            borderRadius: 12,
            border: "2px dashed rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: 24,
          }}
        >
          Upload an image
        </div>
      ) : null}

      {/* Snap guide lines */}
      {interactive && snapH && (
        <div style={{ position: "absolute", top: 0, left: "50%", width: 1, height: "100%", backgroundColor: "#557AF7", pointerEvents: "none" }} />
      )}
      {interactive && snapV && (
        <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, backgroundColor: "#557AF7", pointerEvents: "none" }} />
      )}
    </div>
  )
}
