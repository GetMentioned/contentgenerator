"use client"

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { AspectRatio, BgColor, ChartData } from "@/lib/types"
import { ASPECT_DIMENSIONS } from "@/lib/types"

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

const GRADIENT_SERIES = [
  "#FFFFFF",
  "#34D399",
  "#F59E0B",
  "#EF4444",
  "#A78BFA",
  "#F472B6",
  "#06B6D4",
  "#84CC16",
]

const SERIES_COLORS: Record<BgColor, string[]> = {
  black: [
    "#557AF7",
    "#34D399",
    "#F59E0B",
    "#EF4444",
    "#A78BFA",
    "#F472B6",
    "#06B6D4",
    "#84CC16",
  ],
  blue: GRADIENT_SERIES,
  "gradient-1": GRADIENT_SERIES,
  "gradient-2": GRADIENT_SERIES,
  "gradient-3": GRADIENT_SERIES,
  "gradient-4": GRADIENT_SERIES,
  "gradient-5": GRADIENT_SERIES,
  "gradient-6": GRADIENT_SERIES,
}

const DEFAULT_DATA: ChartData = {
  title: "Monthly Traffic",
  chartType: "line",
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  series: [
    { name: "Organic", data: [4200, 4800, 5100, 4900, 5600, 6200, 6800, 7100, 6900, 7400, 7800, 8200] },
    { name: "Paid", data: [2100, 2400, 2200, 2800, 3100, 2900, 3400, 3600, 3800, 3500, 4000, 4200] },
  ],
}

export function ChartTemplate({
  data = DEFAULT_DATA,
  aspectRatio = "square",
  bgColor = "black",
}: {
  data?: ChartData
  aspectRatio?: AspectRatio
  bgColor?: BgColor
}) {
  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const padding = 56

  // Transform data into Recharts format: [{ category: "Jan", Organic: 4200, Paid: 2100 }, ...]
  const chartData = data.categories.map((cat, i) => {
    const point: Record<string, string | number> = { category: cat }
    data.series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0
    })
    return point
  })

  const gridColor = bgColor === "blue" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"
  const textColor = bgColor === "blue" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)"
  const colors = SERIES_COLORS[bgColor]

  const ChartComponent = data.chartType === "bar" ? BarChart : LineChart

  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Suisse Intl', sans-serif",
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
            fontSize: 64,
            fontWeight: 500,
            lineHeight: 1.1,
            margin: 0,
            fontFamily: "'Suisse Intl', sans-serif",
            whiteSpace: "pre-line",
            flexShrink: 0,
          }}
        >
          {data.title}
        </h1>

        {/* Chart */}
        <div
          style={{
            flex: 1,
            marginTop: 48,
            minHeight: 0,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="none" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="none"
                tick={{ fill: textColor, fontSize: 18 }}
                tickLine={false}
                axisLine={false}
                dy={12}
              />
              <YAxis
                stroke="none"
                tick={{ fill: textColor, fontSize: 18 }}
                tickLine={false}
                axisLine={false}
                width={70}
                dx={-8}
                label={data.yAxisLabel ? {
                  value: data.yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                  fill: textColor,
                  fontSize: 16,
                } : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 14,
                }}
                itemStyle={{ color: "white" }}
                labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
              />
              <Legend content={() => null} />
              {data.series.map((s, i) => {
                const color = s.color || colors[i % colors.length]
                return data.chartType === "bar" ? (
                  <Bar
                    key={s.name}
                    dataKey={s.name}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                  />
                ) : (
                  <Line
                    key={s.name}
                    type="monotone"
                    dataKey={s.name}
                    stroke={color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, fill: color }}
                  />
                )
              })}
            </ChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        {data.series.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              paddingTop: 24,
              flexShrink: 0,
            }}
          >
            {data.series.map((s, i) => {
              const color = s.color || colors[i % colors.length]
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>{s.name}</span>
                </div>
              )
            })}
          </div>
        )}

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
