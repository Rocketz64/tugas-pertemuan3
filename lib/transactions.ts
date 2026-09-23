import { query } from './db';

export interface Transaction {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilterOptions {
  userId: number;
  search?: string;
  type?: 'income' | 'expense' | 'all';
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  type: 'income' | 'expense';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  recentCount: number;
  expenseCategories: CategorySummary[];
}

export async function getTransactions(options: TransactionFilterOptions): Promise<Transaction[]> {
  const {
    userId,
    search,
    type,
    category,
    startDate,
    endDate,
    limit,
    offset = 0,
    sortBy = 'date_desc',
  } = options;

  const conditions: string[] = ['user_id = $1'];
  const params: any[] = [userId];

  if (search && search.trim() !== '') {
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(LOWER(title) LIKE $${params.length} OR LOWER(COALESCE(notes, '')) LIKE $${params.length})`);
  }

  if (type && type !== 'all') {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }

  if (category && category !== 'all' && category.trim() !== '') {
    params.push(category.trim());
    conditions.push(`category = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`date >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`date <= $${params.length}`);
  }

  let orderClause = 'ORDER BY date DESC, id DESC';
  if (sortBy === 'date_asc') {
    orderClause = 'ORDER BY date ASC, id ASC';
  } else if (sortBy === 'amount_desc') {
    orderClause = 'ORDER BY amount DESC, date DESC';
  } else if (sortBy === 'amount_asc') {
    orderClause = 'ORDER BY amount ASC, date DESC';
  }

  let limitClause = '';
  if (limit) {
    params.push(limit);
    limitClause += ` LIMIT $${params.length}`;
  }
  if (offset > 0) {
    params.push(offset);
    limitClause += ` OFFSET $${params.length}`;
  }

  const sql = `
    SELECT id, user_id, title, CAST(amount AS DOUBLE PRECISION) AS amount,
           type, category, TO_CHAR(date, 'YYYY-MM-DD') AS date, notes,
           created_at, updated_at
    FROM transactions
    WHERE ${conditions.join(' AND ')}
    ${orderClause}
    ${limitClause}
  `;

  const res = await query<Transaction>(sql, params);
  return res.rows;
}

export async function getTransactionById(id: number, userId: number): Promise<Transaction | null> {
  const sql = `
    SELECT id, user_id, title, CAST(amount AS DOUBLE PRECISION) AS amount,
           type, category, TO_CHAR(date, 'YYYY-MM-DD') AS date, notes,
           created_at, updated_at
    FROM transactions
    WHERE id = $1 AND user_id = $2
  `;
  const res = await query<Transaction>(sql, [id, userId]);
  return res.rows[0] || null;
}

export async function createTransaction(data: {
  userId: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string | null;
}): Promise<Transaction> {
  const sql = `
    INSERT INTO transactions (user_id, title, amount, type, category, date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, user_id, title, CAST(amount AS DOUBLE PRECISION) AS amount,
              type, category, TO_CHAR(date, 'YYYY-MM-DD') AS date, notes,
              created_at, updated_at
  `;

  const res = await query<Transaction>(sql, [
    data.userId,
    data.title,
    data.amount,
    data.type,
    data.category,
    data.date,
    data.notes || null,
  ]);

  return res.rows[0];
}

export async function updateTransaction(
  id: number,
  userId: number,
  data: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    notes?: string | null;
  }
): Promise<Transaction | null> {
  const sql = `
    UPDATE transactions
    SET title = $1, amount = $2, type = $3, category = $4, date = $5,
        notes = $6, updated_at = NOW()
    WHERE id = $7 AND user_id = $8
    RETURNING id, user_id, title, CAST(amount AS DOUBLE PRECISION) AS amount,
              type, category, TO_CHAR(date, 'YYYY-MM-DD') AS date, notes,
              created_at, updated_at
  `;

  const res = await query<Transaction>(sql, [
    data.title,
    data.amount,
    data.type,
    data.category,
    data.date,
    data.notes || null,
    id,
    userId,
  ]);

  return res.rows[0] || null;
}

export async function deleteTransaction(id: number, userId: number): Promise<boolean> {
  const sql = `DELETE FROM transactions WHERE id = $1 AND user_id = $2`;
  const res = await query(sql, [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

export async function getFinancialSummary(userId: number): Promise<FinancialSummary> {
  const totalsSql = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
      COUNT(*) AS transaction_count
    FROM transactions
    WHERE user_id = $1
  `;
  const totalsRes = await query<{
    total_income: string | number;
    total_expense: string | number;
    transaction_count: string | number;
  }>(totalsSql, [userId]);

  const raw = totalsRes.rows[0] || { total_income: 0, total_expense: 0, transaction_count: 0 };
  const totalIncome = parseFloat(String(raw.total_income)) || 0;
  const totalExpense = parseFloat(String(raw.total_expense)) || 0;
  const transactionCount = parseInt(String(raw.transaction_count), 10) || 0;
  const balance = totalIncome - totalExpense;

  const categorySql = `
    SELECT 
      category,
      CAST(SUM(amount) AS DOUBLE PRECISION) AS amount,
      'expense' AS type
    FROM transactions
    WHERE user_id = $1 AND type = 'expense'
    GROUP BY category
    ORDER BY amount DESC
    LIMIT 6
  `;
  const categoryRes = await query<{ category: string; amount: number; type: 'expense' }>(
    categorySql,
    [userId]
  );

  const expenseCategories: CategorySummary[] = categoryRes.rows.map((row) => ({
    category: row.category,
    amount: row.amount,
    type: 'expense',
    percentage: totalExpense > 0 ? Math.round((row.amount / totalExpense) * 100) : 0,
  }));

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    recentCount: Math.min(transactionCount, 5),
    expenseCategories,
  };
}
