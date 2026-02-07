import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bookingSchema = z.object({
  coachId: z.string().min(1, "Coach ID is required"),
  proposedDates: z
    .array(z.string())
    .min(1, "At least one proposed date is required"),
  sessionType: z.enum(["hourly", "half_day", "full_day"], {
    error: "Session type must be 'hourly', 'half_day', or 'full_day'",
  }),
  goals: z.string().optional(),
  specialRequests: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user as { id: string; userType: string };
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    if (user.userType === "coach") {
      const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: user.id },
      });

      if (!coachProfile) {
        return NextResponse.json(
          { error: "Coach profile not found" },
          { status: 404 }
        );
      }

      where.coachId = coachProfile.id;
    } else {
      const ensembleProfile = await prisma.ensembleProfile.findUnique({
        where: { userId: user.id },
      });

      if (!ensembleProfile) {
        return NextResponse.json(
          { error: "Ensemble profile not found" },
          { status: 404 }
        );
      }

      where.ensembleId = ensembleProfile.id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        coach: true,
        ensemble: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user as { id: string; userType: string };

    if (user.userType !== "ensemble") {
      return NextResponse.json(
        { error: "Only ensemble users can create bookings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { coachId, proposedDates, sessionType, goals, specialRequests } =
      validation.data;

    const ensembleProfile = await prisma.ensembleProfile.findUnique({
      where: { userId: user.id },
    });

    if (!ensembleProfile) {
      return NextResponse.json(
        { error: "Ensemble profile not found. Please create one first." },
        { status: 404 }
      );
    }

    const coach = await prisma.coachProfile.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    let rate: number;
    if (sessionType === "hourly") {
      rate = coach.rateHourly ?? 0;
    } else if (sessionType === "half_day") {
      rate = coach.rateHalfDay ?? 0;
    } else {
      rate = coach.rateFullDay ?? 0;
    }

    const totalCost = rate;

    const booking = await prisma.booking.create({
      data: {
        ensembleId: ensembleProfile.id,
        coachId,
        proposedDates: JSON.stringify(proposedDates),
        sessionType,
        rate,
        totalCost,
        goals: goals ?? null,
        specialRequests: specialRequests ?? null,
        status: "pending",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
