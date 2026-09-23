import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import {
  getTransactions,
  createTransaction,
  getFinancialSummary,
  TransactionFilterOptions,
} from '@/lib/transactions';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const type = (searchParams.get('type') as 'income' | 'expense' | 'all') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'date_desc';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;

    const filterOptions: TransactionFilterOptions = {
      userId: user.id,
      search,
      type,
      category,
      startDate,
      endDate,
      sortBy,
      limit,
      offset,
    };

    const [transactions, summary] = await Promise.all([
      getTransactions(filterOptions),
      getFinancialSummary(user.id),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      summary,
    });
  } catch (error: any) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 });
    }

    const body = await request.json();
    const { title, amount, type, category, date, notes } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Keterangan transaksi wajib diisi' }, { status: 400 });
    }

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Nominal transaksi harus lebih dari 0' }, { status: 400 });
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json({ error: 'Tipe transaksi harus pemasukan (income) atau pengeluaran (expense)' }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json({ error: 'Kategori transaksi wajib dipilih' }, { status: 400 });
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Tanggal transaksi wajib diisi' }, { status: 400 });
    }

    const transaction = await createTransaction({
      userId: user.id,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: category.trim(),
      date,
      notes: notes ? notes.trim() : null,
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil ditambahkan',
      transaction,
    });
  } catch (error: any) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan transaksi' }, { status: 500 });
  }
}
