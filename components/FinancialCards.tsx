'use client';

import { formatRupiah } from '@/lib/format';

interface FinancialCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export function FinancialCards({
  balance,
  totalIncome,
  totalExpense,
}: FinancialCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400">Saldo</div>
        <div className={`text-xl font-bold mt-1 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
          {formatRupiah(balance)}
        </div>
      </div>

      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400">Total Pemasukan</div>
        <div className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
          {formatRupiah(totalIncome)}
        </div>
      </div>

      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400">Total Pengeluaran</div>
        <div className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">
          {formatRupiah(totalExpense)}
        </div>
      </div>
    </div>
  );
}
