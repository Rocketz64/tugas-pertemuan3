"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MngTransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function ambilTrans() {
    try {
      const res = await fetch("/api/mngTransaksi");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
    }
  }

  useEffect(() => {
    ambilTrans();
  }, []);

  async function tambahTrans(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      const res = await fetch("/api/mngTransaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type,
          amount: amount,
          date: date || new Date().toISOString().split("T")[0],
          description: description,
        }),
      });

      const data = await res.json();
      if (data && !data.error) {
        setTransactions([data, ...transactions]);
        setAmount("");
        setDescription("");
      }
    } catch (err) {
      console.error("Gagal menambah transaksi:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SOLUSI SALDO</h1>
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Manajemen Transaksi (Prisma ORM)</h2>
        </div>
        <Link
          href="/dashboard"
          className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Ke Dashboard Utama
        </Link>
      </div>

      <form onSubmit={tambahTrans} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Tambah Transaksi Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tipe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 text-sm"
            >
              <option value="income">Income (Pemasukan)</option>
              <option value="expense">Expense (Pengeluaran)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Jumlah (Amount)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Contoh: 50000"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Beli makan siang"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50 text-sm"
        >
          {loading ? "Menyimpan..." : "Tambah Transaksi"}
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Daftar Transaksi</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada transaksi.</p>
        ) : (
          <div className="grid gap-3">
            {transactions.map((trans) => (
              <div
                key={trans.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {trans.description || trans.title || "Tanpa Judul"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {trans.date ? new Date(trans.date).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`font-semibold text-sm ${
                      trans.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {trans.type === "income" ? "+" : "-"} Rp {Number(trans.amount).toLocaleString("id-ID")}
                  </span>
                  <p className="text-xs capitalize text-gray-400">{trans.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
