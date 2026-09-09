"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminNotification, notificationService } from "@/services/notification.service";

const relativeTime = (value: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString();
};

const toneFor = (type: AdminNotification["type"]) => {
  if (["tutor_approved", "course_approved"].includes(type)) return "border-emerald-400";
  if (["tutor_rejected", "course_rejected"].includes(type)) return "border-rose-400";
  if (type === "payment") return "border-violet-400";
  if (type === "enrollment") return "border-sky-400";
  return "border-primary-400";
};

export default function AdminNotificationBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    const result = await notificationService.getUnreadCount();
    if (result.success && result.data) setUnreadCount(result.data.count);
  };

  const loadNotifications = async () => {
    setLoading(true);
    const result = await notificationService.getNotifications({ page: 1, limit: 8 });
    if (result.success && result.data) setNotifications(result.data.notifications);
    setLoading(false);
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  const markRead = async (notification: AdminNotification) => {
    if (notification.isRead) return true;
    const result = await notificationService.markAsRead(notification.id);
    if (!result.success) return false;
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
    return true;
  };

  const openNotification = async (notification: AdminNotification) => {
    await markRead(notification);
    setOpen(false);
    if (!notification.link) return;
    if (notification.link.startsWith("/")) router.push(notification.link);
    else window.location.assign(notification.link);
  };

  const markAllRead = async () => {
    const result = await notificationService.markAllAsRead();
    if (!result.success) return;
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })));
    setUnreadCount(0);
  };

  const remove = async (notification: AdminNotification) => {
    const result = await notificationService.deleteNotification(notification.id);
    if (!result.success) return;
    setNotifications((items) => items.filter((item) => item.id !== notification.id));
    if (!notification.isRead) setUnreadCount((count) => Math.max(0, count - 1));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-primary-600 px-1 text-[10px] font-bold leading-none text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[min(38rem,calc(100vh-6rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div><p className="font-semibold text-slate-900">Notifications</p><p className="text-xs text-slate-500">{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</p></div>
            {unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-semibold text-primary-700 hover:text-primary-900">Mark all read</button>}
          </div>
          <div className="min-h-32 flex-1 overflow-y-auto">
            {loading ? <div className="grid h-32 place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /></div> : notifications.length === 0 ? (
              <div className="grid min-h-40 place-items-center px-6 text-center"><div><svg className="mx-auto h-9 w-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg><p className="mt-2 text-sm font-medium text-slate-600">No notifications yet</p></div></div>
            ) : notifications.map((notification) => (
              <div key={notification.id} className={`group flex gap-3 border-b border-slate-100 border-l-4 px-3 py-3 last:border-b-0 ${toneFor(notification.type)} ${notification.isRead ? "bg-white" : "bg-primary-50/45"}`}>
                <button type="button" onClick={() => openNotification(notification)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-slate-800">{notification.title}</p>{!notification.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />}</div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{relativeTime(notification.createdAt)}</p>
                </button>
                <button type="button" onClick={() => remove(notification)} className="h-7 w-7 shrink-0 rounded text-slate-400 opacity-100 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Delete ${notification.title}`}>
                  <svg className="mx-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12m-9 0V4h6v3m-8 0 1 13h8l1-13" /></svg>
                </button>
              </div>
            ))}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-primary-700 hover:bg-primary-50">View all notifications</Link>
        </div>
      )}
    </div>
  );
}
