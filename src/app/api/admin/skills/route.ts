import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: "asc" },
        { isCustom: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: { select: { coachSkills: true } },
      },
    });

    return NextResponse.json(
      skills.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        isCustom: s.isCustom,
        showInFilter: s.showInFilter,
        coachCount: s._count.coachSkills,
        createdAt: s.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching admin skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, showInFilter } = body;

    if (!id || typeof showInFilter !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: { showInFilter },
      include: { _count: { select: { coachSkills: true } } },
    });

    const user = session.user as { id: string; name?: string };
    await logAdminAction({
      adminId: user.id,
      adminName: user.name || "Admin",
      action: showInFilter ? "skill_shown" : "skill_hidden",
      targetType: "skill",
      targetId: skill.id,
      targetName: skill.name,
      details: `${showInFilter ? "Shown" : "Hidden"} skill "${skill.name}" in filter`,
    });

    return NextResponse.json({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      isCustom: skill.isCustom,
      showInFilter: skill.showInFilter,
      coachCount: skill._count.coachSkills,
      createdAt: skill.createdAt,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Skill ID required" }, { status: 400 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: { _count: { select: { coachSkills: true } } },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (!skill.isCustom) {
      return NextResponse.json({ error: "Predefined skills cannot be deleted" }, { status: 400 });
    }

    await prisma.coachSkill.deleteMany({ where: { skillId: id } });
    await prisma.skill.delete({ where: { id } });

    const user = session.user as { id: string; name?: string };
    await logAdminAction({
      adminId: user.id,
      adminName: user.name || "Admin",
      action: "skill_deleted",
      targetType: "skill",
      targetId: skill.id,
      targetName: skill.name,
      details: `Deleted skill "${skill.name}" (${skill.category})${skill.isCustom ? " [custom]" : ""}, was used by ${skill._count.coachSkills} coaches`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
