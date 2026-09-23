import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { updateTransaction, deleteTransaction, getTransactionById } from '@/lib/transactions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 });
    }

    const transaction = await getTransactionById(transactionId, user.id);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('GET /api/transactions/[id] error:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail transaksi' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const { title, amount, type, category, date, notes } = body;

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (amount !== undefined && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      return NextResponse.json({ error: 'Nominal harus lebih dari 0' }, { status: 400 });
    }

    if (type && type !== 'income' && type !== 'expense') {
      return NextResponse.json({ error: 'Tipe transaksi harus pemasukan atau pengeluaran' }, { status: 400 });
    }

    const updated = await updateTransaction(transactionId, user.id, {
      title: title?.trim(),
      amount: parsedAmount,
      type,
      category: category?.trim(),
      date,
      notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil diperbarui',
      transaction: updated,
    });
  } catch (error: any) {
    console.error('PUT /api/transactions/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui transaksi' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 });
    }

    const deleted = await deleteTransaction(transactionId, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses untuk menghapusnya' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error: any) {
    console.error('DELETE /api/transactions/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}
