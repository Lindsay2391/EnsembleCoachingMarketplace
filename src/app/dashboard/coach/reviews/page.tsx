"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Send, Search, CheckCircle, Clock, AlertCircle, X } from "lucide-react";
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

interface EnsembleResult {
  id: string;
  ensembleName: string;
  ensembleType: string;
  city: string;
  state: string;
}

export default function CoachReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invites, setInvites] = useState<ReviewInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
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
    if (searchQuery.trim().length < 2) {
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
  }, [searchQuery, selectedEnsemble]);

  async function searchEnsembles(q: string) {
    setSearching(true);
    try {
      const res = await fetch(`/api/ensembles/search?q=${encodeURIComponent(q)}`);
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

            <div ref={searchRef} className="relative">
              <label htmlFor="ensembleSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Search Ensemble
              </label>
              {selectedEnsemble ? (
                <div className="flex items-center justify-between rounded-lg border border-coral-300 bg-coral-50 px-3 py-2.5">
                  <div>
                    <span className="font-medium text-gray-900">{selectedEnsemble.ensembleName}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {selectedEnsemble.ensembleType} &middot; {selectedEnsemble.city}, {selectedEnsemble.state}
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
                    placeholder="Type at least 2 characters to search..."
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
                        {ensemble.ensembleType} &middot; {ensemble.city}, {ensemble.state}
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
