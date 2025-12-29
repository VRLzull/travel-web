-- Database Schema untuk Travel Web Application
-- Dikembangkan berdasarkan struktur backend yang ada
-- Dibuat: 15 Desember 2024

-- Buat database (uncomment jika diperlukan)
-- CREATE DATABASE IF NOT EXISTS travel_web;
-- USE travel_web;

-- Tabel Admin
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Users (Customer)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Packages (Destinasi Wisata)
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description LONGTEXT,
    price DECIMAL(12, 2) NOT NULL,
    duration_days INT NOT NULL,
    max_people INT,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_city (city),
    INDEX idx_country (country),
    FULLTEXT idx_search (title, description, location, city, country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Package Images
CREATE TABLE IF NOT EXISTS package_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    INDEX idx_package (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Package Schedules (Jadwal Keberangkatan)
CREATE TABLE IF NOT EXISTS package_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_people INT,
    available_seats INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    INDEX idx_package (package_id),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    package_schedule_id INT NOT NULL,
    total_people INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_schedule_id) REFERENCES package_schedules(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_booking_code (booking_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'failure') DEFAULT 'pending',
    payment_proof_url VARCHAR(255),
    midtrans_transaction_id VARCHAR(100),
    midtrans_payment_type VARCHAR(50),
    midtrans_response_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_status (status),
    INDEX idx_midtrans (midtrans_transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    booking_id INT,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_package (package_id),
    INDEX idx_user (user_id),
    INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Super Admin (password: admin123)
INSERT INTO admins (name, email, password, role) 
VALUES ('Super Admin', 'superadmin@travelweb.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert Admin (password: admin123)
INSERT INTO admins (name, email, password) 
VALUES ('Admin', 'admin@travelweb.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert Sample Package
INSERT INTO packages (title, slug, description, price, duration_days, max_people, location, city, country, is_featured) VALUES
('Liburan ke Bali', 'liburan-ke-bali', 'Nikmati keindahan pantai dan budaya Bali dengan paket liburan lengkap', 5000000.00, 4, 15, 'Kuta Beach', 'Badung', 'Indonesia', TRUE),
('Petualangan ke Raja Ampat', 'petualangan-raja-ampat', 'Jelajahi keindahan bawah laut Raja Ampat yang memukau', 8500000.00, 5, 10, 'Raja Ampat', 'Raja Ampat', 'Indonesia', TRUE),
('Wisata Budaya Jogja', 'wisata-budaya-jogja', 'Mengenal lebih dekat budaya dan sejarah Yogyakarta', 3500000.00, 3, 20, 'Malioboro', 'Yogyakarta', 'Indonesia', FALSE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert Sample Package Images
INSERT INTO package_images (package_id, image_url, is_primary) VALUES
(1, 'packages/bali-1.jpg', TRUE),
(1, 'packages/bali-2.jpg', FALSE),
(2, 'packages/raja-ampat-1.jpg', TRUE),
(3, 'packages/jogja-1.jpg', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert Sample Package Schedules
INSERT INTO package_schedules (package_id, start_date, end_date, max_people, available_seats) VALUES
(1, '2024-01-15', '2024-01-18', 15, 15),
(1, '2024-02-01', '2024-02-04', 15, 15),
(2, '2024-01-20', '2024-01-24', 10, 10),
(3, '2024-01-25', '2024-01-27', 20, 20)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
