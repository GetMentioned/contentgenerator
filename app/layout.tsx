import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Agentation } from "agentation"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const suisseIntl = localFont({
  src: [
    { path: "../public/SuisseIntl-Regular.woff2", weight: "400" },
    { path: "../public/SuisseIntl-Medium.woff2", weight: "500" },
  ],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", suisseIntl.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  )
}
