'use client';

import { ALL_CATEGORIES } from '@/lib/format';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  datePreset: 'all' | 'today' | '7days' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

interface TransactionFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

export function TransactionFilter({
  filters,
  onChange,
  onReset,
  resultCount,
}: TransactionFilterProps) {
  const isFiltered =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.datePreset !== 'all' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  const handleDatePresetChange = (preset: FilterState['datePreset']) => {
    const today = new Date();
    let start = '';
    let end = '';

    const formatDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      start = formatDateStr(today);
      end = formatDateStr(today);
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      start = formatDateStr(past);
      end = formatDateStr(today);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDateStr(firstDay);
      end = formatDateStr(today);
    }

    onChange({
      ...filters,
      datePreset: preset,
      startDate: start,
      endDate: end,
    });
  };

  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Cari transaksi..."
          className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
        />

        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value as any })}
          className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">Semua Kategori</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={filters.datePreset}
          onChange={(e) => handleDatePresetChange(e.target.value as any)}
          className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">Semua Tanggal</option>
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari Terakhir</option>
          <option value="month">Bulan Ini</option>
          <option value="custom">Pilih Tanggal...</option>
        </select>
      </div>

      {filters.datePreset === 'custom' && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span>Dari:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
          />
          <span>Sampai:</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
        <span>Total hasil: {resultCount}</span>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
