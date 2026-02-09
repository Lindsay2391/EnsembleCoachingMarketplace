export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; userType?: string };
    if (user.userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        coachProfile: {
          select: { id: true, fullName: true },
        },
        reviewer: {
          select: { ensembleName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
