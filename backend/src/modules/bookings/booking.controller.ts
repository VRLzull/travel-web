import { Response } from "express";
import { createBooking, getBookingById, getAllBookings, updateBookingStatus, deleteBooking } from "./booking.service";
import { IAuthRequest } from "../../types/user";

export const getBookingsHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    const filters = {
      customer_email: isAdmin ? (req.query.customer_email as string | undefined) : (req.user as any)?.email,
      payment_status: req.query.payment_status as string | undefined,
      package_id: req.query.package_id ? Number(req.query.package_id) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };

    const bookings = await getAllBookings(filters);
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (err) {
    console.error("Error fetching bookings", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch bookings" 
    });
  }
};

export const updateBookingStatusHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, message: "ID dan status diperlukan" });
    }

    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
    }

    // Jika bukan admin, hanya boleh membatalkan (status: cancelled) pesanan miliknya sendiri yang masih pending
    if (!isAdmin) {
      const userEmail = (req.user as any)?.email;
      if (userEmail !== booking.customer_email) {
        return res.status(403).json({ success: false, message: "Akses ditolak: Anda tidak memiliki akses ke pesanan ini" });
      }

      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: "Akses ditolak: Hanya admin yang bisa mengubah status selain pembatalan" });
      }

      if (booking.payment_status !== 'pending') {
        return res.status(400).json({ success: false, message: "Pesanan yang sudah lunas atau batal tidak bisa diubah" });
      }
    }

    await updateBookingStatus(id, status);
    
    return res.json({
      success: true,
      message: `Status booking #${id} berhasil diperbarui menjadi ${status}`
    });
  } catch (err) {
    console.error("Error updating booking status", err);
    return res.status(500).json({ success: false, message: "Gagal memperbarui status booking" });
  }
};

export const deleteBookingHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Hanya admin yang bisa menghapus transaksi" });
    }

    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "ID diperlukan" });
    }

    await deleteBooking(id);
    
    return res.json({
      success: true,
      message: `Transaksi #${id} berhasil dihapus`
    });
  } catch (err) {
    console.error("Error deleting booking", err);
    return res.status(500).json({ success: false, message: "Gagal menghapus transaksi" });
  }
};

export const createBookingHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const {
      package_id,
      schedule_id,
      trip_date,
      customer_name,
      customer_email,
      customer_phone,
      total_participants,
      travel_time,
      landing_time,
      airline,
      flight_code,
      terminal,
      pickup_address,
      dropoff_address,
      notes,
    } = req.body;

    // Validasi field yang required
    const missingFields: string[] = [];
    
    if (!package_id) missingFields.push('package_id');
    if (!trip_date) missingFields.push('trip_date');
    if (!customer_name) missingFields.push('customer_name');
    if (!customer_email) missingFields.push('customer_email');
    if (!customer_phone) missingFields.push('customer_phone');
    if (!total_participants) missingFields.push('total_participants');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields",
        missingFields: missingFields,
        requiredFields: [
          'package_id',
          'trip_date',
          'customer_name',
          'customer_email',
          'customer_phone',
          'total_participants'
        ],
        optionalFields: ['schedule_id']
      });
    }

    // Validasi format
    if (isNaN(Number(package_id))) {
      return res.status(400).json({ 
        success: false,
        message: "package_id must be a number" 
      });
    }

    if (isNaN(Number(total_participants)) || Number(total_participants) <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "total_participants must be a positive number" 
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Validasi format tanggal (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trip_date)) {
      return res.status(400).json({ 
        success: false,
        message: "trip_date must be in format YYYY-MM-DD (e.g., 2024-12-25)" 
      });
    }

    // Validasi schedule_id jika diberikan
    if (schedule_id) {
      if (isNaN(Number(schedule_id))) {
        return res.status(400).json({ 
          success: false,
          message: "schedule_id must be a number" 
        });
      }
    }

    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      const reqEmail = (req.user as any)?.email;
      if (!reqEmail || reqEmail !== customer_email) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: email pemesan harus sesuai dengan akun yang login"
        });
      }
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found"
      });
    }

    const booking = await createBooking({
      package_id: Number(package_id),
      schedule_id: schedule_id ? Number(schedule_id) : undefined,
      trip_date,
      customer_name,
      customer_email,
      customer_phone,
      total_participants: Number(total_participants),
      travel_time,
      landing_time,
      airline,
      flight_code,
      terminal,
      pickup_address,
      dropoff_address,
      notes,
    }, userId);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (err: any) {
    console.error("Error creating booking", err);
    
    // Handle specific errors
    if (err.message === "Package not found or inactive") {
      return res.status(404).json({ 
        success: false,
        message: err.message 
      });
    }
    
    if (err.message.includes("Schedule with id") && err.message.includes("not found")) {
      return res.status(404).json({ 
        success: false,
        message: err.message,
        hint: "You can omit schedule_id if you don't want to use a specific schedule"
      });
    }
    
    // Handle foreign key constraint errors
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid reference: The provided package_id or schedule_id does not exist",
        hint: "Make sure the package_id exists and if you provide schedule_id, it must exist and belong to the package"
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: err.message || "Failed to create booking" 
    });
  }
};

export const getBookingHandler = async (req: IAuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isAdmin = req.role === 'ADMIN' || req.role === 'SUPERADMIN';
    if (!isAdmin) {
      const reqEmail = (req.user as any)?.email;
      if (!reqEmail || reqEmail !== booking.customer_email) {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    console.error("Error fetching booking", err);
    return res.status(500).json({ message: "Failed to fetch booking" });
  }
};
