import { pool, query } from './lib/db';
import { hashPassword, verifyPassword } from './lib/auth';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
} from './lib/transactions';

async function runTests() {
  try {
    await query('DELETE FROM sessions;');
    await query('DELETE FROM transactions;');
    await query('DELETE FROM users WHERE email LIKE $1;', ['%test%']);

    const pass1 = 'password123';
    const hash = await hashPassword(pass1);
    const valid = await verifyPassword(pass1, hash);
    const invalid = await verifyPassword('wrongpassword', hash);
    if (!valid || invalid) throw new Error('Password hashing verification failed');

    const user1Res = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email`,
      ['Mahasiswa Satu', 'user1.test@kampus.ac.id', hash]
    );
    const user1 = user1Res.rows[0];

    const user2Res = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email`,
      ['Mahasiswa Dua', 'user2.test@kampus.ac.id', hash]
    );
    const user2 = user2Res.rows[0];

    const tx1 = await createTransaction({
      userId: user1.id,
      title: 'Uang Saku Bulanan',
      amount: 1500000,
      type: 'income',
      category: 'Uang Saku',
      date: '2026-09-01',
      notes: 'Transfer orang tua',
    });

    const tx2 = await createTransaction({
      userId: user1.id,
      title: 'Makan Siang Warteg',
      amount: 25000,
      type: 'expense',
      category: 'Makanan & Minuman',
      date: '2026-09-02',
      notes: 'Nasi rames + es teh',
    });

    const tx3 = await createTransaction({
      userId: user1.id,
      title: 'Buku Diktat Kuliah',
      amount: 75000,
      type: 'expense',
      category: 'Kuliah & Buku',
      date: '2026-09-03',
      notes: 'Fotokopi bahan ajar',
    });

    const txUser2 = await createTransaction({
      userId: user2.id,
      title: 'Honor Asisten Lab',
      amount: 600000,
      type: 'income',
      category: 'Gaji / Magang',
      date: '2026-09-05',
      notes: 'Asisten lab komputer',
    });

    const user1Txs = await getTransactions({ userId: user1.id });
    if (user1Txs.length !== 3) {
      throw new Error(`Expected User 1 to have 3 transactions, got ${user1Txs.length}`);
    }

    const unauthorizedAccess = await getTransactionById(txUser2.id, user1.id);
    if (unauthorizedAccess !== null) {
      throw new Error('SECURITY VIOLATION: User 1 could read User 2 transaction!');
    }

    const summary1 = await getFinancialSummary(user1.id);
    if (summary1.totalIncome !== 1500000) {
      throw new Error(`Expected totalIncome 1,500,000, got ${summary1.totalIncome}`);
    }
    if (summary1.totalExpense !== 100000) {
      throw new Error(`Expected totalExpense 100,000, got ${summary1.totalExpense}`);
    }
    if (summary1.balance !== 1400000) {
      throw new Error(`Expected balance 1,400,000, got ${summary1.balance}`);
    }

    const searchFilter = await getTransactions({ userId: user1.id, search: 'warteg' });
    if (searchFilter.length !== 1 || searchFilter[0].title !== 'Makan Siang Warteg') {
      throw new Error('Search filter failed');
    }

    const typeFilter = await getTransactions({ userId: user1.id, type: 'expense' });
    if (typeFilter.length !== 2) {
      throw new Error(`Type filter failed, expected 2 expenses, got ${typeFilter.length}`);
    }

    const categoryFilter = await getTransactions({ userId: user1.id, category: 'Kuliah & Buku' });
    if (categoryFilter.length !== 1 || categoryFilter[0].title !== 'Buku Diktat Kuliah') {
      throw new Error('Category filter failed');
    }

    const updatedTx = await updateTransaction(tx2.id, user1.id, {
      title: 'Makan Siang Warteg Spesial',
      amount: 30000,
      type: 'expense',
      category: 'Makanan & Minuman',
      date: '2026-09-02',
    });
    if (!updatedTx || updatedTx.amount !== 30000 || updatedTx.title !== 'Makan Siang Warteg Spesial') {
      throw new Error('Update transaction failed');
    }

    const hackerUpdate = await updateTransaction(tx2.id, user2.id, {
      title: 'Hacked Title',
      amount: 999999,
      type: 'expense',
      category: 'Makanan & Minuman',
      date: '2026-09-02',
    });
    if (hackerUpdate !== null) {
      throw new Error('SECURITY VIOLATION: User 2 could update User 1 transaction!');
    }

    const deleted = await deleteTransaction(tx3.id, user1.id);
    if (!deleted) throw new Error('Delete transaction failed');

    const checkDeleted = await getTransactionById(tx3.id, user1.id);
    if (checkDeleted !== null) throw new Error('Deleted transaction still exists');

    const hackerDelete = await deleteTransaction(tx1.id, user2.id);
    if (hackerDelete !== false) {
      throw new Error('SECURITY VIOLATION: User 2 could delete User 1 transaction!');
    }

    await query('DELETE FROM transactions WHERE user_id IN ($1, $2);', [user1.id, user2.id]);
    await query('DELETE FROM users WHERE id IN ($1, $2);', [user1.id, user2.id]);

    console.log('Semua pengujian berhasil!');
  } catch (error) {
    console.error('Pengujian gagal:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
