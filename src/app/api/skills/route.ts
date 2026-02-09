export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CUSTOM_SKILL_FILTER_THRESHOLD = 5;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const search = searchParams.get("search");

    if (mode === "search" && search) {
      const skills = await prisma.skill.findMany({
        where: {
          name: { contains: search, mode: "insensitive" },
        },
        include: {
          _count: { select: { coachSkills: true } },
        },
        orderBy: { name: "asc" },
        take: 20,
      });

      return NextResponse.json({
        results: skills.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          isCustom: s.isCustom,
          coachCount: s._count.coachSkills,
        })),
      });
    }

    const skills = await prisma.skill.findMany({
      orderBy: [
        { isCustom: "asc" },
        { category: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: { select: { coachSkills: true } },
        coachSkills: {
          select: {
            endorsementCount: true,
          },
        },
      },
    });

    const filterSkills: Record<string, Array<{
      id: string;
      name: string;
      category: string;
      isCustom: boolean;
      totalEndorsements: number;
      coachCount: number;
    }>> = {};

    const allSkills: Record<string, Array<{
      id: string;
      name: string;
      category: string;
      isCustom: boolean;
      totalEndorsements: number;
      coachCount: number;
    }>> = {};

    for (const skill of skills) {
      const totalEndorsements = skill.coachSkills.reduce(
        (sum, cs) => sum + cs.endorsementCount,
        0
      );
      const coachCount = skill._count.coachSkills;

      const entry = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        isCustom: skill.isCustom,
        totalEndorsements,
        coachCount,
      };

      if (!allSkills[skill.category]) {
        allSkills[skill.category] = [];
      }
      allSkills[skill.category].push(entry);

      const showInFilter = skill.showInFilter &&
        (!skill.isCustom || coachCount >= CUSTOM_SKILL_FILTER_THRESHOLD);

      if (showInFilter) {
        if (!filterSkills[skill.category]) {
          filterSkills[skill.category] = [];
        }
        filterSkills[skill.category].push(entry);
      }
    }

    return NextResponse.json({ skills: filterSkills, allSkills });
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
        showInFilter: true,
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
