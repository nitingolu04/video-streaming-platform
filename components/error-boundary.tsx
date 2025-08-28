"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                The application encountered an error. This might be due to missing configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
              </div>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button onClick={() => this.setState({ hasError: false })} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                If this persists, check the browser console for more details.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
