"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CoachDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading") return;

    async function redirectToProfile() {
      try {
        const res = await fetch("/api/coaches/me");
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.id) {
            router.replace(`/coaches/${data.profile.id}`);
          } else {
            router.replace("/dashboard/coach/profile");
          }
        } else {
          router.replace("/dashboard/coach/profile");
        }
      } catch {
        router.replace("/dashboard/coach/profile");
      }
    }

    redirectToProfile();
  }, [session, status, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
      Redirecting...
    </div>
  );
}
