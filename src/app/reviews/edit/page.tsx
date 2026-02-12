"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import Textarea from "@/components/ui/Textarea";
import MonthYearPicker from "@/components/ui/MonthYearPicker";

interface CoachSkillItem {
  id: string;
  displayOrder: number;
  endorsementCount: number;
  skill: {
    id: string;
    name: string;
    category: string;
  };
}

interface ReviewData {
  id: string;
  rating: number;
  reviewText: string | null;
  sessionMonth: number;
  sessionYear: number;
  sessionFormat: string;
  validatedSkills: string;
  status: string;
  coachProfile: {
    id: string;
    fullName: string;
    city: string;
    state: string;
    country: string;
    photoUrl: string | null;
  };
}

function EditReviewContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");

  const [review, setReview] = useState<ReviewData | null>(null);
  const [coachSkills, setCoachSkills] = useState<CoachSkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

    if (!reviewId) {
      setError("No review specified");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/reviews/ensemble-reviews/${reviewId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Review not found or you don't have access");
          setLoading(false);
          return;
        }

        const found = await res.json();

        if (found.status !== "pending") {
          setError("Only pending reviews can be edited");
          setLoading(false);
          return;
        }

        setReview(found);
        setRating(found.rating);
        setReviewText(found.reviewText || "");
        setSessionMonth(found.sessionMonth);
        setSessionYear(found.sessionYear);
        setSessionFormat(found.sessionFormat as "in_person" | "virtual");

        try {
          const parsed = JSON.parse(found.validatedSkills || "[]");
          setValidatedSkills(parsed);
        } catch {
          setValidatedSkills([]);
        }

        if (found.coachProfile?.coachSkills) {
          setCoachSkills(found.coachProfile.coachSkills);
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [reviewId, session, status, router]);

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
      const res = await fetch(`/api/reviews/ensemble-reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          reviewText: reviewText || undefined,
          sessionMonth,
          sessionYear,
          sessionFormat,
          validatedSkills,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          router.push("/dashboard/ensemble");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update review");
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Updated!</h2>
        <p className="text-gray-600">Your changes have been saved. Redirecting to dashboard...</p>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => router.push("/dashboard/ensemble")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!review) return null;

  const groupedSkills: Record<string, CoachSkillItem[]> = {};
  for (const cs of coachSkills) {
    const cat = cs.skill.category;
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(cs);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Review</h1>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {review.coachProfile.photoUrl ? (
                <Image src={review.coachProfile.photoUrl} alt={review.coachProfile.fullName} width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="text-coral-500 text-xl font-bold">{review.coachProfile.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{review.coachProfile.fullName}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {review.coachProfile.city}, {review.coachProfile.state}
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
              <MonthYearPicker
                month={sessionMonth}
                year={sessionYear}
                onChange={(m, y) => {
                  setSessionMonth(m);
                  setSessionYear(y);
                }}
              />
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
                    {skills.map((cs) => (
                      <button
                        key={cs.id}
                        type="button"
                        onClick={() => toggleSkill(cs.skill.name)}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          validatedSkills.includes(cs.skill.name)
                            ? "bg-coral-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {validatedSkills.includes(cs.skill.name) && <Star className="h-3 w-3 mr-1 fill-current" />}
                        {cs.skill.name}
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
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/dashboard/ensemble")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>}>
      <EditReviewContent />
    </Suspense>
  );
}
