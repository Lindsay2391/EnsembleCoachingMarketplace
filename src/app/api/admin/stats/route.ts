import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { userType: string }).userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [
      totalUsers,
      totalCoaches,
      approvedCoaches,
      pendingCoaches,
      totalEnsembles,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.coachProfile.count(),
      prisma.coachProfile.count({ where: { approved: true } }),
      prisma.coachProfile.count({ where: { approved: false } }),
      prisma.ensembleProfile.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "completed" } }),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.review.count(),
    ]);

    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    return NextResponse.json({
      totalUsers,
      totalCoaches,
      approvedCoaches,
      pendingCoaches,
      totalEnsembles,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalReviews,
      averageRating: avgRating._avg.rating ?? 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
