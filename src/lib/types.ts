import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: string;
      coachProfileId: string | null;
      ensembleProfileId: string | null;
    };
  }

  interface User {
    userType: string;
    coachProfileId: string | null;
    ensembleProfileId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: string;
    coachProfileId: string | null;
    ensembleProfileId: string | null;
  }
}

export interface CoachProfileWithUser {
  id: string;
  userId: string;
  fullName: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  photoUrl: string | null;
  videoUrl: string | null;
  specialties: string;
  experienceLevels: string;
  rateHourly: number | null;
  rateHalfDay: number | null;
  rateFullDay: number | null;
  currency: string;
  availability: string | null;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  verified: boolean;
  approved: boolean;
  cancellationPolicy: string | null;
  travelSupplement: number | null;
  profileViews: number;
  user: {
    email: string;
    name: string;
  };
}

export interface BookingWithDetails {
  id: string;
  ensembleId: string;
  coachId: string;
  status: string;
  proposedDates: string;
  confirmedDate: string | null;
  sessionType: string;
  durationHours: number | null;
  rate: number;
  travelCost: number | null;
  totalCost: number;
  goals: string | null;
  specialRequests: string | null;
  createdAt: string;
  coach: {
    fullName: string;
    city: string;
    state: string;
    photoUrl: string | null;
  };
  ensemble: {
    ensembleName: string;
    ensembleType: string;
    city: string;
    state: string;
    size: number;
  };
  review?: {
    id: string;
    rating: number;
  } | null;
}
