import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? (
  typeof window !== 'undefined' ? `http://${window.location.hostname}:4000/api` : ''
);
if (!API_BASE_URL) {
  // Fallback hanya ketika env tidak tersedia; gunakan host runtime jika di browser
  // Hindari default 'localhost' saat prerender agar tidak salah target jaringan
  // Pada server tanpa env, biarkan kosong agar request tidak dikirim hingga dikonfigurasi
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

if (typeof window !== 'undefined') {
  console.log('API base URL:', API_BASE_URL);
}

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Ambil token dari localStorage
      let token = localStorage.getItem('token');
      
      // Jika tidak ada token, coba ambil adminToken (juga dari localStorage)
      if (!token) {
        token = localStorage.getItem('adminToken');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk menangani error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      if (typeof window !== 'undefined') {
        // Cek apakah sudah di halaman login untuk menghindari loop
        if (!window.location.pathname.startsWith('/login')) {
          // Simpan URL saat ini untuk redirect kembali setelah login
          const currentPath = window.location.pathname + window.location.search;
          
          // Hapus token yang tidak valid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminUser');
          
          // Redirect ke halaman login dengan parameter redirect
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Package {
  id: number;
  title: string;
  slug: string;
  location: string;
  category: string;
  duration_days: number;
  price: number;
  max_people: number;
  description: string;
  is_featured: boolean;
  city: string;
  country: string;
  primary_image?: string | null;
}

export interface PackageDetail extends Package {
  short_description?: string;
  itinerary?: string | unknown[];
  facilities?: string | unknown[];
  images: Array<{
    id: number;
    image_url: string;
    is_primary: number;
  }>;
  schedules: Array<{
    id: number;
    departure_date: string;
    available_quota: number;
  }>;
}

export interface Booking {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  package_id: number;
  schedule_id?: number | null;
  trip_date: string;
  total_participants: number;
  total_amount: number;
  payment_status: string;
  travel_time?: string;
  landing_time?: string;
  airline?: string;
  flight_code?: string;
  terminal?: string;
  pickup_address?: string;
  dropoff_address?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    snap_token: string;
    redirect_url: string;
    order_id: string;
  };
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

// API Functions
export const apiClient = {
  // Packages
  getPackages: async (): Promise<Package[]> => {
    const response = await api.get<Package[]>('/packages');
    // Normalisasi tipe data dari backend (misalnya DECIMAL menjadi string)
    const data = (response.data as unknown as Array<Partial<Package>>).map((pkg) => ({
      ...pkg,
      price: pkg.price ? 
        (typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price) : 0,
      duration_days: typeof pkg.duration_days === 'string'
        ? parseInt(pkg.duration_days, 10)
        : pkg.duration_days,
    }));
    return data as Package[];
  },

  getPackageById: async (id: number): Promise<PackageDetail> => {
    const response = await api.get<PackageDetail>(`/packages/${id}`);
    return response.data;
  },

  // Bookings
  createBooking: async (bookingData: {
    package_id: number;
    schedule_id?: number;
    trip_date: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_participants: number;
    travel_time?: string;
    landing_time?: string;
    airline?: string;
    flight_code?: string;
    terminal?: string;
    pickup_address?: string;
    dropoff_address?: string;
    notes?: string;
  }): Promise<Booking> => {
    const response = await api.post<ApiEnvelope<Booking>>('/bookings', bookingData);
    return response.data.data;
  },

  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get<ApiEnvelope<Booking>>(`/bookings/${id}`);
    return response.data.data;
  },

  getAllBookings: async (filters?: {
    customer_email?: string;
    payment_status?: string;
    package_id?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.customer_email) params.append('customer_email', filters.customer_email);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.package_id) params.append('package_id', filters.package_id.toString());
    const response = await api.get<ApiEnvelope<Booking[]>>(`/bookings?${params.toString()}`);
    return response.data.data;
  },

  // Payments
  createPayment: async (bookingId: number): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payment/create', {
      booking_id: bookingId,
    });
    return response.data;
  },

  checkPaymentStatus: async (orderId: string) => {
    const response = await api.get(`/payment/status/${orderId}`);
    return response.data;
  },

  getPaymentByBooking: async (bookingId: number) => {
    const response = await api.get(`/payment/by-booking/${bookingId}`);
    return response.data;
  },

  updateBookingStatus: async (id: number, status: string) => {
    const response = await api.put<ApiEnvelope<any>>(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Auth
  login: async (email: string, password: string, isAdmin: boolean = false) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      isAdmin,
    });
    return response.data;
  },

  register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  changePassword: async (password: string) => {
    const response = await api.put('/auth/password', { password });
    return response.data;
  },
};

export default api;
