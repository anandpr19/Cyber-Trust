import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes
import { default as scanRoutes } from './routes/scanRoutes';
import { default as uploadRoutes } from './routes/uploadRoutes';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
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

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    dbConnected,
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
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