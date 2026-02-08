import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

export async function PUT(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const coach = await prisma.coachProfile.findUnique({
      where: { id: params.id },
    });

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    const updated = await prisma.coachProfile.update({
      where: { id: params.id },
      data: { approved: true },
    });

    await logAdminAction({
      adminId: session.user.id,
      adminName: session.user.name || "Unknown",
      action: "coach_approved",
      targetType: "coach",
      targetId: params.id,
      targetName: coach.fullName,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Approve coach error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
