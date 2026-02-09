"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Star, ShieldAlert, X } from "lucide-react";
import Link from "next/link";

interface PendingInvite {
  id: string;
  ensembleName: string;
  createdAt: string;
  coachProfile: {
    id: string;
    fullName: string;
    city: string;
    state: string;
  };
}

interface NotificationBellProps {
  isAdmin?: boolean;
}

export default function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvites();
    if (isAdmin) fetchPendingApprovals();
    const interval = setInterval(() => {
      fetchInvites();
      if (isAdmin) fetchPendingApprovals();
    }, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchInvites() {
    try {
      const res = await fetch("/api/reviews/invites/pending");
      if (res.ok) {
        setInvites(await res.json());
      }
    } catch {
    }
  }

  async function fetchPendingApprovals() {
    try {
      const res = await fetch("/api/admin/pending-count");
      if (res.ok) {
        const data = await res.json();
        setPendingApprovals(data.count);
      }
    } catch {
    }
  }

  const count = invites.length + pendingApprovals;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            {count === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No new notifications</p>
            ) : (
              <>
                {isAdmin && pendingApprovals > 0 && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-coral-50 border-b border-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{pendingApprovals} coach {pendingApprovals === 1 ? "profile" : "profiles"}</span> pending approval
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Review in Admin Panel
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
                {invites.map((invite) => (
                  <Link
                    key={invite.id}
                    href={`/reviews/write?inviteId=${invite.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-coral-50 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-coral-100 flex-shrink-0">
                        <Star className="h-4 w-4 text-coral-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{invite.coachProfile.fullName}</span> invited you to write a review
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {invite.coachProfile.city}, {invite.coachProfile.state} &middot; {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
          {count > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 flex gap-3">
              {invites.length > 0 && (
                <Link
                  href="/dashboard/ensemble"
                  onClick={() => setOpen(false)}
                  className="text-xs text-coral-500 hover:text-coral-600 font-medium"
                >
                  View invites
                </Link>
              )}
              {isAdmin && pendingApprovals > 0 && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="text-xs text-coral-500 hover:text-coral-600 font-medium"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
