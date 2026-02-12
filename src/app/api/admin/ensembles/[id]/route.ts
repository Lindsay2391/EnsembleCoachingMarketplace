export const dynamic = "force-dynamic";
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

    const ensemble = await prisma.ensembleProfile.findUnique({
      where: { id: params.id },
    });

    if (!ensemble) {
      return NextResponse.json({ error: "Ensemble not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { reviewerId: params.id } });
      await tx.booking.deleteMany({ where: { ensembleId: params.id } });
      await tx.reviewInvite.deleteMany({ where: { ensembleProfileId: params.id } });
      await tx.ensembleReview.deleteMany({ where: { ensembleProfileId: params.id } });
      await tx.ensembleProfile.delete({ where: { id: params.id } });
    });

    await logAdminAction({
      adminId: session.user.id,
      adminName: session.user.name || "Unknown",
      action: "ensemble_deleted",
      targetType: "ensemble",
      targetId: params.id,
      targetName: ensemble.ensembleName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete ensemble error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
