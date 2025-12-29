-- Script untuk fix password admin di database
-- Jalankan script ini di MySQL untuk update password hash yang benar
-- Password: admin123

-- Update password untuk Super Admin (password: admin123)
UPDATE admin_users 
SET password_hash = '$2b$10$Ty5bHa3pI6w6PlGZFwDWoufrBdOIEzCoqPqw/.aDMh.4tA9QjkYAy' 
WHERE email = 'superadmin@example.com';

-- Update password untuk Admin Biasa (password: admin123)
UPDATE admin_users 
SET password_hash = '$2b$10$Ty5bHa3pI6w6PlGZFwDWoufrBdOIEzCoqPqw/.aDMh.4tA9QjkYAy' 
WHERE email = 'admin@example.com';

-- Verifikasi
SELECT id, name, email, role, 
       CASE 
         WHEN password_hash IS NOT NULL THEN 'Password hash exists'
         ELSE 'No password hash'
       END as password_status
FROM admin_users;

