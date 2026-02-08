import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { userType?: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const data: { approved?: boolean; verified?: boolean } = {};

    if (typeof body.approved === "boolean") data.approved = body.approved;
    if (typeof body.verified === "boolean") data.verified = body.verified;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const coach = await prisma.coachProfile.findUnique({
      where: { id: params.id },
    });

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    const updated = await prisma.coachProfile.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update coach error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { userType?: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coach = await prisma.coachProfile.findUnique({
      where: { id: params.id },
    });

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { revieweeId: params.id } });
      await tx.booking.deleteMany({ where: { coachId: params.id } });
      await tx.coachProfile.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete coach error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
