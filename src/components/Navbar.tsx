"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { Menu, X, User, LogOut, Shield, LayoutDashboard } from "lucide-react";
import Button from "./ui/Button";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.userType === "admin";

  return (
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
              {session && (
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
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
                {session.user.ensembleProfileId && <NotificationBell />}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <User className="h-4 w-4" />
                  {session.user.name}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
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
            {session?.user?.ensembleProfileId && <NotificationBell />}
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
                  className="block text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block text-gray-600 hover:text-gray-900 py-2 text-sm font-medium flex items-center gap-1.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block text-gray-600 hover:text-gray-900 py-2 text-sm font-medium w-full text-left"
                >
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
  );
}
