# 🔧 Fix Password Hash Issue

## Masalah
Password hash di database tidak sesuai dengan password yang diinput, sehingga login selalu gagal.

## Solusi

### Opsi 1: Update Database Langsung (Cara Tercepat)

Jalankan SQL berikut di MySQL/Laragon:

```sql
-- Update password untuk Super Admin (password: admin123)
UPDATE admin_users 
SET password_hash = '$2b$10$Ty5bHa3pI6w6PlGZFwDWoufrBdOIEzCoqPqw/.aDMh.4tA9QjkYAy' 
WHERE email = 'superadmin@example.com';

-- Update password untuk Admin Biasa (password: admin123)
UPDATE admin_users 
SET password_hash = '$2b$10$Ty5bHa3pI6w6PlGZFwDWoufrBdOIEzCoqPqw/.aDMh.4tA9QjkYAy' 
WHERE email = 'admin@example.com';
```

Atau jalankan file SQL:
```bash
# Di Laragon MySQL, jalankan:
source backend/scripts/fix-admin-passwords.sql
```

### Opsi 2: Generate Hash Baru

Jika ingin password yang berbeda, jalankan:

```bash
cd backend
node scripts/generate-password-hash.js
```

Script akan generate hash untuk password yang Anda masukkan.

---

## Setelah Fix

**Login dengan:**
- Email: `admin@example.com`
- Password: `admin123`
- isAdmin: `true`

**Atau:**
- Email: `superadmin@example.com`
- Password: `admin123`
- isAdmin: `true`

---

## Verifikasi

Setelah update, test login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "isAdmin": true
  }'
```

Seharusnya akan return token JWT jika berhasil.

---

## Catatan

- Password hash menggunakan bcrypt dengan salt rounds = 10
- Hash yang di-generate akan berbeda setiap kali (karena salt random)
- Tapi semua hash untuk password yang sama akan valid untuk verifikasi

