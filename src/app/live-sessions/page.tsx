"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { ConfirmDialog, FeedbackBanner } from "@/components/ui/ActionFeedback";
import { AdminLiveSession, adminLiveSessionService } from "@/services/live-session.service";

const TZ = "Asia/Colombo";
const badge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800", failed: "bg-red-100 text-red-800",
  ready: "bg-indigo-100 text-indigo-800", provisioning: "bg-blue-100 text-blue-800",
  not_provisioned: "bg-gray-100 text-gray-700", cancelled: "bg-gray-200 text-gray-700",
};

function monthRange(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  const gridStart = new Date(start); gridStart.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const gridEnd = new Date(end); gridEnd.setUTCDate(end.getUTCDate() + (7 - end.getUTCDay()) % 7);
  return { start, end, gridStart, gridEnd };
}

export default function LiveSessionsAdminPage() {
  const [view, setView] = useState<"queue" | "calendar">("queue");
  const [sessions, setSessions] = useState<AdminLiveSession[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<AdminLiveSession | null>(null);
  const [identity, setIdentity] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [month, setMonth] = useState(new Date());
  const [approval, setApproval] = useState("");
  const [providerStatus, setProviderStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminLiveSession | null>(null);

  const range = useMemo(() => monthRange(month), [month]);

  const load = async () => {
    setLoading(true); setError(null);
    const [list, statistics, organizer, calendar] = await Promise.all([
      adminLiveSessionService.list({ approvalStatus: approval || undefined, providerStatus: providerStatus || undefined, limit: 100 }),
      adminLiveSessionService.statistics(),
      adminLiveSessionService.health(),
      adminLiveSessionService.calendar(range.gridStart.toISOString(), range.gridEnd.toISOString()),
    ]);
    if (list.success) setSessions(list.data?.sessions || []); else setError(list.message || "Failed to load sessions");
    if (statistics.success) setStats(statistics.data);
    if (organizer.success) setHealth(organizer.data);
    if (calendar.success) setEvents(calendar.data?.events || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [approval, providerStatus, month]);

  const open = async (id: number) => {
    const response = await adminLiveSessionService.detail(id);
    if (response.success && response.data) { setSelected(response.data.session); setIdentity(response.data.tutorIdentity); }
    else setError(response.message || "Failed to load session detail");
  };

  const run = async (operation: () => Promise<any>, success: string) => {
    setProcessing(true); setError(null); setNotice(null);
    const response = await operation();
    if (response.success) { setNotice(success); setSelected(null); await load(); }
    else setError(response.message || "Action failed");
    setProcessing(false);
  };

  const reject = () => {
    if (!selected) return;
    const reason = prompt("Reason the tutor must address:");
    if (reason?.trim()) run(() => adminLiveSessionService.reject(selected.id, reason.trim()), "Request rejected and tutor notified.");
  };

  const reschedule = () => {
    if (!selected) return;
    const currentStart = new Date(selected.scheduledStartTime).toISOString();
    const currentEnd = new Date(selected.scheduledEndTime).toISOString();
    const start = prompt("New start time as ISO 8601 (for example 2026-09-10T08:30:00Z)", currentStart);
    if (!start) return;
    const end = prompt("New end time as ISO 8601", currentEnd);
    if (!end) return;
    if (!Number.isFinite(new Date(start).getTime()) || !Number.isFinite(new Date(end).getTime())) {
      setError("Enter valid ISO 8601 start and end times.");
      return;
    }
    (async () => {
      const startUtc = new Date(start).toISOString();
      const endUtc = new Date(end).toISOString();
      const preview = await adminLiveSessionService.conflict(startUtc, endUtc, selected.id);
      if (!preview.success) return setError(preview.message || "Conflict preview failed");
      if (preview.data?.conflict) return setError(preview.data.message || `Organizer conflicts with session #${preview.data.conflictSessionId}`);
      run(() => adminLiveSessionService.update(selected.id, { scheduledStartTime: startUtc, scheduledEndTime: endUtc }), "Session rescheduled and Teams sync queued.");
    })();
  };

  const createSession = () => {
    const tutorId = Number(prompt("Tutor user ID:"));
    if (!tutorId) return;
    const teamsEmail = prompt("Tutor's Microsoft Teams email:");
    const title = prompt("Session title:");
    const start = prompt("Start time as ISO 8601 (for example 2026-09-10T08:30:00Z):");
    const end = prompt("End time as ISO 8601:");
    if (!teamsEmail || !title || !start || !end || !Number.isFinite(new Date(start).getTime()) || !Number.isFinite(new Date(end).getTime())) return setError("Tutor ID, Teams email, title, and valid ISO schedule are required.");
    (async () => {
      const startUtc = new Date(start).toISOString();
      const endUtc = new Date(end).toISOString();
      const preview = await adminLiveSessionService.conflict(startUtc, endUtc);
      if (!preview.success) return setError(preview.message || "Conflict preview failed");
      if (preview.data?.conflict) return setError(preview.data.message || "Organizer schedule conflict");
      run(() => adminLiveSessionService.create({ tutorId, teamsEmail, title, scheduledStartTime: startUtc, scheduledEndTime: endUtc, allowRecording: true }), "Session created and Teams provisioning queued.");
    })();
  };

  const days: Date[] = [];
  for (let date = new Date(range.gridStart); date < range.gridEnd; date.setUTCDate(date.getUTCDate() + 1)) days.push(new Date(date));
  const dayEvents = (day: Date) => events.filter((event) => {
    const value = new Date(event.start);
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(value) === new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(day);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1><p className="mt-1 text-gray-600">Approve requests, protect the shared organizer schedule, and monitor Teams sync.</p></div>
        <div className="flex gap-2"><button onClick={createSession} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Create session</button><button onClick={load} className="rounded-lg border px-4 py-2 hover:bg-gray-50">Refresh</button></div>
      </div>
      {error && <FeedbackBanner message={error} tone="error" />}
      {notice && <FeedbackBanner message={notice} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Pending", stats?.byApproval?.pending || 0], ["Upcoming", stats?.upcoming || 0],
          ["Provider failures", stats?.failed || 0], ["Organizer", health?.healthy ? "Healthy" : "Needs attention"],
          ["Buffer", "15 minutes"],
        ].map(([label, value]) => <Card key={String(label)}><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></Card>)}
      </div>
      {health && !health.healthy && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Teams is disabled or unhealthy: {health.message || "check app credentials, organizer mailbox, and OneDrive permissions"}</div>}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setView("queue")} className={`rounded-lg px-4 py-2 ${view === "queue" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>Operational list</button>
        <button onClick={() => setView("calendar")} className={`rounded-lg px-4 py-2 ${view === "calendar" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>Calendar</button>
        {view === "queue" && <>
          <select value={approval} onChange={(event) => setApproval(event.target.value)} className="rounded-lg border px-3"><option value="">All approvals</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
          <select value={providerStatus} onChange={(event) => setProviderStatus(event.target.value)} className="rounded-lg border px-3"><option value="">All provider states</option><option value="failed">Failed</option><option value="ready">Ready</option><option value="provisioning">Provisioning</option><option value="not_provisioned">Not provisioned</option></select>
        </>}
      </div>
      {loading ? <div className="py-16 text-center text-gray-500">Loading live sessions…</div> : view === "queue" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-gray-500"><th className="p-3">Session</th><th className="p-3">Tutor</th><th className="p-3">Schedule (Colombo)</th><th className="p-3">Approval</th><th className="p-3">Provider</th><th className="p-3">Actions</th></tr></thead>
              <tbody>{sessions.map((session) => <tr key={session.id} className="border-b align-top">
                <td className="p-3"><strong>#{session.id} {session.title}</strong><div className="mt-1 text-xs text-gray-500">{session.status} · {session.provider}</div></td>
                <td className="p-3">{session.tutor ? `${session.tutor.firstName} ${session.tutor.lastName}` : "Unknown"}<div className="text-xs text-gray-500">{session.tutor?.tutorProfile?.teamsEmail || "No Teams email"}</div></td>
                <td className="p-3">{new Date(session.scheduledStartTime).toLocaleString("en-LK", { timeZone: TZ })}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${badge[session.approvalStatus] || "bg-gray-100"}`}>{session.approvalStatus}</span></td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${badge[session.providerStatus] || "bg-gray-100"}`}>{session.providerStatus}</span>{session.meeting?.lastError && <div className="mt-1 max-w-xs text-xs text-red-600">{session.meeting.lastError}</div>}</td>
                <td className="p-3"><div className="flex flex-wrap gap-2"><button onClick={() => open(session.id)} className="rounded bg-gray-100 px-3 py-1.5 hover:bg-gray-200">Manage</button><button disabled={processing} onClick={() => setDeleteConfirm(session)} className="rounded bg-red-700 px-3 py-1.5 text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">Delete</button></div></td>
              </tr>)}</tbody>
            </table>
            {sessions.length === 0 && <div className="py-12 text-center text-gray-500">No sessions match these filters.</div>}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1)))} className="rounded border px-3 py-1">Previous</button>
            <h2 className="text-lg font-semibold">{month.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</h2>
            <button onClick={() => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)))} className="rounded border px-3 py-1">Next</button>
          </div>
          <div className="grid grid-cols-7 border-l border-t text-xs">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((name) => <div key={name} className="border-b border-r bg-gray-50 p-2 text-center font-medium">{name}</div>)}{days.map((day) => <div key={day.toISOString()} className="min-h-28 border-b border-r p-2"><div className={day.getUTCMonth() === month.getUTCMonth() ? "font-medium" : "text-gray-300"}>{day.getUTCDate()}</div><div className="mt-1 space-y-1">{dayEvents(day).map((event) => <button key={event.id} onClick={() => open(event.id)} className="block w-full truncate rounded bg-indigo-100 p-1 text-left text-indigo-900" title={event.title}>{new Date(event.start).toLocaleTimeString("en-LK", { timeZone: TZ, hour: "2-digit", minute: "2-digit" })} {event.title}</button>)}</div></div>)}</div>
        </Card>
      )}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex justify-between"><div><h2 className="text-2xl font-bold">#{selected.id} {selected.title}</h2><p className="mt-1 text-gray-500">{selected.tutor?.firstName} {selected.tutor?.lastName} · {identity?.email || "No Teams identity"} · {identity?.invitationStatus || "not invited"}</p></div><button onClick={() => setSelected(null)} className="text-2xl">×</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-gray-50 p-4"><p className="text-xs text-gray-500">Schedule</p><p>{new Date(selected.scheduledStartTime).toLocaleString("en-LK", { timeZone: TZ })}</p><p>{new Date(selected.scheduledEndTime).toLocaleString("en-LK", { timeZone: TZ })}</p></div><div className="rounded-lg bg-gray-50 p-4"><p className="text-xs text-gray-500">Provider health</p><p>{selected.providerStatus} · {selected.meeting?.syncStatus || "no meeting"}</p><p className="text-sm text-red-600">{selected.meeting?.lastError}</p></div></div>
        {selected.rejectionReason && <div className="mt-4 rounded bg-red-50 p-3 text-red-700">{selected.rejectionReason}</div>}
        <div className="mt-5 flex flex-wrap gap-2">
          {selected.approvalStatus !== "approved" && <button disabled={processing} onClick={() => run(() => adminLiveSessionService.approve(selected.id), "Session approved and provisioning queued.")} className="rounded bg-green-600 px-4 py-2 text-white">Approve</button>}
          {selected.approvalStatus === "pending" && <button disabled={processing} onClick={reject} className="rounded bg-red-600 px-4 py-2 text-white">Reject</button>}
          {selected.providerStatus === "failed" && <button disabled={processing} onClick={() => run(() => adminLiveSessionService.action(selected.id, "retry"), "Provisioning retry queued.")} className="rounded bg-blue-600 px-4 py-2 text-white">Retry provisioning</button>}
          <button disabled={processing} onClick={() => run(() => adminLiveSessionService.action(selected.id, "resend-invitation"), "Tutor invitation resent.")} className="rounded border px-4 py-2">Resend invitation</button>
          {selected.approvalStatus === "approved" && <><button disabled={processing} onClick={() => run(() => adminLiveSessionService.action(selected.id, "sync-attendees"), "Attendee sync queued.")} className="rounded border px-4 py-2">Sync attendees</button><button disabled={processing} onClick={() => run(() => adminLiveSessionService.action(selected.id, "sync-artifacts"), "Artifact sync queued.")} className="rounded border px-4 py-2">Sync attendance/recording</button></>}
          {selected.status === "scheduled" && <button disabled={processing} onClick={reschedule} className="rounded border px-4 py-2">Reschedule</button>}
          {!["cancelled","ended","recorded"].includes(selected.status) && <button disabled={processing} onClick={() => confirm("Cancel this session and its Teams calendar event?") && run(() => adminLiveSessionService.cancel(selected.id), "Session cancelled.")} className="rounded border border-red-300 px-4 py-2 text-red-700">Cancel</button>}
          {selected.recordingUrl && <button disabled={processing} onClick={() => confirm("Permanently delete this recording from OneDrive? This cannot be undone.") && run(() => adminLiveSessionService.removeRecording(selected.id), "Recording removed.")} className="rounded bg-red-700 px-4 py-2 text-white">Delete recording</button>}
          <button disabled={processing} onClick={() => setDeleteConfirm(selected)} className="rounded bg-red-700 px-4 py-2 text-white">Delete session</button>
        </div>
        <div className="mt-6"><h3 className="font-semibold">Enrollments and Teams attendance</h3><div className="mt-2 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Student</th><th className="p-2">Attendance</th><th className="p-2">Duration</th><th className="p-2">Sync</th></tr></thead><tbody>{(selected.enrollments || []).map((item: any) => <tr key={item.id} className="border-b"><td className="p-2">{item.student?.firstName} {item.student?.lastName}<div className="text-xs text-gray-500">{item.student?.email}</div></td><td className="p-2">{item.attended ? "Attended" : "Not recorded"}</td><td className="p-2">{item.attendanceDuration || 0} min</td><td className="p-2">{item.attendanceSource || "unihub"} / {item.attendanceSyncStatus || "pending"}</td></tr>)}</tbody></table></div></div>
      </div></div>}
      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Permanently delete live session?"
        description={`Delete “${deleteConfirm?.title || "this session"}” and its enrollments, Teams meeting metadata, provider jobs, and event history? This cannot be undone.`}
        confirmLabel="Delete session"
        processing={processing}
        tone="danger"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (!deleteConfirm) return;
          run(
            () => adminLiveSessionService.remove(deleteConfirm.id),
            "Live session permanently deleted.",
          );
          setDeleteConfirm(null);
        }}
      />
    </div>
  );
}
