"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Send, Search, CheckCircle, Clock, AlertCircle, X, Check, XCircle, MapPin, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import { COUNTRY_NAMES, getRegionsForCountry, getRegionLabel } from "@/lib/utils";

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

interface EnsembleResult {
  id: string;
  ensembleName: string;
  ensembleType: string;
  city: string;
  state: string;
  country: string;
}

interface PendingEnsembleReview {
  id: string;
  sessionMonth: number;
  sessionYear: number;
  sessionFormat: string;
  createdAt: string;
  ensembleProfile: {
    ensembleName: string;
    ensembleType: string;
    city: string;
    state: string;
    country: string;
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CoachReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invites, setInvites] = useState<ReviewInvite[]>([]);
  const [pendingEnsembleReviews, setPendingEnsembleReviews] = useState<PendingEnsembleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [searchResults, setSearchResults] = useState<EnsembleResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEnsemble, setSelectedEnsemble] = useState<EnsembleResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    fetchPendingEnsembleReviews();
  }, [session, status, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedEnsemble) return;
    const hasFilters = filterCountry || filterState;
    if (searchQuery.trim().length < 2 && !hasFilters) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchEnsembles(searchQuery.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedEnsemble, filterCountry, filterState]);

  async function searchEnsembles(q: string) {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (q.length >= 2) params.set("q", q);
      if (filterCountry) params.set("country", filterCountry);
      if (filterState) params.set("state", filterState);
      const res = await fetch(`/api/ensembles/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }

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

  async function fetchPendingEnsembleReviews() {
    try {
      const res = await fetch("/api/reviews/ensemble-pending");
      if (res.ok) {
        setPendingEnsembleReviews(await res.json());
      }
    } catch (err) {
      console.error("Error fetching pending ensemble reviews:", err);
    }
  }

  async function handleEnsembleReviewAction(reviewId: string, action: "approve" | "reject") {
    setProcessing(reviewId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/reviews/ensemble-approve/${reviewId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setSuccess(action === "approve" ? "Review confirmed and published!" : "Review declined.");
        fetchPendingEnsembleReviews();
        if (action === "approve") fetchInvites();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to process review");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setProcessing(null);
    }
  }

  function handleSelectEnsemble(ensemble: EnsembleResult) {
    setSelectedEnsemble(ensemble);
    setSearchQuery(ensemble.ensembleName);
    setShowDropdown(false);
    setSearchResults([]);
  }

  function handleClearSelection() {
    setSelectedEnsemble(null);
    setSearchQuery("");
    setSearchResults([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedEnsemble) {
      setError("Please search for and select an ensemble from the list");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/reviews/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ensembleProfileId: selectedEnsemble.id }),
      });

      if (res.ok) {
        setSuccess(`Review invite sent to ${selectedEnsemble.ensembleName}!`);
        handleClearSelection();
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
          <p className="mt-1 text-gray-600">Invite ensembles registered on CoachConnect to leave reviews</p>
        </div>
      </div>

      {pendingEnsembleReviews.length > 0 && (
        <Card className="mb-8 border-coral-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-coral-500" />
              Reviews Pending Confirmation
            </h2>
            <p className="text-sm text-gray-500 mt-1">Ensembles have reviewed your coaching. You&apos;ll see who sent each review, but the rating, testimonial, and skills will only be revealed after you confirm.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEnsembleReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{review.ensembleProfile.ensembleName}</p>
                      <p className="text-sm text-gray-500">{review.ensembleProfile.ensembleType}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {review.ensembleProfile.city}, {review.ensembleProfile.state}, {review.ensembleProfile.country}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">
                          Coaching in {MONTH_NAMES[review.sessionMonth - 1]} {review.sessionYear}
                        </span>
                        <Badge variant={review.sessionFormat === "in_person" ? "info" : "default"}>
                          {review.sessionFormat === "in_person" ? "In Person" : "Virtual"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleEnsembleReviewAction(review.id, "approve")}
                        disabled={processing === review.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnsembleReviewAction(review.id, "reject")}
                        disabled={processing === review.id}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-coral-500" />
            Invite a Review
          </h2>
          <p className="text-sm text-gray-500 mt-1">Search for an ensemble that&apos;s registered on CoachConnect</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                id="filterCountry"
                label="Filter by Country"
                value={filterCountry}
                onChange={(e) => { setFilterCountry(e.target.value); setFilterState(""); setSelectedEnsemble(null); }}
                placeholder="All countries"
                options={COUNTRY_NAMES.map((c) => ({ value: c, label: c }))}
              />
              <Select
                id="filterState"
                label={`Filter by ${filterCountry ? getRegionLabel(filterCountry) : "State/Region"}`}
                value={filterState}
                onChange={(e) => { setFilterState(e.target.value); setSelectedEnsemble(null); }}
                placeholder={filterCountry ? `All ${getRegionLabel(filterCountry).toLowerCase()}s` : "Select country first"}
                options={filterCountry ? getRegionsForCountry(filterCountry).map((s) => ({ value: s, label: s })) : []}
                disabled={!filterCountry}
              />
            </div>

            <div ref={searchRef} className="relative">
              <label htmlFor="ensembleSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Search Ensemble
              </label>
              {selectedEnsemble ? (
                <div className="flex items-center justify-between rounded-lg border border-coral-300 bg-coral-50 px-3 py-2.5">
                  <div>
                    <span className="font-medium text-gray-900">{selectedEnsemble.ensembleName}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {selectedEnsemble.ensembleType} &middot; {selectedEnsemble.city}, {selectedEnsemble.state}{selectedEnsemble.country ? `, ${selectedEnsemble.country}` : ""}
                    </span>
                  </div>
                  <button type="button" onClick={handleClearSelection} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="ensembleSearch"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedEnsemble(null);
                    }}
                    placeholder={filterCountry || filterState ? "Search by name or browse filtered results..." : "Type at least 2 characters to search..."}
                    className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 sm:text-sm"
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Searching...</div>
                  )}
                </div>
              )}

              {showDropdown && searchResults.length > 0 && !selectedEnsemble && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((ensemble) => (
                    <button
                      key={ensemble.id}
                      type="button"
                      onClick={() => handleSelectEnsemble(ensemble)}
                      className="w-full text-left px-4 py-3 hover:bg-coral-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{ensemble.ensembleName}</p>
                      <p className="text-sm text-gray-500">
                        {ensemble.ensembleType} &middot; {ensemble.city}, {ensemble.state}{ensemble.country ? `, ${ensemble.country}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {showDropdown && searchResults.length === 0 && searchQuery.trim().length >= 2 && !searching && !selectedEnsemble && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                  <p className="px-4 py-3 text-sm text-gray-500">No ensembles found matching &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>

            <Button type="submit" disabled={sending || !selectedEnsemble}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Review Invite"}
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
