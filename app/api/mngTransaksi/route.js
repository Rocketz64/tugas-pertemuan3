import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const unauthorized = () =>
  Response.json({ error: "Unauthorized: Silakan login terlebih dahulu" }, { status: 401 });

const fmt = (t) => ({ ...t, description: t.notes || t.title });

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });
    return Response.json(transactions.map(fmt));
  } catch (error) {
    console.error("GET_MNG_TRANSAKSI_ERROR", error);
    return Response.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const transaction = await prisma.transaction.create({
      data: {
        type: body.type || "income",
        amount: parseFloat(body.amount) || 0,
        date: body.date ? new Date(body.date) : new Date(),
        title: body.title || body.description || "Transaksi Baru",
        notes: body.description || body.notes || "",
        category: body.category || "Lainnya",
        userId: user.id, // selalu dari session, bukan dari body
      },
    });
    return Response.json(fmt(transaction));
  } catch (error) {
    console.error("POST_MNG_TRANSAKSI_ERROR", error);
    return Response.json({ error: "Gagal menambah transaksi" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const id = Number(body.id);
    if (!id || isNaN(id)) {
      return Response.json({ error: "ID transaksi tidak valid" }, { status: 400 });
    }

    const result = await prisma.transaction.updateMany({
      where: { id, userId: user.id }, // hanya milik user yang login
      data: {
        type: body.type,
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        date: body.date ? new Date(body.date) : undefined,
        title: body.title || body.description || undefined,
        notes: body.description !== undefined ? body.description : undefined,
      },
    });

    if (result.count === 0) {
      return Response.json(
        { error: "Transaksi tidak ditemukan atau Anda tidak memiliki izin" },
        { status: 404 }
      );
    }

    const updated = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    return Response.json(fmt(updated));
  } catch (error) {
    console.error("PUT_MNG_TRANSAKSI_ERROR", error);
    return Response.json({ error: "Gagal memperbarui transaksi" }, { status: 500 });
  }
}