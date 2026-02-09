export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, message } = await req.json();

    if (!category || !message?.trim()) {
      return NextResponse.json({ error: "Category and message are required" }, { status: 400 });
    }

    const validCategories = ["bug_report", "feature_request", "general", "usability"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message must be 2000 characters or less" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        userEmail: session.user.email || "",
        category,
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
