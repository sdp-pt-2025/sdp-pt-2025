import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';

const router = express.Router();

/**
 * Basic health check endpoint
 * GET /health
 */
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {}
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Detailed health check with service status
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {},
      performance: {
        responseTime: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    // Check Firebase Admin SDK
    try {
      if (admin.apps.length > 0) {
        const app = admin.app();
        healthCheck.services.firebase = {
          status: 'healthy',
          projectId: app.options.projectId,
          connected: true
        };
      } else {
        healthCheck.services.firebase = {
          status: 'unhealthy',
          error: 'Firebase Admin SDK not initialized'
        };
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.firebase = {
        status: 'unhealthy',
        error: error.message
      };
      healthCheck.status = 'degraded';
    }

    // Check Firestore connection
    try {
      if (admin.firestore) {
        const db = admin.firestore();
        // Try to read from a test collection
        await db.collection('_health_check').limit(1).get();
        healthCheck.services.firestore = {
          status: 'healthy',
          connected: true
        };
      } else {
        healthCheck.services.firestore = {
          status: 'unhealthy',
          error: 'Firestore not available'
        };
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.firestore = {
        status: 'unhealthy',
        error: error.message
      };
      healthCheck.status = 'degraded';
    }

    // Check Firebase Storage
    try {
      if (admin.storage) {
        const bucket = admin.storage().bucket();
        // Try to get bucket metadata
        await bucket.getMetadata();
        healthCheck.services.storage = {
          status: 'healthy',
          connected: true
        };
      } else {
        healthCheck.services.storage = {
          status: 'unhealthy',
          error: 'Storage not available'
        };
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.storage = {
        status: 'unhealthy',
        error: error.message
      };
      healthCheck.status = 'degraded';
    }

    // Check Weather API
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=-26.1929&lon=28.0305&appid=${apiKey}`,
          { timeout: 5000 }
        );
        healthCheck.services.weatherApi = {
          status: 'healthy',
          connected: true,
          responseTime: response.headers['x-response-time'] || 'unknown'
        };
      } else {
        healthCheck.services.weatherApi = {
          status: 'unhealthy',
          error: 'OpenWeather API key not configured'
        };
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.weatherApi = {
        status: 'unhealthy',
        error: error.message
      };
      healthCheck.status = 'degraded';
    }

    // Calculate response time
    healthCheck.performance.responseTime = Date.now() - startTime;

    // Determine overall status
    const unhealthyServices = Object.values(healthCheck.services).filter(
      service => service.status === 'unhealthy'
    );

    if (unhealthyServices.length > 0) {
      healthCheck.status = unhealthyServices.length === Object.keys(healthCheck.services).length 
        ? 'unhealthy' 
        : 'degraded';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthCheck);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {}
    });
  }
});

/**
 * Database health check
 * GET /health/database
 */
router.get('/database', async (req, res) => {
  try {
    const db = admin.firestore();
    const startTime = Date.now();

    // Test read operation
    const testDoc = await db.collection('_health_check').doc('test').get();
    
    // Test write operation
    await db.collection('_health_check').doc('test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true
    });

    // Test delete operation
    await db.collection('_health_check').doc('test').delete();

    const responseTime = Date.now() - startTime;

    res.json({
      status: 'healthy',
      database: 'firestore',
      operations: {
        read: 'success',
        write: 'success',
        delete: 'success'
      },
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'firestore',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * External API health check
 * GET /health/external
 */
router.get('/external', async (req, res) => {
  try {
    const results = {};

    // Check Weather API
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        const startTime = Date.now();
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=-26.1929&lon=28.0305&appid=${apiKey}`,
          { timeout: 10000 }
        );
        results.weatherApi = {
          status: 'healthy',
          responseTime: `${Date.now() - startTime}ms`,
          statusCode: response.status
        };
      } else {
        results.weatherApi = {
          status: 'unhealthy',
          error: 'API key not configured'
        };
      }
    } catch (error) {
      results.weatherApi = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check Firebase Auth (if available)
    try {
      if (admin.auth) {
        // Try to list users (this will fail if not properly configured, but that's ok)
        await admin.auth().listUsers(1);
        results.firebaseAuth = {
          status: 'healthy',
          connected: true
        };
      } else {
        results.firebaseAuth = {
          status: 'unhealthy',
          error: 'Firebase Auth not available'
        };
      }
    } catch (error) {
      results.firebaseAuth = {
        status: 'unhealthy',
        error: error.message
      };
    }

    const overallStatus = Object.values(results).every(
      result => result.status === 'healthy'
    ) ? 'healthy' : 'degraded';

    res.status(overallStatus === 'healthy' ? 200 : 200).json({
      status: overallStatus,
      services: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Performance metrics endpoint
 * GET /health/metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
        arrayBuffers: process.memoryUsage().arrayBuffers
      },
      cpu: process.cpuUsage(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        title: process.title
      },
      system: {
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
        totalMemory: require('os').totalmem(),
        freeMemory: require('os').freemem(),
        cpuCount: require('os').cpus().length
      }
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness probe for Kubernetes/Docker
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const db = admin.firestore();
    await db.collection('_health_check').limit(1).get();

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness probe for Kubernetes/Docker
 * GET /health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;