/**
 * Express Application Server Configuration
 * 
 * Configures core security middlewares (CORS, Helmet, Rate Limiting),
 * body parsers, static asset serving, REST API routing mounts, and global error handling.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';

import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import adminRoutes from './routes/adminRoutes';
import siteRoutes from './routes/siteRoutes';

// Initialize Express Application
const app: Application = express();

/**
 * 1. Security & CORS Middlewares
 * - Helmet adds standard secure HTTP headers
 * - CORS permits request headers from frontend client domains (Vercel & localhost)
 */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: true, // Allow client origins (Vercel, localhost)
    credentials: true,
  })
);

// 2. Request Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Apply General Rate Limiting to all /api endpoints
app.use('/api', apiLimiter);

// 4. Serve Static Uploaded Room Images
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

/**
 * 5. Mount Versioned REST API Routes (/api/v1/*)
 */
app.use('/api/v1/auth', authRoutes);         // Authentication & Profile routes
app.use('/api/v1/rooms', roomRoutes);        // Room listings & detail routes
app.use('/api/v1/inquiries', inquiryRoutes); // Tenant inquiries & lead routes
app.use('/api/v1/admin', adminRoutes);       // Admin management CRUD routes
app.use('/api/v1/site', siteRoutes);         // Property info & site settings routes

/**
 * 6. Health Check Endpoint
 * Used by cloud uptime monitors to verify server availability.
 */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

/**
 * 7. Global Centralized Error Handler Middleware
 * Catches all unhandled errors thrown across async route handlers.
 */
app.use(errorHandler);

export default app;
