export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      include: {
        coach: true,
        ensemble: true,
        messages: true,
      },
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
        { error: "You do not have access to this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
