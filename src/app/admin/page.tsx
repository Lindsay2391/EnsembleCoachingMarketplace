"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Users, UserCheck, CheckCircle, XCircle, BarChart3, Trash2, ClipboardList, Star, Eye, EyeOff, Lightbulb, MessageSquare } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
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
  coachSkills?: Array<{ skill: { name: string } }>;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  userType: string;
  hasCoachProfile: boolean;
  hasEnsembleProfile: boolean;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  details: string | null;
  createdAt: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  reviewText: string | null;
  sessionMonth: number;
  sessionYear: number;
  sessionFormat: string;
  createdAt: string;
  coachProfile: { id: string; fullName: string };
  reviewer: { ensembleName: string };
}

interface AdminSkillItem {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
  showInFilter: boolean;
  coachCount: number;
  createdAt: string;
}

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  message: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  bug_report: { label: "Bug Report", color: "bg-red-100 text-red-800" },
  feature_request: { label: "Feature Request", color: "bg-blue-100 text-blue-800" },
  usability: { label: "Usability", color: "bg-purple-100 text-purple-800" },
  general: { label: "General", color: "bg-gray-100 text-gray-800" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-amber-100 text-amber-800" },
  reviewed: { label: "Reviewed", color: "bg-green-100 text-green-800" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-600" },
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  coach_approved: { label: "Approved Coach", color: "bg-green-100 text-green-800" },
  coach_rejected: { label: "Rejected Coach", color: "bg-red-100 text-red-800" },
  coach_verified: { label: "Verified Coach", color: "bg-blue-100 text-blue-800" },
  coach_unverified: { label: "Unverified Coach", color: "bg-yellow-100 text-yellow-800" },
  coach_deleted: { label: "Deleted Coach", color: "bg-red-100 text-red-800" },
  user_deleted: { label: "Deleted User", color: "bg-red-100 text-red-800" },
  admin_registered: { label: "Admin Registered", color: "bg-purple-100 text-purple-800" },
  review_deleted: { label: "Deleted Review", color: "bg-red-100 text-red-800" },
  skill_hidden: { label: "Hidden Skill", color: "bg-yellow-100 text-yellow-800" },
  skill_shown: { label: "Shown Skill", color: "bg-green-100 text-green-800" },
  skill_deleted: { label: "Deleted Skill", color: "bg-red-100 text-red-800" },
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [adminReviews, setAdminReviews] = useState<ReviewItem[]>([]);
  const [adminSkills, setAdminSkills] = useState<AdminSkillItem[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "new" | "reviewed" | "archived">("all");
  const [activeTab, setActiveTab] = useState<"coaches" | "users" | "reviews" | "skills" | "feedback" | "audit">("coaches");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) setAdminReviews(await res.json());
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/skills");
      if (res.ok) setAdminSkills(await res.json());
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      if (res.ok) setFeedbackItems(await res.json());
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, coachesRes, usersRes, auditRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/coaches"),
        fetch("/api/admin/users"),
        fetch("/api/admin/audit-log"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (coachesRes.ok) {
        const coachesData = await coachesRes.json();
        setCoaches(coachesData.coaches || coachesData);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || usersData);
      }
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      await Promise.all([fetchReviews(), fetchSkills(), fetchFeedback()]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchReviews, fetchSkills, fetchFeedback]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "loading") return;
    if (session?.user?.userType !== "admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [session, status, router, fetchData]);

  const refreshAuditLog = async () => {
    const res = await fetch("/api/admin/audit-log");
    if (res.ok) setAuditLogs(await res.json());
  };

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
        await refreshAuditLog();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCoach = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the coach profile for "${name}"? This cannot be undone.`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/coaches/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoaches((prev) => prev.filter((c) => c.id !== id));
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) setStats(await statsRes.json());
        await refreshAuditLog();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the account for "${name}"? This will also remove any associated coach profile. This cannot be undone.`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setCoaches((prev) => prev.filter((c) => c.user.id !== id));
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) setStats(await statsRes.json());
        await refreshAuditLog();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSkillFilter = async (id: string, showInFilter: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, showInFilter }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAdminSkills(prev => prev.map(s => s.id === id ? updated : s));
        await refreshAuditLog();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteSkill = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the skill "${name}"? This will remove it from all coach profiles.`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdminSkills(prev => prev.filter(s => s.id !== id));
        await refreshAuditLog();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReview = async (id: string, coachName: string, ensembleName: string) => {
    if (!confirm(`Are you sure you want to delete the review by "${ensembleName}" for "${coachName}"? This cannot be undone.`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdminReviews((prev) => prev.filter((r) => r.id !== id));
        await refreshAuditLog();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFeedbackItems(prev => prev.map(f => f.id === id ? updated : f));
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "reviews"
              ? "bg-coral-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Star className="h-4 w-4" />
          Reviews
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "skills"
              ? "bg-coral-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Skills
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "feedback"
              ? "bg-coral-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
          {feedbackItems.filter(f => f.status === "new").length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
              {feedbackItems.filter(f => f.status === "new").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "bg-coral-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Activity Log
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
                        <Link href={`/coaches/${coach.id}`} target="_blank" className="font-medium text-coral-600 hover:text-coral-700 hover:underline">{coach.fullName}</Link>
                        <div className="text-sm text-gray-500">{coach.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {coach.city}, {coach.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {coach.coachSkills ? coach.coachSkills.length : parseSkills(coach.specialties).length} skills
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
                          <button
                            onClick={() => deleteCoach(coach.id, coach.fullName)}
                            disabled={updatingId === coach.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {user.userType === "admin" && (
                            <Badge variant="danger">Admin</Badge>
                          )}
                          {user.hasCoachProfile && (
                            <Badge variant="info">Coach</Badge>
                          )}
                          {user.hasEnsembleProfile && (
                            <Badge variant="default">Ensemble</Badge>
                          )}
                          {user.userType !== "admin" && !user.hasCoachProfile && !user.hasEnsembleProfile && (
                            <span className="text-xs text-gray-400">No profiles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.userType !== "admin" ? (
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={updatingId === user.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "reviews" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ensemble</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  adminReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{review.coachProfile.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{review.reviewer.ensembleName}</td>
                      <td className="px-6 py-4">
                        <StarRating rating={review.rating} size={14} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteReview(review.id, review.coachProfile.fullName, review.reviewer.ensembleName)}
                          disabled={updatingId === review.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "skills" && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Predefined skills always show in the filter. Custom skills appear automatically when 5+ coaches have them.
              You can manually hide any skill from the filter or delete custom skills.
            </p>
          </CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Coaches</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">In Filter</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminSkills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No skills found
                    </td>
                  </tr>
                ) : (
                  adminSkills.map((skill) => {
                    const meetsThreshold = !skill.isCustom || skill.coachCount >= 5;
                    const effectivelyInFilter = skill.showInFilter && meetsThreshold;
                    return (
                      <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900 text-sm">{skill.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{skill.category}</td>
                        <td className="px-6 py-3">
                          {skill.isCustom ? (
                            <Badge variant="warning">Custom</Badge>
                          ) : (
                            <Badge variant="info">Predefined</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{skill.coachCount}</td>
                        <td className="px-6 py-3">
                          {effectivelyInFilter ? (
                            <Badge variant="success">Visible</Badge>
                          ) : !skill.showInFilter ? (
                            <Badge variant="danger">Hidden by admin</Badge>
                          ) : (
                            <Badge variant="default">Below threshold</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSkillFilter(skill.id, !skill.showInFilter)}
                              disabled={updatingId === skill.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                                skill.showInFilter
                                  ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {skill.showInFilter ? (
                                <><EyeOff className="h-3.5 w-3.5" /> Hide</>
                              ) : (
                                <><Eye className="h-3.5 w-3.5" /> Show</>
                              )}
                            </button>
                            {skill.isCustom && (
                              <button
                                onClick={() => deleteSkill(skill.id, skill.name)}
                                disabled={updatingId === skill.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "feedback" && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">Filter:</span>
              {(["all", "new", "reviewed", "archived"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFeedbackFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    feedbackFilter === f
                      ? "bg-coral-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && (
                    <span className="ml-1">({feedbackItems.filter(fb => fb.status === f).length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {feedbackItems
              .filter(f => feedbackFilter === "all" || f.status === feedbackFilter)
              .length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No feedback {feedbackFilter !== "all" ? `with status "${feedbackFilter}"` : "submitted yet"}
              </div>
            ) : (
              feedbackItems
                .filter(f => feedbackFilter === "all" || f.status === feedbackFilter)
                .map((fb) => {
                  const catInfo = CATEGORY_LABELS[fb.category] || { label: fb.category, color: "bg-gray-100 text-gray-800" };
                  const statusInfo = STATUS_LABELS[fb.status] || { label: fb.status, color: "bg-gray-100 text-gray-800" };
                  return (
                    <div key={fb.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{fb.message}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-medium">{fb.userName}</span>
                            <span>{fb.userEmail}</span>
                            <span>{formatDate(fb.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fb.status !== "reviewed" && (
                            <button
                              onClick={() => updateFeedbackStatus(fb.id, "reviewed")}
                              disabled={updatingId === fb.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Reviewed
                            </button>
                          )}
                          {fb.status !== "archived" && (
                            <button
                              onClick={() => updateFeedbackStatus(fb.id, "archived")}
                              disabled={updatingId === fb.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              Archive
                            </button>
                          )}
                          {fb.status !== "new" && (
                            <button
                              onClick={() => updateFeedbackStatus(fb.id, "new")}
                              disabled={updatingId === fb.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                              Mark New
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No activity recorded yet
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => {
                    const actionInfo = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: "bg-gray-100 text-gray-800",
                    };
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{log.adminName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.targetName ? (
                            <div>
                              <span className="text-sm text-gray-900">{log.targetName}</span>
                              <span className="text-xs text-gray-400 ml-1">({log.targetType})</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.details || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
