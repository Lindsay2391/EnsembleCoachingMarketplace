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

interface CoachInfo {
  id: string;
  fullName: string;
  city: string;
  state: string;
  country: string;
  photoUrl: string | null;
  specialties: string;
  coachSkills?: CoachSkillItem[];
}

interface EnsembleInfo {
  id: string;
  ensembleName: string;
  ensembleType: string;
  city: string;
  state: string;
}

function SubmitReviewContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachId = searchParams.get("coachId");

  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [ensembles, setEnsembles] = useState<EnsembleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [selectedEnsembleId, setSelectedEnsembleId] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [sessionMonth, setSessionMonth] = useState(new Date().getMonth() + 1);
  const [sessionYear, setSessionYear] = useState(new Date().getFullYear());
  const [sessionFormat, setSessionFormat] = useState<"in_person" | "virtual">("in_person");
  const [validatedSkills, setValidatedSkills] = useState<string[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    if (!coachId) {
      setError("No coach specified");
      setLoading(false);
      return;
    }

    const user = session?.user as { ensembleProfileIds?: string[] } | undefined;
    if (!user?.ensembleProfileIds || user.ensembleProfileIds.length === 0) {
      setError("You need an ensemble profile to submit a review");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const verifyRes = await fetch("/api/verify-status");
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (!verifyData.emailVerified) {
            setEmailVerified(false);
            setLoading(false);
            return;
          }
        }

        const [coachRes, ensemblesRes, statusRes] = await Promise.all([
          fetch(`/api/coaches/${coachId}`),
          fetch("/api/ensembles/me"),
          fetch(`/api/reviews/check-status?coachId=${coachId}`),
        ]);

        if (coachRes.ok) {
          const coachData = await coachRes.json();
          setCoach(coachData);
        } else {
          setError("Coach not found");
          setLoading(false);
          return;
        }

        let eligibleProfiles: EnsembleInfo[] = [];
        if (ensemblesRes.ok) {
          const ensemblesData = await ensemblesRes.json();
          const profiles: EnsembleInfo[] = ensemblesData.profiles || [];

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            const ensembleStatuses: Record<string, { status: string }> = statusData.ensembleStatuses || {};
            eligibleProfiles = profiles.filter(p => {
              const s = ensembleStatuses[p.id];
              return !s || s.status === "can_review" || s.status === "can_update";
            });
            const hasUpdate = eligibleProfiles.some(p => {
              const s = ensembleStatuses[p.id];
              return s && s.status === "can_update";
            });
            if (hasUpdate) setIsUpdate(true);
          } else {
            eligibleProfiles = profiles;
          }

          setEnsembles(eligibleProfiles);
          if (eligibleProfiles.length === 1) {
            setSelectedEnsembleId(eligibleProfiles[0].id);
          }
          if (eligibleProfiles.length === 0 && profiles.length > 0) {
            setError("All your ensembles have already reviewed this coach recently. You can submit an updated review after the 9-month cooldown period.");
          }
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coachId, session, status, router]);

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
    if (!selectedEnsembleId) {
      setError("Please select an ensemble profile");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews/ensemble-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachProfileId: coachId,
          ensembleProfileId: selectedEnsembleId,
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
          router.push(`/coaches/${coachId}`);
        }, 3000);
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

  if (!emailVerified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
          <p className="text-gray-600 mb-4">You need to verify your email address before you can submit reviews. Please check your inbox for the verification email.</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{isUpdate ? "Review Updated!" : "Review Submitted!"}</h2>
        <p className="text-gray-600">{isUpdate ? "Your updated review has been submitted! The coach will be notified and can approve it." : "Your review has been submitted! The coach will be notified and can approve it."}</p>
        <p className="text-sm text-gray-500 mt-2">Redirecting to the coach profile...</p>
      </div>
    );
  }

  if (error && !coach) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!coach) return null;

  const coachSkills = coach.coachSkills || [];
  const groupedSkills: Record<string, CoachSkillItem[]> = {};
  for (const cs of coachSkills) {
    const cat = cs.skill.category;
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(cs);
  }


  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{isUpdate ? "Update Your Review" : "Submit a Review"}</h1>

      {isUpdate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            You&apos;re submitting an updated review for this coach. Your previous review will remain visible on their profile, and this new review will reflect your latest experience.
          </p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Please note:</strong> Because this review is unprompted, the coach will need to approve it before it goes live. However, they will <strong>not</strong> be able to see your rating, comments, or selected skills before deciding — they will only see your ensemble name and the coaching period.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {coach.photoUrl ? (
                <Image src={coach.photoUrl} alt={coach.fullName} width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="text-coral-500 text-xl font-bold">{coach.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{coach.fullName}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {coach.city}, {coach.state}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-6">
        <p className="text-sm text-blue-800">
          This review will be sent to the coach for approval. The coach will not see the review content until they approve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {ensembles.length > 1 && (
          <Card>
            <CardHeader><h2 className="text-lg font-semibold">Reviewing As *</h2></CardHeader>
            <CardContent>
              <select
                value={selectedEnsembleId}
                onChange={(e) => setSelectedEnsembleId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 sm:text-sm"
              >
                <option value="">Select an ensemble profile...</option>
                {ensembles.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.ensembleName} ({ep.ensembleType} &middot; {ep.city}, {ep.state})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

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
            {submitting ? "Submitting..." : isUpdate ? "Submit Updated Review" : "Submit Review"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>}>
      <SubmitReviewContent />
    </Suspense>
  );
}
