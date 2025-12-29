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
      const headers = ['ID','Nama','Email','Paket','Tanggal','Peserta','Total','Status']
      const rows = bookings.map(b => [
        b.id,
        b.customer_name,
        b.customer_email,
        packages.find(p=>p.id===b.package_id)?.title || b.package_id,
        new Date(b.trip_date).toLocaleDateString('id-ID'),
        b.total_participants,
        b.total_amount,
        b.payment_status
      ])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-pemesanan-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const viewPayment = async (bookingId: number) => {
    try {
      const res = await adminApi.getPaymentByBooking(bookingId)
      setPaymentInfo(res?.data || null)
    } catch (e: any) {
      setPaymentInfo({ error: e?.message || 'Pembayaran tidak ditemukan' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pemesanan</h1>
        <div className="mt-2 md:mt-0 flex space-x-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Pembayaran</option>
            <option value="paid">Dibayar</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="expired">Kadaluarsa</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={filterPackageId || ''}
            onChange={(e) => setFilterPackageId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Semua Paket</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.title}
              </option>
            ))}
          </select>
        </div>
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
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemesan</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
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
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{b.id}</td>
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
                      {b.total_participants} orang
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.total_amount)}
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
                      <button 
                        onClick={() => viewPayment(b.id)} 
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Lihat
                      </button>
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
                          {new Date(b.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {b.total_participants} orang
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.total_amount)}
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
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => viewPayment(b.id)}
                        className="text-sm px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Lihat Detail
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center" onClick={()=>setPaymentInfo(null)}>
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <div className="text-lg font-semibold mb-4">Bukti Transaksi</div>
            {paymentInfo.error ? (
              <div className="text-red-600">{paymentInfo.error}</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Order ID:</span> {paymentInfo.orderId}</div>
                <div><span className="text-gray-500">Status:</span> {paymentInfo.status}</div>
                <div><span className="text-gray-500">Nominal:</span> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(paymentInfo.amount || 0))}</div>
                <div><span className="text-gray-500">Tanggal:</span> {new Date(paymentInfo.paymentDate).toLocaleString('id-ID')}</div>
              </div>
            )}
            <div className="mt-4 text-right">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={()=>setPaymentInfo(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
