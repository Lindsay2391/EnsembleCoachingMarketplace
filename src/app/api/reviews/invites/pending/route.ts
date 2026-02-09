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

    const user = session.user as { id: string; email: string };

    const invites = await prisma.reviewInvite.findMany({
      where: {
        ensembleEmail: user.email?.toLowerCase(),
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        coachProfile: {
          select: {
            id: true,
            fullName: true,
            photoUrl: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Fetch pending invites error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
