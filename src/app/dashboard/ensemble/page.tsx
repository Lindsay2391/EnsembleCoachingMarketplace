"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Search, MessageSquare, Star, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface PendingInvite {
  id: string;
  ensembleName: string;
  createdAt: string;
  coachProfile: {
    id: string;
    fullName: string;
    photoUrl: string | null;
    city: string;
    state: string;
  };
}

interface EnsembleInfo {
  id: string;
  ensembleName: string;
  ensembleType: string;
  city: string;
  state: string;
}

export default function EnsembleDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [ensembles, setEnsembles] = useState<EnsembleInfo[]>([]);
  const [selectedEnsemble, setSelectedEnsemble] = useState<EnsembleInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function fetchData() {
      try {
        const [profileRes, invitesRes] = await Promise.all([
          fetch("/api/ensembles/me"),
          fetch("/api/reviews/invites/pending"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setEnsembles(data.profiles || []);

          if (selectedId) {
            const found = (data.profiles || []).find((p: EnsembleInfo) => p.id === selectedId);
            if (found) setSelectedEnsemble(found);
          }
        }

        if (invitesRes.ok) {
          setPendingInvites(await invitesRes.json());
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) fetchData();
  }, [session, status, router, selectedId]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">Loading dashboard...</div>;

  if (!selectedId && ensembles.length > 1) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ensemble Dashboard</h1>
            <p className="mt-1 text-gray-600">Select an ensemble to view its dashboard</p>
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

        {pendingInvites.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-coral-500" />
                <h2 className="text-lg font-semibold text-gray-900">Pending Review Invites</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">{invite.coachProfile.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {invite.coachProfile.city}, {invite.coachProfile.state}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Invited {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/reviews/write?inviteId=${invite.id}`}>
                      <Button size="sm">
                        <Star className="h-4 w-4 mr-1.5" />
                        Write Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ensembles.map((ep) => (
            <Link key={ep.id} href={`/dashboard/ensemble?id=${ep.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-gray-100">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-coral-50 rounded-lg">
                      <Users className="h-5 w-5 text-coral-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ep.ensembleName}</p>
                      <p className="text-sm text-gray-500">{ep.ensembleType} &middot; {ep.city}, {ep.state}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const currentEnsemble = selectedEnsemble || ensembles[0] || null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ensemble Dashboard</h1>
          <p className="mt-1 text-gray-600">
            {currentEnsemble ? currentEnsemble.ensembleName : `Welcome back, ${session?.user?.name}`}
          </p>
        </div>
        <div className="flex gap-3">
          {ensembles.length > 1 && (
            <Link href="/dashboard/ensemble">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                All Ensembles
              </Button>
            </Link>
          )}
          <Link href="/coaches">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Find Coaches
            </Button>
          </Link>
        </div>
      </div>

      {!currentEnsemble && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-yellow-800">
              Create your ensemble profile to get started.{" "}
              <Link href="/dashboard/ensemble/profile" className="font-semibold underline">
                Create profile
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {pendingInvites.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-coral-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Review Invites</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{invite.coachProfile.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {invite.coachProfile.city}, {invite.coachProfile.state}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Invited {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/reviews/write?inviteId=${invite.id}`}>
                    <Button size="sm">
                      <Star className="h-4 w-4 mr-1.5" />
                      Write Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href={currentEnsemble ? `/dashboard/ensemble/profile?id=${currentEnsemble.id}` : "/dashboard/ensemble/profile"}>
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
