export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    if (!coachProfile || booking.coachId !== coachProfile.id) {
      return NextResponse.json(
        { error: "Only the assigned coach can decline this booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be declined" },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "declined",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Decline booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
