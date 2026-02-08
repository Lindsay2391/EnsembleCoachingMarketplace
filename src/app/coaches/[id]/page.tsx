"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, DollarSign, Star, Shield, Calendar, MessageSquare, Phone, Mail, Globe, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import { formatCurrency, parseJsonArray, groupSkillsByCategory } from "@/lib/utils";

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
  verified: boolean;
  cancellationPolicy: string | null;
  travelSupplement: number | null;
  profileViews: number;
  user: { email: string; name: string };
}

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  preparationRating: number | null;
  communicationRating: number | null;
  teachingRating: number | null;
  valueRating: number | null;
  createdAt: string;
  reviewer: { ensembleName: string; ensembleType: string };
}

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

export default function CoachProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading profile...</div>;
  }

  if (!coach) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Coach not found</div>;
  }

  const skills = parseJsonArray(coach.specialties);
  const groupedSkills = groupSkillsByCategory(skills);
  const ensembleTypes = parseJsonArray(coach.ensembleTypes);
  const experienceLevels = parseJsonArray(coach.experienceLevels);

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
                <span className="text-sm text-gray-500">
                  {coach.totalBookings} bookings completed
                </span>
              </div>

              {session?.user?.id === coach.userId && (
                <div className="flex gap-3 mt-4">
                  <Link href="/dashboard/coach/profile">
                    <Button>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              )}
              {session?.user?.userType === "ensemble" && (
                <div className="flex gap-3 mt-4">
                  <Link href={`/bookings/new?coachId=${coach.id}`}>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book This Coach
                    </Button>
                  </Link>
                  <Link href={`/messages?to=${coach.userId}`}>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900">About</h2></CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">{coach.bio}</p>
            </CardContent>
          </Card>

          {coach.videoUrl && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900">Video Introduction</h2></CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <a href={coach.videoUrl} target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:underline">
                    Watch Video Introduction
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        {review.preparationRating && <span>Preparation: {review.preparationRating}/5</span>}
                        {review.communicationRating && <span>Communication: {review.communicationRating}/5</span>}
                        {review.teachingRating && <span>Teaching: {review.teachingRating}/5</span>}
                        {review.valueRating && <span>Value: {review.valueRating}/5</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
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
                <div className="flex items-center gap-3 p-3 bg-coral-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center text-coral-600">
                    <ContactIcon method={coach.contactMethod} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <ContactLabel method={coach.contactMethod} />
                    </p>
                    {coach.contactMethod === "website" ? (
                      <a href={coach.contactDetail} target="_blank" rel="noopener noreferrer" className="text-coral-600 hover:underline text-sm font-medium">
                        {coach.contactDetail}
                      </a>
                    ) : coach.contactMethod === "email" ? (
                      <a href={`mailto:${coach.contactDetail}`} className="text-coral-600 hover:underline text-sm font-medium">
                        {coach.contactDetail}
                      </a>
                    ) : coach.contactMethod === "phone" ? (
                      <a href={`tel:${coach.contactDetail}`} className="text-coral-600 hover:underline text-sm font-medium">
                        {coach.contactDetail}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{coach.contactDetail}</p>
                    )}
                  </div>
                </div>
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

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Star className="h-4 w-4 inline mr-1" />Skills</h2></CardHeader>
            <CardContent>
              {Object.keys(groupedSkills).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(groupedSkills).map(([category, catSkills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {catSkills.map((s) => (<Badge key={s} variant="info">{s}</Badge>))}
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
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Clock className="h-4 w-4 inline mr-1" />Coaches</h2></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ensembleTypes.map((t) => (<Badge key={t}>{t}</Badge>))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Clock className="h-4 w-4 inline mr-1" />Teaches</h2></CardHeader>
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
        </div>
      </div>
    </div>
  );
}
