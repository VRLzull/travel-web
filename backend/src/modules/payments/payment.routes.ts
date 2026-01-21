import { Router } from "express";
import { 
  createPaymentHandler, 
  handleNotification,
  checkPaymentStatus,
  getPaymentByBooking,
  manualPaymentCreateHandler,
  manualPaymentUpdateHandler
} from "./payment.controller";
import { authenticate, authorize, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

// Buat transaksi pembayaran baru
router.post("/create", authenticate, createPaymentHandler);

// Endpoint untuk menerima notifikasi dari Midtrans
router.post("/notification", handleNotification);

// Cek status pembayaran
router.get("/status/:orderId", optionalAuthenticate, checkPaymentStatus);

// Dapatkan pembayaran berdasarkan booking
router.get("/by-booking/:bookingId", authenticate, getPaymentByBooking);

// Manual payment create/update (Admin only)
router.post("/manual/create", authenticate, authorize('ADMIN', 'SUPERADMIN'), manualPaymentCreateHandler);
router.post("/manual/update", authenticate, authorize('ADMIN', 'SUPERADMIN'), manualPaymentUpdateHandler);

export default router;
