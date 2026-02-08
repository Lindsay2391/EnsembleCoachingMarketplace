import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { isCustom: "asc" },
        { category: "asc" },
        { name: "asc" },
      ],
      include: {
        coachSkills: {
          select: {
            endorsementCount: true,
          },
        },
      },
    });

    const grouped: Record<string, Array<{
      id: string;
      name: string;
      category: string;
      isCustom: boolean;
      totalEndorsements: number;
    }>> = {};

    for (const skill of skills) {
      const totalEndorsements = skill.coachSkills.reduce(
        (sum, cs) => sum + cs.endorsementCount,
        0
      );

      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }

      grouped[skill.category].push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        isCustom: skill.isCustom,
        totalEndorsements,
      });
    }

    return NextResponse.json({ skills: grouped });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, category } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.skill.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" as const },
        category: { equals: category.trim(), mode: "insensitive" as const },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A skill with this name already exists in this category" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        isCustom: true,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
