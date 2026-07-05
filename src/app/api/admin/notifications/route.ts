import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentNotifications, getUnreadNotificationCount } from "@/lib/data/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    getRecentNotifications(user.id, 10),
    getUnreadNotificationCount(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
