import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './features/auth/auth.routes.js';
import userRoutes from './features/users/user.routes.js';
import providerRoutes from './features/providers/provider.routes.js';
import bookingRoutes from './features/bookings/booking.routes.js';
import reviewRoutes from './features/reviews/review.routes.js';
import notificationRoutes from './features/notifications/notification.routes.js';
import adminRoutes from './features/admin/admin.routes.js';
import uploadRoutes from './features/upload/upload.routes.js';
import { attachRequestId, requestLifecycleLogger, httpRequestLogger } from './middleware/requestLogger.middleware.js';
import { sanitizeRequest } from './middleware/sanitize.middleware.js';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(hpp());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(attachRequestId);
app.use(requestLifecycleLogger);
app.use(httpRequestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequest);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Findkar API running' }));

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
