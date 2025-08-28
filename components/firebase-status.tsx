"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { isFirebaseReady, firebaseError, firebaseConfigValid } from "@/lib/firebase"

export function FirebaseStatus() {
  const [status, setStatus] = useState({
    ready: false,
    error: null as string | null,
    configValid: false,
  })

  const checkStatus = () => {
    setStatus({
      ready: isFirebaseReady(),
      error: firebaseError,
      configValid: firebaseConfigValid,
    })
  }

  useEffect(() => {
    checkStatus()

    // Check status periodically
    const interval = setInterval(checkStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  if (status.ready) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">✅ Firebase is connected and ready!</AlertDescription>
      </Alert>
    )
  }

  if (!status.configValid) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            Firebase Configuration Error
          </CardTitle>
          <CardDescription>Your Firebase configuration is missing or invalid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {status.error}
            </AlertDescription>
          </Alert>

          <div className="text-sm space-y-2">
            <p>
              <strong>Required environment variables:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
              <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
              <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
            </ul>
          </div>

          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Firebase Error:</strong> {status.error || "Unknown error"}
        <Button onClick={checkStatus} variant="outline" size="sm" className="ml-2">
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}
