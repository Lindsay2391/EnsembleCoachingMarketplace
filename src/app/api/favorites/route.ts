export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const favorites = await prisma.favoriteCoach.findMany({
      where: { userId: session.user.id },
      select: { coachProfileId: true },
    });

    return NextResponse.json({
      favoriteIds: favorites.map((f) => f.coachProfileId),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { coachProfileId } = await request.json();
    if (!coachProfileId) {
      return NextResponse.json(
        { error: "coachProfileId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.favoriteCoach.findUnique({
      where: {
        userId_coachProfileId: {
          userId: session.user.id,
          coachProfileId,
        },
      },
    });

    if (existing) {
      await prisma.favoriteCoach.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favoriteCoach.create({
        data: {
          userId: session.user.id,
          coachProfileId,
        },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
