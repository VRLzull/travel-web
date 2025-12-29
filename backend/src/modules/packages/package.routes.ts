import { Router } from "express";
import { 
  getPackagesHandler, 
  getPackageDetailHandler, 
  createPackageHandler,
  updatePackageHandler,
  deletePackageHandler
} from "./package.controller";
import {
  addImageHandler,
  deleteImageHandler,
  setPrimaryImageHandler
} from "./package-images.controller";
import {
  addScheduleHandler,
  updateScheduleHandler,
  deleteScheduleHandler
} from "./package-schedules.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

// Public routes - tidak perlu authentication
// GET /api/packages - Get all packages
router.get("/", getPackagesHandler);

// GET /api/packages/:id - Get package by ID
router.get("/:id", getPackageDetailHandler);

// Protected routes - hanya admin yang bisa akses
// POST /api/packages - Create new package (Admin only)
router.post("/", authenticate, authorize('ADMIN', 'SUPERADMIN'), createPackageHandler);

// PUT /api/packages/:id - Update package (Admin only)
router.put("/:id", authenticate, authorize('ADMIN', 'SUPERADMIN'), updatePackageHandler);

// DELETE /api/packages/:id - Delete package (Admin only)
router.delete("/:id", authenticate, authorize('ADMIN', 'SUPERADMIN'), deletePackageHandler);

// Package Images routes (Admin only)
// POST /api/packages/:packageId/images - Add image to package
router.post("/:packageId/images", authenticate, authorize('ADMIN', 'SUPERADMIN'), addImageHandler);

// DELETE /api/packages/images/:imageId - Delete image
router.delete("/images/:imageId", authenticate, authorize('ADMIN', 'SUPERADMIN'), deleteImageHandler);

// PUT /api/packages/:packageId/images/primary - Set primary image
router.put("/:packageId/images/primary", authenticate, authorize('ADMIN', 'SUPERADMIN'), setPrimaryImageHandler);

// Package Schedules routes (Admin only)
// POST /api/packages/:packageId/schedules - Add schedule to package
router.post("/:packageId/schedules", authenticate, authorize('ADMIN', 'SUPERADMIN'), addScheduleHandler);

// PUT /api/packages/schedules/:scheduleId - Update schedule
router.put("/schedules/:scheduleId", authenticate, authorize('ADMIN', 'SUPERADMIN'), updateScheduleHandler);

// DELETE /api/packages/schedules/:scheduleId - Delete schedule
router.delete("/schedules/:scheduleId", authenticate, authorize('ADMIN', 'SUPERADMIN'), deleteScheduleHandler);

export default router;
