"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Pendaftaran gagal.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border-l-4 border-primary bg-white/50 p-8 dark:bg-white/5">
        <h1 className="text-2xl font-semibold">Buat akun</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/60">
          Mulai catat keuanganmu sendiri.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Nama</label>
            <input
              id="name" type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-line-dark"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-line-dark"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password" type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-line-dark"
              placeholder="Minimal 6 karakter"
            />
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60 dark:text-ink-dark/60">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary underline underline-offset-2">Masuk</Link>
        </p>
      </div>
    </main>
  );
}