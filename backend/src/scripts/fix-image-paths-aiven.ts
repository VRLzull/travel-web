import { pool } from "../config/db";

async function fixImagePaths() {
  const connection = await pool.getConnection();
  try {
    console.log("Starting to fix image paths in database...");
    
    // Update image_url in package_images
    const [images] = await connection.query<any[]>("SELECT id, image_url FROM package_images WHERE image_url LIKE '/images/%'");
    if (Array.isArray(images)) {
      console.log(`Found ${images.length} images to update.`);
      for (const img of images) {
        const newPath = img.image_url.replace('/images/', '/packages/');
        await connection.query("UPDATE package_images SET image_url = ? WHERE id = ?", [newPath, img.id]);
        console.log(`Updated package_images id ${img.id}: ${img.image_url} -> ${newPath}`);
      }
    } else {
      console.log("No images found starting with /images/");
    }

    console.log("Successfully fixed all image paths!");
  } catch (error) {
    console.error("Error fixing image paths:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixImagePaths();
