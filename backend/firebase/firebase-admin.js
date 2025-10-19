// lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  
//   console.log("Initializing Firebase Admin...");
//   console.log("Storage Bucket:", storageBucket); // Debug log/
  
  if (!storageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET is not defined in environment variables");
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: storageBucket,
  });
  
  console.log("✅ Firebase Admin initialized successfully");
}

export const adminStorage = getStorage();