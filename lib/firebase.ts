import { type FirebaseApp, initializeApp, getApps, getApp } from "firebase/app"
import { type Auth, getAuth, GoogleAuthProvider } from "firebase/auth"
import { type Firestore, getFirestore } from "firebase/firestore"
import { type FirebaseStorage, getStorage } from "firebase/storage"
import { type Analytics, getAnalytics, isSupported } from "firebase/analytics"

// Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB6qa7XeNEvFpNkv-GF9iMpTDPW_zNv4e4",
  authDomain: "streamcloud-video-platform.firebaseapp.com",
  projectId: "streamcloud-video-platform",
  storageBucket: "streamcloud-video-platform.firebasestorage.app",
  messagingSenderId: "39046573217",
  appId: "1:39046573217:web:22ac1fea5ee989f200d4e0",
  measurementId: "G-TJKS2RYM86",
}

// Validate required config
const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig])

if (missingKeys.length > 0) {
  console.error("Missing Firebase config keys:", missingKeys)
}

// Check if we're in the browser and have valid config
const isBrowser = typeof window !== "undefined"
const hasValidConfig = missingKeys.length === 0

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined
let storageInstance: FirebaseStorage | undefined
let analyticsInstance: Analytics | undefined

// Initialize Firebase only in browser with valid config
if (isBrowser && hasValidConfig) {
  try {
    // Get or create Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    // Initialize Auth
    authInstance = getAuth(app)

    // Initialize Firestore
    dbInstance = getFirestore(app)

    // Initialize Storage
    storageInstance = getStorage(app)

    // Initialize Analytics (only if supported)
    isSupported()
      .then((supported) => {
        if (supported && app) {
          analyticsInstance = getAnalytics(app)
        }
      })
      .catch((error) => {
        console.warn("Analytics not supported:", error)
      })

    console.log("✅ Firebase initialized successfully")
  } catch (error) {
    console.error("❌ Firebase initialization error:", error)
  }
} else if (isBrowser) {
  console.error("❌ Firebase config invalid or missing")
} else {
  console.log("🔧 Firebase skipped (server-side)")
}

// Create Google Auth Provider
const googleAuthProvider = new GoogleAuthProvider()
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
})

// Safe exports with proper typing
export const auth = authInstance
export const db = dbInstance
export const storage = storageInstance
export const analytics = analyticsInstance
export const googleProvider = googleAuthProvider

// Export initialization status
export const firebaseApp = app
export const firebaseInitialized = !!app && !!authInstance
export const firebaseError = !hasValidConfig ? `Missing config: ${missingKeys.join(", ")}` : null
export const firebaseConfigValid = hasValidConfig

// Helper function to check if Firebase is ready
export const isFirebaseReady = () => {
  return isBrowser && !!app && !!authInstance && !!dbInstance
}

// Debug info
if (isBrowser) {
  console.log("🔥 Firebase Debug Info:", {
    initialized: firebaseInitialized,
    hasApp: !!app,
    hasAuth: !!authInstance,
    hasDb: !!dbInstance,
    hasStorage: !!storageInstance,
    configValid: firebaseConfigValid,
    error: firebaseError,
  })
}

export default app
