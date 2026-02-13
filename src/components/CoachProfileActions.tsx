"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Pencil, Heart, MessageSquareText, Phone } from "lucide-react";

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
    <Button
      variant="outline"
      onClick={toggle}
      disabled={toggling}
      className={isFavorite ? "border-coral-300 text-coral-600" : ""}
    >
      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-coral-500 text-coral-500" : ""}`} />
      {isFavorite ? "Favourited" : "Favourite"}
    </Button>
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
    <div className="flex gap-3 mt-4">
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
        <Link href={`/reviews/submit?coachId=${coachId}`}>
          <Button variant="outline">
            <MessageSquareText className="h-4 w-4 mr-2" />
            Submit a Review
          </Button>
        </Link>
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
