"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Music, Users, Search, User, Settings, Plus, Star, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import FeedbackModal from "@/components/FeedbackModal";

interface CoachInfo {
  id: string;
  fullName: string;
  city: string;
  state: string;
  verified: boolean;
  approved: boolean;
}

interface EnsembleInfo {
  id: string;
  ensembleName: string;
  ensembleType: string;
  city: string;
  state: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coachProfile, setCoachProfile] = useState<CoachInfo | null>(null);
  const [ensembleProfiles, setEnsembleProfiles] = useState<EnsembleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    async function fetchProfiles() {
      try {
        const [coachRes, ensembleRes] = await Promise.all([
          fetch("/api/coaches/me"),
          fetch("/api/ensembles/me"),
        ]);

        if (coachRes.ok) {
          const data = await coachRes.json();
          if (data.profile) setCoachProfile(data.profile);
        }

        if (ensembleRes.ok) {
          const data = await ensembleRes.json();
          if (data.profiles) setEnsembleProfiles(data.profiles);
        }
        const verifyRes = await fetch("/api/verify-status");
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          setEmailVerified(verifyData.emailVerified);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, [session, status, router]);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await fetch("/api/resend-verification", { method: "POST" });
    } catch {}
    setResending(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back, {session?.user?.name}</p>
      </div>

      {!emailVerified && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800 text-sm">
                  Please verify your email address. Check your inbox for a verification link.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleResendVerification} disabled={resending}>
                {resending ? "Sending..." : "Resend Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coral-50 rounded-lg">
                  <Music className="h-6 w-6 text-coral-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Coach Profile</h2>
                  <p className="text-sm text-gray-500">Offer your coaching services</p>
                </div>
              </div>
              {coachProfile && (
                <div className="flex gap-1">
                  {coachProfile.approved ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {coachProfile ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">{coachProfile.fullName}</p>
                  <p className="text-sm text-gray-500">{coachProfile.city}, {coachProfile.state}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/coaches/${coachProfile.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="h-4 w-4 mr-1.5" />
                      View Profile
                    </Button>
                  </Link>
                  <Link href="/dashboard/coach/profile" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-1.5" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/dashboard/coach/reviews" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="h-4 w-4 mr-1.5" />
                      Manage Reviews
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">
                  Set up your coach profile to start connecting with ensembles looking for coaching.
                </p>
                <Link href="/dashboard/coach/profile">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Coach Profile
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coral-50 rounded-lg">
                  <Users className="h-6 w-6 text-coral-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Ensemble Profiles</h2>
                  <p className="text-sm text-gray-500">Find coaches for your groups</p>
                </div>
              </div>
              {ensembleProfiles.length > 0 && <Badge variant="success">{ensembleProfiles.length} Active</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {ensembleProfiles.length > 0 ? (
              <div className="space-y-3">
                {ensembleProfiles.map((ep) => (
                  <div key={ep.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="mb-2">
                      <p className="font-medium text-gray-900">{ep.ensembleName}</p>
                      <p className="text-sm text-gray-500">
                        {ep.ensembleType} &middot; {ep.city}, {ep.state}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/ensemble?id=${ep.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="h-4 w-4 mr-1.5" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href={`/dashboard/ensemble/profile?id=${ep.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/ensemble/profile">
                  <Button variant="outline" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Another Ensemble
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">
                  Set up your ensemble profile to browse and connect with coaches.
                </p>
                <Link href="/dashboard/ensemble/profile">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Ensemble Profile
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Link href="/coaches">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <Search className="h-5 w-5 text-coral-500" />
              <span className="font-medium text-gray-900">Browse Coaches</span>
              <span className="text-sm text-gray-500 ml-auto">Find the perfect coach for your group</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <FeedbackModal />
        <BuyMeACoffee variant="inline" />
      </div>
    </div>
  );
}
