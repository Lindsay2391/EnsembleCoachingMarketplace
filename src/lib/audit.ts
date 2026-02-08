import { prisma } from "./prisma";

export type AuditAction =
  | "coach_approved"
  | "coach_rejected"
  | "coach_verified"
  | "coach_unverified"
  | "coach_deleted"
  | "user_deleted"
  | "admin_registered";

export type AuditTargetType = "coach" | "user";

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
