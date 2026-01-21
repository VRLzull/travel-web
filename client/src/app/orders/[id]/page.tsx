'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, type Booking, type Package } from '@/lib/api';

const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function OrderReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const idStr = String(params?.id || '');
      let id = parseInt(idStr, 10);
      
      if (!id || Number.isNaN(id)) {
        try {
          const res = await apiClient.checkPaymentStatus(idStr) as { success?: boolean; data?: { bookingId?: number } };
          const bookingId = res?.data?.bookingId || 0;
          if (!bookingId) {
            setErrorMsg('ID booking tidak valid');
            setLoading(false);
            return;
          }
          id = bookingId;
        } catch {
          setErrorMsg('ID booking tidak valid');
          setLoading(false);
          return;
        }
      }

      try {
        const b = await apiClient.getBookingById(id);
        setBooking(b);
        try {
          const p = await apiClient.getPackageById(b.package_id);
          setPkg(p);
        } catch {}
      } catch (err: any) {
        setErrorMsg('Gagal memuat data bukti pesanan. Pastikan Anda sudah login.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      setLoading(true);
      await apiClient.updateBookingStatus(booking.id, 'cancelled');
      const b = await apiClient.getBookingById(booking.id);
      setBooking(b);
      alert('Pesanan berhasil dibatalkan.');
    } catch (err: any) {
      console.error('Gagal membatalkan pesanan:', err);
      alert(err.response?.data?.message || 'Gagal membatalkan pesanan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Bukti Pesanan</h1>
            <div className="space-x-2">
              <button onClick={() => router.back()} className="px-4 py-2 rounded-md border text-gray-700">Kembali</button>
              {booking?.payment_status === 'pending' && (
                <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">Batalkan Pesanan</button>
              )}
              <button onClick={handlePrint} className="px-4 py-2 rounded-md bg-blue-600 text-white">Cetak / Download PDF</button>
            </div>
          </div>
          {booking?.payment_status === 'pending' && (
            <p className="text-gray-500 text-sm italic">* Pesanan dapat dibatalkan selama belum dilakukan pembayaran.</p>
          )}
        </div>
        {errorMsg && (
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>
        )}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">ID Booking</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Kode Booking</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.booking_code || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Nama Pemesan</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.customer_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.customer_email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Nomor Telepon</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.customer_phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status Pembayaran</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.payment_status}</div>
            </div>
          </div>
          <hr className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Layanan</div>
              <div className="text-lg font-semibold text-gray-900">{pkg?.title}</div>
              <div className="text-sm text-gray-500 mt-1">{pkg?.location}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tanggal Trip</div>
              <div className="text-lg font-semibold text-gray-900">
                {(() => {
                  const raw = booking?.trip_date || '';
                  if (!raw) return '-';
                  const d = new Date(raw);
                  return isNaN(d.getTime()) ? raw : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Durasi / Unit (Hari)</div>
              <div className="text-lg font-semibold text-gray-900">{booking?.total_participants}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Harga</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(booking?.total_amount || 0)}</div>
            </div>
          </div>
          {(booking?.travel_time || booking?.landing_time || booking?.airline || booking?.flight_code || booking?.terminal || booking?.pickup_address || booking?.dropoff_address || booking?.notes) && (
            <>
              <hr className="my-6" />
              <h3 className="text-sm font-bold text-gray-900 mb-4">Detail Perjalanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booking?.travel_time && (
                  <div>
                    <div className="text-sm text-gray-500">Jam Travel</div>
                    <div className="text-md font-medium text-gray-900">{booking.travel_time}</div>
                  </div>
                )}
                {booking?.landing_time && (
                  <div>
                    <div className="text-sm text-gray-500">Jam Landing</div>
                    <div className="text-md font-medium text-gray-900">{booking.landing_time}</div>
                  </div>
                )}
                {booking?.airline && (
                  <div>
                    <div className="text-sm text-gray-500">Maskapai</div>
                    <div className="text-md font-medium text-gray-900">{booking.airline}</div>
                  </div>
                )}
                {booking?.flight_code && (
                  <div>
                    <div className="text-sm text-gray-500">Kode Penerbangan</div>
                    <div className="text-md font-medium text-gray-900">{booking.flight_code}</div>
                  </div>
                )}
                {booking?.terminal && (
                  <div>
                    <div className="text-sm text-gray-500">Terminal</div>
                    <div className="text-md font-medium text-gray-900">{booking.terminal}</div>
                  </div>
                )}
                {booking?.pickup_address && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Alamat Penjemputan</div>
                    <div className="text-md font-medium text-gray-900">{booking.pickup_address}</div>
                  </div>
                )}
                {booking?.dropoff_address && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Alamat Tujuan / Pengantaran</div>
                    <div className="text-md font-medium text-gray-900">{booking.dropoff_address}</div>
                  </div>
                )}
                {booking?.notes && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Catatan Tambahan</div>
                    <div className="text-md font-medium text-gray-900">{booking.notes}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
