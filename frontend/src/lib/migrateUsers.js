// scripts/migrateUsers.js
import { PrismaClient } from '@prisma/client';
import { auth } from '../firebase/init';
import { listUsers } from 'firebase-admin/auth';

// Initialize Prisma
const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    console.log('Starting user migration from Firebase to Neon...');

    // List all users from Firebase Auth (you might need Firebase Admin SDK)
    // This example assumes you have Firebase Admin setup
    const firebaseUsers = await listUsers(auth);
    
    console.log(`Found ${firebaseUsers.users.length} users in Firebase`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const firebaseUser of firebaseUsers.users) {
      try {
        // Check if user already exists in Neon
        const existingUser = await prisma.user.findUnique({
          where: { uid: firebaseUser.uid }
        });

        if (existingUser) {
          console.log(`User ${firebaseUser.uid} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Prepare user data for Neon
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          // Set default values for required fields
          university: 'Unknown',
          studentId: `temp_${firebaseUser.uid.substring(0, 8)}`,
          yearOfStudy: 1,
          faculty: 'General',
          modules: [],
          isActive: true,
          // You might want to set these from Firebase metadata
          createdAt: firebaseUser.metadata.creationTime 
            ? new Date(firebaseUser.metadata.creationTime) 
            : new Date(),
          lastLoginAt: firebaseUser.metadata.lastSignInTime
            ? new Date(firebaseUser.metadata.lastSignInTime)
            : null
        };

        // Create user in Neon
        await prisma.user.create({
          data: userData
        });

        console.log(`Migrated user: ${firebaseUser.email} (${firebaseUser.uid})`);
        migratedCount++;

      } catch (error) {
        console.error(`Error migrating user ${firebaseUser.uid}:`, error.message);
      }
    }

    console.log(`Migration completed!`);
    console.log(`Migrated: ${migratedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateUsers();