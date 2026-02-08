import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; coachProfileId?: string };
    if (!user.coachProfileId) {
      return NextResponse.json({ error: "Coach profile required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    const ensembles = await prisma.ensembleProfile.findMany({
      where: {
        ensembleName: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        ensembleName: true,
        ensembleType: true,
        city: true,
        state: true,
      },
      take: 10,
      orderBy: { ensembleName: "asc" },
    });

    return NextResponse.json(ensembles);
  } catch (error) {
    console.error("Search ensembles error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
