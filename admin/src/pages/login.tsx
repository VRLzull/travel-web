import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminApi } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await adminApi.loginAdmin(email, password)
      const data = res?.data || res
      const token = data?.token
      const user = data?.user
      if (!token || !user) {
        setErrorMsg('Login gagal')
        setLoading(false)
        return
      }
      try {
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminUser', JSON.stringify(user))
      } catch {}
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard'
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'Email atau password salah'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p className="text-gray-600 mb-6">Masuk sebagai admin untuk mengelola konten.</p>
        {errorMsg && (
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md">
            {loading ? 'Mengautentikasi...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

