import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { upload } from './middleware/upload.js';
import { seedDatabase } from './utils/seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import villaRoutes from './routes/villaRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { getDashboardStats } from './controllers/reportController.js';
import { protect } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading uploaded images/assets cross-origin
}));
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serverless DB Connection & Auto-Seed middleware
let isDbConnecting = false;
let seedExecuted = false;

const ensureDbConnected = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!isDbConnecting) {
    isDbConnecting = true;
    try {
      await connectDB();
      if (!seedExecuted) {
        seedExecuted = true;
        seedDatabase().catch((e) => console.error('Seed error:', e));
      }
    } finally {
      isDbConnecting = false;
    }
  } else {
    while (mongoose.connection.readyState !== 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
};

app.use(async (req, res, next) => {
  try {
    await ensureDbConnected();
    next();
  } catch (err) {
    console.error('Database connection error in request:', err);
    res.status(500).json({ success: false, message: 'Database connection failed: ' + err.message });
  }
});

// Rate limiting for public APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Static uploads directory
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', authRoutes); // Staff routes are also mapped here for clean REST semantics
app.use('/api/villas', villaRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/reports', reportRoutes);
app.get('/api/dashboard/stats', protect, getDashboardStats);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Moon Light Villa Reservation & ERP Engine',
    timestamp: new Date()
  });
});

// Database seed & sync endpoint for one-click Atlas setup / inventory refresh
app.get('/api/seed', async (req, res) => {
  try {
    const isForce = req.query.force === 'true';
    const stats = await seedDatabase(isForce);
    res.json({
      success: true,
      message: 'Database seeded and synced successfully on MongoDB Atlas!',
      stats,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Seed endpoint error:', err);
    res.status(500).json({ success: false, message: 'Seeding failed: ' + err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Moon Light Villa Reservation & ERP API Server',
    message: 'Backend API is running. Access endpoints via /api/*',
    timestamp: new Date()
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start Server & Connect DB (for local / continuous hosting)
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(` MOON LIGHT VILLA - Backend REST API & ERP Engine`);
      console.log(` Running on: http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
