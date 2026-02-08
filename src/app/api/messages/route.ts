import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Get distinct conversation partners by finding the latest message per partner
    // Step 1: Get unread counts per sender (DB-level aggregation instead of loading all messages)
    const unreadCounts = await prisma.message.groupBy({
      by: ["senderId"],
      where: {
        recipientId: userId,
        read: false,
      },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadCounts.map((u) => [u.senderId, u._count.id]));

    // Step 2: Get the latest message per conversation partner
    // Fetch recent messages ordered by date, then deduplicate by partner in JS
    // Limit to a reasonable window to avoid full table scans
    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, userType: true } },
        recipient: { select: { id: true, name: true, userType: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Cap to avoid loading unbounded messages
    });

    // Deduplicate: keep only the first (most recent) message per partner
    const conversationMap = new Map<string, {
      partnerId: string;
      partnerName: string;
      partnerType: string;
      lastMessage: string;
      lastMessageAt: string;
      unreadCount: number;
      bookingId: string | null;
    }>();

    for (const msg of recentMessages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const partner = msg.senderId === userId ? msg.recipient : msg.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerType: partner.userType,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt.toISOString(),
          unreadCount: unreadMap.get(partnerId) || 0,
          bookingId: msg.bookingId,
        });
      }
    }

    return NextResponse.json(Array.from(conversationMap.values()));
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { recipientId, content, bookingId } = body;

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient and content required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        content,
        bookingId: bookingId ?? null,
      },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
