export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { recalculateCoachRating } from "@/lib/reviewUtils";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; coachProfileId?: string };
    if (!user.coachProfileId) {
      return NextResponse.json({ error: "Coach profile required" }, { status: 403 });
    }

    const { id } = params;

    const ensembleReview = await prisma.ensembleReview.findUnique({
      where: { id },
      include: {
        ensembleProfile: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!ensembleReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (ensembleReview.coachProfileId !== user.coachProfileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ensembleReview.status !== "pending") {
      return NextResponse.json({ error: "This review has already been processed" }, { status: 400 });
    }

    const body = await request.json();
    const validation = approveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { action } = validation.data;

    if (action === "reject") {
      await prisma.ensembleReview.update({
        where: { id },
        data: { status: "rejected" },
      });
      return NextResponse.json({ success: true });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const invite = await prisma.reviewInvite.create({
      data: {
        coachProfileId: ensembleReview.coachProfileId,
        ensembleEmail: ensembleReview.ensembleProfile.user.email.toLowerCase(),
        ensembleName: ensembleReview.ensembleProfile.ensembleName,
        ensembleProfileId: ensembleReview.ensembleProfileId,
        status: "completed",
        expiresAt,
      },
    });

    await prisma.review.create({
      data: {
        inviteId: invite.id,
        reviewerId: ensembleReview.ensembleProfileId,
        coachProfileId: ensembleReview.coachProfileId,
        rating: ensembleReview.rating,
        reviewText: ensembleReview.reviewText,
        sessionMonth: ensembleReview.sessionMonth,
        sessionYear: ensembleReview.sessionYear,
        sessionFormat: ensembleReview.sessionFormat,
        validatedSkills: ensembleReview.validatedSkills,
      },
    });

    await prisma.ensembleReview.update({
      where: { id },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    const validatedSkills: string[] = JSON.parse(ensembleReview.validatedSkills || "[]");
    if (validatedSkills.length > 0) {
      const skillRecords = await prisma.skill.findMany({
        where: { name: { in: validatedSkills } },
      });
      const skillIds = skillRecords.map(s => s.id);
      if (skillIds.length > 0) {
        await prisma.coachSkill.updateMany({
          where: {
            coachProfileId: ensembleReview.coachProfileId,
            skillId: { in: skillIds },
          },
          data: {
            endorsementCount: { increment: 1 },
          },
        });
      }
    }

    await recalculateCoachRating(ensembleReview.coachProfileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ensemble approve/reject error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
