# 🚀 Quick Start Testing

## Langkah 1: Pastikan Backend Running

```bash
cd backend
npm run dev
```

Server akan running di `http://localhost:4000`

---

## Langkah 2: Pilih Metode Testing

### ✅ Metode 1: Menggunakan Browser (Paling Mudah)

Buka browser dan akses:
- http://localhost:4000/api/health
- http://localhost:4000/api/packages
- http://localhost:4000/api/bookings

### ✅ Metode 2: Menggunakan VS Code REST Client

1. Install extension **REST Client** di VS Code
2. Buka file `test-api.http`
3. Klik "Send Request" di atas setiap request
4. **PENTING**: Setelah login admin, copy token dan paste ke variable `@adminToken`

### ✅ Metode 3: Menggunakan Postman/Insomnia

1. Import atau copy request dari `test-api.http`
2. Atau ikuti panduan di `TESTING.md`
3. Untuk protected routes, tambahkan header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`

### ✅ Metode 4: Menggunakan cURL (Command Line)

```bash
# Health check
curl http://localhost:4000/api/health

# Login admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","isAdmin":true}'

# Get packages
curl http://localhost:4000/api/packages
```

### ✅ Metode 5: Menggunakan Test Script

```bash
cd backend
node test-script.js
```

---

## Urutan Testing yang Disarankan

1. ✅ **Health Check** - Pastikan server running
2. ✅ **Login Admin** - Dapatkan token
3. ✅ **Get Packages** - Lihat data packages
4. ✅ **Create Package** - Buat package baru (perlu token admin)
5. ✅ **Create Booking** - Buat booking
6. ✅ **Create Payment** - Test payment flow

---

## Troubleshooting

### ❌ Error: Connection refused
- Pastikan backend server sudah running
- Cek port 4000 tidak digunakan aplikasi lain

### ❌ Error: 401 Unauthorized
- Pastikan sudah login dan dapat token
- Pastikan token di-set di header Authorization

### ❌ Error: 403 Forbidden
- Pastikan menggunakan token admin (bukan user biasa)
- Cek role di database admin_users

### ❌ Error: Database connection failed
- Cek file `.env` sudah dikonfigurasi
- Pastikan MySQL server running
- Pastikan database `travel_db` sudah dibuat

---

## Tips

- Simpan token di Postman/Insomnia sebagai environment variable
- Gunakan Postman Collection untuk testing yang lebih terorganisir
- Cek database langsung untuk memastikan data tersimpan

