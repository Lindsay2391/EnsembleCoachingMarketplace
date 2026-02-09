export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { userType?: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const [coaches, total] = await Promise.all([
      prisma.coachProfile.findMany({
        include: {
          user: { select: { id: true, email: true, name: true, createdAt: true } },
          coachSkills: {
            include: { skill: true },
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.coachProfile.count(),
    ]);

    return NextResponse.json({ coaches, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Admin coaches error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
