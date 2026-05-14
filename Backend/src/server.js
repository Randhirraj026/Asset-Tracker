const app = require('./app');
const env = require('./config/env');
const { bootstrapDatabase } = require('./config/databaseBootstrap');
const logger = require('./utils/logger');

let server;

const start = async () => {
  try {
    await bootstrapDatabase();

    server = app.listen(env.port, () => {
      logger.info(`Asset Tracking API listening on port ${env.port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const message = `Port ${env.port} is already in use. Stop the existing backend process or change PORT in Backend/.env.`;
        logger.error(message);
        console.error(message);
        process.exit(1);
      }

      logger.error('HTTP server error', { message: error.message, stack: error.stack });
      console.error(error.message);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Backend startup failed', { message: error.message, stack: error.stack });
    console.error(error.message);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  logger.info(`${signal} received. Closing HTTP server.`);
  if (!server) process.exit(0);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
