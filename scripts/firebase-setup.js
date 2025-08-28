// Firebase Setup and Configuration Script
// Run this script to set up your Firebase project

console.log("🔥 Firebase Setup Guide for StreamCloud")
console.log("=====================================")

console.log("\n📋 Step 1: Create Firebase Project")
console.log("1. Go to https://console.firebase.google.com/")
console.log("2. Click 'Create a project'")
console.log("3. Enter project name: 'streamcloud-video-platform'")
console.log("4. Enable Google Analytics (recommended)")
console.log("5. Click 'Create project'")

console.log("\n🔐 Step 2: Enable Authentication")
console.log("1. In Firebase Console, go to 'Authentication'")
console.log("2. Click 'Get started'")
console.log("3. Go to 'Sign-in method' tab")
console.log("4. Enable 'Email/Password'")
console.log("5. Enable 'Google' sign-in")
console.log("   - Add your domain to authorized domains")
console.log("   - Download the Google config file")

console.log("\n🗄️ Step 3: Set up Firestore Database")
console.log("1. Go to 'Firestore Database'")
console.log("2. Click 'Create database'")
console.log("3. Choose 'Start in test mode' (for development)")
console.log("4. Select your preferred location")
console.log("5. Click 'Done'")

console.log("\n📁 Step 4: Enable Storage")
console.log("1. Go to 'Storage'")
console.log("2. Click 'Get started'")
console.log("3. Choose 'Start in test mode'")
console.log("4. Select same location as Firestore")
console.log("5. Click 'Done'")

console.log("\n⚙️ Step 5: Get Configuration")
console.log("1. Go to Project Settings (gear icon)")
console.log("2. Scroll down to 'Your apps'")
console.log("3. Click 'Web' icon (</>) to add web app")
console.log("4. Enter app nickname: 'StreamCloud Web'")
console.log("5. Check 'Also set up Firebase Hosting'")
console.log("6. Click 'Register app'")
console.log("7. Copy the firebaseConfig object")

console.log("\n🔑 Step 6: Environment Variables")
console.log("Create a .env.local file in your project root with:")
console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# For Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
`)

console.log("\n🛡️ Step 7: Service Account (for Admin Dashboard)")
console.log("1. Go to Project Settings > Service accounts")
console.log("2. Click 'Generate new private key'")
console.log("3. Download the JSON file")
console.log("4. Extract the values for environment variables")

console.log("\n📊 Step 8: Set up Analytics")
console.log("1. Analytics is automatically enabled")
console.log("2. Go to Analytics dashboard to view data")
console.log("3. Set up custom events for video tracking")

console.log("\n🔒 Step 9: Security Rules")
console.log("Update Firestore rules for production:")

const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for public profiles
    }
    
    // Videos - public read, authenticated write
    match /videos/{videoId} {
      allow read: if true; // Public videos
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Comments - authenticated users only
    match /comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Analytics - admin only
    match /analytics/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
`

console.log(firestoreRules)

console.log("\n📱 Step 10: Install Dependencies")
console.log("Run these commands in your project:")
console.log("npm install firebase")
console.log("npm install firebase-admin")

console.log("\n🚀 Step 11: Deploy (Optional)")
console.log("1. Install Firebase CLI: npm install -g firebase-tools")
console.log("2. Login: firebase login")
console.log("3. Initialize: firebase init")
console.log("4. Deploy: firebase deploy")

console.log("\n✅ Setup Complete!")
console.log("Your Firebase project is ready for StreamCloud!")
console.log("\n📈 Admin Dashboard Access:")
console.log("- Set your email as admin in Firestore users collection")
console.log("- Add field: isAdmin: true")
console.log("- Access dashboard at: /admin")

console.log("\n🔍 Monitoring Users:")
console.log("- Real-time user tracking")
console.log("- Video analytics")
console.log("- User engagement metrics")
console.log("- Export data functionality")
