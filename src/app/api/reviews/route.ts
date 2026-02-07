import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().optional(),
  preparationRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  teachingRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; userType: string };
    if (user.userType !== "ensemble") {
      return NextResponse.json({ error: "Only ensembles can submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { bookingId, rating, reviewText, preparationRating, communicationRating, teachingRating, valueRating } = validation.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 });
    }

    if (booking.review) {
      return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
    }

    const ensembleProfile = await prisma.ensembleProfile.findUnique({
      where: { userId: user.id },
    });

    if (!ensembleProfile || booking.ensembleId !== ensembleProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: ensembleProfile.id,
        revieweeId: booking.coachId,
        rating,
        reviewText: reviewText ?? null,
        preparationRating: preparationRating ?? null,
        communicationRating: communicationRating ?? null,
        teachingRating: teachingRating ?? null,
        valueRating: valueRating ?? null,
      },
    });

    // Update coach average rating
    const allReviews = await prisma.review.findMany({
      where: { revieweeId: booking.coachId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length;

    await prisma.coachProfile.update({
      where: { id: booking.coachId },
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
