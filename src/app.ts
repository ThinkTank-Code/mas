import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware
app.use(cors());                // Enables Cross-Origin Resource Sharing
app.use(helmet());              // Adds security headers to protect against vulnerabilities
app.use(morgan('dev'));         // Logs HTTP requests for better monitoring
app.use(compression());         // Compresses response bodies for faster delivery
app.use(express.json());        // Parse incoming JSON requests

// Rate Limiter
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes

// Default route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

export default app;
