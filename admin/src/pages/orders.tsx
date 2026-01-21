import { useEffect, useState } from 'react'
import { adminApi, Booking, Package } from '../services/api'

export default function OrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [packages, setPackages] = useState<Package[]>([] as any)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPackageId, setFilterPackageId] = useState<number | undefined>(undefined)
  const [exporting, setExporting] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null)

  const load = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const pk = await adminApi.getPackages()
      setPackages(Array.isArray(pk) ? pk : [])
      const data = await adminApi.getBookings({ payment_status: filterStatus || undefined, package_id: filterPackageId })
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setBookings(list)
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() 
  }, [filterStatus, filterPackageId]) // Add dependencies to refetch when filters change

  const exportCsv = () => {
    try {
      setExporting(true)
      const headers = [
        'No.',
        'Kode Booking',
        'Nama',
        'Email',
        'Telepon',
        'Paket',
        'Tanggal',
        'Durasi/Unit',
        'Total',
        'Status',
        'Jam Travel',
        'Jam Landing',
        'Maskapai',
        'Kode Penerbangan',
        'Terminal',
        'Jemput',
        'Tujuan',
        'Catatan'
      ]
      
      const rows = bookings.map((b, index) => {
        const pkg = packages.find(p => p.id === b.package_id)
        return [
          index + 1,
          `"${b.booking_code}"`,
          `"${b.customer_name}"`,
          `"${b.customer_email}"`,
          `"${b.customer_phone}"`,
          `"${pkg?.title || b.package_id}"`,
          new Date(b.trip_date).toLocaleDateString('id-ID'),
          b.total_participants,
          b.total_amount,
          `"${b.payment_status}"`,
          `"${b.travel_time || '-'}"`,
          `"${b.landing_time || '-'}"`,
          `"${b.airline || '-'}"`,
          `"${b.flight_code || '-'}"`,
          `"${b.terminal || '-'}"`,
          `"${b.pickup_address || '-'}"`,
          `"${b.dropoff_address || '-'}"`,
          `"${b.notes || '-'}"`
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-pemesanan-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal mengekspor data')
    } finally {
      setExporting(false)
    }
  }

  const viewPayment = async (bookingId: number) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      const res = await adminApi.getPaymentByBooking(bookingId)
      setPaymentInfo({ ...res?.data, bookingId, booking })
    } catch (e: any) {
      const booking = bookings.find(b => b.id === bookingId);
      setPaymentInfo({ error: e?.message || 'Pembayaran tidak ditemukan', bookingId, booking })
    }
  }

  const handleConfirmPayment = async (bookingId: number) => {
    if (!window.confirm('Konfirmasi pembayaran manual untuk pesanan ini?')) return;
    try {
      setLoading(true);
      await adminApi.updateBookingStatus(bookingId, 'paid');
      setPaymentInfo(null);
      await load();
      alert('Pembayaran berhasil dikonfirmasi!');
    } catch (e: any) {
      alert(e.message || 'Gagal mengonfirmasi pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Batalkan pesanan ini?')) return;
    try {
      setLoading(true);
      await adminApi.updateBookingStatus(bookingId, 'cancelled');
      await load();
      alert('Pesanan berhasil dibatalkan!');
    } catch (e: any) {
      alert(e.message || 'Gagal membatalkan pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm('Hapus transaksi ini secara permanen? Data yang dihapus tidak bisa dikembalikan.')) return;
    try {
      setLoading(true);
      await adminApi.deleteBooking(bookingId);
      await load();
      alert('Transaksi berhasil dihapus!');
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pemesanan</h1>
      </div>
      {errorMsg && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm md:text-base">{errorMsg}</div>}
      
      {/* Filter Section - Stacked on mobile, row on desktop */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 space-y-3 md:space-y-0 md:space-x-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select 
            className="w-full border rounded-md px-3 py-2 text-sm md:text-base" 
            value={filterStatus} 
            onChange={e=>setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select 
            className="w-full border rounded-md px-3 py-2 text-sm md:text-base" 
            value={filterPackageId || ''} 
            onChange={e=>setFilterPackageId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Semua Paket</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>
                {p.title.length > 20 ? `${p.title.substring(0, 20)}...` : p.title}
              </option>
            ))}
          </select>
          
          <button 
            onClick={load} 
            className="w-full md:w-auto px-3 py-2 rounded-md bg-indigo-600 text-white text-sm md:text-base"
          >
            Terapkan Filter
          </button>
          
          <button 
            onClick={exportCsv} 
            className="w-full md:w-auto px-3 py-2 rounded-md bg-green-600 text-white text-sm md:text-base" 
            disabled={exporting}
          >
            {exporting ? 'Mengekspor...' : 'Export CSV'}
          </button>
        </div>
      </div>
      
      {/* Orders List - Card view on mobile, table on desktop */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="hidden md:block overflow-x-auto w-full p-2 md:p-4">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemesan</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi/Unit</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-3 py-4 text-center text-sm text-gray-500" colSpan={8}>Memuat data pesanan...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td className="px-3 py-4 text-center text-sm text-gray-500" colSpan={8}>Tidak ada data pesanan</td></tr>
              ) : (
                bookings.map((b, index) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-gray-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">{b.customer_email}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {packages.find(p=>p.id===b.package_id)?.title || b.package_id}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(b.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {b.total_participants} Hari
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rp. {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(b.total_amount)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        b.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        b.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => viewPayment(b.id)} 
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Lihat
                        </button>
                        {b.payment_status === 'pending' && (
                          <button 
                            onClick={() => handleConfirmPayment(b.id)} 
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Konfirmasi
                          </button>
                        )}
                        {b.payment_status !== 'cancelled' && b.payment_status !== 'paid' && (
                          <button 
                            onClick={() => handleCancelBooking(b.id)} 
                            className="text-orange-600 hover:text-orange-900 text-sm"
                          >
                            Batal
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteBooking(b.id)} 
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Memuat data pesanan...</div>
          ) : bookings.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Tidak ada data pesanan</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((b) => {
                const pkg = packages.find(p => p.id === b.package_id);
                return (
                  <div key={b.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">#{b.id} - {b.customer_name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{pkg?.title || 'Paket tidak ditemukan'}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(b.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {b.total_participants} Hari
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Rp. {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(b.total_amount)}
                        </div>
                        <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          b.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {b.payment_status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button 
                        onClick={() => viewPayment(b.id)}
                        className="text-sm px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Lihat Detail
                      </button>
                      {b.payment_status === 'pending' && (
                        <button 
                          onClick={() => handleConfirmPayment(b.id)}
                          className="text-sm px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {b.payment_status !== 'cancelled' && b.payment_status !== 'paid' && (
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-sm px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Batal
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteBooking(b.id)}
                        className="text-sm px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {paymentInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50" onClick={()=>setPaymentInfo(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold text-gray-900">Detail Pesanan #{paymentInfo.bookingId}</div>
              <button onClick={()=>setPaymentInfo(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info Section */}
              <div className="space-y-4 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-indigo-600 border-b border-gray-200 pb-1 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Informasi Pemesan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Nama:</span>
                    <span className="font-medium text-gray-900">{paymentInfo.booking?.customer_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email:</span>
                    <span className="font-medium text-gray-900">{paymentInfo.booking?.customer_email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Telepon:</span>
                    <span className="font-medium text-gray-900">{paymentInfo.booking?.customer_phone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Travel Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-indigo-600 border-b pb-1">Detail Perjalanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Jam Travel:</span>
                    <span className="font-medium">{paymentInfo.booking?.travel_time || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Jam Landing:</span>
                    <span className="font-medium">{paymentInfo.booking?.landing_time || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Maskapai:</span>
                    <span className="font-medium">{paymentInfo.booking?.airline || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Kode Penerbangan:</span>
                    <span className="font-medium">{paymentInfo.booking?.flight_code || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Terminal:</span>
                    <span className="font-medium">{paymentInfo.booking?.terminal || '-'}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-gray-500">Alamat Penjemputan:</span>
                    <span className="font-medium mt-0.5">{paymentInfo.booking?.pickup_address || '-'}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-gray-500">Alamat Tujuan:</span>
                    <span className="font-medium mt-0.5">{paymentInfo.booking?.dropoff_address || '-'}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-gray-500">Catatan:</span>
                    <span className="font-medium mt-0.5">{paymentInfo.booking?.notes || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-indigo-600 border-b pb-1">Status Pembayaran</h3>
                {paymentInfo.error ? (
                  <div className="space-y-3">
                    <div className="text-red-600 bg-red-50 p-3 rounded text-sm border border-red-100">{paymentInfo.error}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Data pembayaran tidak ditemukan di Midtrans. Jika ini adalah pembayaran <b>Cash (ke Driver)</b>, Anda dapat mengonfirmasinya secara manual.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Order ID:</span>
                      <span className="font-medium font-mono">{paymentInfo.orderId}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-semibold ${paymentInfo.status === 'settlement' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {paymentInfo.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Metode:</span>
                      <span className="font-medium uppercase">{paymentInfo.paymentType || '-'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Nominal:</span>
                      <span className="font-bold text-gray-900">
                        Rp. {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(paymentInfo.amount || 0))}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Waktu Bayar:</span>
                      <span className="font-medium">{paymentInfo.paymentDate ? new Date(paymentInfo.paymentDate).toLocaleString('id-ID') : '-'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
              <button 
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors" 
                onClick={()=>setPaymentInfo(null)}
              >
                Tutup
              </button>
              {paymentInfo.bookingId && paymentInfo.booking?.payment_status === 'pending' && (
                <button 
                  className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                  onClick={() => handleConfirmPayment(paymentInfo.bookingId)}
                >
                  Konfirmasi Lunas Manual
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
