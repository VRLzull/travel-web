'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { FiArrowLeft, FiAlertCircle, FiCreditCard, FiCheckCircle, FiPhone } from 'react-icons/fi';
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
  
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

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
          const res = await apiClient.getPaymentByBooking(Number(bookingIdParam));
          setStatus((res?.data || res) as PaymentStatus);
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
  }, [orderIdParam, bookingIdParam]);

  const expiryText = status?.paymentExpiry ? formatExpiry(new Date(status.paymentExpiry)) : '-';

  const handlePayment = (method: string) => {
    setPaymentMethod(method);
    alert('Fitur pembayaran sedang dalam pengembangan.');
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
      <Script src={`${(process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION && process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION.toLowerCase() === 'true') ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/snap.js`} strategy="afterInteractive" />
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
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(typeof status?.amount === 'number' ? status.amount : 0)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex">
                <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-gray-700">Pembayaran aman dan terjamin</p>
                  <p className="text-xs text-gray-500 mt-1">Data pembayaran Anda dilindungi dengan enkripsi</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Metode Pembayaran</h3>
              <div className="space-y-3">
                <button onClick={() => handlePayment('credit_card')} className={`w-full p-4 border rounded-lg text-left flex items-center ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                  <div className="p-2 bg-blue-100 rounded-md mr-4">
                    <FiCreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Kartu Kredit/Debit</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, JCB, dll.</div>
                  </div>
                </button>
                <button onClick={() => handlePayment('bank_transfer')} className={`w-full p-4 border rounded-lg text-left flex items-center ${paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                  <div className="p-2 bg-green-100 rounded-md mr-4">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Transfer Bank</div>
                    <div className="text-sm text-gray-500">BCA, Mandiri, BRI, BNI, dll.</div>
                  </div>
                </button>
                <button onClick={() => handlePayment('ewallet')} className={`w-full p-4 border rounded-lg text-left flex items-center ${paymentMethod === 'ewallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                  <div className="p-2 bg-yellow-100 rounded-md mr-4">
                    <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">E-Wallet</div>
                    <div className="text-sm text-gray-500">OVO, Gopay, DANA, LinkAja</div>
                  </div>
                </button>
              </div>
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
