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
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.ensembleReview.count({
      where: {
        coachProfileId: user.coachProfileId,
        status: "pending",
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Fetch ensemble pending count error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
