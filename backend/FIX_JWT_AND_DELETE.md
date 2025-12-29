# 🔧 Fix JWT Error & Delete Package Issue

## Masalah 1: JWT Verification Error "invalid token"

### Penyebab
Token JWT yang digunakan tidak valid. Kemungkinan:
1. Token di-generate dengan JWT_SECRET yang berbeda
2. Token sudah expired atau corrupt
3. Token tidak di-copy lengkap

### Solusi

**Langkah 1: Restart Backend Server**
```bash
# Stop server (Ctrl+C)
# Start ulang
cd backend
npm run dev
```

**Langkah 2: Login Ulang untuk Dapat Token Baru**

```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123",
  "isAdmin": true
}
```

**Langkah 3: Gunakan Token Baru**

Copy token dari response dan gunakan di request berikutnya dengan format:
```
Authorization: Bearer NEW_TOKEN_HERE
```

**Langkah 4: Pastikan .env Sudah Dikonfigurasi**

File `backend/.env` harus ada:
```
JWT_SECRET=your_secret_key_here
```

Jika belum ada, buat file `.env` di folder `backend` dengan isi:
```
JWT_SECRET=supersecretjwt
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=travel_db
```

---

## Masalah 2: "Cannot delete package with active bookings"

### Penjelasan
**Ini BUKAN error, ini adalah VALIDASI yang benar!**

Package tidak boleh dihapus jika masih ada booking yang:
- Status: `pending` (belum dibayar)
- Status: `paid` (sudah dibayar)

Ini untuk mencegah:
- Data inconsistency
- Booking yang sudah dibayar menjadi invalid
- Masalah refund/refund handling

### Solusi

**Opsi 1: Cancel/Complete Bookings Terlebih Dahulu**

Update status booking menjadi `cancelled` atau `completed`:

```sql
-- Cek bookings yang masih active
SELECT id, booking_code, payment_status, package_id 
FROM bookings 
WHERE package_id = 1 
AND payment_status IN ('pending', 'paid');

-- Update status menjadi cancelled (jika belum dibayar)
UPDATE bookings 
SET payment_status = 'cancelled' 
WHERE package_id = 1 
AND payment_status = 'pending';

-- Atau update menjadi completed (jika sudah dibayar)
UPDATE bookings 
SET payment_status = 'completed' 
WHERE package_id = 1 
AND payment_status = 'paid';
```

Setelah itu, baru bisa delete package.

**Opsi 2: Soft Delete (Recommended)**

Package sudah menggunakan soft delete (set `is_active = 0`), jadi:
- Package tidak akan muncul di list packages (karena filter `WHERE is_active = 1`)
- Data tetap ada di database untuk referensi
- Booking yang sudah ada tetap valid

**Opsi 3: Hard Delete (Hanya untuk Testing)**

Jika benar-benar ingin hard delete (HAPUS PERMANEN), bisa langsung hapus dari database:

```sql
-- ⚠️ HATI-HATI: Ini akan menghapus data permanen!
-- Pastikan tidak ada booking yang penting

-- Hapus bookings terlebih dahulu
DELETE FROM bookings WHERE package_id = 1;

-- Hapus package images
DELETE FROM package_images WHERE package_id = 1;

-- Hapus package schedules
DELETE FROM package_schedules WHERE package_id = 1;

-- Hapus package
DELETE FROM tour_packages WHERE id = 1;
```

---

## Cara Cek Active Bookings

```sql
-- Cek semua bookings untuk package tertentu
SELECT 
  b.id,
  b.booking_code,
  b.customer_name,
  b.payment_status,
  b.total_amount,
  p.title AS package_title
FROM bookings b
JOIN tour_packages p ON p.id = b.package_id
WHERE b.package_id = 1
AND b.payment_status IN ('pending', 'paid');
```

---

## Best Practice

1. **Jangan hard delete** package yang sudah ada booking
2. **Gunakan soft delete** (sudah diimplementasi)
3. **Handle cancellation** dengan baik sebelum delete
4. **Backup data** sebelum delete jika penting

---

## Summary

| Masalah | Status | Solusi |
|---------|--------|--------|
| JWT Error | Bug | Login ulang, restart server |
| Cannot delete package | Validasi (Bukan Bug) | Cancel bookings dulu atau gunakan soft delete |

---

## Test Setelah Fix

1. **Test JWT:**
   ```bash
   # Login ulang
   POST /api/auth/login
   
   # Gunakan token baru
   GET /api/packages (dengan Authorization header)
   ```

2. **Test Delete Package:**
   ```bash
   # Cek bookings dulu
   GET /api/bookings?package_id=1
   
   # Jika tidak ada active bookings, baru delete
   DELETE /api/packages/1
   ```

