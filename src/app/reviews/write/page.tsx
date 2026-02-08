"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import Textarea from "@/components/ui/Textarea";
import { parseJsonArray, groupSkillsByCategory } from "@/lib/utils";

interface InviteDetails {
  id: string;
  ensembleEmail: string;
  ensembleName: string;
  coachProfile: {
    id: string;
    fullName: string;
    city: string;
    state: string;
    country: string;
    photoUrl: string | null;
    specialties: string;
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function WriteReviewContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("inviteId");

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [sessionMonth, setSessionMonth] = useState(new Date().getMonth() + 1);
  const [sessionYear, setSessionYear] = useState(new Date().getFullYear());
  const [sessionFormat, setSessionFormat] = useState<"in_person" | "virtual">("in_person");
  const [validatedSkills, setValidatedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    if (!inviteId) {
      setError("No invite ID provided");
      setLoading(false);
      return;
    }

    async function fetchInvite() {
      try {
        const res = await fetch(`/api/reviews/invite/${inviteId}`);
        if (res.ok) {
          setInvite(await res.json());
        } else {
          const data = await res.json();
          setError(data.error || "Failed to load invite");
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [inviteId, session, status, router]);

  function toggleSkill(skill: string) {
    setValidatedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteId,
          rating,
          reviewText: reviewText || undefined,
          sessionMonth,
          sessionYear,
          sessionFormat,
          validatedSkills,
        }),
      });

      if (res.ok) {
        router.push(`/coaches/${invite?.coachProfile.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;
  }

  if (error && !invite) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!invite) return null;

  const coachSkills = parseJsonArray(invite.coachProfile.specialties);
  const groupedSkills = groupSkillsByCategory(coachSkills);

  const now = new Date();
  const monthOptions: { month: number; year: number; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Write a Review</h1>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {invite.coachProfile.photoUrl ? (
                <Image src={invite.coachProfile.photoUrl} alt={invite.coachProfile.fullName} width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="text-coral-500 text-xl font-bold">{invite.coachProfile.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{invite.coachProfile.fullName}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {invite.coachProfile.city}, {invite.coachProfile.state}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Overall Rating *</h2></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} size={32} interactive onChange={setRating} />
              <span className="text-lg font-medium text-gray-700">{rating > 0 ? `${rating}/5` : "Select rating"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Your Testimonial</h2></CardHeader>
          <CardContent>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience working with this coach..."
              rows={5}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Session Details</h2></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">When did the session take place?</label>
              <select
                value={`${sessionMonth}-${sessionYear}`}
                onChange={(e) => {
                  const [m, y] = e.target.value.split("-");
                  setSessionMonth(parseInt(m));
                  setSessionYear(parseInt(y));
                }}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 sm:text-sm"
              >
                {monthOptions.map((opt) => (
                  <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionFormat"
                    value="in_person"
                    checked={sessionFormat === "in_person"}
                    onChange={() => setSessionFormat("in_person")}
                    className="text-coral-500 focus:ring-coral-500"
                  />
                  <span className="text-sm text-gray-700">In Person</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionFormat"
                    value="virtual"
                    checked={sessionFormat === "virtual"}
                    onChange={() => setSessionFormat("virtual")}
                    className="text-coral-500 focus:ring-coral-500"
                  />
                  <span className="text-sm text-gray-700">Virtual</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.keys(groupedSkills).length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Validate Coach Skills</h2>
              <p className="text-sm text-gray-500 mt-1">Select the skills you can vouch for based on your experience</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          validatedSkills.includes(skill)
                            ? "bg-coral-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {validatedSkills.includes(skill) && <Star className="h-3 w-3 mr-1 fill-current" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} size="lg">
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>}>
      <WriteReviewContent />
    </Suspense>
  );
}
