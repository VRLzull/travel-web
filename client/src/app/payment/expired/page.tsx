import { Suspense } from 'react';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

const ExpiredContent = async () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Kedaluwarsa</h1>
        <p className="text-gray-600 mb-6">Silakan lakukan pemesanan ulang atau cek riwayat pesanan Anda.</p>
        <Link href="/orders" className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">Lihat Riwayat Pesanan</Link>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExpiredContent />
    </Suspense>
  );
}
