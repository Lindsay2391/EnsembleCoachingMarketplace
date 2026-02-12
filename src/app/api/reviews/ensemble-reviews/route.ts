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

    const user = session.user as { id: string; ensembleProfileIds?: string[] };

    if (!user.ensembleProfileIds || user.ensembleProfileIds.length === 0) {
      return NextResponse.json([]);
    }

    const reviews = await prisma.ensembleReview.findMany({
      where: {
        ensembleProfileId: { in: user.ensembleProfileIds },
      },
      include: {
        coachProfile: {
          select: {
            id: true,
            fullName: true,
            city: true,
            state: true,
            country: true,
            photoUrl: true,
          },
        },
        ensembleProfile: {
          select: {
            id: true,
            ensembleName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Fetch ensemble reviews error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
