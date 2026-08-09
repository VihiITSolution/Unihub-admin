"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { adminService, type SupportTicket } from "@/services/admin.service";

const statusStyles: Record<SupportTicket["status"], string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};

const priorityStyles: Record<SupportTicket["priority"], string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [search, setSearch] = useState("");
  const [responseText, setResponseText] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminService.getSupportTickets({
      page,
      limit: 20,
      status: status || undefined,
      priority: priority || undefined,
      assignedTo: (assignedTo || undefined) as "me" | "unassigned" | undefined,
      search: search.trim() || undefined,
    });
    if (result.success && result.data) {
      setTickets(result.data.tickets);
      setTotalPages(Math.max(1, result.data.pagination.totalPages));
      setSelected((current) =>
        current ? result.data!.tickets.find((ticket) => ticket.id === current.id) || null : null,
      );
    } else {
      setError(result.message || "Failed to load support tickets.");
    }
    setLoading(false);
  }, [page, status, priority, assignedTo, search]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const updateTicket = async (changes: Parameters<typeof adminService.updateSupportTicket>[1]) => {
    if (!selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    const result = await adminService.updateSupportTicket(selected.id, changes);
    if (result.success && result.data) {
      setSelected(result.data.ticket);
      setResponseText("");
      setNotice("Ticket updated successfully.");
      await loadTickets();
    } else {
      setError(result.message || "Failed to update the ticket.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Queue</h1>
        <p className="mt-2 text-gray-600">Assign, prioritize, respond to, and resolve student support requests.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {notice && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{notice}</div>}

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search subject or description"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
            <option value="">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={assignedTo} onChange={(event) => { setAssignedTo(event.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
            <option value="">Any assignment</option>
            <option value="me">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <Card>
            {loading ? (
              <p className="py-10 text-center text-gray-500">Loading tickets…</p>
            ) : tickets.length === 0 ? (
              <p className="py-10 text-center text-gray-500">No tickets match these filters.</p>
            ) : (
              <div className="divide-y">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => { setSelected(ticket); setResponseText(ticket.adminResponse || ""); setNotice(""); }}
                    className={`w-full p-4 text-left hover:bg-gray-50 ${selected?.id === ticket.id ? "bg-primary-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">#{ticket.id} {ticket.subject}</p>
                        <p className="mt-1 truncate text-sm text-gray-500">{ticket.user.firstName} {ticket.user.lastName} · {ticket.category}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`rounded-full px-2 py-1 font-medium ${statusStyles[ticket.status]}`}>{ticket.status.replace("_", " ")}</span>
                      <span className="text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <Card title={selected ? `Ticket #${selected.id}` : "Ticket details"}>
            {!selected ? (
              <p className="py-12 text-center text-gray-500">Select a ticket to review it.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-gray-500">From {selected.user.firstName} {selected.user.lastName} ({selected.user.email})</p>
                </div>
                <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-gray-700">{selected.description}</p>
                {selected.attachments && selected.attachments.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="rounded border px-3 py-2 text-sm text-primary-600 hover:bg-gray-50">Open attachment {index + 1}</a>)}
                    </div>
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-3">
                  <select value={selected.status} disabled={saving} onChange={(event) => updateTicket({ status: event.target.value as SupportTicket["status"] })} className="rounded-lg border px-3 py-2">
                    <option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                  </select>
                  <select value={selected.priority} disabled={saving} onChange={(event) => updateTicket({ priority: event.target.value as SupportTicket["priority"] })} className="rounded-lg border px-3 py-2">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                  </select>
                  {selected.assignedAdmin ? (
                    <button disabled={saving} onClick={() => updateTicket({ assignedToAdminId: null })} className="rounded-lg border px-3 py-2 text-sm">Unassign ({selected.assignedAdmin.firstName})</button>
                  ) : (
                    <button disabled={saving} onClick={() => updateTicket({ assignToMe: true, status: "in_progress" })} className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white">Assign to me</button>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Response to the user</label>
                  <textarea value={responseText} onChange={(event) => setResponseText(event.target.value)} rows={6} maxLength={5000} className="w-full rounded-lg border border-gray-300 px-4 py-3" placeholder="Write a clear response or resolution…" />
                  <div className="mt-2 flex justify-end">
                    <button disabled={saving || responseText.trim().length < 2} onClick={() => updateTicket({ adminResponse: responseText })} className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white disabled:opacity-40">{saving ? "Saving…" : "Send response"}</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
