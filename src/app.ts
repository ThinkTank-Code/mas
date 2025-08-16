import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import env from './config/env';

const app = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));                // Enables Cross-Origin Resource Sharing
app.use(helmet());              // Adds security headers to protect against vulnerabilities
app.use(morgan('dev'));         // Logs HTTP requests for better monitoring
app.use(compression());         // Compresses response bodies for faster delivery
app.use(express.urlencoded({ extended: true })); // FOR FORM DATA
app.use(express.json()); // FOR JSON (not needed by SSLCommerz)

// Rate Limiter
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/v1', router);

// Default route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

app.use(globalErrorHandler)

export default app;
