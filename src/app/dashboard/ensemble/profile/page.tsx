"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EXPERIENCE_LEVELS, ENSEMBLE_TYPES, AUSTRALIAN_STATES } from "@/lib/utils";

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
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [ensembleName, setEnsembleName] = useState("");
  const [ensembleType, setEnsembleType] = useState("");
  const [size, setSize] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function loadProfile() {
      try {
        // Try to fetch by looking up via bookings endpoint (will 404 if no profile)
        const res = await fetch("/api/bookings");
        if (res.ok) {
          // Profile exists, try to get it
          // We need a different approach - check if ensemble profile exists
        }
      } catch {
        // No profile
      }
      setLoading(false);
    }

    loadProfile();
  }, [session, status, router]);

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
      size: parseInt(size),
      city,
      state,
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
              <Input id="size" label="Group Size *" type="number" min="2" value={size} onChange={(e) => setSize(e.target.value)} required placeholder="e.g. 30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" label="City *" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Melbourne" />
              <Select id="state" label="State *" value={state} onChange={(e) => setState(e.target.value)} required placeholder="Select state" options={AUSTRALIAN_STATES.map((s) => ({ value: s, label: s }))} />
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
    </div>
  );
}
