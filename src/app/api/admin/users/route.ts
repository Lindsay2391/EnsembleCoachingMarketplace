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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          createdAt: true,
          coachProfile: { select: { id: true } },
          ensembleProfile: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      userType: u.userType,
      hasCoachProfile: !!u.coachProfile,
      hasEnsembleProfile: !!u.ensembleProfile,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: formatted, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
