import { Request, Response } from "express";
import { 
  getAllPackages, 
  getPackageById, 
  createPackage,
  updatePackage,
  deletePackage,
  resetTravelPackages
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
    const data = { ...req.body };
    
    // Jika ada file primary_image yang diupload
    if (req.file) {
      data.primary_image = `/packages/${req.file.filename}`;
    }

    const requiredFields = ['title', 'location', 'duration_days', 'price', 'description'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate price and duration are positive numbers
    if (data.price <= 0 || data.duration_days <= 0) {
      return res.status(400).json({
        message: 'Price and duration days must be greater than 0'
      });
    }

    const newPackage = await createPackage({
      title: data.title,
      location: data.location,
      city: data.city || data.location,
      country: data.country || 'Indonesia',
      duration_days: data.duration_days,
      price: data.price,
      max_people: data.max_people || 10,
      description: data.description,
      is_featured: data.is_featured,
      primary_image: data.primary_image,
      category: data.category,
      short_description: data.short_description,
      itinerary: data.itinerary,
      facilities: data.facilities
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

    const data = { ...req.body };
    
    // Jika ada file primary_image yang diupload
    if (req.file) {
      data.primary_image = `/packages/${req.file.filename}`;
    }

    // Validate numeric fields if provided
    if (data.price !== undefined && data.price <= 0) {
      return res.status(400).json({
        message: 'Price must be greater than 0'
      });
    }

    if (data.duration_days !== undefined && data.duration_days <= 0) {
      return res.status(400).json({
        message: 'Duration days must be greater than 0'
      });
    }

    const updatedPackage = await updatePackage(id, data);
    
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

export const resetTravelPackagesHandler = async (_req: Request, res: Response) => {
  try {
    const result = await resetTravelPackages();
    res.json({
      success: true,
      message: `Reset selesai. Layanan baru ditambahkan: ${result.inserted}`,
      data: result
    });
  } catch (err: any) {
    console.error("Error resetting travel packages", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Gagal reset paket travel"
    });
  }
};
