import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.ensembleProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        ensembleName: true,
        ensembleType: true,
        city: true,
        state: true,
        size: true,
      },
    });

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error("Get ensemble profile error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
