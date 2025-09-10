// backend/scripts/migrateUsers.js
// Run this script to migrate existing Firebase users to Neon

import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON
const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const prisma = new PrismaClient();

// Migration function
async function migrateFirebaseUsersToNeon() {
    try {
        console.log("🚀 Starting Firebase to Neon user migration...");

        let nextPageToken;
        let totalMigrated = 0;
        let totalSkipped = 0;
        let errors = [];

        do {
            // Get users from Firebase (1000 at a time)
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

            console.log(`📋 Processing batch of ${listUsersResult.users.length} users...`);

            for (const firebaseUser of listUsersResult.users) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { uid: firebaseUser.uid }
                    });

                    if (existingUser) {
                        console.log(
                            `⏭️  User ${firebaseUser.email || firebaseUser.uid} already exists, skipping...`
                        );
                        totalSkipped++;
                        continue;
                    }

                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || `unknown_${firebaseUser.uid}@temp.com`,
                        displayName:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              `User_${firebaseUser.uid.substring(0, 8)}`,
                        photoURL: firebaseUser.photoURL || null,
                        university: "University of The Witwatersrand",
                        studentId: `migrated_${firebaseUser.uid.substring(0, 8)}`,
                        yearOfStudy: 1,
                        faculty: "Unknown",
                        modules: [],
                        fcmToken: null,
                        isActive: !firebaseUser.disabled,
                        lastLoginAt: firebaseUser.metadata.lastSignInTime
                            ? new Date(firebaseUser.metadata.lastSignInTime)
                            : null,
                        createdAt: firebaseUser.metadata.creationTime
                            ? new Date(firebaseUser.metadata.creationTime)
                            : new Date()
                    };

                    await prisma.user.create({ data: userData });

                    console.log(`✅ Migrated: ${firebaseUser.email || firebaseUser.uid}`);
                    totalMigrated++;
                } catch (userError) {
                    console.error(
                        `❌ Failed to migrate ${firebaseUser.email || firebaseUser.uid}:`,
                        userError.message
                    );

                    errors.push({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        error: userError.message
                    });
                }
            }

            nextPageToken = listUsersResult.pageToken;
            if (nextPageToken) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        } while (nextPageToken);

        console.log("\n🎉 Migration completed!");
        console.log("📊 Summary:");
        console.log(`   • Users migrated: ${totalMigrated}`);
        console.log(`   • Users skipped: ${totalSkipped}`);
        console.log(`   • Errors: ${errors.length}`);

        if (errors.length > 0) {
            const errorReport = {
                timestamp: new Date().toISOString(),
                totalErrors: errors.length,
                errors
            };
            fs.writeFileSync(
                "migration-errors.json",
                JSON.stringify(errorReport, null, 2)
            );
            console.log("\n📁 Error report saved to migration-errors.json");
        }
    } catch (error) {
        console.error("💥 Migration failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

// Run if called directly
if (process.argv[1].endsWith("migrateUsers.js")) {
    console.log("Starting migration process...");
    migrateFirebaseUsersToNeon();
}

export { migrateFirebaseUsersToNeon };
