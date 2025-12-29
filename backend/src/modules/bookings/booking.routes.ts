import { Router } from "express";
import { createBookingHandler, getBookingHandler, getBookingsHandler } from "./booking.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// GET /api/bookings - Get all bookings (with optional filters)
router.get("/", authenticate, getBookingsHandler);

// POST /api/bookings - Create new booking
router.post("/", authenticate, createBookingHandler);

// GET /api/bookings/:id - Get booking by ID
router.get("/:id", authenticate, getBookingHandler);

export default router;
