import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const updateCoachSchema = z.object({
  fullName: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  specialties: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  ensembleTypes: z.array(z.string()).optional(),
  experienceLevels: z.array(z.string()).optional(),
  contactMethod: z.enum(["phone", "email", "website"]).optional(),
  contactDetail: z.string().min(1, "Contact detail is required").optional(),
  rateHourly: z.number().positive().optional().nullable(),
  rateHalfDay: z.number().positive().optional().nullable(),
  rateFullDay: z.number().positive().optional().nullable(),
  ratesOnEnquiry: z.boolean().optional(),
  currency: z.string().optional(),
  photoUrl: z.string().optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  cancellationPolicy: z.string().optional().nullable(),
  travelSupplement: z.number().min(0).optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const coach = await prisma.coachProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        coachSkills: {
          include: {
            skill: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    await prisma.coachProfile.update({
      where: { id },
      data: { profileViews: { increment: 1 } },
    });

    return NextResponse.json({
      ...coach,
      profileViews: coach.profileViews + 1,
    });
  } catch (error) {
    console.error("Error fetching coach:", error);
    return NextResponse.json(
      { error: "Failed to fetch coach profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    const coach = await prisma.coachProfile.findUnique({
      where: { id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    if (coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = updateCoachSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.specialties !== undefined) updateData.specialties = JSON.stringify(data.specialties);
    if (data.ensembleTypes !== undefined) updateData.ensembleTypes = JSON.stringify(data.ensembleTypes);
    if (data.experienceLevels !== undefined) updateData.experienceLevels = JSON.stringify(data.experienceLevels);
    if (data.contactMethod !== undefined) updateData.contactMethod = data.contactMethod;
    if (data.contactDetail !== undefined) updateData.contactDetail = data.contactDetail;
    if (data.rateHourly !== undefined) updateData.rateHourly = data.rateHourly;
    if (data.rateHalfDay !== undefined) updateData.rateHalfDay = data.rateHalfDay;
    if (data.rateFullDay !== undefined) updateData.rateFullDay = data.rateFullDay;
    if (data.ratesOnEnquiry !== undefined) updateData.ratesOnEnquiry = data.ratesOnEnquiry;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl || null;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl || null;
    if (data.cancellationPolicy !== undefined) updateData.cancellationPolicy = data.cancellationPolicy;
    if (data.travelSupplement !== undefined) updateData.travelSupplement = data.travelSupplement;

    const updatedCoach = await prisma.coachProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        coachSkills: {
          include: { skill: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (data.skills !== undefined) {
      const skillRecords = await prisma.skill.findMany({
        where: { id: { in: data.skills } },
      });
      const validSkillIds = new Set(skillRecords.map((s) => s.id));

      await prisma.$transaction(async (tx) => {
        await tx.coachSkill.deleteMany({
          where: { coachProfileId: id },
        });

        for (let i = 0; i < data.skills!.length; i++) {
          if (validSkillIds.has(data.skills![i])) {
            await tx.coachSkill.create({
              data: {
                coachProfileId: id,
                skillId: data.skills![i],
                displayOrder: i,
              },
            });
          }
        }
      });

      const refreshed = await prisma.coachProfile.findUnique({
        where: { id },
        include: {
          user: { select: { email: true, name: true } },
          coachSkills: {
            include: { skill: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      return NextResponse.json(refreshed);
    }

    return NextResponse.json(updatedCoach);
  } catch (error) {
    console.error("Error updating coach profile:", error);
    return NextResponse.json(
      { error: "Failed to update coach profile" },
      { status: 500 }
    );
  }
}
