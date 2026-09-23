'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/transactions';
import { formatRupiah } from '@/lib/format';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  transaction,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Hapus Transaksi?
        </h3>

        <div className="my-3 p-2.5 rounded bg-gray-50 dark:bg-gray-800 text-xs">
          <div className="font-medium text-gray-900 dark:text-white">{transaction.title}</div>
          <div className="text-gray-500 mt-0.5">
            {formatRupiah(transaction.amount)} ({transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 mb-2">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded bg-red-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
