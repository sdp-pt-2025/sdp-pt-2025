import express from 'express';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'Campus Study Buddy API',
    version: '1.0.0'
  });
});

export default router;
