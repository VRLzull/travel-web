# Panduan Testing Backend API

## Prerequisites
1. Pastikan database `travel_db` sudah dibuat dan tabel-tabel sudah ada
2. Pastikan `.env` file sudah dikonfigurasi dengan benar
3. Jalankan backend server: `npm run dev` (dari folder backend)

## Base URL
```
http://localhost:4000/api
```

---

## 1. Testing Authentication

### Register User
```bash
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890"
}
```

### Login User
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "isAdmin": false
}
```

### Login Admin
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123",
  "isAdmin": true
}
```

**Response akan mengembalikan token JWT, simpan untuk digunakan di request berikutnya**

### Get Current User (Protected)
```bash
GET http://localhost:4000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 2. Testing Packages (Public Routes)

### Get All Packages
```bash
GET http://localhost:4000/api/packages
```

### Get Package Detail
```bash
GET http://localhost:4000/api/packages/1
```

---

## 3. Testing Packages (Admin Routes - Perlu Token)

**Ganti `YOUR_ADMIN_TOKEN` dengan token dari login admin**

### Create Package
```bash
POST http://localhost:4000/api/packages
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Paket Wisata Bali 3D2N",
  "location": "Bali, Indonesia",
  "category": "Domestic",
  "duration_days": 3,
  "price_per_person": 2500000,
  "short_description": "Nikmati keindahan pulau dewata",
  "description": "Paket lengkap wisata Bali selama 3 hari 2 malam dengan berbagai destinasi menarik",
  "primary_image": "https://example.com/bali.jpg"
}
```

### Update Package
```bash
PUT http://localhost:4000/api/packages/1
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Paket Wisata Bali 4D3N",
  "price_per_person": 3000000
}
```

### Delete Package
```bash
DELETE http://localhost:4000/api/packages/1
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 4. Testing Package Images (Admin Routes)

### Add Image to Package
```bash
POST http://localhost:4000/api/packages/1/images
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "image_url": "https://example.com/image2.jpg",
  "is_primary": false
}
```

### Set Primary Image
```bash
PUT http://localhost:4000/api/packages/1/images/primary
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "image_id": 2
}
```

### Delete Image
```bash
DELETE http://localhost:4000/api/packages/images/2
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 5. Testing Package Schedules (Admin Routes)

### Add Schedule to Package
```bash
POST http://localhost:4000/api/packages/1/schedules
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "departure_date": "2024-12-25",
  "available_quota": 20
}
```

### Update Schedule
```bash
PUT http://localhost:4000/api/packages/schedules/1
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "available_quota": 15
}
```

### Delete Schedule
```bash
DELETE http://localhost:4000/api/packages/schedules/1
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 6. Testing Bookings

### Create Booking
```bash
POST http://localhost:4000/api/bookings
Content-Type: application/json

{
  "package_id": 1,
  "trip_date": "2024-12-25",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "081234567890",
  "total_participants": 2,
  "schedule_id": 1
}
```

**Required Fields:**
- `package_id` (number) - ID package yang akan dibooking
- `trip_date` (string) - Format: YYYY-MM-DD (contoh: "2024-12-25")
- `customer_name` (string) - Nama customer
- `customer_email` (string) - Email customer (format email valid)
- `customer_phone` (string) - Nomor telepon customer
- `total_participants` (number) - Jumlah peserta (harus > 0)

**Optional Fields:**
- `schedule_id` (number) - ID schedule jika menggunakan jadwal tertentu
  - ⚠️ **PENTING**: Jika diberikan, schedule_id harus valid dan belong to package_id
  - Jika tidak yakin, bisa di-omit (tidak perlu diisi)

**Tips:**
- Untuk booking tanpa schedule tertentu, **jangan isi** `schedule_id` (biarkan kosong/null)
- Jika ingin menggunakan schedule, pastikan schedule sudah dibuat untuk package tersebut
- Cek available schedules dengan: `GET /api/packages/:id` (akan return schedules)

**Contoh Request yang Benar:**
```json
{
  "package_id": 1,
  "trip_date": "2024-12-25",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "081234567890",
  "total_participants": 2
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "booking_code": "BK20241225-123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "081234567890",
    "package_id": 1,
    "trip_date": "2024-12-25",
    "total_participants": 2,
    "total_amount": 5000000,
    "payment_status": "pending"
  }
}
```

**Response Error (Missing Fields):**
```json
{
  "success": false,
  "message": "Missing required fields",
  "missingFields": ["package_id", "customer_email"],
  "requiredFields": [
    "package_id",
    "trip_date",
    "customer_name",
    "customer_email",
    "customer_phone",
    "total_participants"
  ],
  "optionalFields": ["schedule_id"]
}
```

### Get All Bookings (dengan filter)
```bash
GET http://localhost:4000/api/bookings?payment_status=pending&limit=10
```

### Get Booking Detail
```bash
GET http://localhost:4000/api/bookings/1
```

---

## 7. Testing Payments

### Create Payment
```bash
POST http://localhost:4000/api/payment/create
Content-Type: application/json

{
  "booking_id": 1
}
```

### Check Payment Status
```bash
GET http://localhost:4000/api/payment/status/ORDER-4-1764511177993
```

---

## 8. Simulasi Webhook Notification (Testing)

### Simulasi Payment Success (Status menjadi "paid")
```bash
POST http://localhost:4000/api/payment/notification
Content-Type: application/json

{
  "transaction_status": "settlement",
  "order_id": "ORDER-4-1764511177993",
  "status_code": "200",
  "gross_amount": "6000000.00",
  "fraud_status": "accept"
}
```

**Setelah webhook ini, status payment akan berubah menjadi "paid"**

### Simulasi Payment Expired
```bash
POST http://localhost:4000/api/payment/notification
Content-Type: application/json

{
  "transaction_status": "expire",
  "order_id": "ORDER-4-1764511177993",
  "status_code": "202",
  "gross_amount": "6000000.00"
}
```

### Simulasi Payment Cancelled
```bash
POST http://localhost:4000/api/payment/notification
Content-Type: application/json

{
  "transaction_status": "cancel",
  "order_id": "ORDER-4-1764511177993",
  "status_code": "201",
  "gross_amount": "6000000.00"
}
```

**Mapping Status:**
- `"settlement"` → Status menjadi **"paid"**
- `"expire"` → Status menjadi **"expired"**
- `"cancel"` atau `"deny"` → Status menjadi **"cancelled"**

---

## Testing dengan cURL

### Contoh: Login Admin
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "isAdmin": true
  }'
```

### Contoh: Create Package (dengan token)
```bash
curl -X POST http://localhost:4000/api/packages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Paket Wisata Lombok",
    "location": "Lombok, Indonesia",
    "category": "Domestic",
    "duration_days": 4,
    "price_per_person": 3500000,
    "short_description": "Eksplorasi keindahan Lombok",
    "description": "Paket lengkap wisata Lombok selama 4 hari 3 malam"
  }'
```

---

## Testing dengan Postman/Insomnia

1. Import collection (jika ada)
2. Atau buat request manual dengan mengikuti format di atas
3. Untuk protected routes, tambahkan header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`

---

## Testing dengan Browser

Untuk GET requests, bisa langsung buka di browser:
- http://localhost:4000/api/health
- http://localhost:4000/api/packages
- http://localhost:4000/api/packages/1

---

## Expected Responses

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Tips Testing

1. **Test urutan yang disarankan:**
   - Login admin dulu untuk dapat token
   - Create package
   - Add images & schedules ke package
   - Create booking
   - Create payment

2. **Cek database langsung** untuk memastikan data tersimpan dengan benar

3. **Test error cases:**
   - Request tanpa token (harus return 401)
   - Request dengan token user biasa ke admin route (harus return 403)
   - Invalid data (harus return 400)
   - Not found (harus return 404)

