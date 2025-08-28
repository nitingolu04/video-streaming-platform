// Debug helper to check environment variables
export function debugFirebaseConfig() {
  console.log("🔍 Firebase Environment Variables Debug:")
  console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing")
  console.log(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing",
  )
  console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing")
  console.log(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing",
  )
  console.log(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:",
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing",
  )
  console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing")

  console.log("\n📋 Actual values:")
  console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + "...")
  console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
  console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  console.log("Storage Bucket:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
}
