"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { AdminNotification, notificationService } from "@/services/notification.service";
import { useRouter } from "next/navigation";

const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const typeLabel = (type: AdminNotification["type"]) => type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await notificationService.getNotifications({ page, limit: 20, unreadOnly });
    if (result.success && result.data) {
      setNotifications(result.data.notifications);
      setTotal(result.data.pagination.total);
      setTotalPages(Math.max(1, result.data.pagination.totalPages));
    } else {
      setError(result.message || "Unable to load notifications.");
    }
    setLoading(false);
  }, [page, unreadOnly]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markRead = async (notification: AdminNotification) => {
    if (notification.isRead) return;
    setWorkingId(notification.id);
    const result = await notificationService.markAsRead(notification.id);
    if (result.success) setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
    else setError(result.message || "Unable to mark notification as read.");
    setWorkingId(null);
  };

  const openNotification = async (notification: AdminNotification) => {
    await markRead(notification);
    if (!notification.link) return;
    if (notification.link.startsWith("/")) router.push(notification.link);
    else window.location.assign(notification.link);
  };

  const remove = async (notification: AdminNotification) => {
    setWorkingId(notification.id);
    const result = await notificationService.deleteNotification(notification.id);
    if (result.success) {
      setNotifications((items) => items.filter((item) => item.id !== notification.id));
      setTotal((count) => Math.max(0, count - 1));
    } else setError(result.message || "Unable to delete notification.");
    setWorkingId(null);
  };

  const markAllRead = async () => {
    const result = await notificationService.markAllAsRead();
    if (result.success) {
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })));
    } else setError(result.message || "Unable to mark all notifications as read.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-600">Admin account</p>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subtitle">Keep track of approvals, payments, platform activity, and account updates.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadNotifications} className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Refresh</button>
          <button type="button" onClick={markAllRead} disabled={!notifications.some((item) => !item.isRead)} className="rounded-lg bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">Mark all read</button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <p className="text-sm text-slate-500">{total.toLocaleString()} notification{total === 1 ? "" : "s"}</p>
          <button type="button" onClick={() => { setUnreadOnly((value) => !value); setPage(1); }} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${unreadOnly ? "bg-primary-100 text-primary-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{unreadOnly ? "Unread only" : "All notifications"}</button>
        </div>

        {loading ? (
          <div className="grid min-h-72 place-items-center"><span className="h-9 w-9 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>
        ) : notifications.length === 0 ? (
          <div className="grid min-h-72 place-items-center text-center"><div><svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg><h2 className="mt-3 font-semibold text-slate-800">{unreadOnly ? "No unread notifications" : "No notifications yet"}</h2><p className="mt-1 text-sm text-slate-500">Important platform updates will appear here.</p></div></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex gap-4 px-1 py-4 ${notification.isRead ? "" : "rounded-lg bg-primary-50/50 px-3"}`}>
                <button type="button" onClick={() => openNotification(notification)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{notification.title}</h2>{!notification.isRead && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">New</span>}<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{typeLabel(notification.type)}</span></div>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
                </button>
                <div className="flex shrink-0 flex-col gap-2">
                  {!notification.isRead && <button type="button" disabled={workingId === notification.id} onClick={() => markRead(notification)} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Read</button>}
                  <button type="button" disabled={workingId === notification.id} onClick={() => remove(notification)} className="rounded-md border border-rose-100 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-sm text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">Previous</button><button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">Next</button></div></div>}
      </Card>
    </div>
  );
}
