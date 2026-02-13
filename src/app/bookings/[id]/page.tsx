"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, parseJsonArray } from "@/lib/utils";

interface BookingDetail {
  id: string;
  status: string;
  proposedDates: string;
  confirmedDate: string | null;
  sessionType: string;
  rate: number;
  travelCost: number | null;
  totalCost: number;
  goals: string | null;
  specialRequests: string | null;
  createdAt: string;
  completedAt: string | null;
  cancellationReason: string | null;
  cancelledBy: string | null;
  coach: {
    id: string;
    fullName: string;
    city: string;
    state: string;
    userId: string;
  };
  ensemble: {
    id: string;
    ensembleName: string;
    ensembleType: string;
    city: string;
    state: string;
    size: number;
    userId: string;
  };
}

export default function BookingDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${params.id}`);
        if (res.ok) setBooking(await res.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchBooking();
  }, [params.id]);

  const handleAction = async (action: "accept" | "decline" | "complete" | "cancel") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const updated = await res.json();
        setBooking((prev) => prev ? { ...prev, status: updated.status } : prev);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">Loading booking...</div>;
  if (!booking) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">Booking not found</div>;

  const isCoach = !!session?.user?.coachProfileId;
  const isEnsemble = (session?.user?.ensembleProfileIds?.length ?? 0) > 0;
  const proposedDates = parseJsonArray(booking.proposedDates);

  const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
    pending: "warning", accepted: "success", declined: "danger", completed: "info", cancelled: "danger",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-sm text-gray-500 mt-1">Created {new Date(booking.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge variant={statusVariant[booking.status] || "default"} className="text-sm px-3 py-1">
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Coach / Ensemble Info */}
        <Card>
          <CardContent className="py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Coach</h3>
                <Link href={`/coaches/${booking.coach.id}`} className="text-lg font-semibold text-coral-500 hover:underline">
                  {booking.coach.fullName}
                </Link>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.coach.city}, {booking.coach.state}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ensemble</h3>
                <p className="text-lg font-semibold text-gray-900">{booking.ensemble.ensembleName}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.ensemble.city}, {booking.ensemble.state} &middot; {booking.ensemble.size} members
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Calendar className="h-4 w-4 inline mr-2" />Session Details</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Session Type</p>
                <p className="font-medium">{booking.sessionType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="font-medium">{formatCurrency(booking.rate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="font-semibold text-lg">{formatCurrency(booking.totalCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{booking.confirmedDate ? "Confirmed Date" : "Proposed Dates"}</p>
                <p className="font-medium">
                  {booking.confirmedDate || proposedDates.join(", ") || "TBD"}
                </p>
              </div>
            </div>

            {booking.goals && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Goals</p>
                <p className="text-gray-700">{booking.goals}</p>
              </div>
            )}

            {booking.specialRequests && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                <p className="text-gray-700">{booking.specialRequests}</p>
              </div>
            )}

            {booking.cancellationReason && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-red-500 mb-1">Cancellation Reason ({booking.cancelledBy})</p>
                <p className="text-gray-700">{booking.cancellationReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {isCoach && booking.status === "pending" && (
            <>
              <Button onClick={() => handleAction("accept")} disabled={actionLoading}>Accept Booking</Button>
              <Button variant="danger" onClick={() => handleAction("decline")} disabled={actionLoading}>Decline</Button>
            </>
          )}

          {isCoach && booking.status === "accepted" && (
            <Button onClick={() => handleAction("complete")} disabled={actionLoading}>Mark Completed</Button>
          )}

          {(booking.status === "pending" || booking.status === "accepted") && (
            <Button variant="outline" onClick={() => handleAction("cancel")} disabled={actionLoading}>Cancel Booking</Button>
          )}

          {isEnsemble && booking.status === "completed" && (
            <Link href="/dashboard/ensemble">
              <Button>Check Review Invites</Button>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}
