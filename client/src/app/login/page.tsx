'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const redirect = searchParams.get('redirect');
        router.push(redirect || '/');
      }
    } catch {}
  }, [router, searchParams]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.login(email, password, isAdmin);
      const data = res?.data || res;
      const token = data?.token;
      const user = data?.user;
      
      if (!token || !user) {
        setErrorMsg('Login gagal: Token atau data pengguna tidak valid');
        setLoading(false);
        return;
      }
      
      try {
        if (isAdmin) {
          // Simpan token admin di localStorage
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify(user));
          // Hapus token user jika ada
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          // Simpan token user di localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          // Hapus token admin jika ada
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
        
        console.log('Login berhasil, token disimpan');
      } catch (err) {
        console.error('Gagal menyimpan token:', err);
        setErrorMsg('Gagal menyimpan data sesi');
        setLoading(false);
        return;
      }
      const redirect = searchParams.get('redirect');
      // Redirect ke dashboard admin jika login sebagai admin
      if (isAdmin) {
        router.push(redirect || '/admin/dashboard');
      } else {
        router.push(redirect || '/');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      let msg = 'Email atau password salah';
      try {
        if (err && typeof err === 'object' && err !== null) {
          const maybeResponse = (err as { response?: unknown }).response;
          if (maybeResponse && typeof maybeResponse === 'object') {
            const maybeData = (maybeResponse as { data?: unknown }).data;
            if (maybeData && typeof maybeData === 'object') {
              const d = maybeData as { message?: unknown; error?: unknown };
              if (d.message) {
                msg = String(d.message);
              } else if (d.error) {
                msg = String(d.error);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing error message:', e);
      }
      
      // Tampilkan pesan error yang lebih spesifik jika ada
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          msg = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        } else if (err.message.includes('timeout')) {
          msg = 'Koneksi ke server timeout. Silakan coba lagi.';
        }
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Masuk</h1>
        <p className="text-gray-600 mb-6">Silakan login untuk melanjutkan pemesanan.</p>
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
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
            {loading ? 'Mengautentikasi...' : 'Masuk'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          Belum punya akun? <Link href="/register" className="text-blue-600">Daftar</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Memuat...</div>}>
      <LoginContent />
    </Suspense>
  );
}

