import admin from "firebase-admin";
import serviceAccountKey from "./serviceAccountKey.json" with { type: "json" };

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
    });
}

export const bucket = admin.storage().bucket();
export const auth = admin.auth();
export const db = admin.firestore();
