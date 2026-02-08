import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { userType?: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        coachProfile: { select: { id: true } },
        ensembleProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (user.coachProfile) {
        await tx.review.deleteMany({ where: { revieweeId: user.coachProfile.id } });
        await tx.booking.deleteMany({ where: { coachId: user.coachProfile.id } });
        await tx.coachProfile.delete({ where: { id: user.coachProfile.id } });
      }

      if (user.ensembleProfile) {
        await tx.review.deleteMany({ where: { reviewerId: user.ensembleProfile.id } });
        await tx.booking.deleteMany({ where: { ensembleId: user.ensembleProfile.id } });
        await tx.ensembleProfile.delete({ where: { id: user.ensembleProfile.id } });
      }

      await tx.message.deleteMany({
        where: { OR: [{ senderId: params.id }, { recipientId: params.id }] },
      });

      await tx.user.delete({ where: { id: params.id } });
    });

    await logAdminAction({
      adminId: session.user.id,
      adminName: session.user.name || "Unknown",
      action: "user_deleted",
      targetType: "user",
      targetId: params.id,
      targetName: user.name,
      details: `Email: ${user.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
