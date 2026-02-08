"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Send, Mail, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";

interface ReviewInvite {
  id: string;
  ensembleEmail: string;
  ensembleName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  review?: {
    rating: number;
    reviewText: string | null;
    createdAt: string;
  } | null;
}

export default function CoachReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invites, setInvites] = useState<ReviewInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ensembleName, setEnsembleName] = useState("");
  const [ensembleEmail, setEnsembleEmail] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    const user = session?.user as { coachProfileId?: string } | undefined;
    if (!user?.coachProfileId) {
      router.push("/dashboard");
      return;
    }

    fetchInvites();
  }, [session, status, router]);

  async function fetchInvites() {
    try {
      const res = await fetch("/api/reviews/invite");
      if (res.ok) {
        setInvites(await res.json());
      }
    } catch (err) {
      console.error("Error fetching invites:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!ensembleName.trim() || !ensembleEmail.trim()) {
      setError("Please fill in both fields");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/reviews/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ensembleName: ensembleName.trim(), ensembleEmail: ensembleEmail.trim() }),
      });

      if (res.ok) {
        setSuccess("Review invite sent successfully!");
        setEnsembleName("");
        setEnsembleEmail("");
        fetchInvites();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send invite");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  const statusBadge = (s: string) => {
    const variants: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
      pending: "warning",
      completed: "success",
      expired: "danger",
    };
    return <Badge variant={variants[s] || "default"}>{s}</Badge>;
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Star className="h-8 w-8 text-coral-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Invites</h1>
          <p className="mt-1 text-gray-600">Invite ensembles to leave reviews for your coaching</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-coral-500" />
            Invite a Review
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {success}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ensembleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Ensemble Name
                </label>
                <input
                  id="ensembleName"
                  type="text"
                  value={ensembleName}
                  onChange={(e) => setEnsembleName(e.target.value)}
                  placeholder="e.g. Harmony Heights Chorus"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="ensembleEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Ensemble Email
                </label>
                <input
                  id="ensembleEmail"
                  type="email"
                  value={ensembleEmail}
                  onChange={(e) => setEnsembleEmail(e.target.value)}
                  placeholder="ensemble@example.com"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 sm:text-sm"
                />
              </div>
            </div>
            <Button type="submit" disabled={sending}>
              <Mail className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Sent Invites</h2>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No invites sent yet</p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{invite.ensembleName}</p>
                    <p className="text-sm text-gray-500">{invite.ensembleEmail}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Sent {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {statusBadge(invite.status)}
                    {invite.review && (
                      <div className="mt-1">
                        <StarRating rating={invite.review.rating} size={14} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
