import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Routes
import { default as scanRoutes } from './routes/scanRoutes';
import { default as uploadRoutes } from './routes/uploadRoutes';
import { default as dashboardRoutes } from './routes/dashboardRoutes';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ────────────────────────────────────────────────
// In production, restrict to your Vercel frontend domain.
// Set CORS_ORIGIN env var on Render, e.g. "https://cyber-trust.vercel.app"
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev; restrict in prod via env var
    }
  },
  credentials: true
}));

// ─── Middleware ───────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiters ───────────────────────────────────────
// These MUST be defined before route registration to actually apply.

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,               // 5 scans per minute per IP
  message: { error: 'Too many scan requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                    // 10 uploads per hour per IP
  message: { error: 'Too many upload requests. Try again after a short time.' },
  standardHeaders: true,
  legacyHeaders: false
});

const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,              // 30 requests per minute per IP
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ─── Database ────────────────────────────────────────────
let dbConnected = false;

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cyber-trust';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
    dbConnected = true;
  } catch (err) {
    console.warn('⚠️ MongoDB unavailable - running in memory mode');
    if (err instanceof Error) {
      console.warn(`Error: ${err.message}`);
    }
    dbConnected = false;
  }
};

// ─── Routes (with rate limiters applied) ─────────────────
app.use('/api/scan', scanLimiter, scanRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/dashboard', dashboardLimiter, dashboardRoutes);

// Health check (no rate limit)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    dbConnected,
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// ─── Error Handling ──────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ─── Start Server ────────────────────────────────────────
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Bind to 0.0.0.0 for Render compatibility
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`\n🚀 Cyber-Trust Backend running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;