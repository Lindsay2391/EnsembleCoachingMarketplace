import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const user = session.user as { id: string };

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: user.id },
    });

    const ensembleProfiles = await prisma.ensembleProfile.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const isCoach = coachProfile && booking.coachId === coachProfile.id;
    const isEnsemble =
      ensembleProfiles.some(ep => booking.ensembleId === ep.id);

    if (!isCoach && !isEnsemble) {
      return NextResponse.json(
        { error: "You do not have permission to cancel this booking" },
        { status: 403 }
      );
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json(
        { error: "This booking cannot be cancelled" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = cancelSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    const cancelledBy = isCoach ? "coach" : "ensemble";

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancellationReason: reason ?? null,
        cancelledBy,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
