'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiUsers, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { apiClient, type PackageDetail, type Booking } from '@/lib/api';

const getIdNumber = (id: string | string[]) => {
  const s = Array.isArray(id) ? id[0] : id;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Ambil data dari URL dengan nilai default
  const departureDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const participants = parseInt(searchParams.get('participants') || '1');
  
  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        const id = params?.id ? Array.isArray(params.id) ? params.id[0] : params.id : '';
        const redirect = `/booking/${id}?date=${departureDate}&participants=${participants}`;
        router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }
    } catch {}
    const fetchData = async () => {
      const idNum = params?.id ? getIdNumber(params.id as string) : 0;
      if (!idNum) {
        setIsLoading(false);
        return;
      }
      try {
        const detail = await apiClient.getPackageById(idNum);
        setPackageData(detail);
      } catch (e: unknown) {
        setPackageData(null);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:4000/api` : '');
        setErrorMsg(`Gagal memuat detail paket dari ${apiBase}.`);
        console.error('Gagal memuat detail paket:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params, router, departureDate, participants]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const totalPrice = packageData ? packageData.price * participants : 0;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hapus error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^[0-9+\-\s()]*$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          const id = params?.id ? Array.isArray(params.id) ? params.id[0] : params.id : '';
          const redirect = `/booking/${id}?date=${departureDate}&participants=${participants}`;
          router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
          setIsSubmitting(false);
          return;
        }
      } catch {}
      const idNum = params?.id ? getIdNumber(params.id as string) : 0;
      const scheduleId = packageData?.schedules?.find((s) => {
        const d = (s.departure_date || '').slice(0, 10);
        return d === departureDate;
      })?.id;
      const booking = await apiClient.createBooking({
        package_id: idNum,
        schedule_id: typeof scheduleId === 'number' ? scheduleId : undefined,
        trip_date: departureDate,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_participants: participants,
      });
      console.log('Booking berhasil dibuat:', booking);
      try {
        if (typeof window !== 'undefined' && Number.isFinite(booking?.id)) {
          localStorage.setItem('last_booking_id', String(booking.id));
        }
      } catch {}
      let bookingId = booking?.id;
      if (!Number.isFinite(bookingId)) {
        try {
          const list = await apiClient.getAllBookings({
            customer_email: formData.email,
            package_id: idNum,
          }) as Booking[];
          const normalizedDate = departureDate.slice(0, 10);
          const candidates: Booking[] = Array.isArray(list) ? list.filter((b: Booking) => {
            const d = String(b.trip_date || '').slice(0, 10);
            return d === normalizedDate;
          }) : [];
          candidates.sort((a: Booking, b: Booking) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          bookingId = candidates[0]?.id;
          console.log('Fallback booking.id dari list:', bookingId, candidates[0]);
        } catch (err) {
          console.error('Gagal mengambil daftar bookings untuk fallback id:', err);
        }
      }
      if (!Number.isFinite(bookingId)) {
        setIsSubmitting(false);
        setErrorMsg('Gagal mendapatkan booking_id dari server. Coba lagi atau hubungi admin.');
        return;
      }
      const payment = await apiClient.createPayment(Number(bookingId));
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_order_id', payment.data.order_id || '');
        }
      } catch {}
      console.log('Redirect ke halaman pembayaran:', payment.data.redirect_url, 'Order ID:', payment.data.order_id);
      window.location.href = payment.data.redirect_url;
    } catch (e: unknown) {
      setIsSubmitting(false);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const err = e as { response?: { data?: unknown; status?: number }; message?: string };
      const serverMsg = (err.response?.data as { message?: string })?.message;
      const msg = serverMsg || err.message || `Gagal memproses pemesanan atau pembayaran. Periksa koneksi ke ${apiBase}.`;
      setErrorMsg(msg);
      console.error('Gagal membuat booking atau payment:', e);
      if (err.response?.data) {
        console.error('Detail error dari server:', err.response.data);
      }
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Form Pemesanan</h1>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form Pemesanan */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Pemesan</h2>
              {errorMsg && (
                <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">
                  {errorMsg}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-md border text-gray-900 placeholder:text-gray-500 ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Nama lengkap sesuai KTP"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 block w-full rounded-md border text-gray-900 placeholder:text-gray-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="email@contoh.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`pl-10 block w-full rounded-md border text-gray-900 placeholder:text-gray-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="0812-3456-7890"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2 text-gray-900 placeholder:text-gray-500"
                    placeholder="Contoh: Kamar bertingkat, makanan halal, dll."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Memproses...'
                  ) : (
                    <>
                      Lanjutkan ke Pembayaran
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Ringkasan Pesanan */}
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-medium text-gray-900">{packageData?.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <FiMapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  {packageData?.location}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tanggal Keberangkatan</span>
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <FiCalendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    {formatDate(departureDate)}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Jumlah Peserta</span>
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <FiUsers className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    {participants} Orang
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total Harga</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="ml-2">
                    <p className="text-sm text-gray-600">Pembayaran aman dan terjamin</p>
                    <p className="text-xs text-gray-500 mt-1">Data pribadi Anda dilindungi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
