import { Router, Request, Response, NextFunction } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/auth';

type LoginRequest = Request & {
  body: {
    email: string;
    password: string;
    isAdmin?: boolean;
  };
};

const router = Router();

// Public routes
router.post('/register', (req: Request, res: Response) => {
  return authController.register(req, res);
});

// Login untuk user dan admin
router.post('/login', (req: LoginRequest, res: Response) => {
  // Set default isAdmin ke false jika tidak disertakan
  if (req.body.isAdmin === undefined) {
    req.body.isAdmin = false;
  }
  return authController.login(req, res);
});

// Protected routes
router.get('/me', authenticate, (req: Request, res: Response) => {
  return authController.getMe(req as any, res);
});

// Ubah password untuk user yang sedang login
router.put('/password', authenticate, (req: Request, res: Response) => {
  return authController.updateMyPassword(req as any, res);
});

// Admin-only routes
const adminRouter = Router();
adminRouter.use(authenticate);

adminRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (req.role !== 'ADMIN' && req.role !== 'SUPERADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.'
    });
  }
  next();
});

// Contoh route admin
adminRouter.get('/users', (req: Request, res: Response) => {
  return authController.listUsers(req, res);
});

adminRouter.put('/users/:id/reset-password', (req: Request, res: Response) => {
  return authController.resetUserPassword(req, res);
});

adminRouter.get('/stats', (req: Request, res: Response) => {
  return authController.getAdminStats(req, res);
});

adminRouter.post('/stats/reset-revenue', (req: Request, res: Response) => {
  return authController.resetRevenue(req, res);
});

// Gunakan router admin untuk path /admin
router.use('/admin', adminRouter);

router.post('/admin/bootstrap', (req: Request, res: Response) => {
  return authController.bootstrapAdmin(req, res);
});

export default router;
