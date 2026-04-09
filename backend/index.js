require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./src/config/postgres');
const { connectMongo, isMongoAvailable } = require('./src/config/mongo');
const applicationRoutes = require('./src/routes/application');
const decisionRoutes = require('./src/routes/decision');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');

    const mongoStatus = isMongoAvailable() ? 'up' : 'degraded';
    const status = mongoStatus === 'up' ? 'ok' : 'degraded';

    res.json({
      success: true,
      data: {
        status,
        dependencies: {
          postgres: 'up',
          mongo: mongoStatus,
        },
      },
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Health check failed',
        details: [
          {
            field: 'postgres',
            message: err.message,
          },
        ],
      },
    });
  }
});

app.use('/api/v1/application', applicationRoutes);
app.use('/api/v1/decision', decisionRoutes);

app.use(errorHandler);

async function start() {
  try {
    await connectMongo();
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
