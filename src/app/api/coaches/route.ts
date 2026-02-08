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
  ensembleTypes: z.array(z.string()).default([]),
  experienceLevels: z.array(z.string()).default([]),
  contactMethod: z.enum(["phone", "email", "website"]),
  contactDetail: z.string().min(1, "Contact detail is required"),
  rateHourly: z.number().positive().optional(),
  rateHalfDay: z.number().positive().optional(),
  rateFullDay: z.number().positive().optional(),
  ratesOnEnquiry: z.boolean().optional(),
  currency: z.string().optional(),
  photoUrl: z.string().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  cancellationPolicy: z.string().optional(),
  travelSupplement: z.number().min(0).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const skills = searchParams.get("skills");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const experienceLevel = searchParams.get("experienceLevel");
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "12", 10)));

    const skip = (page - 1) * limit;

    const skillsList = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      approved: true,
    };

    if (skillsList.length > 0) {
      where.OR = skillsList.map(skill => ({ specialties: { contains: skill } }));
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
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: [
            { fullName: { contains: search } },
            { bio: { contains: search } },
          ] },
        ];
        delete where.OR;
      } else {
        where.OR = [
          { fullName: { contains: search } },
          { bio: { contains: search } },
        ];
      }
    }

    const [allCoaches, total] = await Promise.all([
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
      }),
      prisma.coachProfile.count({ where }),
    ]);

    let sortedCoaches = allCoaches;
    if (skillsList.length > 1) {
      sortedCoaches = allCoaches
        .map(coach => {
          const coachSkills: string[] = (() => { try { return JSON.parse(coach.specialties); } catch { return []; } })();
          const matchCount = skillsList.filter(skill => coachSkills.includes(skill)).length;
          return { ...coach, matchCount };
        })
        .sort((a, b) => b.matchCount - a.matchCount || b.rating - a.rating);
    }

    const paginatedCoaches = sortedCoaches.slice(skip, skip + limit);

    return NextResponse.json({
      coaches: paginatedCoaches,
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

    const d = validation.data;

    const coach = await prisma.coachProfile.create({
      data: {
        userId: session.user.id,
        fullName: d.fullName,
        city: d.city,
        state: d.state,
        bio: d.bio,
        specialties: JSON.stringify(d.specialties),
        ensembleTypes: JSON.stringify(d.ensembleTypes),
        experienceLevels: JSON.stringify(d.experienceLevels),
        contactMethod: d.contactMethod ?? null,
        contactDetail: d.contactDetail ?? null,
        rateHourly: d.rateHourly ?? null,
        rateHalfDay: d.rateHalfDay ?? null,
        rateFullDay: d.rateFullDay ?? null,
        ratesOnEnquiry: d.ratesOnEnquiry ?? false,
        currency: d.currency ?? "AUD",
        photoUrl: d.photoUrl || null,
        videoUrl: d.videoUrl || null,
        cancellationPolicy: d.cancellationPolicy ?? null,
        travelSupplement: d.travelSupplement ?? null,
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
