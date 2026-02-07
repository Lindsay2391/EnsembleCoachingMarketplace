"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user) {
      if (session.user.userType === "admin") {
        router.push("/admin");
      } else {
        router.push(`/dashboard/${session.user.userType}`);
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to your dashboard...</p>
    </div>
  );
}
