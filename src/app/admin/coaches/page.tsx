"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { parseJsonArray } from "@/lib/utils";

interface PendingCoach {
  id: string;
  fullName: string;
  city: string;
  state: string;
  bio: string;
  specialties: string;
  experienceLevels: string;
  rateHourly: number | null;
  approved: boolean;
  createdAt: string;
  user: { email: string; name: string; createdAt: string };
}

export default function AdminCoachesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coaches, setCoaches] = useState<PendingCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;
    if (session?.user?.userType !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function fetchPending() {
      try {
        const res = await fetch("/api/admin/coaches/pending");
        if (res.ok) setCoaches(await res.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, [session, status, router]);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const res = await fetch(`/api/admin/coaches/${id}/approve`, { method: "PUT" });
      if (res.ok) {
        setCoaches((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setApproving(null);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Coach Approvals</h1>
      <p className="text-gray-600 mb-8">{coaches.length} coaches awaiting review</p>

      {coaches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending coaches to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => (
            <Card key={coach.id}>
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{coach.fullName}</h3>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {coach.city}, {coach.state}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Email: {coach.user.email}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{coach.bio}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {parseJsonArray(coach.specialties).map((s) => (
                        <Badge key={s} variant="info">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {parseJsonArray(coach.experienceLevels).map((l) => (
                        <Badge key={l}>{l}</Badge>
                      ))}
                    </div>
                    {coach.rateHourly && (
                      <p className="text-sm text-gray-600 mt-2">Hourly rate: ${coach.rateHourly}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleApprove(coach.id)}
                    disabled={approving === coach.id}
                    className="ml-4 flex-shrink-0"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {approving === coach.id ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
