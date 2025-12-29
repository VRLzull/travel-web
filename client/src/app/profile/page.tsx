'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

type Me = { id: number; name: string; email: string; phone?: string };

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          window.location.href = '/login?redirect=/profile';
          return;
        }
        const res = await apiClient.getMe();
        const data = (res?.data || res);
        setMe(data);
        try {
          localStorage.setItem('user', JSON.stringify(data));
        } catch {}
      } catch {
        setErrorMsg('Gagal memuat profil. Silakan login ulang.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (!password || password.length < 6) {
        setErrorMsg('Password minimal 6 karakter');
        setSaving(false);
        return;
      }
      const res = await apiClient.changePassword(password);
      if (res?.success) {
        setSuccessMsg('Password berhasil diubah');
        setPassword('');
      } else {
        setErrorMsg((res?.message as string) || 'Gagal mengubah password');
      }
    } catch {
      setErrorMsg('Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pengaturan Profil</h1>
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 flex items-center gap-3">
            <span className="text-xl">✅</span>
            {successMsg}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Profil */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                👤 Informasi Pribadi
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                  <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {me?.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat Email</label>
                  <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {me?.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Telepon / WhatsApp</label>
                  <div className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {me?.phone || 'Belum diatur'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keamanan */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🔒 Keamanan
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  {saving ? 'Menyimpan...' : 'Ganti Password'}
                </button>
              </form>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Gunakan kombinasi huruf dan angka untuk keamanan ekstra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
