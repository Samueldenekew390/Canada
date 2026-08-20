// Copy this file to `config.js` and fill in your real keys. Do NOT commit `config.js` to source control.
// Firebase config (web app). Get these from Firebase Console -> Project Settings -> General -> Your apps
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

// Supabase config. Get these from your Supabase project settings.
window.SUPABASE_URL = "https://your-project.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
// Name of the storage bucket to use for uploads. Create this in Supabase Storage first.
window.SUPABASE_BUCKET = "uploads";

// Notes:
// - After filling values, create a local copy named `config.js` and ensure it's loaded before `script.js`.
// - For production, consider uploading via a secure server or using signed uploads.
