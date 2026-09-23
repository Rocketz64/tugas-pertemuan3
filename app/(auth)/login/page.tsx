'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('mahasiswa@kampus.ac.id');
    setPassword('mahasiswa123');
    setError(null);
    setLoading(true);

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mahasiswa@kampus.ac.id',
          password: 'mahasiswa123',
        }),
      });

      if (!res.ok) {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Budi Mahasiswa',
            email: 'mahasiswa@kampus.ac.id',
            password: 'mahasiswa123',
          }),
        });

        if (!regRes.ok) {
          const regData = await regRes.json();
          throw new Error(regData.error || 'Gagal menyiapkan akun demo');
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal login akun demo');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Masuk
          </h1>
          <p className="text-xs text-gray-500">
            Aplikasi Expense Tracker Mahasiswa
          </p>
        </div>

        {error && (
          <div className="p-2 text-xs rounded bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kampus.ac.id"
              className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-xs py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full text-xs py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Coba Akun Demo
        </button>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
