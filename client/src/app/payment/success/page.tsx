import { Suspense, use } from 'react';
import { redirect } from 'next/navigation';
import PaymentReceiptLink from '@/components/common/PaymentReceiptLink';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { FiCheckCircle } from 'react-icons/fi';

const SuccessContent = async ({ orderId }: { orderId: string }) => {
  let status: { success?: boolean; data?: { amount?: number } } | null = null;
  try {
    if (orderId) status = await apiClient.checkPaymentStatus(orderId) as { success?: boolean; data?: { amount?: number } };
  } catch {}

  const amount = typeof status?.data?.amount === 'number' ? status.data.amount : undefined;
  const formattedAmount = amount !== undefined
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
    : undefined;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285385631827';
  const whatsappMessage = `Halo, saya sudah bayar\nOrder ID: ${orderId}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" suppressHydrationWarning>
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center" suppressHydrationWarning>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
          <FiCheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil</h1>
        <p className="text-gray-600 mb-6">Order ID: {orderId || '-'}</p>
        {!orderId && (
          <div className="mb-6 p-3 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700">
            Order ID tidak ditemukan di URL. Jika Anda baru saja menyelesaikan pembayaran, pastikan konfigurasi redirect pembayaran mengarahkan ke halaman ini.
          </div>
        )}
        {formattedAmount && (
          <p className="text-lg font-semibold text-gray-900 mb-6">Total: {formattedAmount}</p>
        )}
        <div className="flex flex-col gap-3">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Konfirmasi lewat Chat
          </a>
          <PaymentReceiptLink orderId={orderId} />
          <Link href="/" className="w-full inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>> }) {
  const params = use(searchParams as Promise<Record<string, string | string[] | undefined>>);
  const getParam = (key: string) => {
    const v = params?.[key];
    if (!v) return '';
    return Array.isArray(v) ? (v[0] ?? '') : v;
  };
  const orderId = getParam('orderId') || getParam('order_id');
  const txStatus = (getParam('transaction_status') || '').toLowerCase();
  if (txStatus && txStatus !== 'settlement' && txStatus !== 'capture') {
    const target = txStatus === 'pending'
      ? `/payment/pending?orderId=${encodeURIComponent(orderId)}`
      : `/payment?orderId=${encodeURIComponent(orderId)}`;
    redirect(target);
  }
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {/* Pass only the orderId needed for content rendering */}
      <SuccessContent orderId={orderId} />
    </Suspense>
  );
}
