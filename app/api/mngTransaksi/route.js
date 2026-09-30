import { prisma } from "@/lib/prisma";

// Mengambil data transaksi dari database
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });

    const formatted = transactions.map((t) => ({
      ...t,
      description: t.notes || t.title,
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("GET_MNG_TRANSAKSI_ERROR", error);
    return Response.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}

// Membuat data transaksi baru di database
export async function POST(request) {
  try {
    const body = await request.json();

    let userId = Number(body.userId);
    if (!userId || isNaN(userId)) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser ? firstUser.id : 1;
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: body.type || "income",
        amount: parseFloat(body.amount) || 0,
        date: body.date ? new Date(body.date) : new Date(),
        title: body.title || body.description || "Transaksi Baru",
        notes: body.description || body.notes || "",
        category: body.category || "Lainnya",
        userId: userId,
      },
    });

    return Response.json({
      ...transaction,
      description: transaction.notes || transaction.title,
    });
  } catch (error) {
    console.error("POST_MNG_TRANSAKSI_ERROR", error);
    return Response.json({ error: "Gagal menambah transaksi" }, { status: 500 });
  }
}

// Mengedit data transaksi yang sudah ada di database
export async function PUT(request) {
  try {
    const body = await request.json();

    const transaction = await prisma.transaction.update({
      where: {
        id: Number(body.id),
      },
      data: {
        type: body.type,
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        date: body.date ? new Date(body.date) : undefined,
        title: body.title || body.description || undefined,
        notes: body.description !== undefined ? body.description : undefined,
      },
    });

    return Response.json({
      ...transaction,
      description: transaction.notes || transaction.title,
    });
  } catch (error) {
    console.error("PUT_MNG_TRANSAKSI_ERROR", error);
    return Response.json({ error: "Gagal memperbarui transaksi" }, { status: 500 });
  }
}
