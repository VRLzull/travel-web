import { pool } from "../../config/db";

export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  location: string;
  city: string;
  country: string;
  duration_days: number;
  price: number;
  max_people: number;
  description: string;
  is_featured: boolean;
  primary_image?: string | null;
  category?: string;
  short_description?: string;
  itinerary?: string;
  facilities?: string;
  price_per_person?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export async function getAllPackages() {
  const [rows] = await pool.query(
    `SELECT
       p.id,
       p.title,
       p.slug,
       p.location,
       p.city,
       p.country,
       p.duration_days,
       p.price,
       p.max_people,
       p.description,
       p.is_featured,
       p.category,
       COALESCE(
         (SELECT image_url FROM package_images WHERE package_id = p.id AND is_primary = 1 LIMIT 1),
         (SELECT image_url FROM package_images WHERE package_id = p.id LIMIT 1)
       ) AS primary_image
     FROM tour_packages p
     WHERE p.is_active = 1
     ORDER BY p.created_at DESC`
  );

  return rows as TourPackage[];
}

export async function getPackageById(id: number) {
  // Ambil semua kolom agar kompatibel dengan schema yang mungkin berbeda
  const [rows] = await pool.query(
    `SELECT * FROM tour_packages WHERE id = ? AND is_active = 1 LIMIT 1`,
    [id]
  );

  if (!Array.isArray(rows) || rows.length === 0) return null;
  const pkg = rows[0] as any;

  const [images] = await pool.query(
    `SELECT id, image_url, is_primary
     FROM package_images
     WHERE package_id = ?
     ORDER BY is_primary DESC, id ASC`,
    [id]
  );

  const [schedules] = await pool.query(
    `SELECT 
       id, 
       DATE_FORMAT(start_date, '%Y-%m-%d') AS departure_date, 
       available_seats AS available_quota
     FROM package_schedules
     WHERE package_id = ? AND start_date >= CURDATE()
     ORDER BY start_date ASC`,
    [id]
  );

  const primaryImage = Array.isArray(images) && (images as any[]).length > 0
    ? (images as any[]).find((img: any) => Number(img.is_primary) === 1)?.image_url || (images as any[])[0].image_url
    : null;

  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    location: pkg.location,
    city: pkg.city,
    country: pkg.country,
    duration_days: pkg.duration_days,
    price: pkg.price,
    max_people: pkg.max_people,
    description: pkg.description,
    category: pkg.category,
    short_description: pkg.short_description,
    itinerary: pkg.itinerary,
    facilities: pkg.facilities,
    is_featured: !!pkg.is_featured,
    primary_image: primaryImage,
    images,
    schedules,
  };
}

export async function createPackage(packageData: any) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate slug from title
    const slug = packageData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^\-|\-$)/g, '');

    // Insert package
    const [result] = await connection.query(
      `INSERT INTO tour_packages (
        title, slug, location, city, country, duration_days, 
        price, max_people, description, is_featured,
        category, short_description, itinerary, facilities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageData.title,
        slug,
        packageData.location,
        packageData.city || packageData.location || '',
        packageData.country || 'Indonesia',
        packageData.duration_days,
        packageData.price,
        packageData.max_people || 10,
        packageData.description,
        packageData.is_featured || false,
        packageData.category,
        packageData.short_description,
        packageData.itinerary,
        packageData.facilities
      ]
    );

    const packageId = (result as any).insertId;

    // If there's a primary image, add it
    if (packageData.primary_image) {
      await connection.query(
        'INSERT INTO package_images (package_id, image_url, is_primary) VALUES (?, ?, 1)',
        [packageId, packageData.primary_image]
      );
    }

    await connection.commit();

    return {
      id: packageId,
      slug,
      ...packageData
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function resetTravelPackages(): Promise<{ success: boolean; inserted: number }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Soft-disable semua paket lama
    await connection.query(
      `UPDATE tour_packages SET is_active = 0, updated_at = NOW() WHERE is_active = 1`
    );

    // Ubah slug paket lama agar tidak bentrok dengan paket baru
    await connection.query(
      `UPDATE tour_packages SET slug = CONCAT(slug, '-', UNIX_TIMESTAMP()) WHERE is_active = 0`
    );

    const basePackages = [
      {
        title: 'Travel Malang - Surabaya',
        location: 'Malang, Surabaya',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 150000,
        max_people: 5,
        description: 'Layanan travel reguler rute Malang ke Surabaya. Harga berlaku per hari.',
        is_featured: true,
        category: 'travel_reguler',
        short_description: 'Travel Malang - Surabaya (per hari)',
      },
      {
        title: 'Travel Malang - Juanda',
        location: 'Malang, Juanda',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 150000,
        max_people: 5,
        description: 'Layanan travel reguler rute Malang ke Bandara Juanda. Harga berlaku per hari.',
        is_featured: true,
        category: 'travel_reguler',
        short_description: 'Travel Malang - Juanda (per hari)',
      },
      {
        title: 'Travel Malang - Kediri',
        location: 'Malang, Kediri',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 130000,
        max_people: 5,
        description: 'Layanan travel reguler rute Malang ke Kediri. Harga berlaku per hari.',
        is_featured: true,
        category: 'travel_reguler',
        short_description: 'Travel Malang - Kediri (per hari)',
      },
      {
        title: 'Travel Surabaya - Kediri',
        location: 'Surabaya, Kediri',
        city: 'Surabaya',
        country: 'Indonesia',
        duration_days: 1,
        price: 180000,
        max_people: 5,
        description: 'Layanan travel reguler rute Surabaya ke Kediri. Harga berlaku per hari.',
        is_featured: true,
        category: 'travel_reguler',
        short_description: 'Travel Surabaya - Kediri (per hari)',
      },
      {
        title: 'Sewa Mobil Lepas Kunci',
        location: 'Malang, Surabaya',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 300000,
        max_people: 7,
        description: 'Sewa mobil harian tanpa driver (Lepas Kunci). Harga belum termasuk BBM, Tol, Parkir.',
        is_featured: false,
        category: 'sewa_mobil',
        short_description: 'Sewa mobil harian lepas kunci',
      },
      {
        title: 'Sewa Mobil + Driver',
        location: 'Malang, Surabaya',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 500000,
        max_people: 6,
        description: 'Sewa mobil harian sudah termasuk Driver. Harga belum termasuk BBM, Tol, Parkir.',
        is_featured: false,
        category: 'sewa_mobil',
        short_description: 'Sewa mobil harian + Driver',
      },
      {
        title: 'Sewa Hiace',
        location: 'Malang, Surabaya',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 1200000,
        max_people: 14,
        description: 'Sewa unit Toyota Hiace harian. Harga belum termasuk BBM, Tol, Parkir.',
        is_featured: false,
        category: 'sewa_mobil',
        short_description: 'Sewa Hiace harian',
      },
      {
        title: 'Sewa Elf Long',
        location: 'Malang, Surabaya',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 1000000,
        max_people: 19,
        description: 'Sewa unit Isuzu Elf Long harian. Harga belum termasuk BBM, Tol, Parkir.',
        is_featured: false,
        category: 'sewa_mobil',
        short_description: 'Sewa Elf Long harian',
      },
      {
        title: 'Sewa Elf Short',
        location: 'Malang, Surabaya',
        city: 'Malang',
        country: 'Indonesia',
        duration_days: 1,
        price: 800000,
        max_people: 12,
        description: 'Sewa unit Isuzu Elf Short harian. Harga belum termasuk BBM, Tol, Parkir.',
        is_featured: false,
        category: 'sewa_mobil',
        short_description: 'Sewa Elf Short harian',
      }
    ];

    let inserted = 0;
    for (const pkg of basePackages) {
      const [result] = await connection.query(
        `INSERT INTO tour_packages (
          title, slug, location, city, country, duration_days,
          price, max_people, description, is_featured,
          category, short_description, itinerary, facilities, is_active, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW()
        )`,
        [
          pkg.title,
          pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^\-|\-$)/g, ''),
          pkg.location,
          pkg.city,
          pkg.country,
          pkg.duration_days,
          pkg.price,
          pkg.max_people,
          pkg.description,
          pkg.is_featured ? 1 : 0,
          pkg.category,
          pkg.short_description || '',
          null,
          null
        ]
      ) as any;
      if ((result as any).insertId) inserted++;
    }

    await connection.commit();
    return { success: true, inserted };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function updatePackage(
  id: number,
  packageData: Partial<Omit<TourPackage, 'id' | 'slug'>>
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get current package data
    const [packages] = await connection.query(
      'SELECT * FROM tour_packages WHERE id = ?',
      [id]
    );
    const currentPackage = (packages as any)[0];

    if (!currentPackage) {
      throw new Error('Package not found');
    }

    // Cek kolom yang tersedia di tabel
    const [cols] = await connection.query(
      `SHOW COLUMNS FROM tour_packages`
    ) as any[];
    const colSet = new Set<string>(Array.isArray(cols) ? cols.map((c: any) => String(c.Field)) : []);

    // Prepare update fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (packageData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(packageData.title);
    }
    if (packageData.location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(packageData.location);
    }
    if (packageData.city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(packageData.city);
    }
    if (packageData.country !== undefined) {
      updateFields.push('country = ?');
      updateValues.push(packageData.country);
    }
    if (packageData.duration_days !== undefined) {
      updateFields.push('duration_days = ?');
      updateValues.push(packageData.duration_days);
    }
    if (packageData.price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(packageData.price);
    }
    if (packageData.max_people !== undefined) {
      updateFields.push('max_people = ?');
      updateValues.push(packageData.max_people);
    }
    if (packageData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(packageData.description);
    }
    if (packageData.is_featured !== undefined) {
      updateFields.push('is_featured = ?');
      updateValues.push(packageData.is_featured ? 1 : 0);
    }
    // Optional fields based on schema presence
    if (packageData.category !== undefined && colSet.has('category')) {
      updateFields.push('category = ?');
      updateValues.push(packageData.category);
    }
    if (packageData.short_description !== undefined && colSet.has('short_description')) {
      updateFields.push('short_description = ?');
      updateValues.push(packageData.short_description);
    }
    if (packageData.itinerary !== undefined && colSet.has('itinerary')) {
      updateFields.push('itinerary = ?');
      updateValues.push(packageData.itinerary);
    }
    if (packageData.facilities !== undefined && colSet.has('facilities')) {
      updateFields.push('facilities = ?');
      updateValues.push(packageData.facilities);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await connection.query(
        `UPDATE tour_packages SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Handle primary image update if provided
    if (packageData.primary_image) {
      // First, reset all primary flags for this package
      await connection.query(
        'UPDATE package_images SET is_primary = 0 WHERE package_id = ?',
        [id]
      );
      
      // Check if image already exists for this package
      const [existingImages] = await connection.query(
        'SELECT id FROM package_images WHERE package_id = ? AND image_url = ?',
        [id, packageData.primary_image]
      ) as any[];

      if (Array.isArray(existingImages) && existingImages.length > 0) {
        // Update existing image to primary
        await connection.query(
          'UPDATE package_images SET is_primary = 1 WHERE id = ?',
          [existingImages[0].id]
        );
      } else {
        // Insert new primary image
        await connection.query(
          `INSERT INTO package_images (package_id, image_url, is_primary) VALUES (?, ?, 1)`,
          [id, packageData.primary_image]
        );
      }
    }

    await connection.commit();
    
    // Return the updated package
    return await getPackageById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deletePackage(id: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if package exists
    const [existing] = await connection.query(
      `SELECT id FROM tour_packages WHERE id = ? AND is_active = 1`,
      [id]
    ) as any[];

    if (!Array.isArray(existing) || existing.length === 0) {
      throw new Error('Package not found or already deleted');
    }

    // Check if there are active bookings for this package
    const [bookings] = await connection.query(
      `SELECT id FROM bookings WHERE package_id = ? AND payment_status IN ('pending', 'paid')`,
      [id]
    ) as any[];

    if (Array.isArray(bookings) && bookings.length > 0) {
      throw new Error('Cannot delete package with active bookings');
    }

    // Soft delete: set is_active = 0 instead of hard delete
    await connection.query(
      `UPDATE tour_packages SET is_active = 0, updated_at = NOW() WHERE id = ?`,
      [id]
    );

    await connection.commit();
    return { success: true, message: 'Package deleted successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Package Images Management
export interface PackageImage {
  id: number;
  package_id: number;
  image_url: string;
  is_primary: number;
}

export async function addPackageImage(packageId: number, imageUrl: string, isPrimary: boolean = false) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if package exists
    const [existing] = await connection.query(
      `SELECT id FROM tour_packages WHERE id = ? AND is_active = 1`,
      [packageId]
    ) as any[];

    if (!Array.isArray(existing) || existing.length === 0) {
      throw new Error('Package not found');
    }

    // If this is primary, unset other primary images
    if (isPrimary) {
      await connection.query(
        `UPDATE package_images SET is_primary = 0 WHERE package_id = ?`,
        [packageId]
      );
    }

    const [result] = await connection.query(
      `INSERT INTO package_images (package_id, image_url, is_primary) VALUES (?, ?, ?)`,
      [packageId, imageUrl, isPrimary ? 1 : 0]
    ) as any;

    await connection.commit();
    
    const [images] = await connection.query(
      `SELECT * FROM package_images WHERE id = ?`,
      [result.insertId]
    );
    
    return (images as PackageImage[])[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deletePackageImage(imageId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `DELETE FROM package_images WHERE id = ?`,
      [imageId]
    ) as any;

    if (result.affectedRows === 0) {
      throw new Error('Image not found');
    }

    await connection.commit();
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function setPrimaryImage(packageId: number, imageId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if image belongs to package
    const [images] = await connection.query(
      `SELECT id FROM package_images WHERE id = ? AND package_id = ?`,
      [imageId, packageId]
    ) as any[];

    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('Image not found or does not belong to this package');
    }

    // Unset all primary images for this package
    await connection.query(
      `UPDATE package_images SET is_primary = 0 WHERE package_id = ?`,
      [packageId]
    );

    // Set this image as primary
    await connection.query(
      `UPDATE package_images SET is_primary = 1 WHERE id = ?`,
      [imageId]
    );

    await connection.commit();
    return { success: true, message: 'Primary image updated successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Package Schedules Management
export interface PackageSchedule {
  id: number;
  package_id: number;
  departure_date: string;
  available_quota: number;
}

export async function addPackageSchedule(packageId: number, scheduleData: {
  departure_date: string;
  available_quota: number;
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if package exists
    const [existing] = await connection.query(
      `SELECT id FROM tour_packages WHERE id = ? AND is_active = 1`,
      [packageId]
    ) as any[];

    if (!Array.isArray(existing) || existing.length === 0) {
      throw new Error('Package not found');
    }

    // Validate departure date is in the future
    const departureDate = new Date(scheduleData.departure_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departureDate < today) {
      throw new Error('Departure date must be in the future');
    }

    // Validate quota
    if (scheduleData.available_quota <= 0) {
      throw new Error('Available quota must be greater than 0');
    }

    // Ambil duration_days untuk menghitung end_date
    const [pkgRows] = await connection.query(
      `SELECT duration_days FROM tour_packages WHERE id = ?`,
      [packageId]
    ) as any[];

    const durationDays = Array.isArray(pkgRows) && pkgRows.length > 0 
      ? Number(pkgRows[0].duration_days) || 0 
      : 0;
    const endDate = new Date(scheduleData.departure_date);
    if (durationDays > 0) {
      endDate.setDate(endDate.getDate() + durationDays);
    }
    const endDateStr = endDate.toISOString().slice(0, 10);

    const [result] = await connection.query(
      `INSERT INTO package_schedules (package_id, start_date, end_date, available_seats) VALUES (?, ?, ?, ?)`,
      [packageId, scheduleData.departure_date, endDateStr, scheduleData.available_quota]
    ) as any;

  await connection.commit();
  
  const [schedules] = await connection.query(
      `SELECT id, package_id, DATE_FORMAT(start_date, '%Y-%m-%d') AS departure_date, available_seats AS available_quota FROM package_schedules WHERE id = ?`,
      [result.insertId]
    );
    
    return (schedules as PackageSchedule[])[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updatePackageSchedule(scheduleId: number, scheduleData: {
  departure_date?: string;
  available_quota?: number;
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if schedule exists
    const [existing] = await connection.query(
      `SELECT * FROM package_schedules WHERE id = ?`,
      [scheduleId]
    ) as any[];

    if (!Array.isArray(existing) || existing.length === 0) {
      throw new Error('Schedule not found');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (scheduleData.departure_date !== undefined) {
      // Validate departure date is in the future
      const departureDate = new Date(scheduleData.departure_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (departureDate < today) {
        throw new Error('Departure date must be in the future');
      }
      
      // Recompute end_date based on package duration
      const packageId = (existing as any[])[0].package_id;
      const [pkgRows] = await connection.query(
        `SELECT duration_days FROM tour_packages WHERE id = ?`,
        [packageId]
      ) as any[];
      const durationDays = Array.isArray(pkgRows) && pkgRows.length > 0 
        ? Number(pkgRows[0].duration_days) || 0 
        : 0;
      const endDate = new Date(scheduleData.departure_date);
      if (durationDays > 0) {
        endDate.setDate(endDate.getDate() + durationDays);
      }
      const endDateStr = endDate.toISOString().slice(0, 10);

      updateFields.push('start_date = ?');
      updateValues.push(scheduleData.departure_date);
      updateFields.push('end_date = ?');
      updateValues.push(endDateStr);
    }

    if (scheduleData.available_quota !== undefined) {
      if (scheduleData.available_quota < 0) {
        throw new Error('Available quota cannot be negative');
      }
      updateFields.push('available_seats = ?');
      updateValues.push(scheduleData.available_quota);
    }

    if (updateFields.length === 0) {
      await connection.commit();
      const [schedules] = await connection.query(
        `SELECT * FROM package_schedules WHERE id = ?`,
        [scheduleId]
      );
      return (schedules as PackageSchedule[])[0];
    }

    updateValues.push(scheduleId);

    await connection.query(
      `UPDATE package_schedules SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

  await connection.commit();
  
  const [schedules] = await connection.query(
      `SELECT id, package_id, DATE_FORMAT(start_date, '%Y-%m-%d') AS departure_date, available_seats AS available_quota FROM package_schedules WHERE id = ?`,
      [scheduleId]
    );
    
    return (schedules as PackageSchedule[])[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deletePackageSchedule(scheduleId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if there are bookings for this schedule
    const [bookings] = await connection.query(
      `SELECT id FROM bookings WHERE schedule_id = ? AND payment_status IN ('pending', 'paid')`,
      [scheduleId]
    ) as any[];

    if (Array.isArray(bookings) && bookings.length > 0) {
      throw new Error('Cannot delete schedule with active bookings');
    }

    const [result] = await connection.query(
      `DELETE FROM package_schedules WHERE id = ?`,
      [scheduleId]
    ) as any;

    if (result.affectedRows === 0) {
      throw new Error('Schedule not found');
    }

    await connection.commit();
    return { success: true, message: 'Schedule deleted successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
