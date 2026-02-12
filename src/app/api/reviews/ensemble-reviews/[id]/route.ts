export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; ensembleProfileIds?: string[] };
    const { id } = params;

    const review = await prisma.ensembleReview.findUnique({
      where: { id },
      include: {
        coachProfile: {
          select: {
            id: true,
            fullName: true,
            city: true,
            state: true,
            country: true,
            photoUrl: true,
            coachSkills: {
              include: { skill: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
        ensembleProfile: {
          select: { id: true, ensembleName: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (!user.ensembleProfileIds?.includes(review.ensembleProfileId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Fetch ensemble review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().optional(),
  sessionMonth: z.number().int().min(1).max(12),
  sessionYear: z.number().int().min(2020).max(2030),
  sessionFormat: z.enum(["in_person", "virtual"]),
  validatedSkills: z.array(z.string()).default([]),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; ensembleProfileIds?: string[] };
    const { id } = params;

    const review = await prisma.ensembleReview.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (!user.ensembleProfileIds?.includes(review.ensembleProfileId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (review.status !== "pending") {
      return NextResponse.json({ error: "Only pending reviews can be edited" }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { rating, reviewText, sessionMonth, sessionYear, sessionFormat, validatedSkills } = validation.data;

    const updated = await prisma.ensembleReview.update({
      where: { id },
      data: {
        rating,
        reviewText: reviewText ?? null,
        sessionMonth,
        sessionYear,
        sessionFormat,
        validatedSkills: JSON.stringify(validatedSkills),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update ensemble review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; ensembleProfileIds?: string[] };
    const { id } = params;

    const review = await prisma.ensembleReview.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (!user.ensembleProfileIds?.includes(review.ensembleProfileId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (review.status !== "pending") {
      return NextResponse.json({ error: "Only pending reviews can be recalled" }, { status: 400 });
    }

    await prisma.ensembleReview.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete ensemble review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
