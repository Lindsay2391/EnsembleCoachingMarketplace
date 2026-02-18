export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const REVIEW_COOLDOWN_MONTHS = 9;

const ensembleSubmitSchema = z.object({
  coachProfileId: z.string().min(1),
  ensembleProfileId: z.string().min(1),
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

    const user = session.user as { id: string; ensembleProfileIds?: string[] };

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    });
    if (!dbUser?.emailVerified) {
      return NextResponse.json({ error: "You must verify your email before submitting reviews" }, { status: 403 });
    }

    if (!user.ensembleProfileIds || user.ensembleProfileIds.length === 0) {
      return NextResponse.json({ error: "Ensemble profile required to submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const validation = ensembleSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { coachProfileId, ensembleProfileId, rating, reviewText, sessionMonth, sessionYear, sessionFormat, validatedSkills } = validation.data;

    if (!user.ensembleProfileIds.includes(ensembleProfileId)) {
      return NextResponse.json({ error: "This ensemble profile does not belong to you" }, { status: 403 });
    }

    const coach = await prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      select: { id: true, approved: true, userId: true },
    });

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    if (!coach.approved) {
      return NextResponse.json({ error: "This coach profile is not yet approved" }, { status: 400 });
    }

    if (coach.userId === user.id) {
      return NextResponse.json({ error: "You cannot review your own coach profile" }, { status: 400 });
    }

    const existingPending = await prisma.ensembleReview.findFirst({
      where: {
        ensembleProfileId,
        coachProfileId,
        status: "pending",
      },
    });

    if (existingPending) {
      return NextResponse.json({ error: "You already have a pending review for this coach" }, { status: 400 });
    }

    const cooldownDate = new Date();
    cooldownDate.setMonth(cooldownDate.getMonth() - REVIEW_COOLDOWN_MONTHS);

    const recentReview = await prisma.ensembleReview.findFirst({
      where: {
        ensembleProfileId,
        coachProfileId,
        status: "approved",
        createdAt: { gte: cooldownDate },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentReview) {
      const nextDate = new Date(recentReview.createdAt);
      nextDate.setMonth(nextDate.getMonth() + REVIEW_COOLDOWN_MONTHS);
      const monthsLeft = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      return NextResponse.json({
        error: `You can submit an updated review in ${monthsLeft} month${monthsLeft !== 1 ? "s" : ""}`,
      }, { status: 400 });
    }

    const recentApprovedReview = await prisma.review.findFirst({
      where: {
        reviewerId: ensembleProfileId,
        coachProfileId,
        createdAt: { gte: cooldownDate },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentApprovedReview) {
      const nextDate = new Date(recentApprovedReview.createdAt);
      nextDate.setMonth(nextDate.getMonth() + REVIEW_COOLDOWN_MONTHS);
      const monthsLeft = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      return NextResponse.json({
        error: `You can submit an updated review in ${monthsLeft} month${monthsLeft !== 1 ? "s" : ""}`,
      }, { status: 400 });
    }

    await prisma.ensembleReview.create({
      data: {
        ensembleProfileId,
        coachProfileId,
        rating,
        reviewText: reviewText ?? null,
        sessionMonth,
        sessionYear,
        sessionFormat,
        validatedSkills: JSON.stringify(validatedSkills),
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Ensemble submit review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
