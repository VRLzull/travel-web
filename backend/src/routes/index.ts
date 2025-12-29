import { Router } from 'express';
import packageRoutes from '../modules/packages/package.routes';
import bookingRoutes from '../modules/bookings/booking.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Public routes
router.use('/auth', authRoutes);

// API routes
router.use('/packages', packageRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payment', paymentRoutes);

export default router;
