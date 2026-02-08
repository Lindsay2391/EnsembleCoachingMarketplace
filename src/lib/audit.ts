import { prisma } from "./prisma";

export type AuditAction =
  | "coach_approved"
  | "coach_rejected"
  | "coach_verified"
  | "coach_unverified"
  | "coach_deleted"
  | "user_deleted"
  | "admin_registered"
  | "review_deleted"
  | "skill_hidden"
  | "skill_shown"
  | "skill_deleted";

export type AuditTargetType = "coach" | "user" | "review" | "skill";

export async function logAdminAction({
  adminId,
  adminName,
  action,
  targetType,
  targetId,
  targetName,
  details,
}: {
  adminId: string;
  adminName: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  targetName?: string;
  details?: string;
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        action,
        targetType,
        targetId: targetId || null,
        targetName: targetName || null,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
