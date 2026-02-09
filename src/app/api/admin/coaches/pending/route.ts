export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const pendingCoaches = await prisma.coachProfile.findMany({
      where: { approved: false },
      include: {
        user: { select: { email: true, name: true, createdAt: true } },
        coachSkills: {
          include: { skill: true },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pendingCoaches);
  } catch (error) {
    console.error("Get pending coaches error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
