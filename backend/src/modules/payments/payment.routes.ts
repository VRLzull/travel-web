import { Router } from "express";
import { 
  createPaymentHandler, 
  handleNotification,
  checkPaymentStatus,
  getPaymentByBooking
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

export default router;
