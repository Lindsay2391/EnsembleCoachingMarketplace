export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        fullName: true,
        city: true,
        state: true,
        verified: true,
        approved: true,
      },
    });

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error("Error fetching coach profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
