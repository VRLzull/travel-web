import { useEffect, useState } from 'react'
import { adminApi, type User } from '../services/api'

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [users, setUsers] = useState<User[]>([])

  const loadUsers = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await adminApi.getUsers()
      setUsers(res?.data || [])
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleResetPassword = async (user: User) => {
    const pwd = typeof window !== 'undefined' ? window.prompt(`Masukkan password baru untuk ${user.name}`) : ''
    if (!pwd) return
    if (pwd.length < 6) {
      setErrorMsg('Password minimal 6 karakter')
      return
    }
    try {
      await adminApi.resetUserPassword(user.id, pwd)
      await loadUsers()
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal reset password')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola User</h1>
      {errorMsg && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Memuat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dibuat</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Belum ada user</td>
                  </tr>
                ) : (
                  users.map((u, index) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.phone}</td>
                      <td className="px-4 py-2">{new Date(u.created_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2">
                        <button
                          className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={() => handleResetPassword(u)}
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
