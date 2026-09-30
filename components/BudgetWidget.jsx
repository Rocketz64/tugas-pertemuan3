'use client';

import { useState, useEffect, useCallback } from 'react';

export default function BudgetWidget() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState({
    budget: 0,
    totalExpense: 0,
    remainingBudget: 0,
    usagePercentage: 0,
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputBudget, setInputBudget] = useState('');

  // 1. AJAX Fetch Data Ringkasan Budget dari API
  const fetchBudgetSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budget?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data budget:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgetSummary();
  }, [fetchBudgetSummary]);

  // 2. AJAX Submit Set/Update Budget ke API
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          amount: parseFloat(inputBudget),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setInputBudget('');
        fetchBudgetSummary();
      }
    } catch (err) {
      console.error('Gagal menyimpan budget:', err);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border shadow-sm">
      {/* Selector Periode Bulan/Tahun & Tombol Aksi */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <label className="font-medium text-sm text-gray-700">Periode:</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border p-2 rounded text-sm bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>

          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border p-2 rounded text-sm bg-white"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => {
            setInputBudget(summary.budget.toString());
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
        >
          {summary.budget > 0 ? 'Ubah Budget' : 'Set Budget'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500 text-sm">Memuat data budget...</div>
      ) : (
        <>
          {/* Ringkasan Kartu Anggaran */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Anggaran Bulanan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                Rp {summary.budget.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                Rp {summary.totalExpense.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sisa Anggaran</p>
              <p className={`text-2xl font-bold mt-1 ${summary.remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rp {summary.remainingBudget.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Indikator Persentase Penggunaan */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Penggunaan Budget</span>
              <span className="font-semibold">{summary.usagePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  summary.usagePercentage >= 100 
                    ? 'bg-red-600' 
                    : summary.usagePercentage >= 80 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(summary.usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </>
      )}

      {/* Modal Input/Edit Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">Set Target Anggaran</h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal Budget (Rp)
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="any"
                  value={inputBudget}
                  onChange={(e) => setInputBudget(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: 5000000"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}