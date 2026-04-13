import { Router } from "express";
import { createBookingHandler, getBookingHandler, getBookingsHandler, updateBookingStatusHandler, deleteBookingHandler, clearBookingsHandler } from "./booking.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// GET /api/bookings - Get all bookings (with optional filters)
router.get("/", authenticate, getBookingsHandler);

// POST /api/bookings - Create new booking
router.post("/", authenticate, createBookingHandler);

// GET /api/bookings/:id - Get booking by ID
router.get("/:id", authenticate, getBookingHandler);

// PUT /api/bookings/:id/status - Update booking status (Admin only)
router.put("/:id/status", authenticate, updateBookingStatusHandler);

// POST /api/bookings/clear - Clear all bookings or by month-year (Admin only)
router.post("/clear", authenticate, clearBookingsHandler);

// DELETE /api/bookings/:id - Delete booking (Admin only)
router.delete("/:id", authenticate, deleteBookingHandler);

export default router;
