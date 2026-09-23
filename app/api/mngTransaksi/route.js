import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mengambil data transaksi dari database
export async function GET() {
    const transactions = await prisma.transaction.findMany();

    return Response.json(transactions);
}

// Membuat data transaksi baru di database
export async function POST(request) {
    const body = await request.json();

    const transaction = await prisma.transaction.create({
        data: {
            type: body.type,
            amount: body.amount,
            date: body.date,
            description: body.description,
            userId: body.userId
        }
    });

    return Response.json(transaction);
}

// Mengedit data transaksi yang sudah ada di database
export async function PUT(request) {
    const body = await request.json();

    const transaction = await prisma.transaction.update({
        where: {
            id: body.id
        },
        data: {
            type: body.type,
            amount: body.amount,
            date: body.date,
            description: body.description
        }
    });

    return Response.json(transaction);
}


