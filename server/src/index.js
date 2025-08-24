import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Import routes
import healthRoutes from './routes/health.js';
import partnersRoutes from './routes/partners.js';
import groupsRoutes from './routes/groups.js';
import progressRoutes from './routes/progress.js';
import scheduleRoutes from './routes/schedule.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Firebase Admin
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
} else {
  console.log(
    '⚠️  Firebase Admin not initialized - no service account credentials found'
  );
  console.log(
    '📝 To enable Firebase Admin, set GOOGLE_APPLICATION_CREDENTIALS in your .env file'
  );
}

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/schedule', scheduleRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Campus Study Buddy API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  console.log(
    `🔐 Firebase Admin: ${admin.apps.length > 0 ? '✅ Enabled' : '❌ Disabled'}`
  );
});
