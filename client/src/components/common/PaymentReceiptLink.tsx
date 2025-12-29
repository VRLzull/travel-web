'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
 
type Props = { orderId?: string };

export default function PaymentReceiptLink({ orderId }: Props) {
  const [bookingId, setBookingId] = useState<string>('');

  useEffect(() => {
    const resolveBooking = async () => {
      try {
        const oid = orderId || '';
        if (!oid) {
          setBookingId('');
          return;
        }
        const res = await apiClient.checkPaymentStatus(oid) as { success?: boolean; data?: { bookingId?: number } };
        const idNum = res?.data?.bookingId || 0;
        setBookingId(idNum ? String(idNum) : '');
      } catch {
        setBookingId('');
      }
    };
    resolveBooking();
  }, [orderId]);

  const hasOrder = Boolean(bookingId);

  return (
    <div className={hasOrder ? 'mb-4 space-x-2' : 'mb-4'} suppressHydrationWarning>
      {hasOrder && (
        <Link href={`/orders/${bookingId}`} className="inline-block bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded-md">Lihat Bukti Pesanan</Link>
      )}
      <Link href="/orders" className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md">Riwayat Pesanan</Link>
    </div>
  );
}
