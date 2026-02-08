"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Calendar, MessageSquare, Eye, Star, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface CoachProfile {
  id: string;
  fullName: string;
  approved: boolean;
  profileViews: number;
  totalBookings: number;
  totalReviews: number;
  rating: number;
}

interface Booking {
  id: string;
  status: string;
  proposedDates: string;
  sessionType: string;
  totalCost: number;
  ensemble: { ensembleName: string; city: string; state: string };
  createdAt: string;
}

export default function CoachDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function fetchData() {
      try {
        const [bookingsRes] = await Promise.all([
          fetch("/api/bookings"),
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
        }

        // Try to get coach profile from the first booking or by searching
        const profileRes = await fetch("/api/coaches?search=" + encodeURIComponent(session?.user?.name || ""));
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.coaches?.length > 0) {
            setProfile(data.coaches[0]);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.userType === "coach") fetchData();
  }, [session, status, router]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">Loading dashboard...</div>;

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  void bookings.filter((b) => b.status === "accepted"); // for future use

  const statusBadge = (s: string) => {
    const variants: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
      pending: "warning", accepted: "success", declined: "danger", completed: "info", cancelled: "danger",
    };
    return <Badge variant={variants[s] || "default"}>{s}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-3">
          {!profile ? (
            <Link href="/dashboard/coach/profile">
              <Button>Create Profile</Button>
            </Link>
          ) : (
            <Link href="/dashboard/coach/profile">
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {!profile && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-yellow-800">
              You haven&apos;t created your coach profile yet.{" "}
              <Link href="/dashboard/coach/profile" className="font-semibold underline">
                Create your profile
              </Link>{" "}
              to start receiving bookings.
            </p>
          </CardContent>
        </Card>
      )}

      {profile && !profile.approved && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <p className="text-blue-800">
              Your profile is pending admin approval. You&apos;ll be visible to ensembles once approved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4 text-center">
            <Eye className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.profileViews || 0}</p>
            <p className="text-sm text-gray-500">Profile Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.totalBookings || 0}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Star className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.rating?.toFixed(1) || "N/A"}</p>
            <p className="text-sm text-gray-500">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
            <p className="text-sm text-gray-500">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Booking Requests */}
      {pendingBookings.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Pending Booking Requests</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{booking.ensemble.ensembleName}</p>
                    <p className="text-sm text-gray-500">
                      {booking.ensemble.city}, {booking.ensemble.state} &middot; {booking.sessionType.replace("_", " ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Dates: {JSON.parse(booking.proposedDates).join(", ")}
                    </p>
                  </div>
                  <Link href={`/bookings/${booking.id}`}>
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bookings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/coach/bookings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <Link key={booking.id} href={`/bookings/${booking.id}`} className="block">
                  <div className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.ensemble.ensembleName}</p>
                      <p className="text-sm text-gray-500">{booking.sessionType.replace("_", " ")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${booking.totalCost}</span>
                      {statusBadge(booking.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/coach/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <User className="h-5 w-5 text-coral-500" />
              <span className="font-medium text-gray-900">Edit Profile</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/coach/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-coral-500" />
              <span className="font-medium text-gray-900">All Bookings</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/messages">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-coral-500" />
              <span className="font-medium text-gray-900">Messages</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
