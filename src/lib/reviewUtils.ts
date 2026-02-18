import { prisma } from "@/lib/prisma";

export async function recalculateCoachRating(coachProfileId: string) {
  const allReviews = await prisma.review.findMany({
    where: { coachProfileId },
    select: { rating: true, reviewerId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const latestByEnsemble = new Map<string, number>();
  for (const review of allReviews) {
    if (!latestByEnsemble.has(review.reviewerId)) {
      latestByEnsemble.set(review.reviewerId, review.rating);
    }
  }

  const ratings = Array.from(latestByEnsemble.values());
  const totalReviews = ratings.length;
  const avgRating = totalReviews > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / totalReviews) * 10) / 10
    : 0;

  await prisma.coachProfile.update({
    where: { id: coachProfileId },
    data: { rating: avgRating, totalReviews },
  });
}
