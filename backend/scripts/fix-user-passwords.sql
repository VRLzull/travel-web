-- Script untuk menambahkan password_hash ke user yang sudah ada
-- Password default: password123
-- Jalankan script ini di MySQL untuk update password hash user

-- Langkah 1: Tambahkan kolom password_hash jika belum ada
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;

-- Jika MySQL versi lama tidak support IF NOT EXISTS, gunakan ini:
-- ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;

-- Update password untuk user yang sudah ada (password: password123)
-- Hash di-generate dengan: bcrypt.hash('password123', 10)
UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE email = 'john@example.com';

UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE email = 'jane@example.com';

UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE email = 'bob@example.com';

-- Verifikasi
SELECT id, name, email, 
       CASE 
         WHEN password_hash IS NOT NULL THEN 'Password hash exists'
         ELSE 'No password hash'
       END as password_status
FROM users;

