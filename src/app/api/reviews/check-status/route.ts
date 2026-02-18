export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REVIEW_COOLDOWN_MONTHS = 9;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; ensembleProfileIds?: string[] };
    const url = new URL(request.url);
    const coachProfileId = url.searchParams.get("coachId");

    if (!coachProfileId) {
      return NextResponse.json({ error: "coachId is required" }, { status: 400 });
    }

    if (!user.ensembleProfileIds || user.ensembleProfileIds.length === 0) {
      return NextResponse.json({ status: "no_ensemble" });
    }

    const cooldownDate = new Date();
    cooldownDate.setMonth(cooldownDate.getMonth() - REVIEW_COOLDOWN_MONTHS);

    const statuses: Record<string, { status: string; cooldownUntil?: string }> = {};

    for (const ensembleId of user.ensembleProfileIds) {
      const pendingEnsembleReview = await prisma.ensembleReview.findFirst({
        where: {
          ensembleProfileId: ensembleId,
          coachProfileId,
          status: "pending",
        },
      });

      if (pendingEnsembleReview) {
        statuses[ensembleId] = { status: "pending" };
        continue;
      }

      const recentEnsembleReview = await prisma.ensembleReview.findFirst({
        where: {
          ensembleProfileId: ensembleId,
          coachProfileId,
          status: "approved",
          createdAt: { gte: cooldownDate },
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentEnsembleReview) {
        const nextDate = new Date(recentEnsembleReview.createdAt);
        nextDate.setMonth(nextDate.getMonth() + REVIEW_COOLDOWN_MONTHS);
        statuses[ensembleId] = { status: "cooldown", cooldownUntil: nextDate.toISOString() };
        continue;
      }

      const recentInviteReview = await prisma.review.findFirst({
        where: {
          reviewerId: ensembleId,
          coachProfileId,
          createdAt: { gte: cooldownDate },
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentInviteReview) {
        const nextDate = new Date(recentInviteReview.createdAt);
        nextDate.setMonth(nextDate.getMonth() + REVIEW_COOLDOWN_MONTHS);
        statuses[ensembleId] = { status: "cooldown", cooldownUntil: nextDate.toISOString() };
        continue;
      }

      const anyPastReview = await prisma.review.findFirst({
        where: {
          reviewerId: ensembleId,
          coachProfileId,
        },
      });

      const anyPastEnsembleReview = await prisma.ensembleReview.findFirst({
        where: {
          ensembleProfileId: ensembleId,
          coachProfileId,
          status: "approved",
        },
      });

      if (anyPastReview || anyPastEnsembleReview) {
        statuses[ensembleId] = { status: "can_update" };
      } else {
        statuses[ensembleId] = { status: "can_review" };
      }
    }

    const allStatuses = Object.values(statuses);
    const canReviewOrUpdate = allStatuses.some(s => s.status === "can_review" || s.status === "can_update");
    const allPending = allStatuses.every(s => s.status === "pending");
    const allCooldown = allStatuses.every(s => s.status === "cooldown");

    if (canReviewOrUpdate) {
      const hasUpdate = allStatuses.some(s => s.status === "can_update");
      return NextResponse.json({
        status: hasUpdate ? "can_update" : "can_review",
        ensembleStatuses: statuses,
      });
    }

    if (allPending) {
      return NextResponse.json({ status: "pending", ensembleStatuses: statuses });
    }

    if (allCooldown) {
      const earliest = allStatuses
        .filter(s => s.cooldownUntil)
        .map(s => new Date(s.cooldownUntil!).getTime())
        .sort((a, b) => a - b)[0];
      const monthsLeft = Math.ceil((earliest - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      return NextResponse.json({
        status: "cooldown",
        monthsLeft: Math.max(1, monthsLeft),
        ensembleStatuses: statuses,
      });
    }

    const cooldowns = allStatuses.filter(s => s.cooldownUntil);
    if (cooldowns.length > 0) {
      const earliest = cooldowns
        .map(s => new Date(s.cooldownUntil!).getTime())
        .sort((a, b) => a - b)[0];
      const monthsLeft = Math.ceil((earliest - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      return NextResponse.json({
        status: "cooldown",
        monthsLeft: Math.max(1, monthsLeft),
        ensembleStatuses: statuses,
      });
    }

    return NextResponse.json({ status: "pending", ensembleStatuses: statuses });
  } catch (error) {
    console.error("Check review status error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
