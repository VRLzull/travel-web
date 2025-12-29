import { Request, Response } from "express";
import { 
  getAllPackages, 
  getPackageById, 
  createPackage,
  updatePackage,
  deletePackage
} from "./package.service";

export const getPackagesHandler = async (req: Request, res: Response) => {
  try {
    const packages = await getAllPackages();
    res.json(packages);
  } catch (err) {
    console.error("Error fetching packages", err);
    res.status(500).json({ message: "Failed to fetch packages" });
  }
};

export const getPackageDetailHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid package id" });
    }

    const pkg = await getPackageById(id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json(pkg);
  } catch (err) {
    console.error("Error fetching package detail", err);
    res.status(500).json({ message: "Failed to fetch package details" });
  }
};

export const createPackageHandler = async (req: Request, res: Response) => {
  try {
    const requiredFields = ['title', 'location', 'duration_days', 'price', 'description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate price and duration are positive numbers
    if (req.body.price <= 0 || req.body.duration_days <= 0) {
      return res.status(400).json({
        message: 'Price and duration days must be greater than 0'
      });
    }

    const newPackage = await createPackage({
      title: req.body.title,
      location: req.body.location,
      city: req.body.city || req.body.location,
      country: req.body.country || 'Indonesia',
      duration_days: req.body.duration_days,
      price: req.body.price,
      max_people: req.body.max_people || 10,
      description: req.body.description,
      is_featured: req.body.is_featured,
      primary_image: req.body.primary_image,
      category: req.body.category,
      short_description: req.body.short_description,
      itinerary: req.body.itinerary,
      facilities: req.body.facilities
    });

    res.status(201).json({
      message: 'Package created successfully',
      data: newPackage
    });
  } catch (err: unknown) {
    console.error("Error creating package", err);
    const code = (err as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'A package with this title already exists'
      });
    }
    res.status(500).json({ message: "Failed to create package" });
  }
};

export const updatePackageHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid package id" });
    }

    // Validate numeric fields if provided
    if (req.body.price !== undefined && req.body.price <= 0) {
      return res.status(400).json({
        message: 'Price must be greater than 0'
      });
    }

    if (req.body.duration_days !== undefined && req.body.duration_days <= 0) {
      return res.status(400).json({
        message: 'Duration days must be greater than 0'
      });
    }

    const updatedPackage = await updatePackage(id, req.body);
    
    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({
      message: 'Package updated successfully',
      data: updatedPackage
    });
  } catch (err: any) {
    console.error("Error updating package", err);
    if (err.message === 'Package not found or inactive') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to update package" });
  }
};

export const deletePackageHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid package id" 
      });
    }

    const result = await deletePackage(id);
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err: any) {
    console.error("Error deleting package", err);
    if (err.message === 'Package not found or already deleted') {
      return res.status(404).json({ 
        success: false,
        message: err.message 
      });
    }
    if (err.message === 'Cannot delete package with active bookings') {
      return res.status(409).json({ 
        success: false,
        message: err.message,
        hint: 'Please cancel or complete all active bookings for this package first'
      });
    }
    res.status(500).json({ 
      success: false,
      message: err.message || "Failed to delete package" 
    });
  }
};
