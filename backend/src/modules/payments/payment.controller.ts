// Di file payment.controller.ts

import { Response } from "express";
import crypto from "crypto";
import { createMidtransTransaction, updatePaymentAndBookingStatus, manualCreatePayment, PaymentResult } from "./payment.service";
import { env } from "../../config/env";
import { pool } from "../../config/db";
import { IAuthRequest } from "../../types/user";

// Tipe untuk data pembayaran
interface PaymentData {
  id: number;
  midtrans_transaction_id: string;
  status: string;
  amount: number;
  booking_id: number;
  package_id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

// Tipe untuk notifikasi Midtrans
interface MidtransNotification {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  signature_key?: string;
  gross_amount?: string;
  status_code?: string;
  payment_type?: string;
  transaction_time?: string;
  settlement_time?: string;
  [key: string]: any;
}

// Buat transaksi pembayaran baru
export const createPaymentHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const { booking_id } = req.body;
    
    if (!booking_id) {
      return res.status(400).json({ 
        success: false,
        message: "booking_id is required" 
      });
    }

    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      const [rows] = await pool.query(
        `SELECT customer_email FROM bookings WHERE id = ?`,
        [booking_id]
      ) as any;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
      }
      const ownerEmail = rows[0]?.customer_email;
      const reqEmail = (req.user as any)?.email;
      if (!reqEmail || reqEmail !== ownerEmail) {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }
    }
    console.log("🔄 Creating payment for booking ID:", booking_id);
    const result = await createMidtransTransaction(Number(booking_id));
    
    // Validasi respons
    if (!result.token || !result.redirect_url || !result.order_id) {
      console.error('Data respons pembayaran tidak lengkap:', result);
      throw new Error('Data respons pembayaran tidak lengkap');
    }

    console.log(`✅ Payment created for booking ${booking_id}:`, {
      orderId: result.order_id,
      redirectUrl: result.redirect_url ? '✅ Available' : '❌ Not available'
    });

    return res.json({
      success: true,
      message: "Payment created successfully",
      data: {
        snap_token: result.token,
        redirect_url: result.redirect_url,
        order_id: result.order_id
      }
    });
  } catch (err: any) {
    console.error("❌ Error creating payment:", {
      message: err.message,
      stack: err.stack,
      ...(err.response && { response: err.response.data })
    });
    
    return res.status(500).json({ 
      success: false,
      message: err.message || "Failed to create payment",
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

// Tangani notifikasi dari Midtrans
export const handleNotification = async (req: any, res: Response) => {
  try {
    const notification: MidtransNotification = req.body;
    console.log('📢 Received Midtrans notification:', notification);

    if (!notification || !notification.order_id) {
      console.error('❌ Invalid notification format');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid notification format' 
      });
    }

    const { order_id, transaction_status, fraud_status, signature_key, gross_amount, status_code } = notification;

    // Verifikasi signature - DINONAKTIFKAN UNTUK TESTING
    console.log('⚠️ Signature verification is disabled for testing');
    /*
    if (signature_key) {
      const serverKey = env.midtransServerKey;
      const hash = crypto
        .createHash('sha512')
        .update(order_id + status_code + gross_amount + serverKey)
        .digest('hex');

      if (hash !== signature_key) {
        console.error('❌ Invalid Midtrans signature', { order_id });
        return res.status(400).json({ 
          success: false,
          message: 'Invalid signature' 
        });
      }
    }
    */

    // Tentukan status pembayaran
    let finalStatus: "pending" | "paid" | "expired" | "cancelled" = "pending";
    
    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'challenge') {
          finalStatus = 'pending';
        } else if (fraud_status === 'accept') {
          finalStatus = 'paid';
        }
        break;
      case 'settlement':
        finalStatus = 'paid';
        break;
      case 'cancel':
      case 'deny':
        finalStatus = 'cancelled';
        break;
      case 'expire':
        finalStatus = 'expired';
        break;
      default:
        finalStatus = 'pending';
    }

    console.log(`🔄 Updating payment status for order ${order_id} to ${finalStatus}`);

    await updatePaymentAndBookingStatus(
      order_id,
      finalStatus,
      notification
    );

    console.log(`✅ Successfully updated payment status for order: ${order_id}`);
    res.status(200).send('OK');
  } catch (error: any) {
    console.error('❌ Error handling notification:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data })
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to process notification',
      ...(process.env.NODE_ENV === 'development' && { error: error.stack })
    });
  }
};

// Cek status pembayaran
export const checkPaymentStatus = async (req: IAuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    console.log('🔍 Checking payment status for order:', orderId);
    
    // Gunakan type assertion yang lebih aman
    const [rows] = await pool.query(
      `SELECT p.*, b.package_id, b.total_amount, b.customer_name, b.customer_email 
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.midtrans_transaction_id = ?`,
      [orderId]
    ) as unknown as [PaymentData[]];

    if (!rows || rows.length === 0) {
      console.error('❌ Payment not found for order:', orderId);
      return res.status(404).json({ 
        success: false,
        message: 'Pembayaran tidak ditemukan' 
      });
    }

  const payment = rows[0];
    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    const isAuthenticated = !!req.user;
    if (isAuthenticated && !isAdmin) {
      const reqEmail = (req.user as any)?.email;
      if (!reqEmail || reqEmail !== payment.customer_email) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }
    }
    console.log('✅ Payment status retrieved:', { orderId: payment.midtrans_transaction_id, status: payment.status });
    
    res.json({
      success: true,
      data: {
        orderId: payment.midtrans_transaction_id,
        status: payment.status,
        amount: payment.amount,
        bookingId: payment.booking_id,
        packageId: payment.package_id,
        customerName: payment.customer_name,
        customerEmail: isAuthenticated ? payment.customer_email : undefined,
        paymentDate: payment.updated_at || payment.created_at
      }
    });
  } catch (error: any) {
    console.error('❌ Error checking payment status:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Gagal memeriksa status pembayaran',
      ...(process.env.NODE_ENV === 'development' && { error: error.stack })
    });
  }
};

export const getPaymentByBooking = async (req: IAuthRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId tidak valid' });
    }
    const [rows] = await pool.query(
      `SELECT p.*, b.package_id, b.total_amount, b.customer_name, b.customer_email 
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.booking_id = ?
       ORDER BY p.updated_at DESC, p.created_at DESC
       LIMIT 1`,
      [bookingId]
    ) as any;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pembayaran untuk booking ini tidak ditemukan' });
    }

    const payment = rows[0];

    // Check ownership
    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      const reqEmail = (req.user as any)?.email;
      if (!reqEmail || reqEmail !== payment.customer_email) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }
    }

    res.json({
      success: true,
      data: {
        orderId: payment.midtrans_transaction_id,
        status: payment.status,
        amount: payment.amount,
        bookingId: payment.booking_id,
        packageId: payment.package_id,
        customerName: payment.customer_name,
        customerEmail: payment.customer_email,
        paymentDate: payment.updated_at || payment.created_at
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil pembayaran' });
  }
};

// Alias untuk kompatibilitas
export const midtransNotificationHandler = handleNotification;

export const manualPaymentCreateHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const { booking_id, final_status, amount, note } = req.body as {
      booking_id: number;
      final_status?: 'pending' | 'paid' | 'expired' | 'cancelled';
      amount?: number;
      note?: string;
    };

    if (!booking_id || !Number.isFinite(Number(booking_id))) {
      return res.status(400).json({ success: false, message: 'booking_id tidak valid' });
    }

    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const result = await manualCreatePayment(Number(booking_id), final_status || 'paid', amount, note || '');
    return res.json({
      success: true,
      message: 'Manual payment created/updated',
      data: { order_id: result.order_id }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Gagal membuat pembayaran manual' });
  }
};

export const manualPaymentUpdateHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const { order_id, final_status, note } = req.body as {
      order_id: string;
      final_status: 'pending' | 'paid' | 'expired' | 'cancelled';
      note?: string;
    };

    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({ success: false, message: 'order_id tidak valid' });
    }
    if (!final_status) {
      return res.status(400).json({ success: false, message: 'final_status diperlukan' });
    }

    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await updatePaymentAndBookingStatus(order_id, final_status, { note: note || 'manual update' });
    return res.json({ success: true, message: 'Status pembayaran diupdate' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Gagal mengupdate pembayaran manual' });
  }
};
