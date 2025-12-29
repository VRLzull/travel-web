interface ApiError extends Error {
  status?: number;
  message: string;
}

const getDefaultBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:4000/api`;
  }
  return 'http://localhost:4000/api';
};
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || getDefaultBaseUrl();

async function authFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  try {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
  } catch {}
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = 'Terjadi kesalahan pada server';
    try {
      const errData = await res.json();
      message = errData.message || message;
    } catch {}
    if (res.status === 401) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          sessionStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      } catch {}
    }
    if (res.status === 403) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          sessionStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      } catch {}
      message = message || 'Akses ditolak';
    }
    const error: ApiError = new Error(message);
    error.status = res.status;
    throw error;
  }
  try {
    return await res.json();
  } catch {
    const error: ApiError = new Error('Gagal memproses respons dari server');
    error.status = 500;
    throw error;
  }
}

export type Package = {
  id: number;
  title: string;
  slug: string;
  location: string;
  category?: string;
  city: string;
  country: string;
  duration_days: number;
  price: number;
  price_per_person?: number;
  max_people?: number;
  description: string;
  is_featured?: boolean;
  primary_image?: string | null;
};

export type Booking = {
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
  created_at: string;
};

export type AdminStats = {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  monthly: { month: string; orders: number; revenue: number }[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string | Date;
};

export const adminApi = {
  loginAdmin: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, isAdmin: true })
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = (data?.message as string) || 'Login gagal';
      const err: ApiError = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  },

  // Packages
  getPackages: async (): Promise<Package[]> => {
    const data = await authFetch('/packages');
    return Array.isArray(data) ? data.map((pkg: any) => {
      const priceNum = typeof pkg.price === 'string' ? parseFloat(pkg.price) : Number(pkg.price ?? 0);
      const durationNum = typeof pkg.duration_days === 'string' ? parseInt(pkg.duration_days, 10) : Number(pkg.duration_days ?? 0);
      return {
        ...pkg,
        price: priceNum,
        price_per_person: priceNum,
        duration_days: durationNum,
      } as Package;
    }) : [];
  },

  getPackageById: async (id: number): Promise<Package> => {
    const data = await authFetch(`/packages/${id}`);
    const priceNum = typeof data?.price === 'string' ? parseFloat(data.price) : Number(data?.price ?? 0);
    const durationNum = typeof data?.duration_days === 'string' ? parseInt(data.duration_days, 10) : Number(data?.duration_days ?? 0);
    return {
      ...data,
      price: priceNum,
      price_per_person: priceNum,
      duration_days: durationNum,
    } as Package;
  },

  createPackage: async (payload: Partial<Package> & { duration_days?: number; price?: number; price_per_person?: number }) => {
    const body = {
      ...payload,
      price: payload.price ?? payload.price_per_person ?? 0,
      duration_days: payload.duration_days ?? 1,
    };
    return await authFetch('/packages', { method: 'POST', body: JSON.stringify(body) });
  },

  updatePackage: async (id: number, payload: Partial<Package>) => {
    const body = {
      ...payload,
      price: payload.price ?? payload.price_per_person,
    };
    return await authFetch(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deletePackage: async (id: number) => {
    return await authFetch(`/packages/${id}`, { method: 'DELETE' });
  },

  addImage: async (packageId: number, image_url: string, is_primary = false) => {
    return await authFetch(`/packages/${packageId}/images`, { method: 'POST', body: JSON.stringify({ image_url, is_primary }) });
  },

  deleteImage: async (imageId: number) => {
    return await authFetch(`/packages/images/${imageId}`, { method: 'DELETE' });
  },

  setPrimaryImage: async (packageId: number, imageId: number) => {
    return await authFetch(`/packages/${packageId}/images/primary`, { method: 'PUT', body: JSON.stringify({ image_id: imageId }) });
  },

  addSchedule: async (packageId: number, departure_date: string, available_quota: number) => {
    return await authFetch(`/packages/${packageId}/schedules`, { method: 'POST', body: JSON.stringify({ departure_date, available_quota }) });
  },

  updateSchedule: async (scheduleId: number, payload: { departure_date?: string; available_quota?: number }) => {
    return await authFetch(`/packages/schedules/${scheduleId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  deleteSchedule: async (scheduleId: number) => {
    return await authFetch(`/packages/schedules/${scheduleId}`, { method: 'DELETE' });
  },

  // Bookings
  getBookings: async (filters?: { payment_status?: string; package_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.package_id) params.append('package_id', String(filters.package_id));
    return await authFetch(`/bookings?${params.toString()}`);
  },

  // Users
  getUsers: async (): Promise<{ success: boolean; data: User[]; count: number }> => {
    return await authFetch('/auth/admin/users');
  },
  resetUserPassword: async (id: number, password: string) => {
    return await authFetch(`/auth/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) });
  },

  // Stats
  getAdminStats: async (): Promise<{ success: boolean; data: AdminStats }> => {
    return await authFetch('/auth/admin/stats');
  },

  // Payment (admin)
  getPaymentByBooking: async (bookingId: number) => {
    return await authFetch(`/payment/by-booking/${bookingId}`)
  },
};
