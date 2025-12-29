'use client';

import { useEffect, useState } from 'react';
import { apiClient, type Booking, type Package } from '@/lib/api';

const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [pkgMap, setPkgMap] = useState<Record<number, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          window.location.href = '/login?redirect=/orders';
          return;
        }

        // Ambil data user terbaru dari server untuk memastikan email benar
        const meRes = await apiClient.getMe();
        const me = meRes?.data || meRes;
        
        if (me?.email) {
          setEmail(me.email);
          try {
            const list = await apiClient.getAllBookings({ customer_email: me.email });
            setBookings(Array.isArray(list) ? list : []);
            
            // Load package titles
            try {
              const pkgs = await apiClient.getPackages();
              const map = (pkgs as Package[]).reduce((acc, p) => { acc[p.id] = p.title; return acc; }, {} as Record<number, string>);
              setPkgMap(map);
            } catch (err) {
              console.error('Gagal memuat judul paket:', err);
            }
          } catch (err) {
            console.error('Gagal memuat bookings:', err);
            setBookings([]);
            setErrorMsg('Gagal memuat riwayat pesanan.');
          }
        } else {
          setErrorMsg('Data profil tidak lengkap.');
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setErrorMsg('Gagal memuat data profil.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const load = async () => {
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await apiClient.getAllBookings({ customer_email: email });
      setBookings(Array.isArray(list) ? list : []);
    } catch {
      setBookings([]);
      setErrorMsg('Gagal memuat riwayat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  // Hapus useEffect yang redundant dengan email dependency
  // useEffect(() => { ... }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
          <button 
            onClick={load} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Refresh
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Booking</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket Wisata</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Trip</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peserta</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pembayaran</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={7}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500 font-medium">Memuat pesanan...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td className="px-6 py-16 text-center" colSpan={7}>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <span className="text-3xl">📭</span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold text-lg">Belum Ada Pesanan</p>
                          <p className="text-gray-500">Anda belum memiliki riwayat pemesanan paket wisata.</p>
                        </div>
                        <a href="/paket-wisata" className="mt-2 inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                          Cari Paket Sekarang
                        </a>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">#{b.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{pkgMap[b.package_id] || 'Paket Wisata'}</div>
                        <div className="text-xs text-gray-500">{new Date(b.created_at || '').toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(b.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {b.total_participants} Orang
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(b.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          b.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                          b.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {b.payment_status === 'paid' ? 'Lunas' : 
                           b.payment_status === 'pending' ? 'Menunggu' : 
                           b.payment_status === 'cancelled' ? 'Batal' : b.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a 
                          href={`/orders/${b.id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Lihat Detail →
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <span className="text-gray-500 font-medium">Memuat pesanan...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-900 font-semibold mb-2">Belum Ada Pesanan</p>
                <a href="/paket-wisata" className="text-blue-600 font-medium">Cari Paket Wisata →</a>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-mono text-gray-500">#{b.id}</p>
                      <h3 className="font-bold text-gray-900">{pkgMap[b.package_id] || 'Paket Wisata'}</h3>
                      <p className="text-xs text-gray-500">{new Date(b.created_at || '').toLocaleDateString('id-ID')}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      b.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                      b.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {b.payment_status === 'paid' ? 'Lunas' : 
                       b.payment_status === 'pending' ? 'Menunggu' : 
                       b.payment_status === 'cancelled' ? 'Batal' : b.payment_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-50 pt-3">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Tanggal Trip</p>
                      <p className="text-gray-900">{new Date(b.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total</p>
                      <p className="text-gray-900 font-bold">{formatCurrency(b.total_amount)}</p>
                    </div>
                  </div>
                  <a 
                    href={`/orders/${b.id}`}
                    className="block w-full text-center py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors"
                  >
                    Lihat Detail Pesanan
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
