"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SESSION_TYPES, formatCurrency } from "@/lib/utils";

interface Coach {
  id: string;
  fullName: string;
  city: string;
  state: string;
  rateHourly: number | null;
  rateHalfDay: number | null;
  rateFullDay: number | null;
  currency: string;
}

function BookingForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachId = searchParams.get("coachId") || "";

  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [proposedDate1, setProposedDate1] = useState("");
  const [proposedDate2, setProposedDate2] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [goals, setGoals] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (!coachId) return;

    async function fetchCoach() {
      try {
        const res = await fetch(`/api/coaches/${coachId}`);
        if (res.ok) setCoach(await res.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoach();
  }, [coachId, status, router]);

  const getRate = () => {
    if (!coach || !sessionType) return null;
    if (sessionType === "hourly") return coach.rateHourly;
    if (sessionType === "half_day") return coach.rateHalfDay;
    if (sessionType === "full_day") return coach.rateFullDay;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const proposedDates = [proposedDate1, proposedDate2].filter(Boolean);
    if (proposedDates.length === 0) {
      setError("At least one proposed date is required");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId,
          proposedDates,
          sessionType,
          goals: goals || undefined,
          specialRequests: specialRequests || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create booking");
      } else {
        const booking = await res.json();
        router.push(`/bookings/${booking.id}`);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;
  if (!coach) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Coach not found</div>;

  const rate = getRate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Book {coach.fullName}</h1>
      <p className="text-gray-600 mb-8">{coach.city}, {coach.state}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Session Details</h2></CardHeader>
          <CardContent className="space-y-4">
            <Select id="sessionType" label="Session Type *" value={sessionType} onChange={(e) => setSessionType(e.target.value)} required placeholder="Select session type" options={SESSION_TYPES} />
            {rate !== null && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Estimated cost: <span className="font-semibold text-gray-900">{formatCurrency(rate, coach.currency)}</span></p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input id="date1" label="Preferred Date *" type="date" value={proposedDate1} onChange={(e) => setProposedDate1(e.target.value)} required />
              <Input id="date2" label="Alternative Date" type="date" value={proposedDate2} onChange={(e) => setProposedDate2(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Your Goals</h2></CardHeader>
          <CardContent className="space-y-4">
            <Textarea id="goals" label="What do you hope to achieve?" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g. Contest preparation, work on blend and balance, learn new repertoire..." rows={4} />
            <Textarea id="specialRequests" label="Special Requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="e.g. Need wheelchair access, have a venue booked, specific time preferences..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} size="lg">{saving ? "Submitting..." : "Submit Booking Request"}</Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
