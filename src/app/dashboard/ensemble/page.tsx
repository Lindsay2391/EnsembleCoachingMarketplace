"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Search, Star, Users, XCircle, Clock, Pencil, Trash2, MapPin, ClipboardList } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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

interface EnsembleReview {
  id: string;
  rating: number;
  reviewText: string | null;
  sessionMonth: number;
  sessionYear: number;
  sessionFormat: string;
  status: string;
  createdAt: string;
  coachProfile: {
    id: string;
    fullName: string;
    city: string;
    state: string;
    country: string;
  };
  ensembleProfile: {
    id: string;
    ensembleName: string;
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function EnsembleDashboard() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">Loading dashboard...</div>}>
      <EnsembleDashboardContent />
    </Suspense>
  );
}

function EnsembleDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [ensembles, setEnsembles] = useState<EnsembleInfo[]>([]);
  const [ensembleReviews, setEnsembleReviews] = useState<EnsembleReview[]>([]);
  const [selectedEnsemble, setSelectedEnsemble] = useState<EnsembleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [declining, setDeclining] = useState<string | null>(null);
  const [recalling, setRecalling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function fetchData() {
      try {
        const [profileRes, invitesRes, reviewsRes] = await Promise.all([
          fetch("/api/ensembles/me"),
          fetch("/api/reviews/invites/pending"),
          fetch("/api/reviews/ensemble-reviews"),
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

        if (reviewsRes.ok) {
          setEnsembleReviews(await reviewsRes.json());
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) fetchData();
  }, [session, status, router, selectedId]);

  async function handleDeclineInvite(inviteId: string) {
    if (!confirm("Are you sure you want to decline this review invite?")) return;
    setDeclining(inviteId);
    try {
      const res = await fetch(`/api/reviews/invite/${inviteId}/decline`, { method: "POST" });
      if (res.ok) {
        setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      }
    } catch {
    } finally {
      setDeclining(null);
    }
  }

  async function handleRecallReview(reviewId: string) {
    if (!confirm("Are you sure you want to recall this review? It will be permanently deleted.")) return;
    setRecalling(reviewId);
    try {
      const res = await fetch(`/api/reviews/ensemble-reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setEnsembleReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch {
    } finally {
      setRecalling(null);
    }
  }

  const statusBadge = (s: string) => {
    const variants: Record<string, "success" | "warning" | "danger" | "default"> = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    const labels: Record<string, string> = {
      pending: "Pending Approval",
      approved: "Published",
      rejected: "Rejected",
    };
    return <Badge variant={variants[s] || "default"}>{labels[s] || s}</Badge>;
  };

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

        <InvitesSection
          pendingInvites={pendingInvites}
          declining={declining}
          onDecline={handleDeclineInvite}
        />

        <ReviewsSection
          reviews={ensembleReviews}
          recalling={recalling}
          onRecall={handleRecallReview}
          statusBadge={statusBadge}
        />

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

      <InvitesSection
        pendingInvites={pendingInvites}
        declining={declining}
        onDecline={handleDeclineInvite}
      />

      <ReviewsSection
        reviews={ensembleReviews}
        recalling={recalling}
        onRecall={handleRecallReview}
        statusBadge={statusBadge}
      />

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
      </div>
    </div>
  );
}

function InvitesSection({
  pendingInvites,
  declining,
  onDecline,
}: {
  pendingInvites: PendingInvite[];
  declining: string | null;
  onDecline: (id: string) => void;
}) {
  if (pendingInvites.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-coral-500" />
          <h2 className="text-lg font-semibold text-gray-900">Pending Review Invites</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Coaches have invited you to leave a review</p>
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
                  <Clock className="h-3 w-3 inline mr-1" />
                  Invited {new Date(invite.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/reviews/write?inviteId=${invite.id}`}>
                  <Button size="sm">
                    <Star className="h-4 w-4 mr-1.5" />
                    Write Review
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline(invite.id)}
                  disabled={declining === invite.id}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {declining === invite.id ? "..." : "Decline"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsSection({
  reviews,
  recalling,
  onRecall,
  statusBadge,
}: {
  reviews: EnsembleReview[];
  recalling: string | null;
  onRecall: (id: string) => void;
  statusBadge: (s: string) => React.ReactNode;
}) {
  if (reviews.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-coral-500" />
          <h2 className="text-lg font-semibold text-gray-900">Your Submitted Reviews</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Reviews you have submitted to coaches</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/coaches/${review.coachProfile.id}`} className="font-medium text-gray-900 hover:text-coral-600">
                      {review.coachProfile.fullName}
                    </Link>
                    {statusBadge(review.status)}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {review.coachProfile.city}, {review.coachProfile.state}, {review.coachProfile.country}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Reviewed as <span className="font-medium">{review.ensembleProfile.ensembleName}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      {review.rating}/5
                    </span>
                    <span>
                      {MONTH_NAMES[review.sessionMonth - 1]} {review.sessionYear}
                    </span>
                    <Badge variant={review.sessionFormat === "in_person" ? "info" : "default"}>
                      {review.sessionFormat === "in_person" ? "In Person" : "Virtual"}
                    </Badge>
                  </div>
                  {review.reviewText && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">&ldquo;{review.reviewText}&rdquo;</p>
                  )}
                  {review.status === "rejected" && (
                    <p className="text-sm text-red-600 mt-2">This review was not approved by the coach.</p>
                  )}
                </div>
                {review.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/reviews/edit?reviewId=${review.id}`}>
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRecall(review.id)}
                      disabled={recalling === review.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {recalling === review.id ? "..." : "Recall"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
