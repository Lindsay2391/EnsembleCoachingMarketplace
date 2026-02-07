import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ensemble = await prisma.ensembleProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ensemble) {
      return NextResponse.json(
        { error: "Ensemble not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ensemble);
  } catch (error) {
    console.error("Get ensemble error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const user = session.user as { id: string; userType: string };

    const ensemble = await prisma.ensembleProfile.findUnique({
      where: { id },
    });

    if (!ensemble) {
      return NextResponse.json(
        { error: "Ensemble not found" },
        { status: 404 }
      );
    }

    if (ensemble.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own ensemble profile" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.ensembleName !== undefined) updateData.ensembleName = body.ensembleName;
    if (body.ensembleType !== undefined) updateData.ensembleType = body.ensembleType;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.genres !== undefined) updateData.genres = JSON.stringify(body.genres);
    if (body.experienceLevel !== undefined) updateData.experienceLevel = body.experienceLevel;

    const updated = await prisma.ensembleProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update ensemble error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
