/**
 * Express Application Server Configuration
 * 
 * Configures core security middlewares (CORS, Helmet with CSP/HSTS, Rate Limiting),
 * body & cookie parsers, static asset serving, REST API routing mounts, and global error handling.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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

// Trust Render.com's reverse proxy so express-rate-limit correctly identifies client IPs
app.set('trust proxy', 1);

/**
 * 1. Security & CORS Middlewares
 * - Helmet configures Content Security Policy, HSTS, X-Frame-Options, Referrer-Policy
 * - CORS permits request headers & credentials from client domains (Vercel & localhost)
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://maps.gstatic.com", "https://*.googleapis.com"],
        connectSrc: ["'self'", "https://maps.googleapis.com", "https://*.supabase.co", "https://*.supabase.com"],
      },
    },
  })
);

app.use(
  cors({
    origin: true, // Allow client origins with credentials
    credentials: true,
  })
);

// 2. Request Body & Cookie Parsing Middlewares
app.use(cookieParser());
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
 */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

/**
 * 7. Global Centralized Error Handler Middleware
 */
app.use(errorHandler);

export default app;
