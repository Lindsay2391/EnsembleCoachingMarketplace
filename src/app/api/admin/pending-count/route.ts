import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const count = await prisma.coachProfile.count({
      where: { approved: false },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
