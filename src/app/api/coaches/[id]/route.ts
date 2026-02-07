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
  experienceLevels: z.array(z.string()).optional(),
  rateHourly: z.number().positive().optional().nullable(),
  rateHalfDay: z.number().positive().optional().nullable(),
  rateFullDay: z.number().positive().optional().nullable(),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
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
    if (data.experienceLevels !== undefined) updateData.experienceLevels = JSON.stringify(data.experienceLevels);
    if (data.rateHourly !== undefined) updateData.rateHourly = data.rateHourly;
    if (data.rateHalfDay !== undefined) updateData.rateHalfDay = data.rateHalfDay;
    if (data.rateFullDay !== undefined) updateData.rateFullDay = data.rateFullDay;
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
      },
    });

    return NextResponse.json(updatedCoach);
  } catch (error) {
    console.error("Error updating coach profile:", error);
    return NextResponse.json(
      { error: "Failed to update coach profile" },
      { status: 500 }
    );
  }
}
