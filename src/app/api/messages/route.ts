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

    // Get all unique conversations (grouped by the other user)
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, userType: true } },
        recipient: { select: { id: true, name: true, userType: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group messages by conversation partner
    const conversationMap = new Map<string, {
      partnerId: string;
      partnerName: string;
      partnerType: string;
      lastMessage: string;
      lastMessageAt: string;
      unreadCount: number;
      bookingId: string | null;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const partner = msg.senderId === userId ? msg.recipient : msg.sender;

      if (!conversationMap.has(partnerId)) {
        const unreadCount = messages.filter(
          (m: typeof messages[number]) => m.senderId === partnerId && m.recipientId === userId && !m.read
        ).length;

        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerType: partner.userType,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt.toISOString(),
          unreadCount,
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
