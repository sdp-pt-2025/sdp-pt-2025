#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 Campus Study Buddy - Development Setup');
console.log('==========================================\n');

async function setupDevelopment() {
  try {
    // Check Node.js version
    console.log('📋 Checking prerequisites...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 20) {
      console.error('❌ Node.js 20+ is required. Current version:', nodeVersion);
      process.exit(1);
    }
    console.log('✅ Node.js version:', nodeVersion);

    // Check if npm is available
    try {
      execSync('npm --version', { stdio: 'ignore' });
      console.log('✅ npm is available');
    } catch (error) {
      console.error('❌ npm is not available');
      process.exit(1);
    }

    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    console.log('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('Installing backend dependencies...');
    execSync('cd backend && npm install', { stdio: 'inherit' });

    console.log('Installing frontend dependencies...');
    execSync('cd frontend && npm install', { stdio: 'inherit' });

    // Setup environment files
    console.log('\n🔧 Setting up environment files...');
    await setupEnvironmentFiles();

    // Setup Firebase
    console.log('\n🔥 Setting up Firebase...');
    await setupFirebase();

    // Setup database
    console.log('\n🗄️ Setting up database...');
    await setupDatabase();

    // Run initial tests
    console.log('\n🧪 Running initial tests...');
    try {
      execSync('npm run test:unit', { stdio: 'inherit' });
      console.log('✅ Unit tests passed');
    } catch (error) {
      console.log('⚠️ Some unit tests failed, but continuing setup...');
    }

    // Generate documentation
    console.log('\n📚 Generating documentation...');
    try {
      execSync('cd backend && npm run docs:generate', { stdio: 'inherit' });
      console.log('✅ API documentation generated');
    } catch (error) {
      console.log('⚠️ Documentation generation failed, but continuing...');
    }

    console.log('\n🎉 Development setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your environment files with actual API keys');
    console.log('2. Add your Firebase service account key to backend/service-account.json');
    console.log('3. Run "npm run dev" to start the development servers');
    console.log('4. Visit http://localhost:5173 for the frontend');
    console.log('5. Visit http://localhost:8080/health for the backend health check');
    console.log('\n🔗 Useful commands:');
    console.log('- npm run dev          # Start both frontend and backend');
    console.log('- npm run test         # Run all tests');
    console.log('- npm run test:watch   # Run tests in watch mode');
    console.log('- npm run lint         # Run linting');
    console.log('- npm run seed:db      # Seed database with test data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function setupEnvironmentFiles() {
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('Creating .env file from template...');
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created');
  } else {
    console.log('✅ .env file already exists');
  }

  // Check backend .env
  if (!fs.existsSync('backend/.env')) {
    console.log('Creating backend/.env file...');
    fs.copyFileSync('backend/env.example', 'backend/.env');
    console.log('✅ backend/.env file created');
  } else {
    console.log('✅ backend/.env file already exists');
  }

  // Check frontend .env.local
  if (!fs.existsSync('frontend/.env.local')) {
    console.log('Creating frontend/.env.local file...');
    const frontendEnvContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=sd2025law.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sd2025law
VITE_FIREBASE_STORAGE_BUCKET=sd2025law.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
`;
    fs.writeFileSync('frontend/.env.local', frontendEnvContent);
    console.log('✅ frontend/.env.local file created');
  } else {
    console.log('✅ frontend/.env.local file already exists');
  }
}

async function setupFirebase() {
  console.log('Please ensure you have:');
  console.log('1. Firebase project created at https://console.firebase.google.com/');
  console.log('2. Authentication enabled in Firebase Console');
  console.log('3. Firestore database created');
  console.log('4. Firebase Storage enabled');
  
  const hasFirebaseKey = await question('Do you have your Firebase service account key? (y/n): ');
  
  if (hasFirebaseKey.toLowerCase() === 'y') {
    console.log('Please download your Firebase service account key and save it as backend/service-account.json');
    console.log('You can get it from: https://console.firebase.google.com/u/0/project/sd2025law/settings/serviceaccounts/adminsdk');
  } else {
    console.log('⚠️ You\'ll need to set up Firebase later:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Create a new project or use existing project');
    console.log('3. Enable Authentication, Firestore, and Storage');
    console.log('4. Download service account key and save as backend/service-account.json');
  }
}

async function setupDatabase() {
  const seedDatabase = await question('Do you want to seed the database with test data? (y/n): ');
  
  if (seedDatabase.toLowerCase() === 'y') {
    try {
      console.log('Seeding database with test data...');
      execSync('cd backend && npm run seed:db', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.log('⚠️ Database seeding failed. You can run "npm run seed:db" later.');
    }
  } else {
    console.log('⚠️ Skipping database seeding. You can run "npm run seed:db" later.');
  }
}

// Run setup
setupDevelopment();
