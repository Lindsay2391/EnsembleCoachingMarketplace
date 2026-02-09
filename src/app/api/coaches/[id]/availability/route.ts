export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const updateAvailabilitySchema = z.object({
  availability: z.record(z.string(), z.unknown()),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const coach = await prisma.coachProfile.findUnique({
      where: { id },
      select: { id: true, availability: true },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    const availability = coach.availability
      ? JSON.parse(coach.availability)
      : null;

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    const coach = await prisma.coachProfile.findUnique({
      where: { id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    if (coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own availability" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = updateAvailabilitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedCoach = await prisma.coachProfile.update({
      where: { id },
      data: {
        availability: JSON.stringify(validation.data.availability),
      },
      select: { id: true, availability: true },
    });

    return NextResponse.json({
      availability: updatedCoach.availability
        ? JSON.parse(updatedCoach.availability)
        : null,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
