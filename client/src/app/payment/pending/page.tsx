import { Suspense, use } from 'react';
import PaymentReceiptLink from '@/components/common/PaymentReceiptLink';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { FiAlertCircle } from 'react-icons/fi';

const PendingContent = async ({ searchParams }: { searchParams: { orderId?: string; order_id?: string } | Promise<{ orderId?: string; order_id?: string }> }) => {
  const isPromise = <T,>(v: T | Promise<T>): v is Promise<T> => typeof (v as Promise<T>).then === 'function';
  const params = isPromise(searchParams) ? await searchParams : searchParams;
  const orderId = params?.orderId || params?.order_id || '';
  let status: unknown = null;
  try {
    status = await apiClient.checkPaymentStatus(orderId);
  } catch {}

  const amount = (status as { amount?: number })?.amount;
  const formattedAmount = typeof amount === 'number'
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Tertunda</h1>
        <p className="text-gray-600 mb-6">Order ID: {orderId || '-'}</p>
        {!orderId && (
          <div className="mb-6 p-3 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700">
            Order ID tidak ditemukan di URL. Untuk mengecek status, gunakan tautan dengan query orderId dari pembayaran.
          </div>
        )}
        {formattedAmount && (
          <p className="text-lg font-semibold text-gray-900 mb-6">Total: {formattedAmount}</p>
        )}
        <PaymentReceiptLink orderId={orderId} />
        <Link href="/" className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">Kembali ke Beranda</Link>
      </div>
    </div>
  );
};

export default function Page(props: { searchParams: { orderId?: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PendingContent {...props} />
    </Suspense>
  );
}
