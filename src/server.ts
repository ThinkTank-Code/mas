import http, { Server } from 'http';
import app from './app';
import env from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/database';
import { initializeEmailWorker } from './services/emailService';
// import { seedSuperAdmin } from './scripts/seedSuperAdmin';

let server: Server | null = null;
let dbConnected = false;

// Connect to database on startup
async function initializeDatabase() {
    if (!dbConnected) {
        try {
            await connectDB();
            logger.info('Database connected');
            console.log('✅ Database connected successfully');
            dbConnected = true;
            
            // Initialize email worker after DB connection
            initializeEmailWorker();
        } catch (error) {
            console.error('❌ Error connecting to database:', error);
            throw error;
        }
    }
}

async function startServer() {
    try {
        await initializeDatabase();

        server = http.createServer(app);
        server.listen(env.PORT, () => {
            console.log(`🚀 Server is running on port ${env.PORT}`);
        });
        // await seedSuperAdmin();
        handleProcessEvents();
    } catch (error) {
        console.error('❌ Error during server startup:', error);
        process.exit(1);
    }
}

/**
 * Gracefully shutdown the server and close database connections.
 * @param {string} signal - The termination signal received.
 */
async function gracefulShutdown(signal: string) {
    console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('✅ HTTP server closed.');

            try {
                console.log('✅ Database connection closed.');
            } catch (error) {
                console.error('❌ Error closing database connection:', error);
            }

            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}

/**
 * Handle system signals and unexpected errors.
 */
function handleProcessEvents() {
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
        console.error('💥 Unhandled Rejection:', reason);
        gracefulShutdown('unhandledRejection');
    });
}

// Start the application (for local development and VPS)
if (!process.env.VERCEL) {
    startServer();
}

// Export app for Vercel serverless
export default app;
