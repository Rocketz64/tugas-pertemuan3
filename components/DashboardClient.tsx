'use client';

import { useState, useEffect, useCallback } from 'react';
import { FinancialCards } from '@/components/FinancialCards';
import { TransactionFilter, FilterState } from '@/components/TransactionFilter';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Transaction, FinancialSummary } from '@/lib/transactions';
import { SafeUser } from '@/lib/auth';

interface DashboardClientProps {
  user: SafeUser;
  initialTransactions: Transaction[];
  initialSummary: FinancialSummary;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  datePreset: 'all',
  startDate: '',
  endDate: '',
  sortBy: 'date_desc',
};

export function DashboardClient({
  user,
  initialTransactions,
  initialSummary,
}: DashboardClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [summary, setSummary] = useState<FinancialSummary>(initialSummary);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async (currentFilters: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search.trim()) params.append('search', currentFilters.search.trim());
      if (currentFilters.type !== 'all') params.append('type', currentFilters.type);
      if (currentFilters.category !== 'all') params.append('category', currentFilters.category);
      if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat transaksi');

      const data = await res.json();
      setTransactions(data.transactions || []);
      if (data.summary) setSummary(data.summary);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTransactions(filters);
    }, 250);

    return () => clearTimeout(handler);
  }, [filters, fetchTransactions]);

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDelete = (tx: Transaction) => {
    setDeletingTransaction(tx);
  };

  const handleModalSuccess = () => {
    fetchTransactions(filters);
  };

  const handleDeleteSuccess = () => {
    fetchTransactions(filters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Halo, {user.name}
          </h1>
          <p className="text-xs text-gray-500">
            Kelola pemasukan dan pengeluaran pribadi Anda.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="text-xs px-3.5 py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium"
        >
          + Tambah Transaksi
        </button>
      </div>

      <FinancialCards
        balance={summary.balance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
      />

      <div className="space-y-3 pt-2">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Riwayat Transaksi Terbaru
        </div>

        <TransactionFilter
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          resultCount={transactions.length}
        />

        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
          loading={loading}
        />
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={handleModalSuccess}
        initialData={editingTransaction}
      />

      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
