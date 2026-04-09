const rateLimit = require('express-rate-limit');

const decisionRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many decision requests. Please try again after 2 minutes.',
      },
    });
  },
});

module.exports = { decisionRateLimiter };
