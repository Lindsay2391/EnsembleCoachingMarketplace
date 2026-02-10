"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Music, Users, Search, User, Settings, Plus, Star, Mail, Trash2 } from "lucide-react";
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
  const [pendingInviteCounts, setPendingInviteCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);
  const [resending, setResending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
        const invitesRes = await fetch("/api/reviews/invites/pending");
        if (invitesRes.ok) {
          const invitesData = await invitesRes.json();
          const counts: Record<string, number> = {};
          for (const invite of invitesData) {
            if (invite.coachProfile?.id) {
              counts["_total"] = (counts["_total"] || 0) + 1;
            }
          }
          setPendingInviteCounts({ ...counts, _total: invitesData.length });
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setDeleting(false);
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
                    {(pendingInviteCounts._total || 0) > 0 && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="h-3.5 w-3.5 text-coral-500" />
                        <span className="text-sm text-coral-600 font-medium">
                          {pendingInviteCounts._total} review invite{pendingInviteCounts._total === 1 ? "" : "s"} pending
                        </span>
                      </div>
                    )}
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

      <div className="mt-10 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Account</h3>
            <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Account
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-1">
              This will permanently delete your account, including:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1">
              <li>Your coach profile and all reviews</li>
              <li>All ensemble profiles</li>
              <li>Your favourites and messages</li>
            </ul>
            <p className="text-sm text-gray-600 mb-3">
              Type <span className="font-mono font-semibold text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 bg-red-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
