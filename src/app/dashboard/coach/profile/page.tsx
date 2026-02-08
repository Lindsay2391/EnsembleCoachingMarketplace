"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SPECIALTIES, EXPERIENCE_LEVELS, AUSTRALIAN_STATES } from "@/lib/utils";

export default function CoachProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [rateHourly, setRateHourly] = useState("");
  const [rateHalfDay, setRateHalfDay] = useState("");
  const [rateFullDay, setRateFullDay] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [travelSupplement, setTravelSupplement] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function loadProfile() {
      try {
        const res = await fetch("/api/coaches?search=" + encodeURIComponent(session?.user?.name || ""));
        if (res.ok) {
          const data = await res.json();
          const myProfile = data.coaches?.find((c: { userId: string }) => c.userId === session?.user?.id);
          if (myProfile) {
            setExistingId(myProfile.id);
            setFullName(myProfile.fullName);
            setCity(myProfile.city);
            setState(myProfile.state);
            setBio(myProfile.bio);
            setSpecialties(JSON.parse(myProfile.specialties || "[]"));
            setExperienceLevels(JSON.parse(myProfile.experienceLevels || "[]"));
            setRateHourly(myProfile.rateHourly?.toString() || "");
            setRateHalfDay(myProfile.rateHalfDay?.toString() || "");
            setRateFullDay(myProfile.rateFullDay?.toString() || "");
            setPhotoUrl(myProfile.photoUrl || "");
            setVideoUrl(myProfile.videoUrl || "");
            setCancellationPolicy(myProfile.cancellationPolicy || "");
            setTravelSupplement(myProfile.travelSupplement?.toString() || "");
          } else {
            setFullName(session?.user?.name || "");
          }
        }
      } catch {
        // No existing profile
        setFullName(session?.user?.name || "");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [session, status, router]);

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = {
      fullName,
      city,
      state,
      bio,
      specialties,
      experienceLevels,
      rateHourly: rateHourly ? parseFloat(rateHourly) : undefined,
      rateHalfDay: rateHalfDay ? parseFloat(rateHalfDay) : undefined,
      rateFullDay: rateFullDay ? parseFloat(rateFullDay) : undefined,
      photoUrl: photoUrl || undefined,
      videoUrl: videoUrl || undefined,
      cancellationPolicy: cancellationPolicy || undefined,
      travelSupplement: travelSupplement ? parseFloat(travelSupplement) : undefined,
    };

    try {
      const url = existingId ? `/api/coaches/${existingId}` : "/api/coaches";
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
        setSuccess(existingId ? "Profile updated!" : "Profile created! It will be visible once approved by an admin.");
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
        {existingId ? "Edit Coach Profile" : "Create Coach Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Basic Information</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input id="fullName" label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" label="City *" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Sydney" />
              <Select id="state" label="State *" value={state} onChange={(e) => setState(e.target.value)} required placeholder="Select state" options={AUSTRALIAN_STATES.map((s) => ({ value: s, label: s }))} />
            </div>
            <Textarea id="bio" label="Bio *" value={bio} onChange={(e) => setBio(e.target.value)} required placeholder="Tell ensembles about yourself, your experience, and your coaching style..." rows={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Specialties & Experience</h2></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialties *</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button key={s} type="button" onClick={() => toggleArrayItem(specialties, setSpecialties, s)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      specialties.includes(s) ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                    }`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Levels You Teach *</label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((l) => (
                  <button key={l} type="button" onClick={() => toggleArrayItem(experienceLevels, setExperienceLevels, l)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      experienceLevels.includes(l) ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                    }`}>{l}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Rates (AUD)</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input id="rateHourly" label="Hourly Rate" type="number" min="0" step="0.01" value={rateHourly} onChange={(e) => setRateHourly(e.target.value)} placeholder="$150" />
              <Input id="rateHalfDay" label="Half Day Rate" type="number" min="0" step="0.01" value={rateHalfDay} onChange={(e) => setRateHalfDay(e.target.value)} placeholder="$500" />
              <Input id="rateFullDay" label="Full Day Rate" type="number" min="0" step="0.01" value={rateFullDay} onChange={(e) => setRateFullDay(e.target.value)} placeholder="$900" />
            </div>
            <Input id="travelSupplement" label="Travel Supplement (optional)" type="number" min="0" step="0.01" value={travelSupplement} onChange={(e) => setTravelSupplement(e.target.value)} placeholder="Additional travel cost" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Media & Extras</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input id="photoUrl" label="Profile Photo URL" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            <Input id="videoUrl" label="Video Introduction URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
            <Textarea id="cancellationPolicy" label="Cancellation Policy" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} placeholder="e.g. Full refund with 14+ days notice..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "Saving..." : existingId ? "Update Profile" : "Create Profile"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/dashboard/coach")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
