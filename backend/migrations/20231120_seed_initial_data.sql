-- Masukkan data admin (password: admin123)
-- Password hash di-generate dengan: bcrypt.hash('admin123', 10)
INSERT INTO admin_users (name, email, password_hash, role) VALUES
('Super Admin', 'superadmin@example.com', '$2b$10$Ty5bHa3pI6w6PlGZFwDWoufrBdOIEzCoqPqw/.aDMh.4tA9QjkYAy', 'SUPERADMIN'),
('Admin Biasa', 'admin@example.com', '$2b$10$Ty5bHa3pI6w6PlGZFwDWoufrBdOIEzCoqPqw/.aDMh.4tA9QjkYAy', 'ADMIN');

-- Masukkan beberapa user contoh (password: password123)
-- Password hash di-generate dengan: bcrypt.hash('password123', 10)
INSERT INTO users (name, email, phone, password_hash) VALUES
('John Doe', 'john@example.com', '081234567890', '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK'),
('Jane Smith', 'jane@example.com', '081234567891', '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK'),
('Bob Johnson', 'bob@example.com', '081234567892', '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK');

-- Tampilkan data yang baru saja dimasukkan
SELECT * FROM admin_users;
SELECT * FROM users;