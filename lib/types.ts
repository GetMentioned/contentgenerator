export interface RankingItem {
  rank: number
  name: string
  logo?: string
  domain?: string
  visibility: number
  visibilityChange: number
  position: number
  positionChange: number
}

export interface RankingData {
  title: string
  items: RankingItem[]
}

export interface DomainItem {
  domain: string
  share: number
  logo?: string
}

export interface TopDomainsData {
  title: string
  items: DomainItem[]
}

export interface ChartSeries {
  name: string
  data: number[]
  color?: string
}

export interface ChartData {
  title: string
  chartType: "line" | "bar"
  categories: string[]
  series: ChartSeries[]
  yAxisLabel?: string
}

export interface ImageTemplateData {
  title: string
  imageUrl: string
  imageX: number
  imageY: number
  imageWidth: number
  imageHeight: number
}

export interface QuartrData {
  title: string
  imageUrl: string
  overlay: boolean
  textPosition: "top" | "center" | "bottom"
  tagLeft: string
  tagRight: string
}

export type TemplateType = "visibility-ranking" | "top-domains" | "chart" | "image" | "quartr"

export type AspectRatio = "square" | "horizontal" | "portrait"
export type BgColor = "black" | "blue" | "gradient-1" | "gradient-2" | "gradient-3" | "gradient-4" | "gradient-5" | "gradient-6"

export const ASPECT_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  horizontal: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1350 },
}

