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
    const userId = (session.user as { id: string }).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Account fetch error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const name = body.name?.trim();
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { name: true, email: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

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
