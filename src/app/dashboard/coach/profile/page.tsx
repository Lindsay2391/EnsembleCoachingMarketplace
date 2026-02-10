"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import ImageCropper from "@/components/ui/ImageCropper";
import { EXPERIENCE_LEVELS, ENSEMBLE_TYPES, COUNTRY_NAMES, getRegionsForCountry, getDefaultCurrency, getRegionLabel } from "@/lib/utils";
import { Upload, Phone, Mail, Globe, ChevronUp, ChevronDown, Plus, X, GripVertical } from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
  totalEndorsements: number;
}

const CURRENCIES = [
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "EUR", label: "EUR - Euro" },
];

const CONTACT_METHODS = [
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "website", label: "Website", icon: Globe },
];

export default function CoachProfileForm() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Australia");
  const [bio, setBio] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Record<string, SkillItem[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [ensembleTypes, setEnsembleTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [contactMethod, setContactMethod] = useState<string>("");
  const [contactDetail, setContactDetail] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [rateHourly, setRateHourly] = useState("");
  const [rateHalfDay, setRateHalfDay] = useState("");
  const [rateFullDay, setRateFullDay] = useState("");
  const [rateWeekend, setRateWeekend] = useState("");
  const [ratesOnEnquiry, setRatesOnEnquiry] = useState(false);
  const [ratesNotes, setRatesNotes] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [travelWillingness, setTravelWillingness] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coachingFormats, setCoachingFormats] = useState<string[]>(["in_person", "virtual"]);
  const [voiceTypes, setVoiceTypes] = useState<string[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [travelSupplement, setTravelSupplement] = useState("");
  const [customSkillInputs, setCustomSkillInputs] = useState<Record<string, string>>({});
  const [addingCustomCategory, setAddingCustomCategory] = useState<string | null>(null);
  const [savingCustomSkill, setSavingCustomSkill] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;

    async function loadData() {
      try {
        const [skillsRes, profileRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/coaches?search=" + encodeURIComponent(session?.user?.name || "")),
        ]);

        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          setAvailableSkills(skillsData.skills || {});
        }

        if (profileRes.ok) {
          const data = await profileRes.json();
          const myProfile = data.coaches?.find((c: { userId: string }) => c.userId === session?.user?.id);
          if (myProfile) {
            setExistingId(myProfile.id);
            setFullName(myProfile.fullName);
            setCity(myProfile.city);
            setState(myProfile.state);
            setCountry(myProfile.country || "Australia");
            setBio(myProfile.bio);
            setEnsembleTypes(JSON.parse(myProfile.ensembleTypes || "[]"));
            setExperienceLevels(JSON.parse(myProfile.experienceLevels || "[]"));
            setContactMethod(myProfile.contactMethod || "");
            setContactDetail(myProfile.contactDetail || "");
            setPronouns(myProfile.pronouns || "");
            setRateHourly(myProfile.rateHourly?.toString() || "");
            setRateHalfDay(myProfile.rateHalfDay?.toString() || "");
            setRateFullDay(myProfile.rateFullDay?.toString() || "");
            setRateWeekend(myProfile.rateWeekend?.toString() || "");
            setRatesOnEnquiry(myProfile.ratesOnEnquiry || false);
            setRatesNotes(myProfile.ratesNotes || "");
            setCurrency(myProfile.currency || "AUD");
            setTravelWillingness(myProfile.travelWillingness || "");
            setPhotoUrl(myProfile.photoUrl || "");
            setVideoUrl(myProfile.videoUrl || "");
            setCoachingFormats(JSON.parse(myProfile.coachingFormats || '["in_person","virtual"]'));
            setVoiceTypes(JSON.parse(myProfile.voiceTypes || '[]'));
            setCancellationPolicy(myProfile.cancellationPolicy || "");
            setTravelSupplement(myProfile.travelSupplement?.toString() || "");

            if (myProfile.coachSkills && myProfile.coachSkills.length > 0) {
              const ids = myProfile.coachSkills
                .sort((a: { displayOrder: number }, b: { displayOrder: number }) => a.displayOrder - b.displayOrder)
                .map((cs: { skillId: string }) => cs.skillId);
              setSelectedSkillIds(ids);
            }
          } else {
            setFullName(session?.user?.name || "");
          }
        }
      } catch {
        setFullName(session?.user?.name || "");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, status, router]);

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const toggleSkillId = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const moveSkill = (index: number, direction: "up" | "down") => {
    const newIds = [...selectedSkillIds];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newIds.length) return;
    [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];
    setSelectedSkillIds(newIds);
  };

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.4";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOverItem.current = index;
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const newIds = [...selectedSkillIds];
    const [dragged] = newIds.splice(dragItem.current, 1);
    newIds.splice(dragOverItem.current, 0, dragged);
    setSelectedSkillIds(newIds);

    setDraggingIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
    dragOverItem.current = null;
  }, [selectedSkillIds]);

  const allSkillsList = Object.values(availableSkills).flat();
  const getSkillById = (id: string) => allSkillsList.find(s => s.id === id);

  const handleAddCustomSkill = async (category: string) => {
    const name = customSkillInputs[category]?.trim();
    if (!name) return;
    setSavingCustomSkill(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      if (res.ok) {
        const newSkill = await res.json();
        setAvailableSkills(prev => {
          const updated = { ...prev };
          if (!updated[category]) updated[category] = [];
          updated[category] = [...updated[category], { ...newSkill, totalEndorsements: 0 }];
          return updated;
        });
        setSelectedSkillIds(prev => [...prev, newSkill.id]);
        setCustomSkillInputs(prev => ({ ...prev, [category]: "" }));
        setAddingCustomCategory(null);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add custom skill");
      }
    } catch {
      setError("Failed to add custom skill");
    } finally {
      setSavingCustomSkill(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("Photo must be under 8MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCroppedUpload = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, "profile-photo.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setPhotoUrl(data.url);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case "AUD": case "NZD": case "USD": return "$";
      case "GBP": return "£";
      case "EUR": return "€";
      default: return "$";
    }
  };

  const getContactPlaceholder = () => {
    switch (contactMethod) {
      case "phone": return "+61 4XX XXX XXX";
      case "email": return "your@email.com";
      case "website": return "https://yourwebsite.com";
      default: return "";
    }
  };

  const getContactLabel = () => {
    switch (contactMethod) {
      case "phone": return "Phone Number";
      case "email": return "Email Address";
      case "website": return "Website URL";
      default: return "Contact Detail";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!contactMethod) {
      setError("Please select a preferred contact method.");
      return;
    }
    if (!contactDetail) {
      setError("Please provide your contact details.");
      return;
    }

    setSaving(true);

    const selectedNames = selectedSkillIds
      .map(id => getSkillById(id)?.name)
      .filter(Boolean) as string[];

    const payload = {
      fullName,
      city,
      state,
      country,
      bio,
      specialties: selectedNames,
      skills: selectedSkillIds,
      ensembleTypes,
      experienceLevels,
      contactMethod,
      contactDetail,
      pronouns: pronouns || null,
      rateHourly: ratesOnEnquiry ? null : (rateHourly ? parseFloat(rateHourly) : null),
      rateHalfDay: ratesOnEnquiry ? null : (rateHalfDay ? parseFloat(rateHalfDay) : null),
      rateFullDay: ratesOnEnquiry ? null : (rateFullDay ? parseFloat(rateFullDay) : null),
      rateWeekend: ratesOnEnquiry ? null : (rateWeekend ? parseFloat(rateWeekend) : null),
      ratesOnEnquiry,
      ratesNotes: ratesNotes || null,
      currency,
      travelWillingness: travelWillingness || null,
      travelSupplement: ratesOnEnquiry ? null : (travelSupplement ? parseFloat(travelSupplement) : null),
      photoUrl: photoUrl || null,
      videoUrl: videoUrl || null,
      coachingFormats,
      voiceTypes,
      cancellationPolicy: cancellationPolicy || null,
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
        {existingId ? "Edit Coach Profile" : "Create Coach Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Basic Information</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-coral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {photoUrl ? (
                    <Image src={photoUrl} alt="Profile" width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <span className="text-coral-500 text-3xl font-bold">{fullName.charAt(0) || "?"}</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Button>
                <p className="text-xs text-gray-400">Max 8MB. JPG, PNG, WebP</p>
              </div>
              <div className="flex-1 w-full space-y-4">
                <Input id="fullName" label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <Input id="pronouns" label="Pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="e.g. she/her" />
                <Select id="country" label="Country *" value={country} onChange={(e) => { setCountry(e.target.value); setState(""); setCurrency(getDefaultCurrency(e.target.value)); }} required placeholder="Select country" options={COUNTRY_NAMES.map((c) => ({ value: c, label: c }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input id="city" label="City *" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. Sydney" />
                  <Select id="state" label={`${getRegionLabel(country)} *`} value={state} onChange={(e) => setState(e.target.value)} required placeholder={`Select ${getRegionLabel(country).toLowerCase()}`} options={getRegionsForCountry(country).map((s) => ({ value: s, label: s }))} />
                </div>
              </div>
            </div>
            <Textarea id="bio" label="Bio *" value={bio} onChange={(e) => setBio(e.target.value)} required placeholder="Tell ensembles about yourself, your experience, and your coaching style..." rows={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Preferred Contact Method</h2></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">How should ensembles contact you? <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-3">
                {CONTACT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setContactMethod(m.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        contactMethod === m.value
                          ? "bg-coral-500 text-white border-coral-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {contactMethod && (
              <Input
                id="contactDetail"
                label={`${getContactLabel()} *`}
                value={contactDetail}
                onChange={(e) => setContactDetail(e.target.value)}
                placeholder={getContactPlaceholder()}
                type={contactMethod === "email" ? "email" : "text"}
                required
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Skills & Experience</h2>
              {selectedSkillIds.length > 0 && (
                <span className="text-sm text-coral-600 font-medium">{selectedSkillIds.length} selected</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Skills *</label>
              <div className="space-y-3">
                {Object.entries(availableSkills).map(([category, categorySkills]) => {
                  const selectedCount = categorySkills.filter(s => selectedSkillIds.includes(s.id)).length;
                  const isExpanded = expandedCategories[category] !== false;
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !isExpanded }))}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-800">{category}</span>
                        <div className="flex items-center gap-2">
                          {selectedCount > 0 && (
                            <span className="bg-coral-500 text-white text-xs px-2 py-0.5 rounded-full">{selectedCount}</span>
                          )}
                          <span className="text-gray-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {categorySkills.map((s) => (
                              <button key={s.id} type="button" onClick={() => toggleSkillId(s.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                  selectedSkillIds.includes(s.id) ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                                }`}>
                                {s.name}
                                {s.isCustom && <span className="ml-1 text-xs opacity-75">✦</span>}
                              </button>
                            ))}
                            {addingCustomCategory === category ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={customSkillInputs[category] || ""}
                                  onChange={(e) => setCustomSkillInputs(prev => ({ ...prev, [category]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); handleAddCustomSkill(category); }
                                    if (e.key === "Escape") setAddingCustomCategory(null);
                                  }}
                                  placeholder="Skill name..."
                                  autoFocus
                                  className="px-3 py-1.5 rounded-full text-sm border border-coral-300 focus:outline-none focus:ring-2 focus:ring-coral-200 w-40"
                                  disabled={savingCustomSkill}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddCustomSkill(category)}
                                  disabled={savingCustomSkill || !customSkillInputs[category]?.trim()}
                                  className="px-2.5 py-1.5 rounded-full text-sm bg-coral-500 text-white border border-coral-500 hover:bg-coral-600 disabled:opacity-50 transition-colors"
                                >
                                  {savingCustomSkill ? "..." : "Add"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAddingCustomCategory(null)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAddingCustomCategory(category)}
                                className="px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-500 hover:border-coral-300 hover:text-coral-500 transition-colors flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedSkillIds.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Skills (drag to reorder)</label>
                <div className="space-y-0">
                  {selectedSkillIds.map((skillId, index) => {
                    const skill = getSkillById(skillId);
                    if (!skill) return null;
                    const isDragging = draggingIndex === index;
                    const isOver = dragOverIndex === index && draggingIndex !== null && draggingIndex !== index;
                    const dropAbove = isOver && draggingIndex !== null && draggingIndex > index;
                    const dropBelow = isOver && draggingIndex !== null && draggingIndex < index;
                    return (
                      <div
                        key={skillId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all duration-150 select-none ${
                          isDragging
                            ? "opacity-40 scale-95 bg-gray-100 shadow-inner"
                            : "bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing active:shadow-md active:scale-[1.02] active:bg-white active:ring-2 active:ring-coral-300"
                        } ${dropAbove ? "border-t-2 border-t-coral-500 mt-0.5" : ""} ${dropBelow ? "border-b-2 border-b-coral-500 mb-0.5" : ""} ${!isDragging && !isOver ? "border-t-2 border-t-transparent border-b-2 border-b-transparent" : ""}`}
                      >
                        <GripVertical className={`h-4 w-4 flex-shrink-0 transition-colors ${isDragging ? "text-coral-400" : "text-gray-300 group-hover:text-gray-500"}`} />
                        <span className="text-xs text-gray-400 w-5 font-mono">{index + 1}.</span>
                        <span className="flex-1 text-sm text-gray-800 font-medium">{skill.name}</span>
                        <span className="text-xs text-gray-400 hidden sm:inline">{skill.category}</span>
                        <button type="button" onClick={() => moveSkill(index, "up")} disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-coral-500 disabled:opacity-30 transition-colors">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => moveSkill(index, "down")} disabled={index === selectedSkillIds.length - 1}
                          className="p-1 text-gray-400 hover:text-coral-500 disabled:opacity-30 transition-colors">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ensemble Types You Coach *</label>
              <div className="flex flex-wrap gap-2">
                {ENSEMBLE_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => toggleArrayItem(ensembleTypes, setEnsembleTypes, t)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      ensembleTypes.includes(t) ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                    }`}>{t}</button>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coaching Format *</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleArrayItem(coachingFormats, setCoachingFormats, "in_person")}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    coachingFormats.includes("in_person") ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                  }`}>In Person</button>
                <button type="button" onClick={() => toggleArrayItem(coachingFormats, setCoachingFormats, "virtual")}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    coachingFormats.includes("virtual") ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                  }`}>Virtual</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vocal Ranges</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleArrayItem(voiceTypes, setVoiceTypes, "upper_voice")}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    voiceTypes.includes("upper_voice") ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                  }`}>Upper Ranges</button>
                <button type="button" onClick={() => toggleArrayItem(voiceTypes, setVoiceTypes, "mixed_voice")}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    voiceTypes.includes("mixed_voice") ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                  }`}>Mixed Ranges</button>
                <button type="button" onClick={() => toggleArrayItem(voiceTypes, setVoiceTypes, "lower_voice")}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    voiceTypes.includes("lower_voice") ? "bg-coral-500 text-white border-coral-500" : "bg-white text-gray-700 border-gray-300 hover:border-coral-300"
                  }`}>Lower Ranges</button>
              </div>
            </div>
            <Select id="travelWillingness" label="Travel Willingness" value={travelWillingness} onChange={(e) => setTravelWillingness(e.target.value)} placeholder="Select travel willingness" options={[
              { value: "own_city", label: "Own city only" },
              { value: "within_state", label: "Within state" },
              { value: "interstate", label: "Interstate / National" },
              { value: "international", label: "International" },
            ]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rates</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ratesOnEnquiry}
                  onChange={(e) => setRatesOnEnquiry(e.target.checked)}
                  className="w-4 h-4 text-coral-500 border-gray-300 rounded focus:ring-coral-500"
                />
                <span className="text-sm text-gray-600">Available on enquiry</span>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratesOnEnquiry ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                Your rates will be shown as &quot;Available on enquiry&quot; on your profile.
              </div>
            ) : (
              <>
                <Select
                  id="currency"
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={CURRENCIES}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input id="rateHourly" label="Hourly Rate" type="number" min="0" step="0.01" value={rateHourly} onChange={(e) => setRateHourly(e.target.value)} placeholder={`${getCurrencySymbol()}150`} />
                  <Input id="rateHalfDay" label="Half Day Rate" type="number" min="0" step="0.01" value={rateHalfDay} onChange={(e) => setRateHalfDay(e.target.value)} placeholder={`${getCurrencySymbol()}500`} />
                  <Input id="rateFullDay" label="Full Day Rate" type="number" min="0" step="0.01" value={rateFullDay} onChange={(e) => setRateFullDay(e.target.value)} placeholder={`${getCurrencySymbol()}900`} />
                  <Input id="rateWeekend" label="Weekend Rate" type="number" min="0" step="0.01" value={rateWeekend} onChange={(e) => setRateWeekend(e.target.value)} placeholder={`${getCurrencySymbol()}1200`} />
                </div>
                <Input id="travelSupplement" label="Travel Supplement (optional)" type="number" min="0" step="0.01" value={travelSupplement} onChange={(e) => setTravelSupplement(e.target.value)} placeholder={`${getCurrencySymbol()}0`} />
                <Textarea id="ratesNotes" label="Rates Notes (optional)" value={ratesNotes} onChange={(e) => setRatesNotes(e.target.value)} placeholder="e.g. Travel costs included for local bookings, package deals available..." rows={2} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Media & Extras</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input id="videoUrl" label="Video Introduction URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
            <Textarea id="cancellationPolicy" label="Cancellation Policy" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} placeholder="e.g. Full refund with 14+ days notice..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "Saving..." : existingId ? "Update Profile" : "Create Profile"}
          </Button>
          {existingId && (
            <Button type="button" variant="outline" size="lg" onClick={() => router.push(`/coaches/${existingId}`)}>
              View Profile
            </Button>
          )}
        </div>
      </form>

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCroppedUpload}
          onCancel={() => setCropImageSrc(null)}
          aspectRatio={1}
          cropShape="round"
        />
      )}

      {existingId && (
        <div className="mt-10 border-t border-red-200 pt-8">
          <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Delete Coach Profile</p>
                <p className="text-sm text-gray-500">Remove your coach listing. Your account will remain active.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                className="border-red-300 text-red-600 hover:bg-red-50 whitespace-nowrap"
                onClick={async () => {
                  if (!confirm("Are you sure you want to delete your coach profile? All bookings, reviews, and related data will be permanently removed. This cannot be undone.")) return;
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/coaches/${existingId}`, { method: "DELETE" });
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
