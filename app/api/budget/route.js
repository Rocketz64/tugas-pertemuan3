import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sesuaikan lokasi instance prisma proyekmu jika berbeda
import { getSessionUser } from '@/lib/auth'; // Menggunakan helper auth bawaan proyekmu

// GET /api/budget?month=X&year=Y
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear());

    // 1. Ambil target budget user untuk bulan & tahun bersangkutan
    const budgetData = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
    });

    const budgetAmount = budgetData ? budgetData.amount : 0;

    // 2. Tentukan rentang tanggal awal dan akhir bulan
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 3. Hitung total pengeluaran (SUM transaksi tipe expense)
    const expenseAggregation = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId: user.id,
        type: {
          in: ['expense', 'EXPENSE', 'Expense'],
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalExpense = expenseAggregation._sum.amount || 0;

    // 4. Hitung kalkulasi keuangan
    const remainingBudget = budgetAmount - totalExpense;
    const usagePercentage = budgetAmount > 0 
      ? Math.min((totalExpense / budgetAmount) * 100, 100) 
      : 0;

    return NextResponse.json({
      month,
      year,
      budget: budgetAmount,
      totalExpense,
      remainingBudget,
      usagePercentage: parseFloat(usagePercentage.toFixed(2)),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/budget (Set or Update Budget)
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, year, amount } = await request.json();

    if (!month || !year || amount === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    const parsedAmount = parseFloat(amount);

    const budget = await prisma.budget.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month: parsedMonth,
          year: parsedYear,
        },
      },
      update: {
        amount: parsedAmount,
      },
      create: {
        userId: user.id,
        month: parsedMonth,
        year: parsedYear,
        amount: parsedAmount,
      },
    });

    return NextResponse.json({ message: 'Budget berhasil disimpan', budget });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}