-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.11.15-MariaDB - MariaDB Server
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

SET FOREIGN_KEY_CHECKS = 0;


-- Dumping database structure for db_travel


-- Dumping structure for table `admin_users
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('super_admin','admin') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.admin_users: ~2 rows (approximately)
INSERT INTO `admin_users` (`id`, `name`, `email`, `password_hash`, `phone`, `role`, `is_active`, `last_login`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Super Admin', 'superadmin@travelweb.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'super_admin', 1, NULL, NULL, '2025-12-14 15:26:48', '2025-12-14 16:03:30'),
	(2, 'Admin', 'admin@travelweb.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'admin', 1, NULL, NULL, '2025-12-14 15:27:01', '2025-12-14 16:03:30');

-- Dumping structure for table db_travel.bookings
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `trip_date` date DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `total_participants` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed','cancelled') DEFAULT 'pending',
  `booking_code` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `travel_time` varchar(50) DEFAULT NULL,
  `landing_time` varchar(50) DEFAULT NULL,
  `airline` varchar(100) DEFAULT NULL,
  `flight_code` varchar(50) DEFAULT NULL,
  `terminal` varchar(50) DEFAULT NULL,
  `pickup_address` text DEFAULT NULL,
  `dropoff_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `package_id` (`package_id`),
  KEY `schedule_id` (`schedule_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `tour_packages` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `package_schedules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.bookings: ~34 rows (approximately)
INSERT INTO `bookings` (`id`, `user_id`, `package_id`, `schedule_id`, `trip_date`, `customer_name`, `customer_email`, `customer_phone`, `total_participants`, `total_amount`, `payment_status`, `booking_code`, `created_at`, `updated_at`, `travel_time`, `landing_time`, `airline`, `flight_code`, `terminal`, `pickup_address`, `dropoff_address`, `notes`) VALUES
	(11, 1, 1, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 2, 10000000.00, 'pending', 'BK20251215-416', '2025-12-15 14:25:57', '2025-12-15 14:25:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(12, 1, 1, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 2, 10000000.00, 'pending', 'BK20251215-800', '2025-12-15 14:40:18', '2025-12-15 14:40:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(15, 1, 1, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 5.00, 'pending', 'BK20251216-395', '2025-12-16 15:06:49', '2025-12-16 15:06:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(16, 1, 2, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 1.00, 'pending', 'BK20251216-548', '2025-12-16 15:45:20', '2025-12-16 15:45:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(17, 1, 2, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 1.00, 'pending', 'BK20251216-106', '2025-12-16 15:46:48', '2025-12-16 15:46:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(18, 1, 2, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 1.00, 'pending', 'BK20251216-199', '2025-12-16 16:19:57', '2025-12-16 16:19:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(19, 1, 2, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 1.00, 'pending', 'BK20251216-579', '2025-12-16 16:46:54', '2025-12-16 16:46:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(20, 1, 2, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 1.00, 'pending', 'BK20251217-250', '2025-12-17 12:29:39', '2025-12-17 12:29:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(21, 1, 2, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 1.00, 'pending', 'BK20251217-708', '2025-12-17 12:55:02', '2025-12-17 12:55:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(25, 1, 3, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 3500000.00, 'paid', 'BK20251217-326', '2025-12-17 14:24:18', '2025-12-17 16:24:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(26, 1, 3, NULL, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 3500000.00, 'paid', 'BK20251217-392', '2025-12-17 16:55:47', '2025-12-17 16:56:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(27, 1, 1, 11, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 3, 9000.00, 'paid', 'BK20251219-195', '2025-12-18 17:21:09', '2025-12-18 17:30:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(28, 1, 1, 11, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 4, 12000.00, 'paid', 'BK20251219-011', '2025-12-18 18:07:32', '2025-12-18 18:07:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(29, 1, 3, 12, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 3500000.00, 'paid', 'BK20251222-525', '2025-12-22 15:22:06', '2025-12-22 15:22:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(30, 1, 3, 12, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 3500000.00, 'paid', 'BK20251222-023', '2025-12-22 15:28:47', '2025-12-22 15:29:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(31, 1, 1, 11, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 3000.00, 'paid', 'BK20251222-044', '2025-12-22 15:35:45', '2025-12-22 15:36:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(32, 1, 1, 11, NULL, 'percobaan', 'coba@gmail.com', '08892383293', 1, 3000.00, 'paid', 'BK20251222-542', '2025-12-22 16:27:12', '2025-12-22 16:27:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(33, 2, 3, 12, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 2, 7000000.00, 'paid', 'BK20251223-183', '2025-12-22 17:58:37', '2025-12-22 17:59:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(34, 2, 4, 15, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 10000.00, 'paid', 'BK20251229-165', '2025-12-29 14:24:08', '2025-12-29 14:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(35, 2, 3, 12, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 3500000.00, 'paid', 'BK20251229-910', '2025-12-29 14:25:42', '2025-12-29 14:26:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(37, 2, 4, 15, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 10000.00, 'paid', 'BK20251229-510', '2025-12-29 14:47:13', '2025-12-29 14:47:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(51, 2, 4, 15, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 10000.00, 'paid', 'BK20251230-032', '2025-12-30 00:59:41', '2025-12-30 00:59:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(53, 2, 4, NULL, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 2, 20000.00, 'paid', 'BK20251230-370', '2025-12-30 11:56:51', '2025-12-30 11:57:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(55, 2, 5, NULL, NULL, 'rasyadan', 'rasyadan@gmail.com', '08928373672', 1, 100000.00, 'paid', 'BK20251230-420', '2025-12-30 13:37:43', '2025-12-30 13:38:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(56, 2, 6, NULL, NULL, 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 600000.00, 'paid', 'BK20251230-706', '2025-12-30 13:42:02', '2025-12-30 13:42:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(59, 2, 5, NULL, '2025-12-31', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 100000.00, 'cancelled', 'BK20251230-547', '2025-12-30 14:47:15', '2026-01-08 02:10:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(60, 2, 6, NULL, '2026-01-07', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 600000.00, 'paid', 'BK20260106-069', '2026-01-06 02:01:13', '2026-01-06 02:01:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(61, 2, 8, NULL, '2026-01-10', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 2, 2000000.00, 'paid', 'BK20260107-657', '2026-01-07 00:40:48', '2026-01-07 00:41:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(62, 2, 8, NULL, '2026-01-10', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 1000000.00, 'paid', 'BK20260108-685', '2026-01-08 00:52:16', '2026-01-08 01:43:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(63, 2, 5, NULL, '2026-01-09', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 100000.00, 'paid', 'BK20260108-313', '2026-01-08 01:56:44', '2026-01-08 01:57:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(64, 2, 8, NULL, '2026-01-13', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 1000000.00, 'paid', 'BK20260112-669', '2026-01-12 01:45:12', '2026-01-12 01:45:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(65, 2, 19, NULL, '2026-01-13', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 150000.00, 'paid', 'BK20260112-582', '2026-01-12 12:37:20', '2026-01-13 00:46:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(66, 2, 19, NULL, '2026-01-14', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 150000.00, 'paid', 'BK20260113-221', '2026-01-13 01:28:46', '2026-01-13 01:29:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(68, 2, 19, NULL, '2026-01-18', 'rasyadan', 'rasyadan@gmail.com', '0857-4610-9179', 1, 150000.00, 'paid', 'BK20260113-226', '2026-01-13 01:57:24', '2026-01-13 01:57:40', '09:00', '12:00', 'lion air', 'SE 422', 'arjosari', 'bandara ABD salleh', 'surabaya', NULL);

-- Dumping structure for table db_travel.package_images
DROP TABLE IF EXISTS `package_images`;
CREATE TABLE IF NOT EXISTS `package_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_package` (`package_id`),
  CONSTRAINT `package_images_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tour_packages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.package_images: ~29 rows (approximately)
INSERT INTO `package_images` (`id`, `package_id`, `image_url`, `is_primary`, `created_at`, `updated_at`) VALUES
	(9, 1, '/images/bali.webp', 1, '2025-12-18 16:18:37', '2026-01-14 01:28:57'),
	(10, 3, '/images/placeholder-package.svg', 1, '2025-12-18 18:15:35', '2026-01-14 01:28:57'),
	(11, 3, '/images/placeholder-package.svg', 0, '2025-12-18 18:16:03', '2026-01-14 01:28:57'),
	(12, 2, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2025-12-18 18:17:56', '2026-01-14 01:28:57'),
	(13, 2, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 0, '2025-12-18 18:18:16', '2026-01-14 01:28:57'),
	(14, 2, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 0, '2025-12-18 18:19:16', '2026-01-14 01:28:57'),
	(15, 4, '/images/placeholder-package.svg', 1, '2025-12-29 14:17:57', '2026-01-14 01:28:57'),
	(16, 8, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM (1).jpeg', 1, '2026-01-07 00:39:41', '2026-01-14 01:28:57'),
	(17, 5, '/images/bali.webp', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(18, 9, '/images/bali.webp', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(19, 10, '/images/bali.webp', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(20, 11, '/images/bali.webp', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(21, 12, '/images/bali.webp', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(32, 6, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM (1).jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(33, 7, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(34, 13, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(35, 14, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(36, 15, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(37, 16, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(38, 17, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(40, 24, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(41, 25, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(42, 26, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(43, 27, '/images/WhatsApp Image 2026-01-13 at 7.09.06 PM.jpeg', 1, '2026-01-14 01:38:22', '2026-01-14 01:38:22'),
	(52, 23, '/images/mobil 2.jpeg', 0, '2026-01-14 06:18:19', '2026-01-14 06:18:19'),
	(53, 19, '/images/mobil 2.jpeg', 0, '2026-01-14 06:35:36', '2026-01-14 06:35:36'),
	(54, 20, '/images/mobil.jpeg', 0, '2026-01-14 06:35:55', '2026-01-14 06:35:55'),
	(55, 21, '/images/mobil 2.jpeg', 0, '2026-01-14 06:36:43', '2026-01-14 06:36:43'),
	(56, 22, '/images/mobil.jpeg', 0, '2026-01-14 06:37:04', '2026-01-14 06:37:04');

-- Dumping structure for table db_travel.package_schedules
DROP TABLE IF EXISTS `package_schedules`;
CREATE TABLE IF NOT EXISTS `package_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `max_people` int(11) DEFAULT NULL,
  `available_seats` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_package` (`package_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  CONSTRAINT `package_schedules_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `tour_packages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.package_schedules: ~11 rows (approximately)
INSERT INTO `package_schedules` (`id`, `package_id`, `start_date`, `end_date`, `max_people`, `available_seats`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, '2024-01-15', '2024-01-18', 15, 15, 1, '2025-12-14 15:30:49', '2025-12-14 15:30:49'),
	(2, 1, '2024-02-01', '2024-02-04', 15, 15, 1, '2025-12-14 15:30:49', '2025-12-14 15:30:49'),
	(3, 2, '2024-01-20', '2024-01-24', 10, 10, 1, '2025-12-14 15:30:49', '2025-12-14 15:30:49'),
	(4, 3, '2024-01-25', '2024-01-27', 20, 20, 1, '2025-12-14 15:30:49', '2025-12-14 15:30:49'),
	(10, 1, '2025-12-19', '2025-12-24', NULL, 8, 1, '2025-12-18 16:21:45', '2025-12-18 16:21:45'),
	(11, 1, '2025-12-31', '2026-01-05', NULL, 10, 1, '2025-12-18 16:48:47', '2025-12-18 16:48:47'),
	(12, 3, '2026-01-10', '2026-01-13', NULL, 10, 1, '2025-12-18 18:16:14', '2025-12-18 18:16:14'),
	(13, 2, '2026-02-06', '2026-02-11', NULL, 10, 1, '2025-12-18 18:19:37', '2025-12-18 18:19:37'),
	(14, 1, '2026-01-10', '2026-01-15', NULL, 20, 1, '2025-12-29 14:07:19', '2025-12-29 14:07:19'),
	(15, 4, '2026-01-09', '2026-01-10', NULL, 10, 1, '2025-12-29 14:18:08', '2025-12-29 14:18:08'),
	(16, 4, '2026-01-31', '2026-02-01', NULL, 10, 1, '2025-12-30 03:22:37', '2025-12-30 03:22:37');

-- Dumping structure for table db_travel.payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','settlement','capture','deny','cancel','expire','failure') DEFAULT 'pending',
  `payment_proof_url` varchar(255) DEFAULT NULL,
  `midtrans_transaction_id` varchar(100) DEFAULT NULL,
  `midtrans_payment_type` varchar(50) DEFAULT NULL,
  `midtrans_response_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`midtrans_response_json`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_status` (`status`),
  KEY `idx_midtrans` (`midtrans_transaction_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.payments: ~29 rows (approximately)
INSERT INTO `payments` (`id`, `booking_id`, `payment_method`, `amount`, `status`, `payment_proof_url`, `midtrans_transaction_id`, `midtrans_payment_type`, `midtrans_response_json`, `created_at`, `updated_at`) VALUES
	(5, 15, 'credit_card', 5.00, 'pending', NULL, 'ORDER-15-1765897609529', 'credit_card', '{"token":"396d34f1-5adf-4abd-aa56-a4073dad1f63","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/396d34f1-5adf-4abd-aa56-a4073dad1f63","order_id":"ORDER-15-1765897609529"}', '2025-12-16 15:06:49', '2025-12-16 15:06:49'),
	(6, 16, 'credit_card', 1.00, 'pending', NULL, 'ORDER-16-1765899920287', 'credit_card', '{"token":"4283eb3d-0500-486e-800c-0e9436a5dfc2","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/4283eb3d-0500-486e-800c-0e9436a5dfc2","order_id":"ORDER-16-1765899920287"}', '2025-12-16 15:45:20', '2025-12-16 15:45:20'),
	(7, 17, 'credit_card', 1.00, 'pending', NULL, 'ORDER-17-1765900008663', 'credit_card', '{"token":"47673274-4ef0-432d-a8d6-d11eea5f1438","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/47673274-4ef0-432d-a8d6-d11eea5f1438","order_id":"ORDER-17-1765900008663"}', '2025-12-16 15:46:49', '2025-12-16 15:46:49'),
	(8, 18, 'credit_card', 1.00, 'pending', NULL, 'ORDER-18-1765901997746', 'credit_card', '{"token":"28b3acff-e278-4e53-9f30-db786c542a39","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/28b3acff-e278-4e53-9f30-db786c542a39","order_id":"ORDER-18-1765901997746"}', '2025-12-16 16:19:58', '2025-12-16 16:19:58'),
	(9, 19, 'credit_card', 1.00, 'pending', NULL, 'ORDER-19-1765903614181', 'credit_card', '{"token":"58acf565-236e-4a30-a266-a65ed6f4806a","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/58acf565-236e-4a30-a266-a65ed6f4806a","order_id":"ORDER-19-1765903614181"}', '2025-12-16 16:46:54', '2025-12-16 16:46:54'),
	(10, 20, 'credit_card', 1.00, 'pending', NULL, 'ORDER-20-1765974579763', 'credit_card', '{"token":"04cff3c0-5cb7-4a0e-910b-18c233d78c5a","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/04cff3c0-5cb7-4a0e-910b-18c233d78c5a","order_id":"ORDER-20-1765974579763"}', '2025-12-17 12:29:40', '2025-12-17 12:29:40'),
	(11, 21, 'credit_card', 1.00, 'pending', NULL, 'ORDER-21-1765976102553', 'credit_card', '{"token":"f6d4bbe8-5477-4fd9-ae96-031753105bfe","redirect_url":"https://app.sandbox.midtrans.com/snap/v4/redirection/f6d4bbe8-5477-4fd9-ae96-031753105bfe","order_id":"ORDER-21-1765976102553"}', '2025-12-17 12:55:02', '2025-12-17 12:55:02'),
	(15, 25, 'credit_card', 3500000.00, 'settlement', NULL, 'ORDER-25-1765981458594', 'credit_card', '{"status_code":"200","order_id":"ORDER-25-1765981458594","gross_amount":"3500000.00","payment_type":"qris","transaction_status":"settlement","fraud_status":"accept"}', '2025-12-17 14:24:19', '2025-12-17 16:24:12'),
	(16, 26, 'credit_card', 3500000.00, 'settlement', NULL, 'ORDER-26-1765990547301', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-17 23:55:52","transaction_status":"settlement","transaction_id":"03558192-2ccf-4302-9470-571a9a756dac","status_message":"midtrans payment notification","status_code":"200","signature_key":"9ea5f26c810a90ddc08bb26a20cc1776aba00dedc21ca2086cb203cee49e2f62e15a7e81fbb3e2eac5796ad1bd0307fc52f97bd1ddf97aebf06a111d865d6736","settlement_time":"2025-12-17 23:56:07","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-26-1765990547301","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"3500000.00","fraud_status":"accept","expiry_time":"2025-12-18 23:55:52","customer_details":{"phone":"+628892383293","full_name":"percobaan","email":"coba@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-17 16:55:47', '2025-12-17 16:56:06'),
	(17, 27, 'credit_card', 9000.00, 'settlement', NULL, 'ORDER-27-1766078469528', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-19 00:21:17","transaction_status":"settlement","transaction_id":"1799eac6-f0a9-4577-b34c-1ea42b0e3c33","status_message":"midtrans payment notification","status_code":"200","signature_key":"bfd141ed47af359bf789753516628cb8009700772ee2ec933fabab507bd905c83246f7aa13d0425bfccfa589bf4f468fb97e15f15bc9d4f1dc825e84dbd9e069","settlement_time":"2025-12-19 00:21:36","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-27-1766078469528","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"9000.00","fraud_status":"accept","expiry_time":"2025-12-20 00:21:17","customer_details":{"phone":"+628892383293","full_name":"percobaan","email":"coba@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-18 17:21:09', '2025-12-18 17:30:27'),
	(18, 28, 'credit_card', 12000.00, 'settlement', NULL, 'ORDER-28-1766081252247', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-19 01:07:37","transaction_status":"settlement","transaction_id":"81e39a52-50ba-4815-b8ec-fecb1e229ac2","status_message":"midtrans payment notification","status_code":"200","signature_key":"e829620b78d15ca80942a25ea2dd524693d5a8dc877bf2a3adbf6e428228c0a110f464f211dd57e1d59c4bd1f50b50d66ec798f78426d847b10358bca88edfeb","settlement_time":"2025-12-19 01:07:52","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-28-1766081252247","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"12000.00","fraud_status":"accept","expiry_time":"2025-12-20 01:07:37","customer_details":{"phone":"+628892383293","full_name":"percobaan","email":"coba@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-18 18:07:32', '2025-12-18 18:07:50'),
	(19, 29, 'credit_card', 3500000.00, 'settlement', NULL, 'ORDER-29-1766416926687', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2025-12-22 22:22:10","transaction_status":"settlement","transaction_id":"fbbe526c-03b5-46a0-9466-b574570988ac","status_message":"midtrans payment notification","status_code":"200","signature_key":"ad838e52e294cad63df7c81d8f328dcfe722525de32ae832fe2e71dc9b78338dd6742dc1a1fc494d8cd01f3423d22e9eca5f038a355edcc31be855d71b3af76e","settlement_time":"2025-12-22 22:22:47","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-29-1766416926687","merchant_id":"G002486392","issuer":"dana","gross_amount":"3500000.00","fraud_status":"accept","expiry_time":"2025-12-23 22:22:10","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-22 15:22:07', '2025-12-22 15:22:47'),
	(20, 30, 'credit_card', 3500000.00, 'settlement', NULL, 'ORDER-30-1766417327394', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2025-12-22 22:28:50","transaction_status":"settlement","transaction_id":"1c48ab1b-ada9-43a0-aea5-db4069a1670d","status_message":"midtrans payment notification","status_code":"200","signature_key":"8fd01b46146fd4f449f700d61ad800d6c96681f5d9b1024f07bab68d1b72b5657b58235f3c1518461b3a4f14e122f56b7f8fe77c01c3e7384ad4e213f650a94f","settlement_time":"2025-12-22 22:29:06","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-30-1766417327394","merchant_id":"G002486392","issuer":"dana","gross_amount":"3500000.00","fraud_status":"accept","expiry_time":"2025-12-23 22:28:50","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-22 15:28:48', '2025-12-22 15:29:07'),
	(21, 31, 'credit_card', 3000.00, 'settlement', NULL, 'ORDER-31-1766417745784', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2025-12-22 22:35:58","transaction_status":"settlement","transaction_id":"a37ac005-4b74-4469-b72c-54bce13d0091","status_message":"midtrans payment notification","status_code":"200","signature_key":"a0cf1cc72c794a64a625f46a51f41b642c34b9bb25f42ffdeb31fd7168c042df3059b011fedb5670f1e837df431cdf417dc67acad46d30900e544c4c41e61a38","settlement_time":"2025-12-22 22:36:20","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-31-1766417745784","merchant_id":"G002486392","issuer":"airpay shopee","gross_amount":"3000.00","fraud_status":"accept","expiry_time":"2025-12-23 22:35:58","customer_details":{"phone":"+628892383293","full_name":"percobaan","email":"coba@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-22 15:35:46', '2025-12-22 15:36:20'),
	(22, 32, 'credit_card', 3000.00, 'settlement', NULL, 'ORDER-32-1766420832886', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2025-12-22 23:27:16","transaction_status":"settlement","transaction_id":"d31eb5ba-4651-48ec-8dbd-002d13a8cf7e","status_message":"midtrans payment notification","status_code":"200","signature_key":"a0f6f84b24a6f7d772e95ab77d334d95264de600e50436e38a249051c14c03aad229345fbaa51ff8371680b9c3a13c3a16efb6975e0c5a5b4c49b9ee7377cd71","settlement_time":"2025-12-22 23:27:37","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-32-1766420832886","merchant_id":"G002486392","issuer":"ovo","gross_amount":"3000.00","fraud_status":"accept","expiry_time":"2025-12-23 23:27:16","customer_details":{"phone":"+628892383293","full_name":"percobaan","email":"coba@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-22 16:27:13', '2025-12-22 16:27:38'),
	(23, 33, 'credit_card', 7000000.00, 'settlement', NULL, 'ORDER-33-1766426317714', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2025-12-23 00:58:52","transaction_status":"settlement","transaction_id":"aaf31e0d-d077-4a2b-b281-015ac140ba14","status_message":"midtrans payment notification","status_code":"200","signature_key":"0aa12449341b3e2dba7b933926c670eeb0de26b8a67366d3762c0436c62d262485218e5054b54782daa05774202a4aa2ed04ffb503d2df67cf8d7cd9ae8cd769","settlement_time":"2025-12-23 00:59:07","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-33-1766426317714","merchant_id":"G002486392","issuer":"linkaja","gross_amount":"7000000.00","fraud_status":"accept","expiry_time":"2025-12-24 00:58:52","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-22 17:58:38', '2025-12-22 17:59:07'),
	(24, 34, 'credit_card', 10000.00, 'settlement', NULL, 'ORDER-34-1767018248861', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-29 21:24:13","transaction_status":"settlement","transaction_id":"745a2a66-af2f-4c4b-b698-923143e3c91a","status_message":"midtrans payment notification","status_code":"200","signature_key":"b1621917c5aec1f4ee4addd9bfe8e6301e33479604e558c3152b77aff80c7af41ebb5b56caf4fd3d268ba234f9f06021da30ddd61d3740ce105a511c2af4078d","settlement_time":"2025-12-29 21:24:36","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-34-1767018248861","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"10000.00","fraud_status":"accept","expiry_time":"2025-12-30 21:24:13","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-29 14:24:09', '2025-12-29 14:24:37'),
	(25, 35, 'credit_card', 3500000.00, 'settlement', NULL, 'ORDER-35-1767018342077', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-29 21:25:44","transaction_status":"settlement","transaction_id":"4be4e2cd-db9e-4c37-84e1-84ed132e75f2","status_message":"midtrans payment notification","status_code":"200","signature_key":"41aae1396beb42ebadacc4aa402c96607624fa944bd3a5149fff8b1b150db0885c39732f90ba481d94b089ab0515cb88b2c6cd3c1b2115b283f020307714af5c","settlement_time":"2025-12-29 21:26:00","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-35-1767018342077","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"3500000.00","fraud_status":"accept","expiry_time":"2025-12-30 21:25:44","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-29 14:25:42', '2025-12-29 14:26:01'),
	(27, 37, 'credit_card', 10000.00, 'settlement', NULL, 'ORDER-37-1767019633061', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-29 21:47:18","transaction_status":"settlement","transaction_id":"51e3a395-efbf-4de3-a420-87285b1bc0ea","status_message":"midtrans payment notification","status_code":"200","signature_key":"5f9d8756d005a7346c372d2180086501f92d309ee136d14cbd69bfb72f082ecf2b638db46d0bd07d0474d44781fd38abbc3fa80776f5f31040257f580858744e","settlement_time":"2025-12-29 21:47:39","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-37-1767019633061","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"10000.00","fraud_status":"accept","expiry_time":"2025-12-30 21:47:18","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-29 14:47:13', '2025-12-29 14:47:41'),
	(28, 51, 'credit_card', 10000.00, 'settlement', NULL, 'ORDER-51-1767056381648', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-30 07:59:44","transaction_status":"settlement","transaction_id":"9ffc7de4-9138-4443-a512-18ae38274392","status_message":"midtrans payment notification","status_code":"200","signature_key":"b9e30fcbcab2e5ffb62ac86a12092ce6c24c00dc06e892b38cc14ef91a1c4b5aa4aa3850ce981560f935feba5d3df0b960890fea6c898e72715a276f5c3745b2","settlement_time":"2025-12-30 07:59:59","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-51-1767056381648","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"10000.00","fraud_status":"accept","expiry_time":"2025-12-31 07:59:44","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-30 00:59:41', '2025-12-30 00:59:59'),
	(30, 53, 'credit_card', 20000.00, 'settlement', NULL, 'ORDER-53-1767095811281', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-30 18:57:09","transaction_status":"settlement","transaction_id":"123a039e-06df-4193-b5aa-80b8381dd831","status_message":"midtrans payment notification","status_code":"200","signature_key":"b75317094a6c590e6a01e91cb8bb3f9b431890d3320926c454a3aea73297af99d519fd86458a394c4f997c28b0a1c415e226fa0dc1e5aa1d0426046fe003d344","settlement_time":"2025-12-30 18:57:27","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-53-1767095811281","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"20000.00","fraud_status":"accept","expiry_time":"2025-12-31 18:57:09","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-30 11:56:52', '2025-12-30 11:57:28'),
	(31, 55, 'credit_card', 100000.00, 'settlement', NULL, 'ORDER-55-1767101863146', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2025-12-30 20:37:59","transaction_status":"settlement","transaction_id":"6c516252-b09c-4a57-84f8-90ab495257c3","status_message":"midtrans payment notification","status_code":"200","signature_key":"7a1f8fb187b11b67efed4199c643d63b286050cdb3cce09f879a296652b739b192b0aafb18526ea40604a1895f2d385b489ff74b5fba5a284d871618f158372d","settlement_time":"2025-12-30 20:38:52","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-55-1767101863146","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"100000.00","fraud_status":"accept","expiry_time":"2025-12-31 20:37:59","customer_details":{"phone":"+628928373672","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-30 13:37:47', '2025-12-30 13:38:55'),
	(32, 56, 'credit_card', 600000.00, 'settlement', NULL, 'ORDER-56-1767102122327', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2025-12-30 20:42:04","transaction_status":"settlement","transaction_id":"b9877da8-5e54-4dac-aab6-51aedf89a7a9","status_message":"midtrans payment notification","status_code":"200","signature_key":"42f2972fc30867b4a27e4257d1476e3e1325fb10f00440adc758dfe0cc6241495df1071539c3b5f8b4c82d9d29a1969f8fd1abd001e0a11836c4e6d00a9af17b","settlement_time":"2025-12-30 20:42:19","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-56-1767102122327","merchant_id":"G002486392","issuer":"dana","gross_amount":"600000.00","fraud_status":"accept","expiry_time":"2025-12-31 20:42:03","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2025-12-30 13:42:02', '2025-12-30 13:42:20'),
	(33, 60, 'credit_card', 600000.00, 'settlement', NULL, 'ORDER-60-1767664873356', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2026-01-06 09:01:16","transaction_status":"settlement","transaction_id":"13efd942-d331-4e69-b325-33ee6ee7ae3a","status_message":"midtrans payment notification","status_code":"200","signature_key":"1a303c146914df1898591b592b59b630ab3b182e5ce023507d14253189504e275f69540cbd44d80e83c602037a8a42be3662cc790e0102b7ab9a21e9fba3b933","settlement_time":"2026-01-06 09:01:34","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-60-1767664873356","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"600000.00","fraud_status":"accept","expiry_time":"2026-01-07 09:01:16","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2026-01-06 02:01:13', '2026-01-06 02:01:35'),
	(34, 61, 'credit_card', 2000000.00, 'settlement', NULL, 'ORDER-61-1767746448487', 'credit_card', '{"transaction_type":"off-us","transaction_time":"2026-01-07 07:40:52","transaction_status":"settlement","transaction_id":"94675057-610d-444a-b48d-e483d4881784","status_message":"midtrans payment notification","status_code":"200","signature_key":"78d4197f6f0d3fb23d14a0783ef7545a54021c8e57efb9fbc27593f7f85abe59af2997ac47d3889538968e96164669caad61e1518f9e21b7d0a01cfcc6c96ca1","settlement_time":"2026-01-07 07:41:15","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-61-1767746448487","merchant_id":"G002486392","issuer":"dana","gross_amount":"2000000.00","fraud_status":"accept","expiry_time":"2026-01-08 07:40:52","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2026-01-07 00:40:49', '2026-01-07 00:41:16'),
	(35, 63, 'credit_card', 100000.00, 'settlement', NULL, 'ORDER-63-1767837404382', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2026-01-08 08:56:52","transaction_status":"settlement","transaction_id":"2a4320aa-4dcb-4cec-823e-e8b8b7e483e5","status_message":"midtrans payment notification","status_code":"200","signature_key":"dde60ec12fffe898dd18af9d30f3a394cb34a8979803dc9ad396b874c3b18d9c0c1e8ebcd062fc5d6aff8e327ae9d39746a6ce2c83af71292ea87e1fc93cbf1b","settlement_time":"2026-01-08 08:57:11","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-63-1767837404382","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"100000.00","fraud_status":"accept","expiry_time":"2026-01-09 08:56:52","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2026-01-08 01:56:44', '2026-01-08 01:57:12'),
	(36, 64, 'credit_card', 1000000.00, 'settlement', NULL, 'ORDER-64-1768182312650', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2026-01-12 08:45:17","transaction_status":"settlement","transaction_id":"dd9bd60c-2660-4db0-9d87-c763095f173e","status_message":"midtrans payment notification","status_code":"200","signature_key":"3f813f496c160f91bb5aab29a670c6c638b192fb876861e7c72200983ffe6d60db1a7b3397033a2675c3a6a41e96d77f2462a8c2e5d923f4628eab574ff0edda","settlement_time":"2026-01-12 08:45:39","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-64-1768182312650","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"1000000.00","fraud_status":"accept","expiry_time":"2026-01-13 08:45:17","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2026-01-12 01:45:13', '2026-01-12 01:45:41'),
	(37, 66, 'credit_card', 150000.00, 'settlement', NULL, 'ORDER-66-1768267726609', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2026-01-13 08:28:50","transaction_status":"settlement","transaction_id":"dc343a34-72bf-4d46-b8c2-218c03525bee","status_message":"midtrans payment notification","status_code":"200","signature_key":"5a899bf016b984d4e12c6c31e10043295ebe0b28f22fa6065d3307adfb0154b31c20963c7a34da005e17f46686455f3edb356ea4b89d2343ff5730e75dcd1f29","settlement_time":"2026-01-13 08:29:09","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-66-1768267726609","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"150000.00","fraud_status":"accept","expiry_time":"2026-01-14 08:28:50","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2026-01-13 01:28:46', '2026-01-13 01:29:09'),
	(39, 68, 'credit_card', 150000.00, 'settlement', NULL, 'ORDER-68-1768269444594', 'credit_card', '{"transaction_type":"on-us","transaction_time":"2026-01-13 08:57:26","transaction_status":"settlement","transaction_id":"e5cfbfe7-e64d-451b-a6fe-b860ab0adc54","status_message":"midtrans payment notification","status_code":"200","signature_key":"858214b25bb9b57547a4c84da2bbc1e924bf02140741531d92c2b9c10f99edd9f879760ddbc9764e8f0baa5a88097ce571ba66ca534eefc855e8c16aa9c4ac81","settlement_time":"2026-01-13 08:57:39","pop_id":"2b2b3bd4-cc2e-4d27-bd82-ceb81dae8c7e","payment_type":"qris","order_id":"ORDER-68-1768269444594","merchant_id":"G002486392","merchant_cross_reference_id":"870664d3-9f88-430c-9498-46b2c36a205c","issuer":"gopay","gross_amount":"150000.00","fraud_status":"accept","expiry_time":"2026-01-14 08:57:26","customer_details":{"phone":"+6285746109179","full_name":"rasyadan","email":"rasyadan@gmail.com"},"currency":"IDR","acquirer":"gopay"}', '2026-01-13 01:57:24', '2026-01-13 01:57:40');

-- Dumping structure for table db_travel.reviews
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_package` (`package_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_approved` (`is_approved`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.reviews: ~0 rows (approximately)

-- Dumping structure for table db_travel.settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.settings: ~1 rows (approximately)
INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
	(1, 'revenue_reset_date', '2026-01-13 01:12:15', '2026-01-13 01:12:15');

-- Dumping structure for table db_travel.tour_packages
DROP TABLE IF EXISTS `tour_packages`;
CREATE TABLE IF NOT EXISTS `tour_packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `max_people` int(11) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category` varchar(100) DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `itinerary` text DEFAULT NULL,
  `facilities` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_location` (`location`),
  KEY `idx_city` (`city`),
  KEY `idx_country` (`country`),
  FULLTEXT KEY `idx_search` (`title`,`description`,`location`,`city`,`country`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.tour_packages: ~26 rows (approximately)
INSERT INTO `tour_packages` (`id`, `title`, `slug`, `description`, `price`, `duration_days`, `max_people`, `location`, `city`, `country`, `is_featured`, `is_active`, `created_at`, `updated_at`, `category`, `short_description`, `itinerary`, `facilities`) VALUES
	(1, 'Liburan ke Bali private', 'liburan-ke-bali-1768214393', 'Nikmati keindahan pantai dan budaya Bali dengan paket liburan ', 3000.00, 5, 15, 'Kuta Beach ...', 'Badung', 'Indonesia', 1, 0, '2025-12-14 15:27:19', '2026-01-12 10:39:53', 'Private Tour', '...........', '.............', '............'),
	(2, 'Petualangan ke Raja Ampat', 'petualangan-raja-ampat-1768214393', 'Jelajahi keindahan bawah laut Raja Ampat yang memukau', 1.00, 5, 10, 'Raja Ampat', 'Raja Ampat', 'Indonesia', 1, 0, '2025-12-14 15:27:19', '2026-01-12 10:39:53', 'Internasional', '', '', ''),
	(3, 'Wisata Budaya Jogja', 'wisata-budaya-jogja-1768214393', 'Mengenal lebih dekat budaya dan sejarah Yogyakarta', 3500000.00, 3, 20, 'Malioboro', 'Yogyakarta', 'Indonesia', 0, 0, '2025-12-14 15:27:19', '2026-01-12 10:39:53', 'Private Tour', '', '', ''),
	(4, 'pantai balekambang', 'pantai-balekambang-1768214393', '............', 10000.00, 1, 10, 'malang', 'malang', 'Indonesia', 0, 0, '2025-12-29 14:17:57', '2026-01-12 10:39:53', 'Private Tour', '.............', '...................', '.................'),
	(5, 'Travel Reguler', 'travel-reguler-1768214393', 'Layanan travel reguler dengan armada van/MPV untuk rute harian.', 100000.00, 1, 6, 'Jawa Timur', 'Surabaya', 'Indonesia', 1, 0, '2025-12-30 13:13:17', '2026-01-12 10:39:53', 'travel_reguler', 'Travel reguler harian', NULL, NULL),
	(6, 'Carter', 'carter-1768214393', 'Layanan carter mobil (point-to-point) untuk kebutuhan fleksibel.', 600000.00, 1, 4, 'Jawa Timur', 'Malang', 'Indonesia', 1, 0, '2025-12-30 13:13:17', '2026-01-12 10:39:53', 'carter', 'Carter mobil point-to-point', NULL, NULL),
	(7, 'Sewa Mobil', 'sewa-mobil-1768214393', 'Sewa mobil harian termasuk supir (opsional) dan BBM sesuai paket.', 350000.00, 1, 5, 'Jawa Timur', 'Malang', 'Indonesia', 0, 0, '2025-12-30 13:13:17', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa mobil harian', NULL, NULL),
	(8, 'travel premium', 'travel-premium-1768214393', '.........', 1000000.00, 2, 10, 'malang', 'malang', 'Indonesia', 0, 0, '2026-01-07 00:39:41', '2026-01-12 10:39:53', 'Domestik', '.......', '.........', '..............'),
	(9, 'Travel Malang - Surabaya', 'travel-malang-surabaya-1768214393', 'Layanan travel reguler rute Malang ke Surabaya.', 150000.00, 1, 5, 'Malang, Surabaya', 'Malang', 'Indonesia', 1, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Malang - Surabaya', NULL, NULL),
	(10, 'Travel Malang - Juanda', 'travel-malang-juanda-1768214393', 'Layanan travel reguler rute Malang ke Bandara Juanda.', 150000.00, 1, 5, 'Malang, Juanda', 'Malang', 'Indonesia', 1, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Malang - Juanda', NULL, NULL),
	(11, 'Travel Malang - Kediri', 'travel-malang-kediri-1768214393', 'Layanan travel reguler rute Malang ke Kediri.', 130000.00, 1, 5, 'Malang, Kediri', 'Malang', 'Indonesia', 1, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Malang - Kediri', NULL, NULL),
	(12, 'Travel Surabaya - Kediri', 'travel-surabaya-kediri-1768214393', 'Layanan travel reguler rute Surabaya ke Kediri.', 180000.00, 1, 5, 'Surabaya, Kediri', 'Surabaya', 'Indonesia', 1, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Surabaya - Kediri', NULL, NULL),
	(13, 'Sewa Mobil Lepas Kunci', 'sewa-mobil-lepas-kunci-1768214393', 'Sewa mobil harian tanpa driver (Lepas Kunci). Harga belum termasuk BBM, Tol, Parkir.', 300000.00, 1, 7, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa mobil harian lepas kunci', NULL, NULL),
	(14, 'Sewa Mobil + Driver', 'sewa-mobil-driver-1768214393', 'Sewa mobil harian sudah termasuk Driver. Harga belum termasuk BBM, Tol, Parkir.', 500000.00, 1, 6, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa mobil harian + Driver', NULL, NULL),
	(15, 'Sewa Hiace', 'sewa-hiace-1768214393', 'Sewa unit Toyota Hiace harian. Harga belum termasuk BBM, Tol, Parkir.', 1200000.00, 1, 14, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa Hiace harian', NULL, NULL),
	(16, 'Sewa Elf Long', 'sewa-elf-long-1768214393', 'Sewa unit Isuzu Elf Long harian. Harga belum termasuk BBM, Tol, Parkir.', 1000000.00, 1, 19, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa Elf Long harian', NULL, NULL),
	(17, 'Sewa Elf Short', 'sewa-elf-short-1768214393', 'Sewa unit Isuzu Elf Short harian. Harga belum termasuk BBM, Tol, Parkir.', 800000.00, 1, 12, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 0, '2026-01-12 02:11:08', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa Elf Short harian', NULL, NULL),
	(19, 'Travel Malang - Surabaya', 'travel-malang-surabaya', 'Layanan travel reguler rute Malang ke Surabaya. Harga berlaku per hari.', 150000.00, 1, 5, 'Malang, Surabaya', 'Malang', 'Indonesia', 1, 1, '2026-01-12 10:39:53', '2026-01-14 06:09:14', 'travel_reguler', 'Travel Malang - Surabaya (per hari)', '', ''),
	(20, 'Travel Malang - Juanda', 'travel-malang-juanda', 'Layanan travel reguler rute Malang ke Bandara Juanda. Harga berlaku per hari.', 150000.00, 1, 5, 'Malang, Juanda', 'Malang', 'Indonesia', 1, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Malang - Juanda (per hari)', NULL, NULL),
	(21, 'Travel Malang - Kediri', 'travel-malang-kediri', 'Layanan travel reguler rute Malang ke Kediri. Harga berlaku per hari.', 130000.00, 1, 5, 'Malang, Kediri', 'Malang', 'Indonesia', 1, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Malang - Kediri (per hari)', NULL, NULL),
	(22, 'Travel Surabaya - Kediri', 'travel-surabaya-kediri', 'Layanan travel reguler rute Surabaya ke Kediri. Harga berlaku per hari.', 180000.00, 1, 5, 'Surabaya, Kediri', 'Surabaya', 'Indonesia', 1, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'travel_reguler', 'Travel Surabaya - Kediri (per hari)', NULL, NULL),
	(23, 'Sewa Mobil Lepas Kunci', 'sewa-mobil-lepas-kunci', 'Sewa mobil harian tanpa driver (Lepas Kunci). Harga belum termasuk BBM, Tol, Parkir.', 300000.00, 1, 7, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa mobil harian lepas kunci', NULL, NULL),
	(24, 'Sewa Mobil + Driver', 'sewa-mobil-driver', 'Sewa mobil harian sudah termasuk Driver. Harga belum termasuk BBM, Tol, Parkir.', 500000.00, 1, 6, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa mobil harian + Driver', NULL, NULL),
	(25, 'Sewa Hiace', 'sewa-hiace', 'Sewa unit Toyota Hiace harian. Harga belum termasuk BBM, Tol, Parkir.', 1200000.00, 1, 14, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa Hiace harian', NULL, NULL),
	(26, 'Sewa Elf Long', 'sewa-elf-long', 'Sewa unit Isuzu Elf Long harian. Harga belum termasuk BBM, Tol, Parkir.', 1000000.00, 1, 19, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa Elf Long harian', NULL, NULL),
	(27, 'Sewa Elf Short', 'sewa-elf-short', 'Sewa unit Isuzu Elf Short harian. Harga belum termasuk BBM, Tol, Parkir.', 800000.00, 1, 12, 'Malang, Surabaya', 'Malang', 'Indonesia', 0, 1, '2026-01-12 10:39:53', '2026-01-12 10:39:53', 'sewa_mobil', 'Sewa Elf Short harian', NULL, NULL);

-- Dumping structure for table db_travel.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_travel.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `address`, `email_verified_at`, `remember_token`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
	(1, 'percobaan', 'coba@gmail.com', '$2b$10$8FRICHD3koaZckxk1toTHuqPy.ayLGQUA2wmaxTqt3cBORNLP4e.e', '08892383293', NULL, NULL, NULL, 1, NULL, '2025-12-15 12:27:35', '2025-12-15 12:27:35'),
	(2, 'rasya', 'rasyadan@gmail.com', '$2b$10$Nm//Jtn3zVxHyy0TMm.kk.yAyawFrkELlXWkG/Xs7M7Q7WjAKCwRW', '0857-4610-9179', NULL, NULL, NULL, 1, NULL, '2025-12-22 15:21:10', '2025-12-22 15:21:10');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
SET FOREIGN_KEY_CHECKS = 1;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
