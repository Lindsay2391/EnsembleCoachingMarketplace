export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { userType?: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    if (typeof body.emailVerified !== "boolean") {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        coachProfile: { select: { id: true } },
        ensembleProfiles: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: { emailVerified: boolean; verificationToken?: null } = {
      emailVerified: body.emailVerified,
    };
    if (body.emailVerified) {
      updateData.verificationToken = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        emailVerified: true,
        createdAt: true,
        coachProfile: { select: { id: true } },
        ensembleProfiles: { select: { id: true } },
      },
    });

    if (body.emailVerified && user.coachProfile) {
      await prisma.coachProfile.update({
        where: { id: user.coachProfile.id },
        data: { verified: true },
      });
    }

    if (!body.emailVerified && user.coachProfile) {
      await prisma.coachProfile.update({
        where: { id: user.coachProfile.id },
        data: { verified: false },
      });
    }

    await logAdminAction({
      adminId: session.user.id,
      adminName: session.user.name || "Unknown",
      action: body.emailVerified ? "user_verified" : "user_unverified",
      targetType: "user",
      targetId: params.id,
      targetName: user.name,
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      emailVerified: updatedUser.emailVerified,
      hasCoachProfile: !!updatedUser.coachProfile,
      hasEnsembleProfile: updatedUser.ensembleProfiles.length > 0,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

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
        ensembleProfiles: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (user.coachProfile) {
        await tx.review.deleteMany({ where: { coachProfileId: user.coachProfile.id } });
        await tx.booking.deleteMany({ where: { coachId: user.coachProfile.id } });
        await tx.coachProfile.delete({ where: { id: user.coachProfile.id } });
      }

      for (const ep of user.ensembleProfiles) {
        await tx.review.deleteMany({ where: { reviewerId: ep.id } });
        await tx.booking.deleteMany({ where: { ensembleId: ep.id } });
        await tx.reviewInvite.deleteMany({ where: { ensembleProfileId: ep.id } });
        await tx.ensembleProfile.delete({ where: { id: ep.id } });
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
