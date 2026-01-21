import { pool } from "../../config/db";

export interface CreateBookingInput {
  package_id: number;
  schedule_id?: number;
  trip_date: string; // YYYY-MM-DD
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_participants: number;
  travel_time?: string;
  landing_time?: string;
  airline?: string;
  flight_code?: string;
  terminal?: string;
  pickup_address?: string;
  dropoff_address?: string;
  notes?: string;
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
  travel_time?: string;
  landing_time?: string;
  airline?: string;
  flight_code?: string;
  terminal?: string;
  pickup_address?: string;
  dropoff_address?: string;
  notes?: string;
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
  
  console.log('Harga per hari:', price);
  console.log('Durasi/Unit:', participants);
  console.log('Total amount:', totalAmount);

  try {
    const [result] = await pool.query(
      `INSERT INTO bookings (
        user_id,
        package_id,
        schedule_id,
        trip_date,
        customer_name,
        customer_email,
        customer_phone,
        total_participants,
        total_amount,
        booking_code,
        payment_status,
        travel_time,
        landing_time,
        airline,
        flight_code,
        terminal,
        pickup_address,
        dropoff_address,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        input.package_id,
        input.schedule_id || null,
        input.trip_date,
        input.customer_name,
        input.customer_email,
        input.customer_phone,
        input.total_participants,
        totalAmount,
        bookingCode,
        input.travel_time || null,
        input.landing_time || null,
        input.airline || null,
        input.flight_code || null,
        input.terminal || null,
        input.pickup_address || null,
        input.dropoff_address || null,
        input.notes || null,
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

export async function getBookingByOrderId(orderId: string) {
  let bookingId: number | null = null;

  if (orderId.startsWith('ORDER-')) {
    // Format: ORDER-{id}-{timestamp}
    const parts = orderId.split('-');
    bookingId = parseInt(parts[1]);
  } else if (orderId.startsWith('BK')) {
    // Format: BK{YYYYMMDD}-{rand}
    const [rows] = await pool.query(
      `SELECT b.*, p.title, p.location, p.price, p.duration_days
       FROM bookings b
       JOIN tour_packages p ON b.package_id = p.id
       WHERE b.booking_code = ? LIMIT 1`,
      [orderId]
    );
    const bookings = rows as any[];
    if (bookings.length > 0) {
      const b = bookings[0];
      return {
        ...b,
        package: {
          title: b.title,
          location: b.location,
          price: b.price,
          duration_days: b.duration_days
        }
      };
    }
  } else {
    // Assume it's a numeric ID
    bookingId = parseInt(orderId);
  }

  if (bookingId && !isNaN(bookingId)) {
    const [rows] = await pool.query(
      `SELECT b.*, p.title, p.location, p.price, p.duration_days
       FROM bookings b
       JOIN tour_packages p ON b.package_id = p.id
       WHERE b.id = ? LIMIT 1`,
      [bookingId]
    );
    const bookings = rows as any[];
    if (bookings.length > 0) {
      const b = bookings[0];
      return {
        ...b,
        package: {
          title: b.title,
          location: b.location,
          price: b.price,
          duration_days: b.duration_days
        }
      };
    }
  }

  return null;
}

export async function updateBookingStatus(id: number, status: string) {
  const [result] = await pool.query(
    `UPDATE bookings SET payment_status = ? WHERE id = ?`,
    [status, id]
  );
  return result;
}

export async function deleteBooking(id: number) {
  const [result] = await pool.query(
    `DELETE FROM bookings WHERE id = ?`,
    [id]
  );
  return result;
}
