import { buildApp } from './app.js';
import { config } from './config/index.js';
import { closePool } from './db/index.js';

const signals = ['SIGINT', 'SIGTERM'];

async function start() {
  let app;

  try {
    // Build and start the Fastify app
    app = await buildApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          LA CASA DE ROZGAAR - Intelligence Platform          ║
║              Module 1: Intelligence & Data API                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server started successfully

📍 API Server:      http://${config.host}:${config.port}
📚 Documentation:   http://localhost:${config.port}/api/docs
❤️  Health Check:   http://localhost:${config.port}/api/health

🔧 Environment:     ${config.nodeEnv}
📊 Log Level:       ${config.logging.level}
🗄️  Database:       ${config.database.name}

Press CTRL+C to stop
    `);

    // Graceful shutdown handler
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n⚠️  ${signal} received, starting graceful shutdown...`);

        try {
          // Close Fastify server
          await app.close();
          console.log('✅ HTTP server closed');

          // Close database connections
          await closePool();
          console.log('✅ Database connections closed');

          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
start();
