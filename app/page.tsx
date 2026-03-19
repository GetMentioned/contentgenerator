"use client"

import { useState, useRef, useCallback } from "react"
import { domToJpeg } from "modern-screenshot"
import { Button } from "@/components/ui/button"
import { RankingTable } from "@/components/templates/ranking-table"
import { TopDomainsTemplate } from "@/components/templates/top-domains"
import { ChartTemplate } from "@/components/templates/chart-template"
import { ImageTemplate } from "@/components/templates/image-template"
import { QuartrTemplate } from "@/components/templates/quartr-template"
import type { RankingData, TopDomainsData, ChartData, ImageTemplateData, QuartrData, AspectRatio, BgColor, TemplateType } from "@/lib/types"
import { ASPECT_DIMENSIONS } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Copy, Square, RectangleHorizontal, RectangleVertical, ArrowUp, LineChart, BarChart3, Upload, ArrowUpToLine, AlignVerticalJustifyCenter, ArrowDownToLine, HelpCircle, Globe, Image, ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { compressImage } from "@/lib/compress-image"

const PROMPTS: Record<string, string> = {
  "visibility-ranking": `Analyze this screenshot of a ranking/leaderboard table and extract the data into the following JSON structure:

[
  {
    "rank": 1,
    "name": "Company or brand name",
    "domain": "company.com",
    "visibility": 66.2,
    "visibilityChange": -4.3,
    "position": 1.6,
    "positionChange": -0.1
  }
]

Rules:
- "rank" is the row number (integer)
- "name" is the company/brand name (string)
- "domain" is the company's primary website domain (e.g. "jetblue.com", "delta.com"). Use your knowledge to determine the correct domain.
- "visibility" is the visibility percentage value (number, no % sign)
- "visibilityChange" is the change value shown next to visibility (positive or negative number)
- "position" is the position value (number)
- "positionChange" is the change value shown next to position (positive or negative number)
- Include ALL rows from the table
- Return ONLY the JSON array, no explanation`,

  "top-domains": `Analyze this screenshot of a domain ranking/bar chart and extract the data into the following JSON structure:

[
  {
    "domain": "reddit.com",
    "share": 23.29
  }
]

Rules:
- "domain" is the website domain shown (string)
- "share" is the percentage share value (number, no % sign)
- Include ALL rows from the chart
- Return ONLY the JSON array, no explanation`,

  "chart": `Analyze this screenshot of a chart and extract the data into the following JSON structure:

{
  "chartType": "line",
  "categories": ["Jan", "Feb", "Mar"],
  "series": [
    {
      "name": "Series Name",
      "data": [100, 200, 300]
    }
  ]
}

Rules:
- "chartType" is either "line" or "bar" depending on the chart type shown
- "categories" is an array of x-axis labels (strings)
- "series" is an array of data series, each with a "name" and "data" array of numbers
- If there are multiple lines/bars (e.g. different colors), create a separate series for each
- Estimate values as accurately as possible from the visual
- Return ONLY the JSON object, no explanation`,
}

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  "visibility-ranking": "Visibility Ranking",
  "top-domains": "Top Domains Cited",
  "chart": "Chart",
  "image": "Image",
  "quartr": "Quartr Image",
}

const TEMPLATE_ICONS: Record<TemplateType, React.ComponentType<{ className?: string }>> = {
  "visibility-ranking": BarChart3,
  "top-domains": Globe,
  "chart": LineChart,
  "image": Image,
  "quartr": Image,
}

const DEFAULT_RANKING_DATA: RankingData = {
  title: "Title",
  items: [
    { rank: 1, name: "JetBlue", domain: "jetblue.com", visibility: 66.2, visibilityChange: -4.3, position: 1.6, positionChange: -0.1 },
    { rank: 2, name: "Delta Air Lines", domain: "delta.com", visibility: 35.0, visibilityChange: -5.0, position: 2.1, positionChange: -0.1 },
    { rank: 3, name: "Alaska Airlines", domain: "alaskaair.com", visibility: 33.1, visibilityChange: 9.7, position: 2.6, positionChange: 0.2 },
  ],
}

const DEFAULT_DOMAINS_DATA: TopDomainsData = {
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

const DEFAULT_CHART_DATA: ChartData = {
  title: "Monthly Traffic",
  chartType: "line",
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  series: [
    { name: "Organic", data: [4200, 4800, 5100, 4900, 5600, 6200, 6800, 7100, 6900, 7400, 7800, 8200] },
    { name: "Paid", data: [2100, 2400, 2200, 2800, 3100, 2900, 3400, 3600, 3800, 3500, 4000, 4200] },
  ],
}

const DEFAULT_IMAGE_DATA: ImageTemplateData = {
  title: "Title",
  imageUrl: "",
  imageX: 114,
  imageY: 340,
  imageWidth: 852,
  imageHeight: 400,
}

const DEFAULT_QUARTR_DATA: QuartrData = {
  title: "Title",
  imageUrl: "",
  overlay: true,
  textPosition: "bottom",
  tagLeft: "MARKET REPORT",
  tagRight: "STREAMING",
}

function getDefaultData(template: TemplateType) {
  switch (template) {
    case "top-domains": return DEFAULT_DOMAINS_DATA
    case "chart": return DEFAULT_CHART_DATA
    case "image": return DEFAULT_IMAGE_DATA
    case "quartr": return DEFAULT_QUARTR_DATA
    default: return DEFAULT_RANKING_DATA
  }
}

function getMaxItems(template: TemplateType): number {
  switch (template) {
    case "top-domains": return 22
    default: return 10
  }
}

export default function EditorPage() {
  const previewRef = useRef<HTMLDivElement>(null)

  const [template, setTemplate] = useState<TemplateType>("visibility-ranking")
  const [data, setData] = useState<RankingData | TopDomainsData | ChartData | ImageTemplateData | QuartrData>(getDefaultData("visibility-ranking"))
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("square")
  const [bgColor, setBgColor] = useState<BgColor>("black")
  const [exporting, setExporting] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [logoEditIndex, setLogoEditIndex] = useState<number | null>(null)
  const [logoUrlInput, setLogoUrlInput] = useState("")
  const [showHelp, setShowHelp] = useState(false)

  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const prompt = PROMPTS[template] || PROMPTS["visibility-ranking"]
  const maxItems = getMaxItems(template)

  const handleTemplateChange = useCallback((newTemplate: TemplateType) => {
    setTemplate(newTemplate)
    setData(getDefaultData(newTemplate))
    setJsonInput("")
    setLogoEditIndex(null)
  }, [])

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const dataUrl = await domToJpeg(previewRef.current, {
        width: dims.width,
        height: dims.height,
        scale: 2,
        quality: 0.9,
        fetch: { requestInit: { mode: "cors" as RequestMode } },
      })
      const link = document.createElement("a")
      link.download = `${data.title || "export"}.jpg`
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }, [dims, data])

  const handleSubmitJson = useCallback(() => {
    try {
      const cleaned = jsonInput.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim()
      const json = JSON.parse(cleaned)

      if (template === "chart") {
        const chartUpdate: Partial<ChartData> = {}
        if (json.chartType) chartUpdate.chartType = json.chartType
        if (json.categories) chartUpdate.categories = json.categories
        if (json.series) chartUpdate.series = json.series
        if (json.chartType || json.categories || json.series) {
          setData({ ...data, ...chartUpdate } as ChartData)
          toast.success("Data loaded")
        } else {
          toast.error("Expected chart data with categories and series")
        }
      } else {
        const items = Array.isArray(json) ? json : json?.items
        if (Array.isArray(items) && items.length > 0) {
          setData({ ...data, items: items.slice(0, maxItems) } as typeof data)
          toast.success("Data loaded")
        } else {
          toast.error("Expected a JSON array of items")
        }
      }
    } catch {
      toast.error("Invalid JSON")
    }
  }, [jsonInput, data, maxItems, template])

  const previewScale = Math.min(1, 700 / dims.width, 700 / dims.height)

  const renderTemplate = () => {
    switch (template) {
      case "top-domains":
        return (
          <TopDomainsTemplate
            data={data as TopDomainsData}
            aspectRatio={aspectRatio}
            bgColor={bgColor}
            onLogoClick={(index) => {
              const domainsData = data as TopDomainsData
              setLogoEditIndex(index)
              setLogoUrlInput(domainsData.items[index]?.logo || "")
            }}
          />
        )
      case "chart":
        return (
          <ChartTemplate
            data={data as ChartData}
            aspectRatio={aspectRatio}
            bgColor={bgColor}
          />
        )
      case "quartr":
        return (
          <QuartrTemplate
            data={data as QuartrData}
            aspectRatio={aspectRatio}
          />
        )
      case "image":
        return (
          <ImageTemplate
            data={data as ImageTemplateData}
            aspectRatio={aspectRatio}
            bgColor={bgColor}
            previewScale={previewScale}
            onUpdate={exporting ? undefined : (updates) => setData({ ...(data as ImageTemplateData), ...updates })}
          />
        )
      default:
        return (
          <RankingTable
            data={data as RankingData}
            aspectRatio={aspectRatio}
            bgColor={bgColor}
            onLogoClick={(index) => {
              const rankingData = data as RankingData
              setLogoEditIndex(index)
              setLogoUrlInput(rankingData.items[index]?.logo || "")
            }}
          />
        )
    }
  }

  const TemplateIcon = TEMPLATE_ICONS[template]

  return (
    <div className="flex h-dvh bg-background">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border flex flex-col">
        <div className="flex items-center gap-2 px-4 border-b border-border h-12">
          <h2 className="text-sm font-medium">Editor</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Template Picker */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-muted-foreground">Template</label>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between" />}>
                <span className="flex items-center gap-2">
                  <TemplateIcon className="size-3.5" />
                  {TEMPLATE_LABELS[template]}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[calc(var(--radix-dropdown-menu-trigger-width,200px))]" style={{ minWidth: "var(--trigger-width, 200px)" }}>
                {(Object.keys(TEMPLATE_LABELS) as TemplateType[]).map((t) => {
                  const Icon = TEMPLATE_ICONS[t]
                  return (
                    <DropdownMenuItem key={t} onClick={() => handleTemplateChange(t)}>
                      <Icon className="size-3.5" />
                      {TEMPLATE_LABELS[t]}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            {template === "top-domains" ? (
              <textarea
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none resize-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            ) : (
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            )}
          </div>

          {/* Chart Type — only for chart template */}
          {template === "chart" && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-muted-foreground">Chart Type</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setData({ ...(data as ChartData), chartType: "line" })}
                  className={cn(
                    "flex-1",
                    (data as ChartData).chartType === "line" && "ring-2 ring-ring bg-accent"
                  )}
                >
                  <LineChart className="size-3.5" />
                  Line
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setData({ ...(data as ChartData), chartType: "bar" })}
                  className={cn(
                    "flex-1",
                    (data as ChartData).chartType === "bar" && "ring-2 ring-ring bg-accent"
                  )}
                >
                  <BarChart3 className="size-3.5" />
                  Bar
                </Button>
              </div>
            </div>
          )}

          {/* Image controls */}
          {template === "image" && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-muted-foreground">Image</label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = async (ev) => {
                    const compressed = await compressImage(ev.target?.result as string)
                    setData({ ...(data as ImageTemplateData), imageUrl: compressed })
                  }
                  reader.readAsDataURL(file)
                  e.target.value = ""
                }}
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="size-3.5" />
                {(data as ImageTemplateData).imageUrl ? "Replace Image" : "Upload Image"}
              </Button>
              {(data as ImageTemplateData).imageUrl && (
                <p className="text-xs text-muted-foreground text-pretty">
                  Drag to move, use corner handles to resize.
                </p>
              )}
            </div>
          )}

          {/* Quartr controls */}
          {template === "quartr" && (() => {
            const qData = data as QuartrData
            const updateQ = (updates: Partial<QuartrData>) => setData({ ...qData, ...updates } as QuartrData)
            return (
              <>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-muted-foreground">Background Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="quartr-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = async (ev) => {
                        const compressed = await compressImage(ev.target?.result as string)
                        updateQ({ imageUrl: compressed })
                      }
                      reader.readAsDataURL(file)
                      e.target.value = ""
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => document.getElementById("quartr-upload")?.click()}
                  >
                    <Upload className="size-3.5" />
                    {qData.imageUrl ? "Replace Image" : "Upload Image"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Overlay</label>
                  <Switch
                    checked={qData.overlay}
                    onCheckedChange={(checked) => updateQ({ overlay: !!checked })}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-muted-foreground">Text Position</label>
                  <div className="flex gap-2">
                    {([
                      { value: "top" as const, icon: ArrowUpToLine },
                      { value: "center" as const, icon: AlignVerticalJustifyCenter },
                      { value: "bottom" as const, icon: ArrowDownToLine },
                    ]).map(({ value, icon: Icon }) => (
                      <Button
                        key={value}
                        variant="outline"
                        onClick={() => updateQ({ textPosition: value })}
                        className={cn(
                          "flex-1",
                          qData.textPosition === value && "ring-2 ring-ring bg-accent"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-muted-foreground">Tag Left</label>
                  <input
                    type="text"
                    value={qData.tagLeft}
                    onChange={(e) => updateQ({ tagLeft: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-muted-foreground">Tag Right</label>
                  <input
                    type="text"
                    value={qData.tagRight}
                    onChange={(e) => updateQ({ tagRight: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </>
            )
          })()}

          {/* Data */}
          {template !== "image" && template !== "quartr" && <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-muted-foreground">Data</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste JSON here...'
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono outline-none resize-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitJson}>
                <ArrowUp className="size-3.5" />
                Submit
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(prompt)
                  toast.success("Prompt copied to clipboard")
                }}
              >
                <Copy className="size-3.5" />
                Copy Prompt
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="How it works"
                onClick={() => setShowHelp(true)}
              >
                <HelpCircle className="size-3.5" />
              </Button>
            </div>
          </div>}

          {/* Background Color — not for quartr */}
          {template !== "quartr" && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-muted-foreground">Background</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBgColor("black")}
                  className={cn(
                    "size-16 rounded-lg overflow-hidden border-2",
                    bgColor === "black" ? "border-ring ring-2 ring-ring/30" : "border-border"
                  )}
                >
                  <img src="/black.jpg" alt="Black" className="size-full object-cover" />
                </button>
                <button
                  onClick={() => setBgColor("blue")}
                  className={cn(
                    "size-16 rounded-lg overflow-hidden border-2",
                    bgColor === "blue" ? "border-ring ring-2 ring-ring/30" : "border-border"
                  )}
                >
                  <img src="/blue.jpg" alt="Blue" className="size-full object-cover" />
                </button>
              </div>
            </div>
          )}

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-muted-foreground">Aspect Ratio</label>
            <div className="flex gap-2">
              {([
                { value: "square" as const, icon: Square, label: "1:1" },
                { value: "horizontal" as const, icon: RectangleHorizontal, label: "16:9" },
                { value: "portrait" as const, icon: RectangleVertical, label: "4:5" },
              ]).map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => setAspectRatio(value)}
                  className={cn(
                    "flex-1 flex-col gap-1 h-auto py-2",
                    aspectRatio === value && "ring-2 ring-ring bg-accent"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 h-12 border-b border-border">
          <span className="text-sm text-muted-foreground tabular-nums">
            {dims.width} &times; {dims.height}px
          </span>
          <Button onClick={handleExport} disabled={exporting}>
            <Download className="size-3.5" />
            {exporting ? "Exporting..." : "Download JPG"}
          </Button>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-auto p-8">
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            <div ref={previewRef} style={{ width: dims.width, height: dims.height }}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </main>

      {/* Logo edit dialog — only for templates with items */}
      {template !== "chart" && (() => {
        const itemData = data as RankingData | TopDomainsData
        const itemLabel = logoEditIndex !== null
          ? template === "top-domains"
            ? (itemData as TopDomainsData).items[logoEditIndex]?.domain
            : (itemData as RankingData).items[logoEditIndex]?.name
          : ""
        return (
          <Dialog
            open={logoEditIndex !== null}
            onOpenChange={(open) => { if (!open) setLogoEditIndex(null) }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change logo for {itemLabel}</DialogTitle>
                <DialogDescription>
                  Paste an image URL to override the auto-fetched logo.
                </DialogDescription>
              </DialogHeader>
              <input
                type="url"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <DialogFooter>
                {logoEditIndex !== null && itemData.items[logoEditIndex]?.logo && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const items = [...itemData.items] as typeof itemData.items
                      items[logoEditIndex] = { ...items[logoEditIndex], logo: undefined }
                      setData({ ...itemData, items } as typeof itemData)
                      setLogoEditIndex(null)
                    }}
                  >
                    Reset
                  </Button>
                )}
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  onClick={() => {
                    if (logoEditIndex === null) return
                    const items = [...itemData.items] as typeof itemData.items
                    items[logoEditIndex] = { ...items[logoEditIndex], logo: logoUrlInput || undefined }
                    setData({ ...itemData, items } as typeof itemData)
                    setLogoEditIndex(null)
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* How it works dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How it works</DialogTitle>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
              <div>
                <p className="text-sm font-medium">Screenshot your data</p>
                <p className="text-xs text-muted-foreground text-pretty mt-1">
                  {template === "visibility-ranking" && "Take a screenshot of a ranking table that includes company names, visibility percentages with changes, and position values with changes."}
                  {template === "top-domains" && "Take a screenshot of a domain ranking that shows website domains and their share percentages."}
                  {template === "chart" && "Take a screenshot of any line or bar chart. Make sure the legend, axis labels, and data points are clearly visible."}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
              <div>
                <p className="text-sm font-medium">Generate JSON with AI</p>
                <p className="text-xs text-muted-foreground text-pretty mt-1">Click &ldquo;Copy Prompt&rdquo; then paste it along with your screenshot into Claude, ChatGPT, or any LLM. It will return structured JSON data.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
              <div>
                <p className="text-sm font-medium">Paste and submit</p>
                <p className="text-xs text-muted-foreground text-pretty mt-1">Paste the JSON into the text area and click Submit. Your template will populate with the data.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button />}>
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
