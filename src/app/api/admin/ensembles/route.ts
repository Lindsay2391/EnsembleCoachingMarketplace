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
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          ensembleName: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const ensembles = await prisma.ensembleProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ensembles);
  } catch (error) {
    console.error("Admin ensembles error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
