"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Search, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Booking {
  id: string;
  status: string;
  proposedDates: string;
  sessionType: string;
  totalCost: number;
  coach: { fullName: string; city: string; state: string };
  createdAt: string;
}

export default function EnsembleDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function fetchData() {
      try {
        const bookingsRes = await fetch("/api/bookings");
        if (bookingsRes.ok) {
          setBookings(await bookingsRes.json());
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.userType === "ensemble") fetchData();
  }, [session, status, router]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">Loading dashboard...</div>;

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
          <h1 className="text-3xl font-bold text-gray-900">Ensemble Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/coaches">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Find Coaches
            </Button>
          </Link>
        </div>
      </div>

      {hasProfile === false && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-yellow-800">
              Create your ensemble profile to start booking coaches.{" "}
              <Link href="/dashboard/ensemble/profile" className="font-semibold underline">
                Create profile
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{bookings.filter((b) => b.status === "pending").length}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{bookings.filter((b) => b.status === "accepted").length}</p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{bookings.filter((b) => b.status === "completed").length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/ensemble/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No bookings yet</p>
              <Link href="/coaches"><Button variant="outline" size="sm" className="mt-3">Browse Coaches</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <Link key={booking.id} href={`/bookings/${booking.id}`} className="block">
                  <div className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.coach.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {booking.coach.city}, {booking.coach.state} &middot; {booking.sessionType.replace("_", " ")}
                      </p>
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
        <Link href="/dashboard/ensemble/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <User className="h-5 w-5 text-coral-500" />
              <span className="font-medium text-gray-900">Edit Profile</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/coaches">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <Search className="h-5 w-5 text-coral-500" />
              <span className="font-medium text-gray-900">Find Coaches</span>
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
