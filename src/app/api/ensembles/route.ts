export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ensembleSchema = z.object({
  ensembleName: z.string().min(1, "Ensemble name is required"),
  ensembleType: z.string().min(1, "Ensemble type is required"),
  voiceRange: z.string().optional(),
  size: z.number().int().positive("Size must be a positive number").optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().optional(),
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

    const { ensembleName, ensembleType, voiceRange, size, city, state, country, genres, experienceLevel } =
      validation.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Your session has expired. Please log out and log back in." },
        { status: 401 }
      );
    }

    const existingDuplicate = await prisma.ensembleProfile.findFirst({
      where: { ensembleName, state, country: country || "Australia" },
    });

    if (existingDuplicate) {
      return NextResponse.json(
        { error: "An ensemble with this name already exists in that region" },
        { status: 400 }
      );
    }

    const ensemble = await prisma.ensembleProfile.create({
      data: {
        userId: user.id,
        ensembleName,
        ensembleType,
        voiceRange: voiceRange || null,
        size: size || null,
        city,
        state,
        country: country || "Australia",
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
