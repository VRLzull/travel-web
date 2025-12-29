-- Script untuk menambahkan kolom password_hash ke tabel users
-- Jalankan script ini TERLEBIH DAHULU sebelum fix-user-passwords.sql

-- Cek apakah kolom sudah ada (optional, untuk referensi)
-- SHOW COLUMNS FROM users LIKE 'password_hash';

-- Tambahkan kolom password_hash
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;

-- Verifikasi kolom sudah ditambahkan
SHOW COLUMNS FROM users;

