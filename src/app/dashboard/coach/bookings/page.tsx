"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface Booking {
  id: string;
  status: string;
  proposedDates: string;
  confirmedDate: string | null;
  sessionType: string;
  totalCost: number;
  createdAt: string;
  ensemble: { ensembleName: string; city: string; state: string; size: number };
}

export default function CoachBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function fetchBookings() {
      try {
        const params = filter !== "all" ? `?status=${filter}` : "";
        const res = await fetch(`/api/bookings${params}`);
        if (res.ok) setBookings(await res.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session, status, router, filter]);

  const statusBadge = (s: string) => {
    const v: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
      pending: "warning", accepted: "success", declined: "danger", completed: "info", cancelled: "danger",
    };
    return <Badge variant={v[s] || "default"}>{s}</Badge>;
  };

  const filters = ["all", "pending", "accepted", "completed", "declined", "cancelled"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "primary" : "outline"}
            onClick={() => { setFilter(f); setLoading(true); }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No bookings found</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.ensemble.ensembleName}</p>
                      <p className="text-sm text-gray-500">
                        {booking.ensemble.city}, {booking.ensemble.state} &middot; {booking.ensemble.size} members &middot; {booking.sessionType.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.confirmedDate || JSON.parse(booking.proposedDates).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(booking.totalCost)}</p>
                      <div className="mt-1">{statusBadge(booking.status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
