"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, Star, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Stats {
  totalUsers: number;
  totalCoaches: number;
  approvedCoaches: number;
  pendingCoaches: number;
  totalEnsembles: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalReviews: number;
  averageRating: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;
    if (session?.user?.userType !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [session, status, router]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Platform overview and management</p>
        </div>
        <Link href="/admin/coaches">
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Review Coaches ({stats?.pendingCoaches || 0} pending)
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4 text-center">
            <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Shield className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.approvedCoaches || 0}</p>
            <p className="text-sm text-gray-500">Active Coaches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalEnsembles || 0}</p>
            <p className="text-sm text-gray-500">Ensembles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Calendar className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Booking Metrics</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Bookings</span>
              <span className="font-semibold">{stats?.completedBookings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Bookings</span>
              <span className="font-semibold">{stats?.pendingBookings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Reviews</span>
              <span className="font-semibold">{stats?.totalReviews || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-semibold flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                {stats?.averageRating?.toFixed(1) || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Coach Management</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Coach Profiles</span>
              <span className="font-semibold">{stats?.totalCoaches || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved</span>
              <span className="font-semibold text-green-600">{stats?.approvedCoaches || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Approval</span>
              <span className="font-semibold text-yellow-600">{stats?.pendingCoaches || 0}</span>
            </div>
            <div className="mt-4">
              <Link href="/admin/coaches">
                <Button variant="outline" className="w-full">Review Pending Coaches</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
