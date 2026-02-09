export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  inviteId: z.string().min(1, "Invite ID is required"),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().optional(),
  sessionMonth: z.number().int().min(1).max(12),
  sessionYear: z.number().int().min(2020).max(2030),
  sessionFormat: z.enum(["in_person", "virtual"]),
  validatedSkills: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; email: string };

    const userEnsembles = await prisma.ensembleProfile.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    if (userEnsembles.length === 0) {
      return NextResponse.json({ error: "Ensemble profile required to submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { inviteId, rating, reviewText, sessionMonth, sessionYear, sessionFormat, validatedSkills } = validation.data;

    const invite = await prisma.reviewInvite.findUnique({
      where: { id: inviteId },
      include: { review: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.ensembleEmail !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: "This invite is not for your account" }, { status: 403 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite has already been used or expired" }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      await prisma.reviewInvite.update({
        where: { id: inviteId },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
    }

    if (invite.review) {
      return NextResponse.json({ error: "Review already submitted for this invite" }, { status: 400 });
    }

    const userEnsembleIds = userEnsembles.map(e => e.id);
    let reviewerId = userEnsembles[0].id;
    if (invite.ensembleProfileId && userEnsembleIds.includes(invite.ensembleProfileId)) {
      reviewerId = invite.ensembleProfileId;
    }

    const review = await prisma.review.create({
      data: {
        inviteId,
        reviewerId,
        coachProfileId: invite.coachProfileId,
        rating,
        reviewText: reviewText ?? null,
        sessionMonth,
        sessionYear,
        sessionFormat,
        validatedSkills: JSON.stringify(validatedSkills),
      },
    });

    await prisma.reviewInvite.update({
      where: { id: inviteId },
      data: {
        status: "completed",
        ensembleProfileId: reviewerId,
      },
    });

    if (validatedSkills.length > 0) {
      const skillRecords = await prisma.skill.findMany({
        where: { name: { in: validatedSkills } },
      });

      const skillIds = skillRecords.map(s => s.id);

      if (skillIds.length > 0) {
        await prisma.coachSkill.updateMany({
          where: {
            coachProfileId: invite.coachProfileId,
            skillId: { in: skillIds },
          },
          data: {
            endorsementCount: { increment: 1 },
          },
        });
      }
    }

    const allReviews = await prisma.review.findMany({
      where: { coachProfileId: invite.coachProfileId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.coachProfile.update({
      where: { id: invite.coachProfileId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
