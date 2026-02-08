"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";

export default function ReviewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [preparationRating, setPreparationRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [teachingRating, setTeachingRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please provide an overall rating");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: params.id,
          rating,
          reviewText: reviewText || undefined,
          preparationRating: preparationRating || undefined,
          communicationRating: communicationRating || undefined,
          teachingRating: teachingRating || undefined,
          valueRating: valueRating || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
      } else {
        router.push(`/bookings/${params.id}`);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!session || !session.user.ensembleProfileId) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">You need an ensemble profile to submit reviews.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Leave a Review</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Overall Rating *</h2></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} size={32} interactive onChange={setRating} />
              <span className="text-lg font-medium text-gray-700">{rating > 0 ? `${rating}/5` : "Select rating"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Category Ratings</h2></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Preparation", value: preparationRating, setter: setPreparationRating },
              { label: "Communication", value: communicationRating, setter: setCommunicationRating },
              { label: "Teaching Effectiveness", value: teachingRating, setter: setTeachingRating },
              { label: "Value for Money", value: valueRating, setter: setValueRating },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <StarRating rating={value} size={20} interactive onChange={setter} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Written Review</h2></CardHeader>
          <CardContent>
            <Textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience with this coach..." rows={5} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} size="lg">{saving ? "Submitting..." : "Submit Review"}</Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
