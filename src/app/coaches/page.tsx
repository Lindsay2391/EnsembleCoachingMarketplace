"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Filter } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import { formatCurrency, parseJsonArray, SPECIALTIES, EXPERIENCE_LEVELS, AUSTRALIAN_STATES } from "@/lib/utils";

interface Coach {
  id: string;
  fullName: string;
  city: string;
  state: string;
  bio: string;
  photoUrl: string | null;
  specialties: string;
  experienceLevels: string;
  rateHourly: number | null;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  verified: boolean;
}

function CoachBrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experienceLevel") || "");
  const [page, setPage] = useState(1);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (specialty) params.set("specialty", specialty);
    if (state) params.set("state", state);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/coaches?${params}`);
      const data = await res.json();
      setCoaches(data.coaches || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, specialty, state, experienceLevel, page]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCoaches();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSpecialty("");
    setState("");
    setExperienceLevel("");
    setPage(1);
    router.push("/coaches");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Coach</h1>
        <p className="mt-2 text-gray-600">
          Browse qualified coaches for your ensemble ({total} available)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </form>

        {showFilters && (
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Specialty"
                  value={specialty}
                  onChange={(e) => { setSpecialty(e.target.value); setPage(1); }}
                  placeholder="All Specialties"
                  options={SPECIALTIES.map((s) => ({ value: s, label: s }))}
                />
                <Select
                  label="State"
                  value={state}
                  onChange={(e) => { setState(e.target.value); setPage(1); }}
                  placeholder="All States"
                  options={AUSTRALIAN_STATES.map((s) => ({ value: s, label: s }))}
                />
                <Select
                  label="Experience Level"
                  value={experienceLevel}
                  onChange={(e) => { setExperienceLevel(e.target.value); setPage(1); }}
                  placeholder="All Levels"
                  options={EXPERIENCE_LEVELS.map((l) => ({ value: l, label: l }))}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading coaches...</div>
      ) : coaches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No coaches found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <Link key={coach.id} href={`/coaches/${coach.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                      {coach.photoUrl ? (
                        <img
                          src={coach.photoUrl}
                          alt={coach.fullName}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-coral-500 text-xl font-bold">
                          {coach.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {coach.fullName}
                        </h3>
                        {coach.verified && (
                          <Badge variant="success">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {coach.city}, {coach.state}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {coach.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {parseJsonArray(coach.specialties).slice(0, 3).map((s) => (
                      <Badge key={s} variant="info">{s}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <StarRating rating={coach.rating} size={14} />
                      <span className="text-sm text-gray-500">
                        ({coach.totalReviews})
                      </span>
                    </div>
                    {coach.rateHourly && (
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(coach.rateHourly)}/hr
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CoachesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <CoachBrowseContent />
    </Suspense>
  );
}
