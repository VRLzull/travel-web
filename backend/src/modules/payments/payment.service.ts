import { pool } from "../../config/db";
import midtransClient from 'midtrans-client';
import { createHash } from 'crypto';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { env } from "../../config/env";

// Inisialisasi midtransSnap
let midtransSnap: InstanceType<typeof midtransClient.Snap> | null = null;

// Fungsi untuk menginisialisasi midtransSnap
export function initializeMidtrans() {
  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
    throw new Error('Midtrans credentials are not configured');
  }
  
  // FORCE OVERRIDE for debugging if needed, but better to rely on env
  // console.log('Initializing Midtrans with:', {
  //   isProduction: env.midtransIsProduction,
  //   serverKey: process.env.MIDTRANS_SERVER_KEY,
  //   clientKey: process.env.MIDTRANS_CLIENT_KEY
  // });

  midtransSnap = new midtransClient.Snap({
    isProduction: env.midtransIsProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });
  
  return midtransSnap;
}

// Inisialisasi saat modul dimuat
initializeMidtrans();

// Interface untuk response dari Midtrans
export interface MidtransResponse {
  token: string;
  redirect_url: string;
  order_id: string;
  [key: string]: any;
}

// Define PaymentStatus type based on database enum
export type PaymentStatus = 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'failure';

// Define PaymentData interface
export interface PaymentData extends RowDataPacket {
  id: number;
  booking_id: number;
  payment_method: string;
  amount: number;
  status: PaymentStatus;
  payment_proof_url: string | null;
  midtrans_transaction_id: string | null;
  midtrans_payment_type: string | null;
  midtrans_response_json: string | null;
  created_at: Date;
  updated_at: Date;
}

interface Booking {
  id: number;
  package_id: number;
  total_amount: number;
  total_participants: number;
  package_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  duration_days?: number;
  start_date?: Date;
  end_date?: Date;
}

// Fungsi untuk delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fungsi untuk membuat transaksi dengan midtrans-client
const createTransaction = async (booking: Booking, serverKey: string): Promise<MidtransResponse> => {
  // Validate booking data
  if (!booking.id || !booking.total_amount || !booking.customer_email || !booking.customer_phone) {
    throw new Error('Invalid booking data. Required fields are missing.');
  }
  if (!midtransSnap) {
    throw new Error('Midtrans client is not initialized');
  }

  const orderId = `ORDER-${booking.id}-${Date.now()}`;
  
  // Validasi dan format data
  const totalAmount = Number(booking.total_amount) || 0;
  const participants = Number(booking.total_participants) || 1;
  const pricePerPerson = totalAmount / participants;
  
  // Dapatkan base URL dari environment variable atau gunakan default
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const bookingDetailUrl = `${frontendBaseUrl}/booking/${booking.id}`;
  
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: totalAmount,
    },
    item_details: [
      {
        id: String(booking.package_id || '1'),
        price: Math.round(pricePerPerson * 100) / 100,
        quantity: participants,
        name: (booking as any).package_title?.substring(0, 50) || 'Layanan',
      },
    ],
    customer_details: {
      first_name: (booking.customer_name || 'Customer').substring(0, 20),
      email: (booking.customer_email || 'customer@example.com').substring(0, 45),
      phone: (booking.customer_phone || '081234567890').substring(0, 19),
    },
    callbacks: {
      finish: `${frontendBaseUrl}/payment/success?orderId=${orderId}`,
      error: `${frontendBaseUrl}/payment?orderId=${orderId}`,
      pending: `${frontendBaseUrl}/payment/pending?orderId=${orderId}`,
    },
    expiry: {
      unit: 'hours',
      duration: 24
    }
  };

  console.log('Mengirim permintaan ke Midtrans dengan parameter:', JSON.stringify(parameter, null, 2));

  try {
    const response = await midtransSnap.createTransaction(parameter);
    console.log('Response dari Midtrans:', response);
    
    // Generate token secara manual jika tidak ada di response
    if (!response.token) {
      const token = createHash('sha512')
        .update(`${orderId}${response.status_code}${response.gross_amount}${serverKey}`)
        .digest('hex');
      const base = env.midtransIsProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
      return {
        ...response,
        token: token,
        redirect_url: response.redirect_url || `${base}/snap/v2/vtweb/${token}`,
        order_id: orderId
      };
    }

    return {
      token: response.token || '',
      redirect_url: response.redirect_url || `${env.midtransIsProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/v2/vtweb/${response.token}`,
      order_id: orderId,
      ...response
    };
  } catch (error: any) {
    console.error('Error saat membuat transaksi Midtrans:', {
      message: error.message,
      code: error.httpStatusCode,
      apiResponse: error.ApiResponse
    });
    throw new Error(`Gagal membuat transaksi: ${error.message}`);
  }
};

export interface PaymentResult {
  token: string;
  redirect_url: string;
  order_id: string;
}

export async function createMidtransTransaction(bookingId: number): Promise<PaymentResult> {
  if (!midtransSnap) {
    throw new Error('Midtrans client is not initialized. Please check your configuration.');
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // 1. Dapatkan data booking dari database
    const [bookingRows] = await connection.query(
      `SELECT b.*, p.title AS package_title, p.duration_days
       FROM bookings b
       JOIN tour_packages p ON p.id = b.package_id
       WHERE b.id = ? 
       FOR UPDATE`,
      [bookingId]
    ) as [Booking[], any];

    if (!Array.isArray(bookingRows) || bookingRows.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingRows[0];
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    if (!serverKey) {
      throw new Error('Midtrans server key is not configured');
    }
    
    // 2. Buat transaksi menggunakan midtrans-client
    const transaction = await createTransaction(booking, serverKey);
    
    // 3. Simpan data pembayaran ke database
    const [result] = await connection.query(
      `INSERT INTO payments (
        booking_id, 
        payment_method, 
        amount, 
        status, 
        midtrans_transaction_id,
        midtrans_payment_type,
        midtrans_response_json,
        created_at,
        updated_at
      ) VALUES (?, 'credit_card', ?, 'pending', ?, 'credit_card', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        midtrans_transaction_id = VALUES(midtrans_transaction_id),
        midtrans_payment_type = VALUES(midtrans_payment_type),
        midtrans_response_json = VALUES(midtrans_response_json),
        amount = VALUES(amount),
        status = VALUES(status),
        updated_at = NOW()`,
      [
        booking.id, 
        booking.total_amount, 
        transaction.order_id,
        JSON.stringify(transaction)
      ]
    ) as any;

    // 4. Update booking payment status only (no status column in DB)
    await connection.query(
      `UPDATE bookings 
       SET payment_status = 'pending',
           updated_at = NOW()
       WHERE id = ?`,
      [booking.id]
    );

    await connection.commit();

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: transaction.order_id
    };
  } catch (error: any) {
    console.error('Error in createMidtransTransaction:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      httpStatusCode: error.httpStatusCode,
      apiResponse: error.apiResponse
    });
    throw new Error(`Gagal membuat pembayaran: ${error.message}`);
  }
}

export async function handleMidtransNotification(notification: any): Promise<{ success: boolean }> {
  const {
    order_id: orderId,
    transaction_status: status,
    payment_type,
    fraud_status,
    status_code,
    gross_amount,
    signature_key,
    // Add other fields you need
  } = notification;

  // Verify the notification signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('Midtrans server key is not configured');
  }

  const hashed = createHash('sha512')
    .update(`${orderId}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');

  if (hashed !== signature_key) {
    throw new Error('Invalid signature key');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    console.log(`🔄 Processing Midtrans notification for order: ${orderId}, status: ${status}`);
    
    // 1. Update payment status
    const [updateResult] = await connection.query(
      `UPDATE payments 
       SET status = ?,
           midtrans_payment_type = ?,
           midtrans_response_json = ?,
           updated_at = NOW()
       WHERE midtrans_transaction_id = ?`,
      [status, payment_type, JSON.stringify(notification), orderId]
    ) as any;

    if (updateResult.affectedRows === 0) {
      throw new Error(`Payment not found for order_id: ${orderId}`);
    }

    // 2. Get payment details
    const [paymentRows] = await connection.query(
      `SELECT booking_id FROM payments 
       WHERE midtrans_transaction_id = ?`,
      [orderId]
    ) as any[];

    if (!Array.isArray(paymentRows) || paymentRows.length === 0) {
      throw new Error(`Payment not found for order_id: ${orderId}`);
    }

    const bookingId = paymentRows[0].booking_id;
    if (!bookingId) {
      throw new Error(`No booking_id found for order_id: ${orderId}`);
    }

    // 3. Map Midtrans status to booking status
    // Map Midtrans status to payment_status text in bookings
    let paymentStatusText = 'pending';
    if (['capture', 'settlement'].includes(status)) {
      paymentStatusText = fraud_status === 'challenge' ? 'pending' : 'paid';
    } else if (status === 'cancel' || status === 'deny') {
      paymentStatusText = 'cancelled';
    } else if (status === 'expire') {
      paymentStatusText = 'expired';
    }

    // 4. Update booking payment_status only
    await connection.query(
      `UPDATE bookings 
       SET payment_status = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [paymentStatusText, bookingId]
    );

    await connection.commit();
    console.log(`✅ Successfully processed payment notification for order: ${orderId}`);
    return { success: true };

  } catch (error: any) {
    await connection.rollback();
    console.error('❌ Error processing payment notification:', {
      orderId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    connection.release();
  }
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentData | null> {
  try {
    const [rows] = await pool.query<PaymentData[]>(
      `SELECT * FROM payments WHERE midtrans_transaction_id = ?`,
      [orderId]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting payment by order ID:', error);
    throw error;
  }
}

export async function updatePaymentStatus(
  orderId: string, 
  status: PaymentStatus,
  additionalData: Partial<PaymentData> = {}
): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const updateFields = ['status = ?'];
    const params: any[] = [status];

    // Add additional fields to update if provided
    if (additionalData.midtrans_payment_type) {
      updateFields.push('midtrans_payment_type = ?');
      params.push(additionalData.midtrans_payment_type);
    }
    
    if (additionalData.midtrans_response_json) {
      updateFields.push('midtrans_response_json = ?');
      params.push(JSON.stringify(additionalData.midtrans_response_json));
    }

    params.push(orderId);

    const [result] = await connection.query(
      `UPDATE payments 
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE midtrans_transaction_id = ?`,
      params
    ) as any;

    await connection.commit();
    return result && result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('Error updating payment status:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updatePaymentAndBookingStatus(
  orderId: string,
  finalStatus: 'pending' | 'paid' | 'expired' | 'cancelled',
  notification: any = {}
): Promise<{ success: boolean }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const paymentStatus: PaymentStatus = finalStatus === 'paid'
      ? 'settlement'
      : finalStatus === 'expired'
      ? 'expire'
      : finalStatus === 'cancelled'
      ? 'cancel'
      : 'pending';

    await connection.query(
      `UPDATE payments 
       SET status = ?, 
           midtrans_response_json = ?, 
           updated_at = NOW()
       WHERE midtrans_transaction_id = ?`,
      [paymentStatus, JSON.stringify(notification), orderId]
    );

    const [rows] = await connection.query(
      `SELECT booking_id FROM payments WHERE midtrans_transaction_id = ? LIMIT 1`,
      [orderId]
    ) as any[];

    const bookingId = Array.isArray(rows) && rows.length > 0 ? rows[0].booking_id : null;

    if (bookingId) {
      const paymentStatusText = finalStatus === 'paid'
        ? 'paid'
        : finalStatus === 'expired'
        ? 'expired'
        : finalStatus === 'cancelled'
        ? 'cancelled'
        : 'pending';

      await connection.query(
        `UPDATE bookings 
         SET payment_status = ?, 
             updated_at = NOW()
         WHERE id = ?`,
        [paymentStatusText, bookingId]
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function manualCreatePayment(
  bookingId: number,
  finalStatus: 'pending' | 'paid' | 'expired' | 'cancelled' = 'paid',
  amountOverride?: number,
  note: string = ''
): Promise<{ success: boolean; order_id: string }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      `SELECT * FROM bookings WHERE id = ? FOR UPDATE`,
      [bookingId]
    ) as any[];

    if (!Array.isArray(bookingRows) || bookingRows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingRows[0];
    const amount = typeof amountOverride === 'number' && amountOverride > 0
      ? amountOverride
      : Number(booking.total_amount) || 0;

    const orderId = `MANUAL-${bookingId}-${Date.now()}`;

    const paymentStatus: PaymentStatus = finalStatus === 'paid'
      ? 'settlement'
      : finalStatus === 'expired'
      ? 'expire'
      : finalStatus === 'cancelled'
      ? 'cancel'
      : 'pending';

    await connection.query(
      `INSERT INTO payments (
        booking_id,
        payment_method,
        amount,
        status,
        midtrans_transaction_id,
        midtrans_payment_type,
        midtrans_response_json,
        created_at,
        updated_at
      ) VALUES (?, 'whatsapp', ?, ?, ?, 'whatsapp', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        amount = VALUES(amount),
        status = VALUES(status),
        midtrans_transaction_id = VALUES(midtrans_transaction_id),
        midtrans_payment_type = VALUES(midtrans_payment_type),
        midtrans_response_json = VALUES(midtrans_response_json),
        updated_at = NOW()`,
      [
        bookingId,
        amount,
        paymentStatus,
        orderId,
        JSON.stringify({ method: 'whatsapp', note })
      ]
    );

    const bookingStatusText = finalStatus === 'paid'
      ? 'paid'
      : finalStatus === 'expired'
      ? 'expired'
      : finalStatus === 'cancelled'
      ? 'cancelled'
      : 'pending';

    await connection.query(
      `UPDATE bookings
       SET payment_status = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [bookingStatusText, bookingId]
    );

    await connection.commit();
    return { success: true, order_id: orderId };
  } catch (error: any) {
    await connection.rollback();
    console.error('Error in manualCreatePayment:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}
