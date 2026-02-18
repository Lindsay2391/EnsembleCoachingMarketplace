export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { recalculateCoachRating } from "@/lib/reviewUtils";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; name?: string; userType?: string };
    if (user.userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        coachProfile: { select: { id: true, fullName: true } },
        reviewer: { select: { ensembleName: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.reviewInvite.update({
      where: { id: review.inviteId },
      data: { status: "pending", ensembleProfileId: null },
    });

    await prisma.review.delete({ where: { id } });

    await recalculateCoachRating(review.coachProfileId);

    await logAdminAction({
      adminId: user.id,
      adminName: user.name || "Admin",
      action: "review_deleted",
      targetType: "review",
      targetId: id,
      targetName: `Review by ${review.reviewer.ensembleName} for ${review.coachProfile.fullName}`,
      details: `Rating: ${review.rating}/5`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
