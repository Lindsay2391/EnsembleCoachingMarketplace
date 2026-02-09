"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, DollarSign, Star, Shield, MessageSquare, Phone, Mail, Globe, Pencil, AlertTriangle, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import { formatCurrency, parseJsonArray } from "@/lib/utils";

interface CoachSkillItem {
  id: string;
  skillId: string;
  displayOrder: number;
  endorsementCount: number;
  skill: {
    id: string;
    name: string;
    category: string;
    isCustom: boolean;
  };
}

interface CoachProfile {
  id: string;
  userId: string;
  fullName: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  photoUrl: string | null;
  videoUrl: string | null;
  specialties: string;
  ensembleTypes: string;
  experienceLevels: string;
  contactMethod: string | null;
  contactDetail: string | null;
  rateHourly: number | null;
  rateHalfDay: number | null;
  rateFullDay: number | null;
  ratesOnEnquiry: boolean;
  currency: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  approved: boolean;
  verified: boolean;
  cancellationPolicy: string | null;
  travelSupplement: number | null;
  profileViews: number;
  user: { email: string; name: string };
  coachSkills?: CoachSkillItem[];
}

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  sessionMonth: number;
  sessionYear: number;
  sessionFormat: string;
  validatedSkills: string;
  createdAt: string;
  reviewer: { ensembleName: string; ensembleType: string };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ContactIcon({ method }: { method: string }) {
  switch (method) {
    case "phone": return <Phone className="h-4 w-4" />;
    case "email": return <Mail className="h-4 w-4" />;
    case "website": return <Globe className="h-4 w-4" />;
    default: return null;
  }
}

function ContactLabel({ method }: { method: string }) {
  switch (method) {
    case "phone": return <>Phone</>;
    case "email": return <>Email</>;
    case "website": return <>Website</>;
    default: return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v");
      if (!videoId && parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default function CoachProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  useEffect(() => {
    async function fetchCoach() {
      try {
        const [coachRes, reviewsRes] = await Promise.all([
          fetch(`/api/coaches/${params.id}`),
          fetch(`/api/coaches/${params.id}/reviews`),
        ]);
        if (coachRes.ok) setCoach(await coachRes.json());
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchCoach();
  }, [params.id]);

  useEffect(() => {
    if (!session?.user || !params.id) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        setIsFavorite(data.favoriteIds?.includes(params.id) ?? false);
      })
      .catch(() => {});
  }, [session, params.id]);

  const toggleFavorite = async () => {
    if (!session) return;
    const prev = isFavorite;
    setIsFavorite(!prev);
    setTogglingFav(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachProfileId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.favorited);
      } else {
        setIsFavorite(prev);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setIsFavorite(prev);
    } finally {
      setTogglingFav(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading profile...</div>;
  }

  if (!coach) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Coach not found</div>;
  }

  const coachSkills = coach.coachSkills || [];
  const ensembleTypes = parseJsonArray(coach.ensembleTypes);
  const experienceLevels = parseJsonArray(coach.experienceLevels);

  const groupedSkills: Record<string, CoachSkillItem[]> = {};
  for (const cs of coachSkills) {
    const cat = cs.skill.category;
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(cs);
  }

  const topSkills = [...coachSkills]
    .sort((a, b) => b.endorsementCount - a.endorsementCount)
    .filter(cs => cs.endorsementCount > 0)
    .slice(0, 5);

  const skillVerificationCounts: Record<string, number> = {};
  const skillVerifiers: Record<string, string[]> = {};
  reviews.forEach((review) => {
    const validated = parseJsonArray(review.validatedSkills);
    validated.forEach((skill) => {
      skillVerificationCounts[skill] = (skillVerificationCounts[skill] || 0) + 1;
      if (!skillVerifiers[skill]) skillVerifiers[skill] = [];
      if (!skillVerifiers[skill].includes(review.reviewer.ensembleName)) {
        skillVerifiers[skill].push(review.reviewer.ensembleName);
      }
    });
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {coach.photoUrl ? (
                <Image src={coach.photoUrl} alt={coach.fullName} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="text-coral-500 text-3xl font-bold">{coach.fullName.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{coach.fullName}</h1>
                {coach.verified && <Badge variant="success"><Shield className="h-3 w-3 mr-1" />Verified</Badge>}
              </div>

              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin className="h-4 w-4" />
                {coach.city}, {coach.state}, {coach.country}
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <StarRating rating={coach.rating} size={18} />
                  <span className="text-sm text-gray-600 ml-1">
                    {coach.rating.toFixed(1)} ({coach.totalReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {session?.user?.id === coach.userId && (
                  <Link href="/dashboard/coach/profile">
                    <Button>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
                {session && session.user?.id !== coach.userId && (
                  <Button
                    variant="outline"
                    onClick={toggleFavorite}
                    disabled={togglingFav}
                    className={isFavorite ? "border-coral-300 text-coral-600" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-coral-500 text-coral-500" : ""}`} />
                    {isFavorite ? "Favourited" : "Favourite"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {session?.user?.id === coach.userId && (!coach.approved || !coach.verified) && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {!coach.approved && !coach.verified
                ? "Your profile is pending admin approval and verification. It will not be publicly visible until an admin approves it."
                : !coach.approved
                ? "Your profile is pending admin approval. It will not be publicly visible until an admin approves it."
                : "Your profile is not yet verified. While it is visible, verification adds extra credibility."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900">About</h2></CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">{coach.bio}</p>
            </CardContent>
          </Card>

          {coach.videoUrl && (() => {
            const embedUrl = getYouTubeEmbedUrl(coach.videoUrl);
            return (
              <Card>
                <CardHeader><h2 className="text-lg font-semibold text-gray-900">Video Introduction</h2></CardHeader>
                <CardContent>
                  {embedUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={embedUrl}
                        title="Video Introduction"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <a href={coach.videoUrl} target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:underline">
                        Watch Video Introduction
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Reviews ({coach.totalReviews})
              </h2>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewer.ensembleName}</p>
                          <p className="text-sm text-gray-500">{review.reviewer.ensembleType}</p>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      {review.reviewText && (
                        <p className="text-gray-600 mt-2">{review.reviewText}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">
                          {MONTH_NAMES[review.sessionMonth - 1]} {review.sessionYear}
                        </span>
                        <Badge variant={review.sessionFormat === "in_person" ? "info" : "default"}>
                          {review.sessionFormat === "in_person" ? "In Person" : "Virtual"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {coach.contactMethod && coach.contactDetail && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><MessageSquare className="h-4 w-4 inline mr-1" />Contact</h2></CardHeader>
              <CardContent>
                {coach.contactMethod === "email" ? (
                  <a href={`mailto:${coach.contactDetail}`} className="inline-flex items-center justify-center gap-2 w-full text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 px-4 py-2.5 rounded-lg transition-colors">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </a>
                ) : coach.contactMethod === "phone" ? (
                  <div className="relative w-full h-10 [perspective:600px]">
                    <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${phoneRevealed ? "[transform:rotateX(180deg)]" : ""}`}>
                      <button
                        onClick={() => setPhoneRevealed(true)}
                        className="absolute inset-0 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 rounded-lg transition-colors [backface-visibility:hidden]"
                      >
                        <Phone className="h-4 w-4" />
                        Show Number
                      </button>
                      <div className="absolute inset-0 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-coral-600 bg-coral-50 border border-coral-200 rounded-lg [backface-visibility:hidden] [transform:rotateX(180deg)]">
                        <Phone className="h-4 w-4" />
                        {coach.contactDetail}
                      </div>
                    </div>
                  </div>
                ) : coach.contactMethod === "website" ? (
                  <a href={coach.contactDetail} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 px-4 py-2.5 rounded-lg transition-colors">
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{coach.contactDetail}</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900"><DollarSign className="h-4 w-4 inline mr-1" />Rates</h2></CardHeader>
            <CardContent>
              {coach.ratesOnEnquiry ? (
                <p className="text-gray-600 text-sm italic">Rates available on enquiry. Please contact this coach directly for pricing.</p>
              ) : (
                <div className="space-y-3">
                  {coach.rateHourly && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly</span>
                      <span className="font-semibold">{formatCurrency(coach.rateHourly, coach.currency)}</span>
                    </div>
                  )}
                  {coach.rateHalfDay && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Half Day</span>
                      <span className="font-semibold">{formatCurrency(coach.rateHalfDay, coach.currency)}</span>
                    </div>
                  )}
                  {coach.rateFullDay && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Day</span>
                      <span className="font-semibold">{formatCurrency(coach.rateFullDay, coach.currency)}</span>
                    </div>
                  )}
                  {coach.travelSupplement && (
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Travel Supplement</span>
                      <span className="font-semibold">{formatCurrency(coach.travelSupplement, coach.currency)}</span>
                    </div>
                  )}
                  {!coach.rateHourly && !coach.rateHalfDay && !coach.rateFullDay && (
                    <p className="text-gray-500 text-sm">No rates listed</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {topSkills.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Star className="h-4 w-4 inline mr-1" />Top Skills</h2></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {topSkills.map((cs) => (
                    <Badge key={cs.id} variant="success" className="cursor-default">
                      {cs.skill.name} ✓{cs.endorsementCount}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Star className="h-4 w-4 inline mr-1" />Skills</h2></CardHeader>
            <CardContent>
              {Object.keys(groupedSkills).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(groupedSkills).map(([category, catSkills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {catSkills.map((cs) => {
                          const count = cs.endorsementCount;
                          const reviewCount = skillVerificationCounts[cs.skill.name] || 0;
                          const totalCount = count || reviewCount;
                          const verifiers = skillVerifiers[cs.skill.name] || [];
                          return totalCount > 0 ? (
                            <span key={cs.id} className="relative group">
                              <Badge variant="success" className="cursor-default">{cs.skill.name} ✓{totalCount}</Badge>
                              {verifiers.length > 0 && (
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-max max-w-xs">
                                  <span className="block rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                                    <span className="block font-semibold mb-1">Verified by:</span>
                                    {verifiers.map((name) => (
                                      <span key={name} className="block">{name}</span>
                                    ))}
                                  </span>
                                  <span className="block mx-auto w-2 h-2 bg-gray-900 rotate-45 -mt-1"></span>
                                </span>
                              )}
                            </span>
                          ) : (
                            <Badge key={cs.id} variant="info">{cs.skill.name}</Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No skills listed</p>
              )}
            </CardContent>
          </Card>

          {ensembleTypes.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Clock className="h-4 w-4 inline mr-1" />Ensemble Types</h2></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ensembleTypes.map((t) => (<Badge key={t}>{t}</Badge>))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Clock className="h-4 w-4 inline mr-1" />Experience Levels</h2></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((l) => (<Badge key={l}>{l}</Badge>))}
              </div>
            </CardContent>
          </Card>

          {coach.cancellationPolicy && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900">Cancellation Policy</h2></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{coach.cancellationPolicy}</p>
              </CardContent>
            </Card>
          )}

          <BuyMeACoffee variant="inline" />
        </div>
      </div>
    </div>
  );
}
