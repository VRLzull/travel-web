# 💳 Payment Status Guide

## Cara Status Payment Berubah dari "pending" ke "paid"

Status payment berubah melalui **webhook notification** dari Midtrans. Ada beberapa cara untuk mengubah status:

---

## 1. Otomatis via Webhook (Production)

### Cara Kerja:
1. User melakukan pembayaran di Midtrans
2. Midtrans mengirim webhook notification ke endpoint: `POST /api/payment/notification`
3. Backend memproses notification dan update status

### Setup Webhook URL di Midtrans:
```
https://your-domain.com/api/payment/notification
```

**Untuk development/testing**, gunakan ngrok atau service serupa untuk expose local server.

---

## 2. Manual Update untuk Testing

### Opsi A: Simulasi Webhook Notification

Kirim POST request ke endpoint notification dengan payload Midtrans:

```bash
POST http://localhost:4000/api/payment/notification
Content-Type: application/json

{
  "transaction_time": "2024-12-01 12:00:00",
  "transaction_status": "settlement",
  "transaction_id": "test-transaction-id",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "test-signature",
  "payment_type": "credit_card",
  "order_id": "ORDER-4-1764511177993",
  "merchant_id": "G123456789",
  "gross_amount": "6000000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Status yang bisa digunakan:**
- `"settlement"` → Status menjadi **"paid"**
- `"capture"` dengan `"fraud_status": "accept"` → Status menjadi **"paid"**
- `"expire"` → Status menjadi **"expired"**
- `"cancel"` atau `"deny"` → Status menjadi **"cancelled"**

---

### Opsi B: Update Langsung di Database (Hanya untuk Testing)

```sql
-- Update payment status
UPDATE payments 
SET status = 'paid' 
WHERE midtrans_order_id = 'ORDER-4-1764511177993';

-- Update booking status juga
UPDATE bookings 
SET payment_status = 'paid' 
WHERE id = 4;
```

---

## 3. Test dengan Midtrans Sandbox

### Langkah-langkah:

1. **Buat Payment:**
```bash
POST http://localhost:4000/api/payment/create
{
  "booking_id": 4
}
```

2. **Buka redirect_url** di browser (dari response)

3. **Pilih metode pembayaran** di Midtrans Sandbox:
   - **Credit Card**: Gunakan kartu test
   - **Bank Transfer**: Simulasi transfer
   - **E-Wallet**: Simulasi e-wallet

4. **Selesaikan pembayaran** di Midtrans

5. **Midtrans akan otomatis mengirim webhook** ke endpoint notification

6. **Cek status:**
```bash
GET http://localhost:4000/api/payment/status/ORDER-4-1764511177993
```

---

## 4. Kartu Test Midtrans Sandbox

Untuk testing pembayaran sukses:

**Credit Card:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Expiry: Bulan/tahun apapun di masa depan
- 3D Secure: `112233`

**Status yang akan diterima:**
- `settlement` → Payment berhasil, status menjadi "paid"

---

## 5. Simulasi Webhook Notification (Contoh Lengkap)

### Untuk Status "paid":

```bash
POST http://localhost:4000/api/payment/notification
Content-Type: application/json

{
  "transaction_time": "2024-12-01 12:00:00",
  "transaction_status": "settlement",
  "transaction_id": "test-123456",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "test",
  "payment_type": "credit_card",
  "order_id": "ORDER-4-1764511177993",
  "merchant_id": "G123456789",
  "gross_amount": "6000000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

### Untuk Status "expired":

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

### Untuk Status "cancelled":

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

---

## 6. Mapping Transaction Status ke Payment Status

| Midtrans Status | Payment Status | Keterangan |
|----------------|----------------|------------|
| `settlement` | `paid` | Pembayaran berhasil |
| `capture` + `fraud_status: accept` | `paid` | Pembayaran diterima |
| `capture` + `fraud_status: challenge` | `pending` | Menunggu verifikasi |
| `expire` | `expired` | Pembayaran expired |
| `cancel` | `cancelled` | Pembayaran dibatalkan |
| `deny` | `cancelled` | Pembayaran ditolak |
| `pending` | `pending` | Masih menunggu |

---

## 7. Cek Status Payment

```bash
GET http://localhost:4000/api/payment/status/ORDER-4-1764511177993
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORDER-4-1764511177993",
    "status": "paid",
    "amount": 6000000,
    "bookingId": 4,
    "packageId": 1,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "paymentDate": "2024-12-01T12:00:00.000Z"
  }
}
```

---

## 8. Troubleshooting

### Webhook tidak terkirim?
- Pastikan URL webhook sudah dikonfigurasi di Midtrans Dashboard
- Untuk development, gunakan ngrok: `ngrok http 4000`
- Cek log backend untuk melihat apakah notification diterima

### Status tidak berubah?
- Cek apakah webhook notification sudah diterima
- Cek log backend untuk error
- Verifikasi `order_id` sesuai dengan yang ada di database

### Signature verification failed?
- Pastikan `MIDTRANS_SERVER_KEY` di `.env` sudah benar
- Untuk testing, bisa skip signature verification (tidak disarankan untuk production)

---

## 9. Quick Test Script

Simpan sebagai `test-payment-webhook.http`:

```http
### Simulasi Payment Success
POST http://localhost:4000/api/payment/notification
Content-Type: application/json

{
  "transaction_status": "settlement",
  "order_id": "ORDER-4-1764511177993",
  "status_code": "200",
  "gross_amount": "6000000.00",
  "fraud_status": "accept"
}

### Cek Status Setelah Webhook
GET http://localhost:4000/api/payment/status/ORDER-4-1764511177993
```

---

## Summary

**Cara termudah untuk testing:**
1. Buat payment → dapat `order_id`
2. Simulasi webhook dengan status `"settlement"` → status menjadi "paid"
3. Cek status dengan `GET /api/payment/status/:orderId`

**Untuk production:**
- Setup webhook URL di Midtrans Dashboard
- Midtrans akan otomatis mengirim notification ketika pembayaran berhasil

