"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Filter, X, Heart, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import { formatCurrency, EXPERIENCE_LEVELS, AUSTRALIAN_STATES } from "@/lib/utils";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
  totalEndorsements: number;
}

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
  ratesOnEnquiry: boolean;
  currency: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  verified: boolean;
  matchCount?: number;
  isFavorite?: boolean;
  relevanceScore?: number;
  coachSkills?: CoachSkillItem[];
}

function CoachBrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [skillCategories, setSkillCategories] = useState<Record<string, SkillItem[]>>({});

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const s = searchParams.get("skills");
    return s ? s.split(",").filter(Boolean) : [];
  });
  const [state, setState] = useState(searchParams.get("state") || "");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experienceLevel") || "");
  const [page, setPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [skillSearchResults, setSkillSearchResults] = useState<Array<{ id: string; name: string; category: string; coachCount: number }>>([]);
  const [skillSearchLoading, setSkillSearchLoading] = useState(false);
  const [showSkillSearch, setShowSkillSearch] = useState(false);

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(data => setSkillCategories(data.skills || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!skillSearchTerm || skillSearchTerm.length < 2) {
      setSkillSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSkillSearchLoading(true);
      try {
        const res = await fetch(`/api/skills?mode=search&search=${encodeURIComponent(skillSearchTerm)}`);
        const data = await res.json();
        setSkillSearchResults((data.results || []).filter(
          (s: { name: string }) => !selectedSkills.includes(s.name)
        ));
      } catch {
        setSkillSearchResults([]);
      } finally {
        setSkillSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [skillSearchTerm, selectedSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedSkills.length > 0) params.set("skills", selectedSkills.join(","));
    if (state) params.set("state", state);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/coaches?${params}`);
      const data = await res.json();
      setCoaches(data.coaches || []);
      setTotal(data.total || 0);
      const favIds = new Set<string>();
      (data.coaches || []).forEach((c: Coach) => {
        if (c.isFavorite) favIds.add(c.id);
      });
      setFavoriteIds(favIds);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSkills, state, experienceLevel, page]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const toggleFavorite = async (e: React.MouseEvent, coachId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    const wasFav = favoriteIds.has(coachId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(coachId);
      else next.add(coachId);
      return next;
    });
    setTogglingFav(coachId);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachProfileId: coachId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (data.favorited) next.add(coachId);
          else next.delete(coachId);
          return next;
        });
      } else {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFav) next.add(coachId);
          else next.delete(coachId);
          return next;
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(coachId);
        else next.delete(coachId);
        return next;
      });
    } finally {
      setTogglingFav(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCoaches();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
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
            {(selectedSkills.length > 0 || state || experienceLevel) && (
              <span className="ml-1.5 bg-coral-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {(selectedSkills.length > 0 ? 1 : 0) + (state ? 1 : 0) + (experienceLevel ? 1 : 0)}
              </span>
            )}
          </Button>
        </form>

        {selectedSkills.length > 0 && !showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Filtering by:</span>
            {selectedSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-coral-100 text-coral-700 hover:bg-coral-200 transition-colors"
              >
                {skill}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={() => { setSelectedSkills([]); setPage(1); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {showFilters && (
          <Card>
            <CardContent className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Skills
                    {selectedSkills.length > 0 && (
                      <span className="ml-2 text-coral-600">({selectedSkills.length} selected)</span>
                    )}
                  </label>
                  {selectedSkills.length > 0 && (
                    <button
                      onClick={() => { setSelectedSkills([]); setPage(1); }}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear skills
                    </button>
                  )}
                </div>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-coral-500 text-white hover:bg-coral-600 transition-colors"
                      >
                        {skill}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for a skill..."
                        value={skillSearchTerm}
                        onChange={(e) => { setSkillSearchTerm(e.target.value); setShowSkillSearch(true); }}
                        onFocus={() => setShowSkillSearch(true)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                      />
                    </div>
                  </div>
                  {showSkillSearch && skillSearchTerm.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {skillSearchLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                      ) : skillSearchResults.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No skills found</div>
                      ) : (
                        skillSearchResults.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              toggleSkill(s.name);
                              setSkillSearchTerm("");
                              setShowSkillSearch(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-coral-50 transition-colors flex items-center justify-between"
                          >
                            <span>
                              <span className="text-gray-900">{s.name}</span>
                              <span className="text-gray-400 ml-2 text-xs">{s.category}</span>
                            </span>
                            <span className="text-gray-400 text-xs">{s.coachCount} coach{s.coachCount !== 1 ? "es" : ""}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {Object.entries(skillCategories).map(([category, categorySkills]) => {
                    const selectedCount = categorySkills.filter(s => selectedSkills.includes(s.name)).length;
                    const isExpanded = expandedCategories[category] === true;
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                        >
                          <span className="font-medium text-gray-700">{category}</span>
                          <div className="flex items-center gap-2">
                            {selectedCount > 0 && (
                              <span className="bg-coral-500 text-white text-xs px-2 py-0.5 rounded-full">{selectedCount}</span>
                            )}
                            <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-3 py-2 flex flex-wrap gap-1.5">
                            {categorySkills.map((s) => (
                              <button key={s.id} type="button" onClick={() => toggleSkill(s.name)}
                                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                  selectedSkills.includes(s.name) ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-600 border-gray-300 hover:border-coral-300"
                                }`}>{s.name}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading coaches...</div>
      ) : coaches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No coaches found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => {
            const coachSkillNames = (coach.coachSkills || [])
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(cs => cs.skill.name);
            const matchCount = selectedSkills.length > 0
              ? selectedSkills.filter(s => coachSkillNames.includes(s)).length
              : 0;
            const isFav = favoriteIds.has(coach.id);
            return (
              <Link key={coach.id} href={`/coaches/${coach.id}`}>
                <Card className={`h-full hover:shadow-md transition-shadow cursor-pointer ${isFav ? "ring-2 ring-coral-200" : ""}`}>
                  <CardContent className="py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {coach.photoUrl ? (
                          <Image
                            src={coach.photoUrl}
                            alt={coach.fullName}
                            width={56}
                            height={56}
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
                      {session && (
                        <button
                          onClick={(e) => toggleFavorite(e, coach.id)}
                          disabled={togglingFav === coach.id}
                          className="flex-shrink-0 p-1.5 rounded-full hover:bg-coral-50 transition-colors"
                          title={isFav ? "Remove from favourites" : "Add to favourites"}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${
                              isFav ? "fill-coral-500 text-coral-500" : "text-gray-300 hover:text-coral-400"
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {selectedSkills.length > 0 && matchCount > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-coral-600">
                          Matches {matchCount} of {selectedSkills.length} selected skill{selectedSkills.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {coach.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {coachSkillNames.slice(0, 4).map((s) => (
                        <Badge key={s} variant={selectedSkills.includes(s) ? "default" : "info"}>
                          {s}
                        </Badge>
                      ))}
                      {coachSkillNames.length > 4 && (
                        <span className="text-xs text-gray-400 self-center">+{coachSkillNames.length - 4} more</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <StarRating rating={coach.rating} size={14} />
                        <span className="text-sm text-gray-500">
                          ({coach.totalReviews})
                        </span>
                      </div>
                      {coach.ratesOnEnquiry ? (
                        <span className="text-sm text-gray-500 italic">On enquiry</span>
                      ) : coach.rateHourly ? (
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(coach.rateHourly, coach.currency)}/hr
                        </span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

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
