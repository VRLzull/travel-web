# 🔧 Troubleshooting Authentication Issues

## Error: "JsonWebTokenError: invalid token"

Error ini terjadi ketika token JWT tidak valid. Berikut penyebab dan solusinya:

---

## Penyebab Umum

### 1. Token Tidak Dikirim dengan Benar

**Format yang benar:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Contoh di Postman/Insomnia:**
- Header Key: `Authorization`
- Header Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Contoh di cURL:**
```bash
curl -X GET http://localhost:4000/api/packages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Contoh di JavaScript/Fetch:**
```javascript
fetch('http://localhost:4000/api/packages', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

### 2. Token Sudah Expired

Token JWT memiliki expiry time (default: 7 hari). Jika token sudah expired, perlu login ulang.

**Solusi:** Login ulang untuk mendapatkan token baru.

---

### 3. JWT_SECRET Tidak Cocok

Jika JWT_SECRET berbeda antara saat generate token dan verify token, akan error.

**Solusi:** 
- Pastikan `.env` file sudah dikonfigurasi dengan benar
- Restart backend server setelah mengubah `.env`

---

### 4. Token Format Salah

Token harus berupa string JWT yang valid (format: `xxxxx.yyyyy.zzzzz`)

**Cek token:**
- Token harus ada 3 bagian yang dipisah titik (.)
- Contoh valid: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InVzZXIifQ.signature`

---

## Cara Debug

### 1. Cek Token yang Dikirim

Tambahkan logging di request:
```javascript
console.log('Token:', req.header('Authorization'));
```

### 2. Cek JWT_SECRET

Pastikan JWT_SECRET sama di:
- `.env` file
- Saat generate token (auth.service.ts)
- Saat verify token (middleware/auth.ts)

### 3. Test Token Manual

Bisa decode token di https://jwt.io untuk melihat isinya.

---

## Solusi Cepat

### Langkah 1: Pastikan Format Header Benar

```bash
# ❌ SALAH
Authorization: YOUR_TOKEN

# ✅ BENAR
Authorization: Bearer YOUR_TOKEN
```

### Langkah 2: Login Ulang untuk Dapat Token Baru

```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123",
  "isAdmin": true
}
```

Copy token dari response dan gunakan di request berikutnya.

### Langkah 3: Pastikan .env Sudah Dikonfigurasi

File `.env` di folder `backend`:
```
JWT_SECRET=your_secret_key_here
```

Restart backend server setelah mengubah `.env`.

---

## Contoh Request yang Benar

### Postman/Insomnia

1. **Login dulu:**
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "admin123",
       "isAdmin": true
     }
     ```
   - Response akan berisi `token`

2. **Gunakan token di request berikutnya:**
   - Method: `POST`
   - URL: `http://localhost:4000/api/packages`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer PASTE_TOKEN_DISINI`
   - Body: (data package)

### cURL

```bash
# 1. Login dan simpan token
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","isAdmin":true}' \
  | jq -r '.data.token')

# 2. Gunakan token
curl -X POST http://localhost:4000/api/packages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Package",...}'
```

---

## Error Messages

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `No token, authorization denied` | Header Authorization tidak ada | Tambahkan header Authorization |
| `Invalid token format` | Token tidak valid | Login ulang untuk dapat token baru |
| `Token has expired` | Token sudah expired | Login ulang |
| `User not found` | User di token tidak ada di database | Cek database atau login ulang |

---

## Tips

1. **Simpan token di environment variable** di Postman/Insomnia
2. **Jangan hardcode token** di code
3. **Handle token expiration** di frontend (auto refresh atau redirect ke login)
4. **Gunakan HTTPS** di production untuk keamanan token

