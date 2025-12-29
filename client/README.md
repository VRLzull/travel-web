# Travel Web - Client Frontend

Frontend aplikasi travel web menggunakan Next.js 16 dengan TypeScript dan Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

3. Update `.env` dengan konfigurasi yang sesuai:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

4. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Fitur

- ✅ Homepage dengan list packages
- ✅ Package detail page
- ✅ Booking form
- ✅ Payment integration (Midtrans)
- ✅ Login & Register
- ✅ My Bookings page
- ✅ Responsive design

## Struktur Folder

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Homepage (packages list)
│   ├── login/        # Login page
│   ├── register/     # Register page
│   ├── packages/     # Package detail pages
│   └── bookings/     # Booking pages
├── components/       # React components
│   └── Navbar.tsx   # Navigation bar
└── lib/             # Utilities & API client
    ├── api.ts       # API client service
    └── utils.ts     # Utility functions
```

## API Integration

Backend API base URL: `http://localhost:4000/api`

Pastikan backend server sudah running sebelum menjalankan frontend.

## Build untuk Production

```bash
npm run build
npm start
```
