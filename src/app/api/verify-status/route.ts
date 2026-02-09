export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: { emailVerified: true },
    });

    return NextResponse.json({ emailVerified: user?.emailVerified || false });
  } catch (error) {
    console.error("Verify status error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
