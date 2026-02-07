import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const createCoachSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  bio: z.string().min(1, "Bio is required"),
  specialties: z.array(z.string()).default([]),
  experienceLevels: z.array(z.string()).default([]),
  rateHourly: z.number().positive().optional(),
  rateHalfDay: z.number().positive().optional(),
  rateFullDay: z.number().positive().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  cancellationPolicy: z.string().optional(),
  travelSupplement: z.number().min(0).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const specialty = searchParams.get("specialty");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const experienceLevel = searchParams.get("experienceLevel");
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "12", 10)));

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      approved: true,
    };

    if (specialty) {
      where.specialties = { contains: specialty };
    }

    if (state) {
      where.state = state;
    }

    if (city) {
      where.city = city;
    }

    if (experienceLevel) {
      where.experienceLevels = { contains: experienceLevel };
    }

    if (minRate || maxRate) {
      where.rateHourly = {};
      if (minRate) {
        where.rateHourly.gte = parseFloat(minRate);
      }
      if (maxRate) {
        where.rateHourly.lte = parseFloat(maxRate);
      }
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    const [coaches, total] = await Promise.all([
      prisma.coachProfile.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: [
          { rating: "desc" },
          { totalBookings: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.coachProfile.count({ where }),
    ]);

    return NextResponse.json({
      coaches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.userType !== "coach") {
      return NextResponse.json(
        { error: "Only coaches can create a coach profile" },
        { status: 403 }
      );
    }

    const existingProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Coach profile already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validation = createCoachSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      fullName,
      city,
      state,
      bio,
      specialties,
      experienceLevels,
      rateHourly,
      rateHalfDay,
      rateFullDay,
      photoUrl,
      videoUrl,
      cancellationPolicy,
      travelSupplement,
    } = validation.data;

    const coach = await prisma.coachProfile.create({
      data: {
        userId: session.user.id,
        fullName,
        city,
        state,
        bio,
        specialties: JSON.stringify(specialties),
        experienceLevels: JSON.stringify(experienceLevels),
        rateHourly: rateHourly ?? null,
        rateHalfDay: rateHalfDay ?? null,
        rateFullDay: rateFullDay ?? null,
        photoUrl: photoUrl || null,
        videoUrl: videoUrl || null,
        cancellationPolicy: cancellationPolicy ?? null,
        travelSupplement: travelSupplement ?? null,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(coach, { status: 201 });
  } catch (error) {
    console.error("Error creating coach profile:", error);
    return NextResponse.json(
      { error: "Failed to create coach profile" },
      { status: 500 }
    );
  }
}
