import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { VideosProvider } from "@/hooks/useVideos"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StreamCloud - Video Streaming Platform",
  description: "Upload, share, and discover amazing videos on StreamCloud",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <VideosProvider>{children}</VideosProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
