// Environment configuration for the frontend
// Make sure to set these environment variables in your .env.local file

export const config = {
  // Public API URL (Backend)
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL || 'http://localhost:8080',
  
  // Google Maps API Key
  // Get your API key from: https://console.cloud.google.com/google/maps-apis
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
  // Firebase Configuration
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },
  
  // Campus coordinates (Wits University)
  CAMPUS: {
    LAT: -26.1929,
    LNG: 28.0305,
    NAME: 'Wits University Campus'
  }
};

// Validation function to check if required environment variables are set
export const validateEnvironment = () => {
  const missing = [];
  
  if (!config.GOOGLE_MAPS_API_KEY) {
    missing.push('VITE_GOOGLE_MAPS_API_KEY');
  }
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Please set these in your .env.local file');
    return false;
  }
  
  return true;
};

export default config;
