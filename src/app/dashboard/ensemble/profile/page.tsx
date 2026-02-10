"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EXPERIENCE_LEVELS, ENSEMBLE_TYPES, VOICE_RANGES, COUNTRY_NAMES, getRegionsForCountry, getRegionLabel } from "@/lib/utils";

const GENRES = [
  "Barbershop",
  "A Cappella",
  "Contemporary",
  "Jazz",
  "Pop",
  "Gospel",
  "Classical",
  "Folk",
];

export default function EnsembleProfileForm() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>}>
      <EnsembleProfileFormContent />
    </Suspense>
  );
}

function EnsembleProfileFormContent() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [existingId, setExistingId] = useState<string | null>(editId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [ensembleName, setEnsembleName] = useState("");
  const [ensembleType, setEnsembleType] = useState("");
  const [voiceRange, setVoiceRange] = useState("");
  const [size, setSize] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Australia");
  const [genres, setGenres] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function loadProfile() {
      if (editId) {
        try {
          const res = await fetch(`/api/ensembles/${editId}`);
          if (res.ok) {
            const data = await res.json();
            setExistingId(data.id);
            setEnsembleName(data.ensembleName || "");
            setEnsembleType(data.ensembleType || "");
            setVoiceRange(data.voiceRange || "");
            setSize(data.size?.toString() || "");
            setCity(data.city || "");
            setState(data.state || "");
            setCountry(data.country || "Australia");
            setExperienceLevel(data.experienceLevel || "");
            try {
              setGenres(JSON.parse(data.genres || "[]"));
            } catch {
              setGenres([]);
            }
          }
        } catch {
          // Could not load profile
        }
      }
      setLoading(false);
    }

    loadProfile();
  }, [session, status, router, editId]);

  const toggleGenre = (genre: string) => {
    setGenres(genres.includes(genre) ? genres.filter((g) => g !== genre) : [...genres, genre]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = {
      ensembleName,
      ensembleType,
      voiceRange: voiceRange || undefined,
      size: size ? parseInt(size) : undefined,
      city,
      state,
      country,
      genres,
      experienceLevel,
    };

    try {
      const url = existingId ? `/api/ensembles/${existingId}` : "/api/ensembles";
      const method = existingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile");
      } else {
        const data = await res.json();
        setExistingId(data.id);
        setSuccess(existingId ? "Profile updated!" : "Profile created!");
        if (!existingId) {
          await updateSession();
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {existingId ? "Edit Ensemble Profile" : "Create Ensemble Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Ensemble Details</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input id="ensembleName" label="Ensemble Name *" value={ensembleName} onChange={(e) => setEnsembleName(e.target.value)} required placeholder="e.g. Harmony Heights Chorus" />
            <div className="grid grid-cols-2 gap-4">
              <Select id="ensembleType" label="Ensemble Type *" value={ensembleType} onChange={(e) => setEnsembleType(e.target.value)} required placeholder="Select type" options={ENSEMBLE_TYPES.map((t) => ({ value: t.toLowerCase().replace(/ /g, "_"), label: t }))} />
              <Select id="voiceRange" label="Voice Range" value={voiceRange} onChange={(e) => setVoiceRange(e.target.value)} placeholder="Select voice range" options={VOICE_RANGES.map((v) => ({ value: v.toLowerCase().replace(/ /g, "_"), label: v }))} />
            </div>
            <Input id="size" label="Group Size" type="number" min="2" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 30" />
            <Select id="country" label="Country *" value={country} onChange={(e) => { setCountry(e.target.value); setState(""); }} required placeholder="Select country" options={COUNTRY_NAMES.map((c) => ({ value: c, label: c }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" label="City *" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Melbourne" />
              <Select id="state" label={`${getRegionLabel(country)} *`} value={state} onChange={(e) => setState(e.target.value)} required placeholder={`Select ${getRegionLabel(country).toLowerCase()}`} options={getRegionsForCountry(country).map((s) => ({ value: s, label: s }))} />
            </div>
            <Select id="experienceLevel" label="Experience Level *" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} required placeholder="Select level" options={EXPERIENCE_LEVELS.map((l) => ({ value: l.toLowerCase(), label: l }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Genres / Styles</h2></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button key={genre} type="button" onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    genres.includes(genre) ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                  }`}>{genre}</button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "Saving..." : existingId ? "Update Profile" : "Create Profile"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/dashboard")}>Cancel</Button>
        </div>
      </form>

      {existingId && (
        <div className="mt-10 border-t border-red-200 pt-8">
          <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Delete Ensemble Profile</p>
                <p className="text-sm text-gray-500">Remove your ensemble listing. Your account will remain active.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                className="border-red-300 text-red-600 hover:bg-red-50 whitespace-nowrap"
                onClick={async () => {
                  if (!confirm("Are you sure you want to delete your ensemble profile? All bookings, reviews, and related data will be permanently removed. This cannot be undone.")) return;
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/ensembles/${existingId}`, { method: "DELETE" });
                    if (res.ok) {
                      await updateSession();
                      router.push("/dashboard");
                    } else {
                      const data = await res.json();
                      setError(data.error || "Failed to delete profile");
                    }
                  } catch {
                    setError("Something went wrong");
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Deleting..." : "Delete Profile"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
