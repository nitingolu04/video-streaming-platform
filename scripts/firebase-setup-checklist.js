// Firebase Setup Checklist for StreamCloud

console.log("📋 Firebase Setup Checklist")
console.log("=".repeat(30))

const checklist = [
  {
    step: "1. Enable Authentication",
    url: "https://console.firebase.google.com/project/streamcloud-video-platform/authentication",
    tasks: [
      "Click 'Get started'",
      "Go to 'Sign-in method' tab",
      "Enable 'Email/Password'",
      "Enable 'Google' provider",
      "Add your domain (localhost:3000) to authorized domains",
    ],
  },
  {
    step: "2. Create Firestore Database",
    url: "https://console.firebase.google.com/project/streamcloud-video-platform/firestore",
    tasks: ["Click 'Create database'", "Choose 'Start in test mode'", "Select your preferred location", "Click 'Done'"],
  },
  {
    step: "3. Enable Storage",
    url: "https://console.firebase.google.com/project/streamcloud-video-platform/storage",
    tasks: ["Click 'Get started'", "Choose 'Start in test mode'", "Select same location as Firestore", "Click 'Done'"],
  },
  {
    step: "4. Set Security Rules",
    url: "https://console.firebase.google.com/project/streamcloud-video-platform/firestore/rules",
    tasks: [
      "Update Firestore rules for production",
      "Set proper read/write permissions",
      "Test rules with Firebase emulator",
    ],
  },
]

checklist.forEach((item, index) => {
  console.log(`\n${item.step}`)
  console.log(`URL: ${item.url}`)
  console.log("Tasks:")
  item.tasks.forEach((task) => console.log(`  • ${task}`))
})

console.log("\n🔒 Recommended Security Rules:")
console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Public profiles
    }
    
    // Videos - public read, authenticated write
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    
    // Comments - authenticated users only
    match /comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
`)

console.log("\n✅ After completing these steps, your platform will be fully functional!")
