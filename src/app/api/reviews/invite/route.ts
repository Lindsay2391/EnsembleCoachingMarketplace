export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteSchema = z.object({
  ensembleProfileId: z.string().min(1, "Ensemble selection is required"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; coachProfileId?: string };
    if (!user.coachProfileId) {
      return NextResponse.json({ error: "Coach profile required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = inviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { ensembleProfileId } = validation.data;

    const ensemble = await prisma.ensembleProfile.findUnique({
      where: { id: ensembleProfileId },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!ensemble) {
      return NextResponse.json({ error: "Ensemble not found on CoachConnect" }, { status: 404 });
    }

    if (ensemble.user.id === user.id) {
      return NextResponse.json({ error: "You cannot send a review invite to your own ensemble" }, { status: 400 });
    }

    const existing = await prisma.reviewInvite.findFirst({
      where: {
        coachProfileId: user.coachProfileId,
        ensembleProfileId: ensembleProfileId,
        status: "pending",
      },
    });

    if (existing) {
      return NextResponse.json({ error: "A pending invite already exists for this ensemble" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const invite = await prisma.reviewInvite.create({
      data: {
        coachProfileId: user.coachProfileId,
        ensembleEmail: ensemble.user.email.toLowerCase(),
        ensembleName: ensemble.ensembleName,
        ensembleProfileId: ensemble.id,
        expiresAt,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; coachProfileId?: string };
    if (!user.coachProfileId) {
      return NextResponse.json({ error: "Coach profile required" }, { status: 403 });
    }

    const invites = await prisma.reviewInvite.findMany({
      where: { coachProfileId: user.coachProfileId },
      include: {
        review: {
          select: { rating: true, reviewText: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Fetch invites error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
