# 🔧 Fix User Password Issue

## Masalah
User biasa tidak bisa login karena:
1. Tabel `users` tidak punya kolom `password_hash` 
2. User yang sudah ada tidak punya password_hash

## Solusi - Lakukan Langkah Berurutan

### ⚠️ PENTING: Lakukan Langkah 1 DULU sebelum Langkah 2!

### Langkah 1: Tambahkan Kolom password_hash

**Jalankan SQL ini TERLEBIH DAHULU:**

```sql
-- Tambahkan kolom password_hash ke tabel users
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;
```

Atau jalankan file SQL:
- Buka `backend/scripts/add-password-column.sql` di Laragon MySQL
- Execute

**Verifikasi kolom sudah ditambahkan:**
```sql
SHOW COLUMNS FROM users;
```

Pastikan kolom `password_hash` muncul di hasil query.

---

### Langkah 2: Update Password untuk User yang Sudah Ada

**Setelah kolom sudah ditambahkan, jalankan SQL ini:**

```sql
-- Update password untuk user yang sudah ada (password: password123)
UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE email = 'john@example.com';

UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE email = 'jane@example.com';

UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE email = 'bob@example.com';
```

**Atau update semua user sekaligus:**
```sql
UPDATE users 
SET password_hash = '$2b$10$WNR3SAauKr8NH9WSzkRLA.1gTfjWkALnRLb47gJbjXJsSoAfjlrPK' 
WHERE password_hash IS NULL;
```

Atau jalankan file SQL:
- Buka `backend/scripts/fix-user-passwords.sql` di Laragon MySQL
- Execute

---

## Urutan Eksekusi yang Benar

1. ✅ **Pertama**: Jalankan `add-password-column.sql` (tambahkan kolom)
2. ✅ **Kedua**: Jalankan `fix-user-passwords.sql` (update password)

---

## Setelah Fix

**Login dengan user biasa:**
- Email: `john@example.com`
- Password: `password123`
- isAdmin: `false`

**Atau:**
- Email: `jane@example.com`
- Password: `password123`
- isAdmin: `false`

---

## Register User Baru

Sekarang register user sudah support password:

```json
POST /api/auth/register
{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "081234567890",
  "password": "password123"
}
```

**Password wajib diisi dan minimal 6 karakter.**

---

## Verifikasi

Setelah update, test login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "isAdmin": false
  }'
```

Seharusnya akan return token JWT jika berhasil.

---

## Troubleshooting

### Error: Unknown column 'password_hash'
- **Solusi**: Pastikan sudah menjalankan `add-password-column.sql` terlebih dahulu

### Error: Duplicate column name 'password_hash'
- **Solusi**: Kolom sudah ada, langsung ke Langkah 2

### Error: Column 'password_hash' cannot be null
- **Solusi**: Kolom sudah ada tapi masih NULL, jalankan Langkah 2 untuk update password

---

## Catatan

- Password hash menggunakan bcrypt dengan salt rounds = 10
- User baru yang register akan otomatis punya password_hash
- User lama perlu di-update manual dengan SQL di atas
