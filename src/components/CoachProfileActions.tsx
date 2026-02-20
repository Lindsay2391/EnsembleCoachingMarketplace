"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Pencil, Heart, MessageSquareText, Clock, Phone } from "lucide-react";

export function FavoriteButton({ coachId }: { coachId: string }) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        setIsFavorite(data.favoriteIds?.includes(coachId) ?? false);
      })
      .catch(() => {});
  }, [session, coachId]);

  const toggle = async () => {
    if (!session) return;
    const prev = isFavorite;
    setIsFavorite(!prev);
    setToggling(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachProfileId: coachId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.favorited);
      } else {
        setIsFavorite(prev);
      }
    } catch {
      setIsFavorite(prev);
    } finally {
      setToggling(false);
    }
  };

  if (!session) return null;

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
        isFavorite
          ? "bg-coral-50 border-2 border-coral-400 text-coral-600 hover:bg-coral-100"
          : "bg-white border-2 border-coral-300 text-coral-500 hover:bg-coral-50 hover:border-coral-400"
      } ${toggling ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-coral-500 text-coral-500" : ""}`} />
      {isFavorite ? "Favourited" : "Favourite"}
    </button>
  );
}

function ReviewButton({ coachId }: { coachId: string }) {
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [monthsLeft, setMonthsLeft] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews/check-status?coachId=${coachId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviewStatus(data.status);
        if (data.monthsLeft) setMonthsLeft(data.monthsLeft);
      })
      .catch(() => setReviewStatus("can_review"));
  }, [coachId]);

  if (reviewStatus === null) return null;

  if (reviewStatus === "cooldown") {
    return (
      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed">
        <Clock className="h-5 w-5" />
        Review update in {monthsLeft} month{monthsLeft !== 1 ? "s" : ""}
      </span>
    );
  }

  if (reviewStatus === "pending") {
    return (
      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-amber-50 border-2 border-amber-200 text-amber-600 cursor-not-allowed">
        <Clock className="h-5 w-5" />
        Review pending approval
      </span>
    );
  }

  if (reviewStatus === "can_update") {
    return (
      <Link href={`/reviews/submit?coachId=${coachId}`}>
        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-coral-500 text-white hover:bg-coral-600 transition-colors">
          <MessageSquareText className="h-5 w-5" />
          Update Review
        </span>
      </Link>
    );
  }

  return (
    <Link href={`/reviews/submit?coachId=${coachId}`}>
      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-coral-500 text-white hover:bg-coral-600 transition-colors">
        <MessageSquareText className="h-5 w-5" />
        Submit a Review
      </span>
    </Link>
  );
}

export function CoachProfileActionButtons({
  coachId,
  coachUserId,
}: {
  coachId: string;
  coachUserId: string;
}) {
  const { data: session } = useSession();

  if (!session) return null;

  const isOwner = session.user?.id === coachUserId;

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {isOwner && (
        <Link href="/dashboard/coach/profile">
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      )}
      {!isOwner && <FavoriteButton coachId={coachId} />}
      {!isOwner && session.user?.ensembleProfileIds?.length > 0 && (
        <ReviewButton coachId={coachId} />
      )}
    </div>
  );
}

export function PhoneRevealButton({ contactDetail }: { contactDetail: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative w-full h-10 [perspective:600px]">
      <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${revealed ? "[transform:rotateX(180deg)]" : ""}`}>
        <button
          onClick={() => setRevealed(true)}
          className="absolute inset-0 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 rounded-lg transition-colors [backface-visibility:hidden]"
        >
          <Phone className="h-4 w-4" />
          Call
        </button>
        <div className="absolute inset-0 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-coral-600 bg-coral-50 border border-coral-200 rounded-lg [backface-visibility:hidden] [transform:rotateX(180deg)]">
          <Phone className="h-4 w-4" />
          {contactDetail}
        </div>
      </div>
    </div>
  );
}

export function OwnerWarningBanner({
  coachUserId,
  approved,
  verified,
}: {
  coachUserId: string;
  approved: boolean;
  verified: boolean;
}) {
  const { data: session } = useSession();

  if (!session || session.user?.id !== coachUserId) return null;
  if (approved && verified) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      <div>
        <p className="text-sm font-medium text-amber-800">
          {!approved && !verified
            ? "Your profile is pending admin approval and verification. It will not be publicly visible until an admin approves it."
            : !approved
            ? "Your profile is pending admin approval. It will not be publicly visible until an admin approves it."
            : "Your profile is not yet verified. While it is visible, verification adds extra credibility."}
        </p>
      </div>
    </div>
  );
}
