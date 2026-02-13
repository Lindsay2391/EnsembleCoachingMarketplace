import { notFound } from "next/navigation";
import CoachAvatar from "@/components/ui/CoachAvatar";
import { MapPin, Clock, DollarSign, Star, Shield, Mail, Globe, Users, Phone as PhoneIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import { formatCurrency, parseJsonArray } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import {
  CoachProfileActionButtons,
  PhoneRevealButton,
  OwnerWarningBanner,
} from "@/components/CoachProfileActions";

interface PageProps {
  params: { id: string };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

export default async function CoachProfilePage({ params }: PageProps) {
  const { id } = params;

  const [coach, reviewsData] = await Promise.all([
    prisma.coachProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        coachSkills: {
          include: { skill: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    }),
    prisma.review.findMany({
      where: { coachProfileId: id },
      include: {
        reviewer: {
          select: { ensembleName: true, ensembleType: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!coach) {
    notFound();
  }

  // Increment profile views in background (non-blocking)
  prisma.coachProfile.update({
    where: { id },
    data: { profileViews: { increment: 1 } },
  }).catch(() => {});

  const coachSkills = coach.coachSkills || [];
  const ensembleTypes = parseJsonArray(coach.ensembleTypes);
  const experienceLevels = parseJsonArray(coach.experienceLevels);
  const coachingFormats = parseJsonArray(coach.coachingFormats);
  const voiceTypes = parseJsonArray(coach.voiceTypes);

  const groupedSkills: Record<string, typeof coachSkills> = {};
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
  reviewsData.forEach((review) => {
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
              <CoachAvatar photoUrl={coach.photoUrl} fullName={coach.fullName} size={96} textSize="text-3xl" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{coach.fullName}</h1>
                {coach.pronouns && <span className="text-sm text-gray-500">({coach.pronouns})</span>}
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

              <CoachProfileActionButtons coachId={coach.id} coachUserId={coach.userId} />
            </div>
          </div>
        </CardContent>
      </Card>

      <OwnerWarningBanner coachUserId={coach.userId} approved={coach.approved} verified={coach.verified} />

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
                        loading="lazy"
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

          {reviewsData.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Reviews ({coach.totalReviews})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviewsData.map((review) => (
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
                        <Badge variant="info">
                          {review.sessionFormat === "in_person" ? "In Person" : "Virtual"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {coach.contactMethod && coach.contactDetail && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><PhoneIcon className="h-4 w-4 inline mr-1" />Contact</h2></CardHeader>
              <CardContent>
                {coach.contactMethod === "email" ? (
                  <a href={`mailto:${coach.contactDetail}`} className="inline-flex items-center justify-center gap-2 w-full text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 px-4 py-2.5 rounded-lg transition-colors">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </a>
                ) : coach.contactMethod === "phone" ? (
                  <PhoneRevealButton contactDetail={coach.contactDetail} />
                ) : coach.contactMethod === "website" ? (
                  <a href={coach.contactDetail.startsWith("http") ? coach.contactDetail : `https://${coach.contactDetail}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 px-4 py-2.5 rounded-lg transition-colors">
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{coach.contactDetail}</p>
                )}
              </CardContent>
            </Card>
          )}

          {(coach.ratesOnEnquiry || coach.rateHourly || coach.rateHalfDay || coach.rateFullDay || coach.rateWeekend) && (
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
                    {coach.rateWeekend && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekend</span>
                        <span className="font-semibold">{formatCurrency(coach.rateWeekend, coach.currency)}</span>
                      </div>
                    )}
                    {coach.travelSupplement && (
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Travel Supplement</span>
                        <span className="font-semibold">{formatCurrency(coach.travelSupplement, coach.currency)}</span>
                      </div>
                    )}
                    {coach.ratesNotes && (
                      <p className="text-sm text-gray-500 italic pt-2 border-t border-gray-100">{coach.ratesNotes}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                  {ensembleTypes.map((t) => (<Badge key={t} variant="info">{t}</Badge>))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Clock className="h-4 w-4 inline mr-1" />Experience Levels</h2></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((l) => (<Badge key={l} variant="info">{l}</Badge>))}
              </div>
            </CardContent>
          </Card>

          {coachingFormats.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Globe className="h-4 w-4 inline mr-1" />Coaching Format</h2></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {coachingFormats.includes("in_person") && <Badge variant="info">In Person</Badge>}
                  {coachingFormats.includes("virtual") && <Badge variant="info">Virtual</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          {voiceTypes.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><Users className="h-4 w-4 inline mr-1" />Vocal Ranges</h2></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {voiceTypes.includes("upper_voice") && <Badge variant="info">Upper Range</Badge>}
                  {voiceTypes.includes("mixed_voice") && <Badge variant="info">Mixed Range</Badge>}
                  {voiceTypes.includes("lower_voice") && <Badge variant="info">Lower Range</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          {coach.travelWillingness && (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold text-gray-900"><MapPin className="h-4 w-4 inline mr-1" />Travel Willingness</h2></CardHeader>
              <CardContent>
                <Badge variant="info">
                  {coach.travelWillingness === "own_city" && "Own city only"}
                  {coach.travelWillingness === "within_state" && "Within state"}
                  {coach.travelWillingness === "interstate" && "Interstate / National"}
                  {coach.travelWillingness === "international" && "International"}
                </Badge>
              </CardContent>
            </Card>
          )}

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
