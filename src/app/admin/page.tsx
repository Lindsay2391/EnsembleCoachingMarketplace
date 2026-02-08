"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Users, UserCheck, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Stats {
  totalUsers: number;
  totalCoaches: number;
  pendingApprovals: number;
  verifiedCoaches: number;
}

interface Coach {
  id: string;
  fullName: string;
  city: string;
  state: string;
  specialties: string;
  verified: boolean;
  approved: boolean;
  user: { id: string; email: string; name: string; createdAt: string };
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  userType: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [activeTab, setActiveTab] = useState<"coaches" | "users">("coaches");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, coachesRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/coaches"),
        fetch("/api/admin/users"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (coachesRes.ok) setCoaches(await coachesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;
    if (session?.user?.userType !== "admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [session, status, router, fetchData]);

  const updateCoach = async (id: string, data: { approved?: boolean; verified?: boolean }) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/coaches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCoaches((prev) => prev.map((c) => (c.id === id ? updated : c)));
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const parseSkills = (specialties: string): string[] => {
    try {
      return JSON.parse(specialties);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-coral-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-gray-600">Platform overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-5 text-center">
            <Users className="h-6 w-6 text-coral-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <BarChart3 className="h-6 w-6 text-coral-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalCoaches || 0}</p>
            <p className="text-sm text-gray-500">Total Coaches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <Shield className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals || 0}</p>
            <p className="text-sm text-gray-500">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <UserCheck className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.verifiedCoaches || 0}</p>
            <p className="text-sm text-gray-500">Verified Coaches</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("coaches")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "coaches"
              ? "bg-coral-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Coaches
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "users"
              ? "bg-coral-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === "coaches" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coaches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No coaches found
                    </td>
                  </tr>
                ) : (
                  coaches.map((coach) => (
                    <tr key={coach.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{coach.fullName}</div>
                        <div className="text-sm text-gray-500">{coach.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {coach.city}, {coach.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {parseSkills(coach.specialties).length} skills
                      </td>
                      <td className="px-6 py-4">
                        {coach.verified ? (
                          <Badge variant="success">Verified</Badge>
                        ) : (
                          <Badge variant="default">Unverified</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {coach.approved ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCoach(coach.id, { verified: !coach.verified })}
                            disabled={updatingId === coach.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                              coach.verified
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {coach.verified ? "Unverify" : "Verify"}
                          </button>
                          {coach.approved ? (
                            <button
                              onClick={() => updateCoach(coach.id, { approved: false })}
                              disabled={updatingId === coach.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          ) : (
                            <button
                              onClick={() => updateCoach(coach.id, { approved: true })}
                              disabled={updatingId === coach.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            user.userType === "admin"
                              ? "danger"
                              : user.userType === "coach"
                              ? "info"
                              : "default"
                          }
                        >
                          {user.userType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
