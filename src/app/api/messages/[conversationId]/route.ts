import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const partnerId = params.conversationId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        recipientId: userId,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
