// Gunakan URL lengkap untuk development
interface ApiError extends Error {
  status?: number;
  message: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? (
  typeof window !== 'undefined' ? `http://${window.location.hostname}:4000/api` : ''
);

// Fungsi untuk menangani response fetch
async function handleResponse(response: Response) {
  console.log('API Response Status:', response.status);
  
  if (!response.ok) {
    let errorMessage = 'Terjadi kesalahan pada server';
    try {
      const errorData = await response.json().catch(() => ({}));
      errorMessage = errorData.message || errorMessage;
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
    } catch (e) {
      console.error('Failed to parse error response:', e);
    }
    
    const error: ApiError = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error('Failed to parse response:', e);
    const error: ApiError = new Error('Gagal memproses respons dari server');
    error.status = 500;
    throw error;
  }
}

export interface Package {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: number;
  rating: number;
  reviewCount?: number;
  imageUrl: string;
  images?: string[];
  description?: string;
  facilities?: Array<{ name: string; icon: string }>;
  itinerary?: Array<{ day: string; title: string; description: string }>;
  availableDates?: string[];
}

export const getPackages = async (filters?: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
}) : Promise<Package[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.duration) params.append('duration', filters.duration);

    const base = API_BASE_URL || '';
    const url = `${base}/packages?${params.toString()}`;
    console.log('Fetching packages from:', url);
    
    // Tambahkan timeout untuk fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Tambahkan header lain jika diperlukan (seperti token auth)
      },
      credentials: 'include', // Jika menggunakan cookies/session
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    
    if (err.name === 'AbortError') {
      console.error('Request timeout:', error);
      throw new Error('Waktu koneksi habis. Silakan coba lagi.');
    }
    
    console.error('Network error:', error);
    
    // Periksa jika error terkait koneksi
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      const hint = API_BASE_URL || 'http://<SERVER_IP>:4000/api';
      throw new Error(`Tidak dapat terhubung ke server. Pastikan backend berjalan di ${hint}`);
    }
    
    throw new Error(err.message || 'Terjadi kesalahan tidak terduga');
  }
};

export const getPackageById = async (id: string): Promise<Package> => {
  const base = API_BASE_URL || '';
  const response = await fetch(`${base}/packages/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      // Tambahkan header lain jika diperlukan (seperti token auth)
    },
  });
  
  return handleResponse(response);
};
