import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ACT Admin - Core Management",
  description: "Advanced User, Role, and Menu Management system.",
  generator: "ACT Admin",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // Put font variables and antialiasing on html so they apply before hydration.
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      // Ensure a default brand so color theming is active before hydration.
      data-brand="purple"
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            {children}
            <Analytics />
            <Toaster position="top-right" closeButton richColors />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
