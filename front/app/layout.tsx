import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "./provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

export const metadata: Metadata = {
  title: "BoostMyDeal - AI Voice Agents Platform",
  description: "Configure AI agents to match your sales workflow. Automate calls, emails, and CRM updates.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F74000" },
    { media: "(prefers-color-scheme: dark)", color: "#F74000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="boostmydeal-theme">
          <Providers>

            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
