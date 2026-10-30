"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import {
  adminService,
  type Administrator,
  type LiveSessionNotificationEvent,
  type LiveSessionNotificationSettings,
} from "@/services/admin.service";

const eventLabels: Record<LiveSessionNotificationEvent, string> = {
  request_submitted: "New session requests and resubmissions",
  approval_updated: "Approvals and rejections",
  provisioning_failed: "Microsoft Teams provisioning failures",
  schedule_changed: "Schedule changes",
  cancelled: "Session cancellations",
};

const defaultSettings = (): LiveSessionNotificationSettings => ({
  emailEnabled: true,
  events: {
    request_submitted: true,
    approval_updated: true,
    provisioning_failed: true,
    schedule_changed: true,
    cancelled: true,
  },
});

function settingsFor(administrator: Administrator): LiveSessionNotificationSettings {
  const saved = administrator.notificationPrefs?.adminLiveSessions;
  return saved ? {
    emailEnabled: saved.emailEnabled !== false,
    events: { ...defaultSettings().events, ...saved.events },
  } : defaultSettings();
}

export default function AdministratorsPage() {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [events, setEvents] = useState<LiveSessionNotificationEvent[]>(Object.keys(eventLabels) as LiveSessionNotificationEvent[]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await adminService.getAdministrators();
    if (result.success && result.data) {
      setAdministrators(result.data.administrators);
      setEvents(result.data.liveSessionEvents);
      setError("");
    } else setError(result.message || "Unable to load administrators.");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    setAdding(true); setNotice(""); setError("");
    const result = await adminService.addAdministrator(value);
    if (result.success) {
      setEmail("");
      setNotice("Administrator access granted.");
      await load();
    } else setError(result.message || "Unable to grant administrator access.");
    setAdding(false);
  };

  const update = async (administrator: Administrator, changes: Parameters<typeof adminService.updateAdministrator>[1], success: string) => {
    setWorkingId(administrator.id); setNotice(""); setError("");
    const result = await adminService.updateAdministrator(administrator.id, changes);
    if (result.success) {
      setNotice(success);
      await load();
    } else setError(result.message || "Unable to update administrator.");
    setWorkingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administrators</h1>
        <p className="mt-2 text-gray-600">Grant admin access and choose which live-session updates each administrator receives by email.</p>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{notice}</div>}

      <Card title="Add an administrator">
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-medium text-gray-700">
            Existing UniHub account email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <button type="submit" disabled={adding} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {adding ? "Adding…" : "Grant access"}
          </button>
        </form>
        <p className="mt-3 text-sm text-gray-500">The email must already belong to a UniHub account. Its account email is also used for administrator notifications.</p>
      </Card>

      <Card title="Administrator access and live-session emails">
        {loading ? <p className="py-10 text-center text-gray-500">Loading administrators…</p> : administrators.length === 0 ? <p className="py-10 text-center text-gray-500">No administrators found.</p> : (
          <div className="space-y-5">
            {administrators.map((administrator) => {
              const settings = settingsFor(administrator);
              const working = workingId === administrator.id;
              return (
                <section key={administrator.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900">{administrator.firstName} {administrator.lastName}</h2>
                      <p className="mt-0.5 text-sm text-gray-600">{administrator.email}</p>
                      <p className="mt-1 text-xs text-gray-500">Last sign-in: {administrator.lastLogin ? new Date(administrator.lastLogin).toLocaleString() : "Never"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${administrator.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{administrator.isActive ? "Active" : "Suspended"}</span>
                      <button type="button" disabled={working} onClick={() => update(administrator, { isActive: !administrator.isActive }, `Administrator ${administrator.isActive ? "suspended" : "activated"}.`)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{administrator.isActive ? "Suspend" : "Activate"}</button>
                      <button type="button" disabled={working} onClick={() => { if (window.confirm(`Remove administrator access for ${administrator.email}?`)) update(administrator, { hasAdminAccess: false }, "Administrator access removed."); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">Remove access</button>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h3 className="font-semibold text-gray-900">Live-session email notifications</h3><p className="mt-1 text-sm text-gray-500">In-app notifications are always shown. Select which updates are also emailed to this administrator.</p></div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={settings.emailEnabled} disabled={working} onChange={(event) => update(administrator, { liveSessionNotifications: { ...settings, emailEnabled: event.target.checked } }, "Email notification settings saved.")} /> Send email</label>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {events.map((type) => <label key={type} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${settings.emailEnabled ? "border-gray-200 text-gray-700" : "border-gray-100 text-gray-400"}`}><input type="checkbox" checked={settings.events[type]} disabled={!settings.emailEnabled || working} onChange={(event) => update(administrator, { liveSessionNotifications: { ...settings, events: { ...settings.events, [type]: event.target.checked } } }, "Email notification settings saved.")} />{eventLabels[type]}</label>)}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
