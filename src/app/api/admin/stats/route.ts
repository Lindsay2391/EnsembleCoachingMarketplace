export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { userType?: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [totalUsers, totalCoaches, pendingApprovals, verifiedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.coachProfile.count(),
      prisma.coachProfile.count({ where: { approved: false } }),
      prisma.user.count({ where: { emailVerified: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalCoaches,
      pendingApprovals,
      verifiedUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
