'use client';

import { Transaction } from '@/lib/transactions';
import { formatRupiah, formatDate } from '@/lib/format';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAddNew: () => void;
  loading?: boolean;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  loading = false,
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-gray-500 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        Memuat transaksi...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">Belum ada transaksi</p>
        <button
          onClick={onAddNew}
          className="mt-3 text-xs px-3 py-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium"
        >
          + Tambah Transaksi
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Keterangan</th>
              <th className="py-2.5 px-3">Kategori</th>
              <th className="py-2.5 px-3 text-right">Nominal</th>
              <th className="py-2.5 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">
                    <div>{tx.title}</div>
                    {tx.notes && (
                      <div className="text-[11px] text-gray-400 font-normal">{tx.notes}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                    {tx.category}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">
                    <span className={isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onEdit(tx)}
                      className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      className="px-2 py-1 text-red-600 dark:text-red-400 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
