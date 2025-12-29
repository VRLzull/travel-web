'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.register({ name, email, phone, password });
      const data = res?.data || res;
      const token = data?.token;
      const user = data?.user;
      if (token && user) {
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
        router.push('/');
      } else {
        setErrorMsg('Registrasi gagal');
      }
    } catch (err: unknown) {
      let msg = 'Registrasi gagal';
      try {
        const anyErr = err as { response?: { data?: { message?: string } } };
        msg = anyErr?.response?.data?.message || msg;
      } catch {}
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar</h1>
        <p className="text-gray-600 mb-6">Buat akun untuk memesan paket wisata.</p>
        {errorMsg && (
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">{errorMsg}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          Sudah punya akun? <Link href="/login" className="text-blue-600">Masuk</Link>
        </div>
      </div>
    </div>
  );
}
