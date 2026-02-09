import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        coachProfile: { select: { id: true } },
        ensembleProfiles: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be self-deleted. Contact another admin." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (user.coachProfile) {
        await tx.reviewInvite.deleteMany({ where: { coachProfileId: user.coachProfile.id } });
        await tx.review.deleteMany({ where: { coachProfileId: user.coachProfile.id } });
        await tx.coachSkill.deleteMany({ where: { coachProfileId: user.coachProfile.id } });
        await tx.favoriteCoach.deleteMany({ where: { coachProfileId: user.coachProfile.id } });
        await tx.booking.deleteMany({ where: { coachId: user.coachProfile.id } });
        await tx.coachProfile.delete({ where: { id: user.coachProfile.id } });
      }

      for (const ep of user.ensembleProfiles) {
        await tx.review.deleteMany({ where: { reviewerId: ep.id } });
        await tx.reviewInvite.deleteMany({ where: { ensembleProfileId: ep.id } });
        await tx.booking.deleteMany({ where: { ensembleId: ep.id } });
        await tx.ensembleProfile.delete({ where: { id: ep.id } });
      }

      await tx.favoriteCoach.deleteMany({ where: { userId } });
      await tx.message.deleteMany({
        where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      });

      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
