import { useEffect, useState, useMemo } from 'react';
import { adminApi, Booking, type AdminStats } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<AdminStats | any>(null)
  const [resetLoading, setResetLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await adminApi.getBookings()
      setBookings(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
      const s = await adminApi.getAdminStats()
      setStats(s?.data || null)
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleResetRevenue = async () => {
    if (!window.confirm('Apakah Anda yakin ingin me-reset data pendapatan menjadi nol? Tindakan ini akan mengabaikan transaksi sebelum waktu sekarang dalam perhitungan statistik.')) {
      return
    }

    setResetLoading(true)
    try {
      await adminApi.resetRevenue()
      await loadData()
      alert('Data pendapatan berhasil di-reset.')
    } catch (e: any) {
      alert(e.message || 'Gagal reset pendapatan')
    } finally {
      setResetLoading(false)
    }
  }

  const totalOrders = stats?.total_orders ?? bookings.length
  const totalRevenue = useMemo(() => {
    if (stats?.total_revenue !== undefined) return stats.total_revenue;
    
    const resetDate = stats?.reset_date ? new Date(stats.reset_date) : new Date(0);
    return bookings
      .filter(b => {
        const isPaid = String(b.payment_status).toLowerCase() === 'paid';
        const isAfterReset = new Date(b.created_at) >= resetDate;
        return isPaid && isAfterReset;
      })
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  }, [stats, bookings]);
  const totalUsers = stats?.total_users ?? 0
  // Ensure we have valid monthly data
  const monthly = Array.isArray(stats?.monthly) ? stats.monthly : []
  const last = monthly.length > 0 ? monthly[monthly.length - 1] : null
  const prev = monthly.length > 1 ? monthly[monthly.length - 2] : null
  
  // Safe calculations with proper fallbacks
  const { growthRevenue, growthOrders } = useMemo(() => {
    if (!last || !prev) return { growthRevenue: 0, growthOrders: 0 };  
    
    const revenueGrowth = prev.revenue > 0 
      ? ((last.revenue - prev.revenue) / prev.revenue) * 100 
      : 0;
      
    const ordersGrowth = prev.orders > 0
      ? ((last.orders - prev.orders) / prev.orders) * 100
      : 0;
      
    return { 
      growthRevenue: isFinite(revenueGrowth) ? revenueGrowth : 0, 
      growthOrders: isFinite(ordersGrowth) ? ordersGrowth : 0 
    };
  }, [last, prev]);

  useMemo(() => {
    return bookings.filter(b => String(b.payment_status).toLowerCase() === 'paid').length;
  }, [bookings]);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <button
            onClick={handleResetRevenue}
            disabled={resetLoading}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {resetLoading ? 'Memproses...' : 'Reset Data Pendapatan'}
          </button>
        </div>
        
        {errorMsg && (
          <div className="mb-6 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  Rp. {new Intl.NumberFormat('id-ID', { 
                    maximumFractionDigits: 0 
                  }).format(totalRevenue)}
                </p>
                <div className={`mt-2 flex items-center text-xs font-medium ${growthRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{growthRevenue >= 0 ? '↑' : '↓'} {Math.abs(growthRevenue).toFixed(1)}%</span>
                  <span className="text-gray-400 ml-1 font-normal text-[10px]">vs bln lalu</span>
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalOrders}</p>
                <div className={`mt-2 flex items-center text-xs font-medium ${growthOrders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{growthOrders >= 0 ? '↑' : '↓'} {Math.abs(growthOrders).toFixed(1)}%</span>
                  <span className="text-gray-400 ml-1 font-normal text-[10px]">vs bln lalu</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pesanan Pending</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {bookings.filter(b => String(b.payment_status).toLowerCase() === 'pending').length}
                </p>
                <div className="mt-2 flex items-center text-xs text-amber-600 font-medium">
                  <span className="animate-pulse mr-1">●</span>
                  <span>Menunggu Konfirmasi</span>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsers}</p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                  <span>Aktif & Terdaftar</span>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Grafik Pendapatan</h2>
            </div>
            {monthly.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-500">
                Belum ada data untuk ditampilkan
              </div>
            ) : (
              <div className="h-72">
                <Line 
                  data={{
                    labels: monthly.map((m: any) => m.month),
                    datasets: [{
                      fill: true,
                      label: 'Pendapatan (IDR)',
                      data: monthly.map((m: any) => m.revenue),
                      borderColor: 'rgb(79, 70, 229)',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: 'rgb(79, 70, 229)',
                      pointBorderColor: '#fff',
                      pointHoverRadius: 6,
                      pointRadius: 4,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: (context) => {
                            return 'Rp. ' + new Intl.NumberFormat('id-ID', { 
                              maximumFractionDigits: 0
                            }).format((context.parsed.y as number) || 0);
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => {
                            return 'Rp. ' + new Intl.NumberFormat('id-ID', {
                              notation: 'compact',
                              maximumFractionDigits: 0
                            }).format(value as number);
                          }
                        },
                        grid: { color: '#f3f4f6' }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Grafik Pesanan</h2>
            </div>
            {monthly.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-500">
                Belum ada data untuk ditampilkan
              </div>
            ) : (
              <div className="h-72">
                <Bar 
                  data={{
                    labels: monthly.map((m: any) => m.month),
                    datasets: [{
                      label: 'Jumlah Pesanan',
                      data: monthly.map((m: any) => m.orders),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderRadius: 6,
                      hoverBackgroundColor: 'rgb(59, 130, 246)',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: '#f3f4f6' }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Second Row: Activity and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-pulse text-gray-500">Memuat aktivitas...</div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-gray-500">Tidak ada aktivitas terbaru</div>
                </div>
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {b.customer_name} - {b.payment_status === 'paid' ? 'Pembayaran berhasil' : 'Menunggu pembayaran'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(b.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="mt-1 flex items-center text-xs">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium ml-1">
                          {new Intl.NumberFormat('id-ID', { 
                            style: 'currency', 
                            currency: 'IDR', 
                            maximumFractionDigits: 0 
                          }).format(b.total_amount)}
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          b.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {b.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h2>
            <div className="h-64 flex items-center justify-center">
              {bookings.length === 0 ? (
                <div className="text-gray-500">Tidak ada data</div>
              ) : (
                <div className="w-full h-full">
                  {/* Using a simple custom pie/donut chart visualization since we have chart.js but it might be overkill for a small donut */}
                  {/* Actually let's use ChartJS Pie chart for consistency */}
                  {(() => {
                    const statusCount = bookings.reduce((acc: any, b) => {
                      const s = b.payment_status?.toLowerCase() || 'pending';
                      acc[s] = (acc[s] || 0) + 1;
                      return acc;
                    }, {});
                    
                    const labels = Object.keys(statusCount).map(s => s.charAt(0).toUpperCase() + s.slice(1));
                    const data = Object.values(statusCount) as number[];
                    
                    // We need to import Doughnut/Pie from react-chartjs-2 and register ArcElement
                    return (
                      <div className="h-full relative">
                         {/* Fallback to simple list if data is too simple, but let's try to make it nice */}
                         <div className="flex flex-col h-full justify-center">
                            {labels.map((label, i) => {
                              const percentage = Math.round((Number(data[i]) / bookings.length) * 100);
                              const colors: any = {
                                'Paid': 'bg-green-500',
                                'Pending': 'bg-yellow-500',
                                'Cancelled': 'bg-red-500',
                                'Failed': 'bg-gray-500'
                              };
                              return (
                                <div key={label} className="mb-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{label}</span>
                                    <span className="text-gray-500">{percentage}% ({data[i]})</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                      className={`${colors[label] || 'bg-blue-500'} h-2 rounded-full`} 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                         </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaksi Terakhir</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemesan</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi/Unit</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                      Memuat data transaksi...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 5).map((b, index) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                            {b.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{b.customer_name}</div>
                            <div className="text-xs text-gray-500">{b.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(b.trip_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {b.total_participants} Hari
                        </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rp. {new Intl.NumberFormat('id-ID', { 
                          maximumFractionDigits: 0 
                        }).format(b.total_amount)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          b.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {bookings.length > 5 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 text-right text-sm">
              <a href="/admin/orders" className="text-indigo-600 hover:text-indigo-900 font-medium">
                Lihat semua transaksi →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
