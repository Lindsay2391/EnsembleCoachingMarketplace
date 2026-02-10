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

    const user = session.user as { id: string; coachProfileId?: string };
    if (!user.coachProfileId) {
      return NextResponse.json({ error: "Coach profile required" }, { status: 403 });
    }

    const pendingReviews = await prisma.ensembleReview.findMany({
      where: {
        coachProfileId: user.coachProfileId,
        status: "pending",
      },
      select: {
        id: true,
        sessionMonth: true,
        sessionYear: true,
        sessionFormat: true,
        createdAt: true,
        ensembleProfile: {
          select: {
            ensembleName: true,
            ensembleType: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pendingReviews);
  } catch (error) {
    console.error("Fetch ensemble pending reviews error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
