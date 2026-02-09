export const dynamic = "force-dynamic";
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
  skills: z.array(z.string()).optional(),
  ensembleTypes: z.array(z.string()).default([]),
  experienceLevels: z.array(z.string()).default([]),
  contactMethod: z.enum(["phone", "email", "website"]),
  contactDetail: z.string().min(1, "Contact detail is required"),
  rateHourly: z.number().positive().optional().nullable(),
  rateHalfDay: z.number().positive().optional().nullable(),
  rateFullDay: z.number().positive().optional().nullable(),
  ratesOnEnquiry: z.boolean().optional(),
  currency: z.string().optional(),
  photoUrl: z.string().optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  cancellationPolicy: z.string().optional().nullable(),
  travelSupplement: z.number().min(0).optional().nullable(),
  country: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);

    const skills = searchParams.get("skills");
    const country = searchParams.get("country");
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
      where.coachSkills = {
        some: {
          skill: {
            name: { in: skillsList },
          },
        },
      };
    }

    if (country) {
      where.country = country;
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
      const searchCondition = {
        OR: [
          { fullName: { contains: search } },
          { bio: { contains: search } },
        ],
      };
      if (where.coachSkills) {
        where.AND = [searchCondition];
      } else {
        where.OR = searchCondition.OR;
      }
    }

    const favoriteIds = new Set<string>();
    let ensembleProfile: { ensembleType: string; experienceLevel: string; state: string; city: string; country: string } | null = null;

    if (session?.user?.id) {
      const [favs, ensembles] = await Promise.all([
        prisma.favoriteCoach.findMany({
          where: { userId: session.user.id },
          select: { coachProfileId: true },
        }),
        prisma.ensembleProfile.findMany({
          where: { userId: session.user.id },
          select: { ensembleType: true, experienceLevel: true, state: true, city: true, country: true },
          take: 1,
        }),
      ]);
      favs.forEach((f) => favoriteIds.add(f.coachProfileId));
      ensembleProfile = ensembles[0] || null;
    }

    const needsRelevanceSort = !!ensembleProfile || favoriteIds.size > 0;

    if (needsRelevanceSort) {
      // When we need relevance scoring, fetch all matching coaches but only IDs + scoring fields
      // then paginate in memory (unavoidable for custom relevance sorting)
      const allCoaches = await prisma.coachProfile.findMany({
        where,
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
        orderBy: [
          { rating: "desc" },
          { totalBookings: "desc" },
        ],
      });

      const total = allCoaches.length;

      const parseJson = (val: string): string[] => {
        try { return JSON.parse(val); } catch { return []; }
      };

      const scoredCoaches = allCoaches.map((coach) => {
        const coachSkillNames = coach.coachSkills.map(cs => cs.skill.name);
        const coachEnsembleTypes = parseJson(coach.ensembleTypes);
        const coachExpLevels = parseJson(coach.experienceLevels);

        const isFavorite = favoriteIds.has(coach.id);

        let relevanceScore = 0;
        if (ensembleProfile) {
          if (coach.country === ensembleProfile.country) relevanceScore += 15;
          if (coach.state === ensembleProfile.state) relevanceScore += 10;
          if (coach.city === ensembleProfile.city) relevanceScore += 5;
          if (coachEnsembleTypes.includes(ensembleProfile.ensembleType)) relevanceScore += 10;
          if (coachExpLevels.includes(ensembleProfile.experienceLevel)) relevanceScore += 10;
        }

        const skillMatchCount = skillsList.length > 0
          ? skillsList.filter((skill) => coachSkillNames.includes(skill)).length
          : 0;

        return { ...coach, isFavorite, relevanceScore, matchCount: skillMatchCount };
      });

      scoredCoaches.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        if (a.relevanceScore !== b.relevanceScore) return b.relevanceScore - a.relevanceScore;
        if (skillsList.length > 0 && a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
        return b.rating - a.rating;
      });

      const paginatedCoaches = scoredCoaches.slice(skip, skip + limit);

      return NextResponse.json({
        coaches: paginatedCoaches,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    // For unauthenticated/non-ensemble users: use DB-level pagination (much cheaper)
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
          coachSkills: {
            include: { skill: true },
            orderBy: { displayOrder: "asc" },
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

    const paginatedCoaches = coaches.map((coach) => ({
      ...coach,
      isFavorite: false,
      relevanceScore: 0,
      matchCount: 0,
    }));

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

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, emailVerified: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Your session has expired. Please log out and log back in." },
        { status: 401 }
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
        country: d.country || "Australia",
        currency: d.currency ?? "AUD",
        photoUrl: d.photoUrl || null,
        videoUrl: d.videoUrl || null,
        cancellationPolicy: d.cancellationPolicy ?? null,
        travelSupplement: d.travelSupplement ?? null,
        verified: dbUser.emailVerified === true,
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

    if (d.skills && d.skills.length > 0) {
      const skillRecords = await prisma.skill.findMany({
        where: { id: { in: d.skills } },
      });
      const validSkillIds = new Set(skillRecords.map((s) => s.id));

      const skillData = d.skills
        .map((skillId, i) => ({ coachProfileId: coach.id, skillId, displayOrder: i }))
        .filter((s) => validSkillIds.has(s.skillId));

      if (skillData.length > 0) {
        await prisma.coachSkill.createMany({ data: skillData });
      }
    }

    return NextResponse.json(coach, { status: 201 });
  } catch (error) {
    console.error("Error creating coach profile:", error);
    return NextResponse.json(
      { error: "Failed to create coach profile" },
      { status: 500 }
    );
  }
}
