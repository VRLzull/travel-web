'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { apiClient } from '@/lib/api';

interface PaymentStatus {
  order_id?: string;
  status?: string;
  amount?: number;
  paymentExpiry?: string | Date;
}

const PaymentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId') || searchParams.get('order_id') || '';
  const bookingIdParam = searchParams.get('booking_id') || searchParams.get('bookingId') || '';
  const paymentMethodParam = searchParams.get('method') || 'online';
  
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const manualMode = searchParams.get('manual') === '1';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatExpiry = (expiry: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(expiry));
  };

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true);
      setError('');
      try {
        if (orderIdParam) {
          const res = await apiClient.checkPaymentStatus(orderIdParam);
          setStatus((res?.data || res) as PaymentStatus);
        } else if (bookingIdParam) {
          if (manualMode) {
            const booking = await apiClient.getBookingById(Number(bookingIdParam));
            setStatus({
              order_id: booking.booking_code || `BOOKING-${booking.id}`,
              status: booking.payment_status,
              amount: Number(booking.total_amount || 0),
            });
          } else {
            const res = await apiClient.getPaymentByBooking(Number(bookingIdParam));
            setStatus((res?.data || res) as PaymentStatus);
          }
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading payment status:', err);
        setError('Gagal memuat status pembayaran.');
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [orderIdParam, bookingIdParam, manualMode]);

  const expiryText = status?.paymentExpiry ? formatExpiry(new Date(status.paymentExpiry)) : '-';

  const getWhatsappUrl = () => {
    const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
    if (!number || !bookingIdParam) return '';
    const lines = [
      '*BAYAR ONLINE*',
      '',
      `Booking ID: ${bookingIdParam}`,
      `Kode Booking: ${status?.order_id || '-'}`,
      `Nominal Tagihan: ${formatCurrency(Number(status?.amount || 0))}`,
      '',
      'Mohon kirim detail rekening pembayaran.'
    ];
    return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  if (!orderIdParam && !bookingIdParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Nomor pesanan tidak valid atau sudah kadaluarsa.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700">{error}</div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FiArrowLeft className="mr-2" /> Kembali
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Status Pembayaran</h1>
                <p className="text-gray-500 mt-1">Order ID: {status?.order_id || orderIdParam || '-'}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${
                status?.status === 'paid' ? 'bg-green-100 text-green-700' : 
                status?.status === 'expired' || status?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {status?.status === 'paid' ? <FiCheckCircle /> : <FiAlertCircle />}
                {status?.status === 'paid' ? 'LUNAS' : 
                 status?.status === 'expired' ? 'KADALUARSA' :
                 status?.status === 'cancelled' ? 'DIBATALKAN' : 'MENUNGGU PEMBAYARAN'}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nomor Pesanan</h3>
              <p className="text-lg font-medium text-gray-900">{status?.order_id || orderIdParam || '-'}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pembayaran</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(status?.amount || 0))}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex">
                <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-gray-700">Pembayaran transfer manual via konfirmasi WhatsApp</p>
                  <p className="text-xs text-gray-500 mt-1">Kirim bukti transfer, lalu admin akan verifikasi dan approve pembayaran.</p>
                </div>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Pembayaran</h3>
              <p className="text-sm text-gray-600">Klik tombol WhatsApp untuk minta detail rekening. Setelah transfer, kirim screenshot bukti transfer di chat yang sama lalu ketik konfirmasi pembayaran.</p>
              <a
                href={getWhatsappUrl() || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <FiPhone />
                Minta Detail Rekening via WhatsApp
              </a>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FiPhone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Hubungi Kami</h4>
                <p className="text-sm text-gray-600">(021) 1234-5678</p>
                <p className="text-sm text-gray-500">Buka 24/7</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-600">cs@travelkita.com</p>
                <p className="text-sm text-gray-500">Respon dalam 1x24 jam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;
