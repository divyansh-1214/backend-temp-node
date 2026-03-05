const app = require('./app');
const config = require('./config/env');
const connectMongoDB = require('./config/db.mongo');
const { connectPostgres } = require('./config/db.postgres');

const startServer = async () => {
  try {
    // Connect to both databases
    console.log('🔄 Connecting to databases...');

    await Promise.all([connectMongoDB(), connectPostgres()]);

    console.log('✅ All database connections established');

    // Start the Express server
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📍 Health check: http://localhost:${config.port}/api/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('💤 Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
