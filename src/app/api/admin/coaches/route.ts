import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coaches = await prisma.coachProfile.findMany({
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coaches);
  } catch (error) {
    console.error("Admin coaches error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
