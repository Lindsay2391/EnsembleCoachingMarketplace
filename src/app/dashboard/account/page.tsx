"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
      })
      .catch(() => setError("Failed to load account details"))
      .finally(() => setLoading(false));
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Name updated successfully
              </div>
            )}

            <Input
              id="name"
              label="Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">{email}</p>
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
