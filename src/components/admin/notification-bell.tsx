"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/admin/notifications/actions";
import type { Notification } from "@/types";

const POLL_INTERVAL_MS = 60_000;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Non-critical — the bell just stays at its last known state.
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      await markNotificationReadAction(notification.id);
    }
  }

  async function handleMarkAllRead() {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsReadAction();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-nomad-fog transition-colors hover:bg-nomad-steel/50"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nomad-red px-1 text-[0.6rem] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold text-nomad-white">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-nomad-ash hover:text-nomad-red"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-nomad-ash">You&apos;re all caught up.</p>
        ) : (
          <div className="flex max-h-96 flex-col overflow-y-auto">
            {notifications.map((notification) => {
              const content = (
                <div
                  className={cn(
                    "flex flex-col gap-0.5 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-nomad-steel/50",
                    !notification.isRead && "bg-nomad-red/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-nomad-white">{notification.title}</span>
                    {!notification.isRead && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-nomad-red" />}
                  </div>
                  <p className="text-xs text-nomad-ash">{notification.message}</p>
                  <span className="text-[0.65rem] text-nomad-ash/70">{formatDate(notification.createdAt)}</span>
                </div>
              );

              return notification.link ? (
                <Link key={notification.id} href={notification.link} onClick={() => handleNotificationClick(notification)}>
                  {content}
                </Link>
              ) : (
                <button key={notification.id} type="button" onClick={() => handleNotificationClick(notification)} className="text-left">
                  {content}
                </button>
              );
            })}
          </div>
        )}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <Badge variant="outline" className="mx-2 my-1 w-fit normal-case">
              Showing latest {notifications.length}
            </Badge>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
