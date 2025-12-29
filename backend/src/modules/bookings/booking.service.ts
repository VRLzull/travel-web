import { pool } from "../../config/db";

export interface CreateBookingInput {
  package_id: number;
  schedule_id?: number;
  trip_date: string; // YYYY-MM-DD
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_participants: number;
}

export interface Booking {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  package_id: number;
  schedule_id?: number | null;
  trip_date: string;
  total_participants: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

function generateBookingCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `BK${y}${m}${d}-${rand}`;
}

export async function createBooking(input: CreateBookingInput, userId: number) {
  // 1. Validasi package exists
  const [packageRows] = await pool.query(
    `SELECT price FROM tour_packages WHERE id = ? AND is_active = 1 LIMIT 1`,
    [input.package_id]
  );

  const pkgs = packageRows as { price: number }[];
  if (pkgs.length === 0) {
    throw new Error("Package not found or inactive");
  }

  // 2. Validasi schedule_id jika diberikan
  if (input.schedule_id) {
    const [scheduleRows] = await pool.query(
      `SELECT id FROM package_schedules WHERE id = ? AND package_id = ? LIMIT 1`,
      [input.schedule_id, input.package_id]
    );

    const schedules = scheduleRows as { id: number }[];
    if (schedules.length === 0) {
      throw new Error(`Schedule with id ${input.schedule_id} not found or does not belong to package ${input.package_id}`);
    }
  }

  // Pastikan price adalah number
  const price = typeof pkgs[0].price === 'number' ? pkgs[0].price : parseFloat(pkgs[0].price) || 0;
  const participants = typeof input.total_participants === 'number' 
    ? input.total_participants 
    : parseInt(input.total_participants as string) || 1;
  const totalAmount = Math.round(price * participants * 100) / 100; // Bulatkan ke 2 desimal
  const bookingCode = generateBookingCode();
  
  console.log('Harga per orang:', price);
  console.log('Jumlah peserta:', participants);
  console.log('Total amount:', totalAmount);

  try {
    const [result] = await pool.query(
      `INSERT INTO bookings (
        user_id,
        package_id,
        schedule_id,
        customer_name,
        customer_email,
        customer_phone,
        total_participants,
        total_amount,
        booking_code,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        input.package_id,
        input.schedule_id || null,
        input.customer_name,
        input.customer_email,
        input.customer_phone,
        input.total_participants,
        totalAmount,
        bookingCode,
      ]
    );

    const insertResult = result as any;
    const bookingId = insertResult.insertId as number;

    return getBookingById(bookingId);
  } catch (error: any) {
    // Handle foreign key constraint error
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.sqlMessage.includes('fk_bookings_schedule')) {
        throw new Error(`Schedule with id ${input.schedule_id} not found. Please provide a valid schedule_id or omit it.`);
      }
      if (error.sqlMessage.includes('fk_bookings_package')) {
        throw new Error(`Package with id ${input.package_id} not found.`);
      }
    }
    throw error;
  }
}

export async function getBookingById(id: number) {
  const [rows] = await pool.query(
    `SELECT * FROM bookings WHERE id = ? LIMIT 1`,
    [id]
  );

  const bookings = rows as Booking[];
  if (bookings.length === 0) return null;
  return bookings[0];
}

export async function getAllBookings(filters?: {
  customer_email?: string;
  payment_status?: string;
  package_id?: number;
  limit?: number;
  offset?: number;
}) {
  let query = `
    SELECT 
      b.*,
      p.title AS package_title,
      p.location AS package_location
    FROM bookings b
    LEFT JOIN tour_packages p ON p.id = b.package_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.customer_email) {
    query += ` AND b.customer_email = ?`;
    params.push(filters.customer_email);
  }

  if (filters?.payment_status) {
    query += ` AND b.payment_status = ?`;
    params.push(filters.payment_status);
  }

  if (filters?.package_id) {
    query += ` AND b.package_id = ?`;
    params.push(filters.package_id);
  }

  query += ` ORDER BY b.created_at DESC`;

  if (filters?.limit) {
    query += ` LIMIT ?`;
    params.push(filters.limit);
    
    if (filters?.offset) {
      query += ` OFFSET ?`;
      params.push(filters.offset);
    }
  }

  const [rows] = await pool.query(query, params);
  return rows as (Booking & { package_title?: string; package_location?: string })[];
}