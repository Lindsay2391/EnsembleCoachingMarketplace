import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ensembleSchema = z.object({
  ensembleName: z.string().min(1, "Ensemble name is required"),
  ensembleType: z.string().min(1, "Ensemble type is required"),
  size: z.number().int().positive("Size must be a positive number"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user as { id: string };

    const body = await request.json();

    const validation = ensembleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { ensembleName, ensembleType, size, city, state, genres, experienceLevel } =
      validation.data;

    const existingDuplicate = await prisma.ensembleProfile.findFirst({
      where: { ensembleName, state },
    });

    if (existingDuplicate) {
      return NextResponse.json(
        { error: "An ensemble with this name already exists in that state" },
        { status: 400 }
      );
    }

    const ensemble = await prisma.ensembleProfile.create({
      data: {
        userId: user.id,
        ensembleName,
        ensembleType,
        size,
        city,
        state,
        genres: JSON.stringify(genres),
        experienceLevel,
      },
    });

    return NextResponse.json(ensemble, { status: 201 });
  } catch (error) {
    console.error("Create ensemble error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
