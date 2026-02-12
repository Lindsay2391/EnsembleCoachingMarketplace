export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.ensembleEmail !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite is no longer pending" }, { status: 400 });
    }

    await prisma.reviewInvite.update({
      where: { id },
      data: { status: "declined" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Decline invite error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
