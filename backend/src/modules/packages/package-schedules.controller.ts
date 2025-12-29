import { Request, Response } from "express";
import { 
  addPackageSchedule, 
  updatePackageSchedule, 
  deletePackageSchedule 
} from "./package.service";

export const addScheduleHandler = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.packageId);
    const { departure_date, available_quota } = req.body;

    if (!packageId) {
      return res.status(400).json({ message: "Invalid package id" });
    }

    if (!departure_date || !available_quota) {
      return res.status(400).json({ 
        message: "departure_date and available_quota are required" 
      });
    }

    const schedule = await addPackageSchedule(packageId, {
      departure_date,
      available_quota: Number(available_quota)
    });

    res.status(201).json({
      message: 'Schedule added successfully',
      data: schedule
    });
  } catch (err: any) {
    console.error("Error adding schedule", err);
    if (err.message === 'Package not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('must be') || err.message.includes('cannot')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to add schedule" });
  }
};

export const updateScheduleHandler = async (req: Request, res: Response) => {
  try {
    const scheduleId = Number(req.params.scheduleId);
    const { departure_date, available_quota } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const schedule = await updatePackageSchedule(scheduleId, {
      departure_date,
      available_quota: available_quota !== undefined ? Number(available_quota) : undefined
    });

    res.json({
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (err: any) {
    console.error("Error updating schedule", err);
    if (err.message === 'Schedule not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('must be') || err.message.includes('cannot')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to update schedule" });
  }
};

export const deleteScheduleHandler = async (req: Request, res: Response) => {
  try {
    const scheduleId = Number(req.params.scheduleId);

    if (!scheduleId) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const result = await deletePackageSchedule(scheduleId);
    res.json({
      message: result.message,
      success: result.success
    });
  } catch (err: any) {
    console.error("Error deleting schedule", err);
    if (err.message === 'Schedule not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === 'Cannot delete schedule with active bookings') {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to delete schedule" });
  }
};

