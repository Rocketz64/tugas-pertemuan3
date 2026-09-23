import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const genericError = { error: "Email atau password salah." };

    if (!user) {
      return NextResponse.json(genericError, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(genericError, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}