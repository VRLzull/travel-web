import { Request, Response } from "express";
import { 
  addPackageImage, 
  deletePackageImage, 
  setPrimaryImage 
} from "./package.service";

export const addImageHandler = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.packageId);
    let { image_url, is_primary } = req.body;

    if (!packageId) {
      return res.status(400).json({ message: "Invalid package id" });
    }

    // Jika ada file yang diupload, gunakan path file tersebut
    if (req.file) {
      // Simpan path relatif ke folder packages
      image_url = `/packages/${req.file.filename}`;
    }

    if (!image_url) {
      return res.status(400).json({ message: "Image file or image_url is required" });
    }

    const image = await addPackageImage(
      packageId, 
      image_url, 
      Boolean(is_primary)
    );

    res.status(201).json({
      message: 'Image added successfully',
      data: image
    });
  } catch (err: any) {
    console.error("Error adding image", err);
    if (err.message === 'Package not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to add image" });
  }
};

export const deleteImageHandler = async (req: Request, res: Response) => {
  try {
    const imageId = Number(req.params.imageId);

    if (!imageId) {
      return res.status(400).json({ message: "Invalid image id" });
    }

    const result = await deletePackageImage(imageId);
    res.json({
      message: result.message,
      success: result.success
    });
  } catch (err: any) {
    console.error("Error deleting image", err);
    if (err.message === 'Image not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to delete image" });
  }
};

export const setPrimaryImageHandler = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.packageId);
    const imageId = Number(req.body.image_id);

    if (!packageId) {
      return res.status(400).json({ message: "Invalid package id" });
    }

    if (!imageId) {
      return res.status(400).json({ message: "image_id is required" });
    }

    const result = await setPrimaryImage(packageId, imageId);
    res.json({
      message: result.message,
      success: result.success
    });
  } catch (err: any) {
    console.error("Error setting primary image", err);
    if (err.message === 'Image not found or does not belong to this package') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || "Failed to set primary image" });
  }
};

