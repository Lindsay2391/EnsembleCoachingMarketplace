"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyReviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/ensemble");
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">
      Redirecting to your dashboard...
    </div>
  );
}
