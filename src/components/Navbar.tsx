"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Menu, X, User, LogOut, Shield, LayoutDashboard, Settings, MessageSquare, ChevronDown } from "lucide-react";
import Button from "./ui/Button";
import NotificationBell from "./NotificationBell";
import FeedbackModal from "./FeedbackModal";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.userType === "admin";
  const hasCoachProfile = !!session?.user?.coachProfileId;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="CoachConnect" width={36} height={36} className="rounded-full" />
                <span className="text-xl font-bold text-gray-900">
                  CoachConnect
                </span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link
                  href="/coaches"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Find Coaches
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1.5"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:gap-3">
              {session ? (
                <div className="flex items-center gap-3">
                  {(session.user.ensembleProfileIds?.length > 0 || isAdmin || hasCoachProfile) && <NotificationBell isAdmin={isAdmin} hasCoachProfile={hasCoachProfile} />}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>{session.user.name}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/account"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Account Settings
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); setFeedbackOpen(true); }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Send Feedback
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            <div className="sm:hidden flex items-center gap-2">
              {((session?.user?.ensembleProfileIds?.length ?? 0) > 0 || isAdmin || hasCoachProfile) && <NotificationBell isAdmin={isAdmin} hasCoachProfile={hasCoachProfile} />}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/coaches"
                className="block text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Coaches
              </Link>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/account"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); setFeedbackOpen(true); }}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium w-full text-left"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Feedback
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block text-coral-500 hover:text-coral-600 py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
