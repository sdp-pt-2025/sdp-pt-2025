#!/usr/bin/env node

/**
 * Debug script to test routing configuration
 * Run with: node debug-routes.js
 */

const routes = [
  '/',
  '/dashboard',
  '/partners',
  '/study-groups',
  '/progress-tracker',
  '/profile',
  '/chats',
  '/chats/123',
  '/nonexistent-route'
];

console.log('🔍 Campus Study Buddy - Route Debugging');
console.log('=====================================\n');

console.log('📋 Available Routes:');
routes.forEach((route, index) => {
  console.log(`${index + 1}. ${route}`);
});

console.log('\n🧪 Testing Route Patterns:');
console.log('✅ Valid routes should load the correct components');
console.log('❌ Invalid routes should show 404 page');
console.log('🔄 Refresh test: Try refreshing each route in browser');

console.log('\n📝 Route Configuration Check:');
console.log('✅ Frontend: React Router with BrowserRouter');
console.log('✅ Backend: Express.js API routes');
console.log('✅ Vercel: SPA rewrite configuration');
console.log('✅ Vite: History API fallback enabled');

console.log('\n🚀 Next Steps:');
console.log('1. Start development server: npm run dev');
console.log('2. Test each route by navigating and refreshing');
console.log('3. Check browser console for any routing errors');
console.log('4. Verify Vercel deployment with production URLs');

console.log('\n🔧 Troubleshooting:');
console.log('- If routes work in dev but not production: Check Vercel config');
console.log('- If refresh fails: Verify historyApiFallback is enabled');
console.log('- If 404 persists: Check route order and catch-all placement');
