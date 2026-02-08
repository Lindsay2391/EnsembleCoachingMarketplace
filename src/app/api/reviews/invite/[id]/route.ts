import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = session.user as { id: string; email: string };
    const { id } = params;

    const invite = await prisma.reviewInvite.findUnique({
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
            specialties: true,
            coachSkills: {
              include: { skill: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.ensembleEmail !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite has already been used or expired" }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      await prisma.reviewInvite.update({
        where: { id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
    }

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Fetch invite error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
