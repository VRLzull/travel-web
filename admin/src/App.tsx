import { Routes, Route, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom'
import LoginPage from './pages/login'
import DashboardPage from './pages/dashboard'
import PackagesPage from './pages/packages'
import NewPackagePage from './pages/packages/new'
import EditPackagePage from './pages/packages/edit/[id]'
import UsersPage from './pages/users'
import OrdersPage from './pages/orders'
import { useEffect, useState } from 'react'

// Komponen untuk memproteksi rute yang membutuhkan autentikasi
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
      const userRaw = localStorage.getItem('adminUser')
      let roleOk = false
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw)
          const role = String(user?.role || '').toUpperCase()
          roleOk = role === 'ADMIN' || role === 'SUPERADMIN'
        } catch {}
      }
      setIsAuthenticated(!!token && roleOk)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    try {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      sessionStorage.removeItem('adminToken')
    } catch {}
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function App() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const adminUser = (() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || 'null') } catch { return null }
  })()

  const handleLogout = () => {
    try {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    } catch {}
    navigate('/admin/login', { replace: true })
  }

  const AdminLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`bg-gray-900 text-white flex flex-col fixed md:static inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-200 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64 z-40`}>
        <div className="px-6 py-4 flex items-center justify-start">
          <div className={`${sidebarCollapsed ? 'hidden md:block md:hidden' : ''} text-lg font-semibold`}>TravelKu Admin</div>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          <div className={`uppercase text-xs ${sidebarCollapsed ? 'hidden md:block md:hidden' : ''} text-gray-400 px-4 py-2`}>Home</div>
          <NavLink to="/admin/dashboard" className={({isActive})=>`flex items-center gap-3 px-4 py-2 rounded ${isActive?'bg-indigo-600':'hover:bg-gray-800'}`}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            <span className={`${sidebarCollapsed ? 'hidden md:block md:hidden' : ''}`}>Dashboard</span>
          </NavLink>
          <div className={`uppercase text-xs ${sidebarCollapsed ? 'hidden md:block md:hidden' : ''} text-gray-400 px-4 py-2`}>Menu</div>
          <NavLink to="/admin/packages" className={({isActive})=>`flex items-center gap-3 px-4 py-2 rounded ${isActive?'bg-indigo-600':'hover:bg-gray-800'}`}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 16V8l-9-5-9 5v8l9 5 9-5zM12 4.26L18.74 8 12 11.74 5.26 8 12 4.26zM12 13.26L18.74 10v4L12 17.26 5.26 14v-4L12 13.26z"/></svg>
            <span className={`${sidebarCollapsed ? 'hidden md:block md:hidden' : ''}`}>Layanan</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive})=>`flex items-center gap-3 px-4 py-2 rounded ${isActive?'bg-indigo-600':'hover:bg-gray-800'}`}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.82 12h8.36l1.24-5H6.58l1.24 5zM5 6h14l-2 9H7L5 6z"/></svg>
            <span className={`${sidebarCollapsed ? 'hidden md:block md:hidden' : ''}`}>Pemesanan</span>
          </NavLink>
          <div className={`uppercase text-xs ${sidebarCollapsed ? 'hidden md:block md:hidden' : ''} text-gray-400 px-4 py-2`}>Admin</div>
          <NavLink to="/admin/users" className={({isActive})=>`flex items-center gap-3 px-4 py-2 rounded ${isActive?'bg-indigo-600':'hover:bg-gray-800'}`}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
            <span className={`${sidebarCollapsed ? 'hidden md:block md:hidden' : ''}`}>Data User</span>
          </NavLink>
        </nav>
        <div className={`px-4 py-4 text-sm text-gray-300 ${sidebarCollapsed ? 'hidden md:block md:hidden' : ''}`}>{adminUser?.name || 'Admin User'}</div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={()=>setSidebarOpen(false)}></div>}
      <main className={`flex-1 min-h-screen overflow-x-auto h-scroll`}>
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300" onClick={()=>{
            if (window.innerWidth < 768) setSidebarOpen(!sidebarOpen); else setSidebarCollapsed(!sidebarCollapsed)
          }}>
            <span className="sr-only">Toggle Sidebar</span>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="font-semibold text-gray-900">Admin Panel</div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-gray-600">{adminUser?.email || ''}</div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={()=>navigate('/admin/users')}>Profil</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleLogout}>Logout</button>
            </div>
            <div className="sm:hidden relative">
              <button className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300" onClick={()=>setUserMenuOpen(!userMenuOpen)} aria-label="User Menu">
                <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="6" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="18" r="2" fill="currentColor"/></svg>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-30">
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={()=>{ setUserMenuOpen(false); navigate('/admin/users') }}>Profil</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600" onClick={()=>{ setUserMenuOpen(false); handleLogout() }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="px-4 md:px-6 py-6 w-[120vw] md:w-auto">{children}</div>
      </main>
    </div>
  )

  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminLayout>
            <DashboardPage />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/packages" element={
        <ProtectedRoute>
          <AdminLayout>
            <PackagesPage />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/packages/new" element={
        <ProtectedRoute>
          <AdminLayout>
            <NewPackagePage />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/packages/edit/:id" element={
        <ProtectedRoute>
          <AdminLayout>
            <EditPackagePage />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AdminLayout>
            <UsersPage />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/orders" element={
        <ProtectedRoute>
          <AdminLayout>
            <OrdersPage />
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}

export default App
