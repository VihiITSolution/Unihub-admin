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

const slaFor = (ticket: SupportTicket) => {
  if (["resolved", "closed"].includes(ticket.status)) return null;
  const thresholdHours = { critical: 2, high: 8, medium: 24, low: 48 }[ticket.priority];
  const ageHours = (Date.now() - new Date(ticket.createdAt).getTime()) / 3_600_000;
  if (ageHours >= thresholdHours) return { label: "SLA overdue", className: "bg-red-100 text-red-800" };
  if (ageHours >= thresholdHours * 0.75) return { label: "Due soon", className: "bg-amber-100 text-amber-800" };
  return null;
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

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
      setSelectedIds((current) => current.filter((id) => result.data!.tickets.some((ticket) => ticket.id === id)));
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

  const applyBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    const changes =
      bulkAction === "assign"
        ? { assignToMe: true }
        : bulkAction === "unassign"
          ? { assignedToAdminId: null as null }
          : bulkAction.startsWith("status:")
            ? { status: bulkAction.slice(7) as SupportTicket["status"] }
            : { priority: bulkAction.slice(9) as SupportTicket["priority"] };

    setBulkSaving(true);
    setError("");
    setNotice("");
    const result = await adminService.bulkUpdateSupportTickets(selectedIds, changes);
    if (result.success) {
      setNotice(result.message || `${selectedIds.length} tickets updated.`);
      setSelectedIds([]);
      setBulkAction("");
      await loadTickets();
    } else {
      setError(result.message || "Failed to update selected tickets.");
    }
    setBulkSaving(false);
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

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={tickets.length > 0 && selectedIds.length === tickets.length}
              onChange={(event) => setSelectedIds(event.target.checked ? tickets.map((ticket) => ticket.id) : [])}
            />
            Select this page
          </label>
          <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
          <select
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Choose a safe bulk action</option>
            <option value="assign">Assign to me</option>
            <option value="unassign">Unassign</option>
            <option value="status:open">Set status: open</option>
            <option value="status:in_progress">Set status: in progress</option>
            <option value="priority:critical">Set priority: critical</option>
            <option value="priority:high">Set priority: high</option>
            <option value="priority:medium">Set priority: medium</option>
            <option value="priority:low">Set priority: low</option>
          </select>
          <button
            type="button"
            disabled={!bulkAction || selectedIds.length === 0 || bulkSaving}
            onClick={applyBulkAction}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {bulkSaving ? "Updating…" : "Apply to selected"}
          </button>
          <p className="text-xs text-gray-500">Resolving and closing tickets remain individual actions so each case is reviewed.</p>
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
                {tickets.map((ticket) => {
                  const sla = slaFor(ticket);
                  return (
                  <div key={ticket.id} className={`flex items-start gap-3 p-4 hover:bg-gray-50 ${selected?.id === ticket.id ? "bg-primary-50" : ""}`}>
                    <input
                      type="checkbox"
                      aria-label={`Select ticket ${ticket.id}`}
                      checked={selectedIds.includes(ticket.id)}
                      onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, ticket.id] : current.filter((id) => id !== ticket.id))}
                      className="mt-1"
                    />
                    <button
                      type="button"
                      onClick={() => { setSelected(ticket); setResponseText(ticket.adminResponse || ""); setNotice(""); }}
                      className="min-w-0 flex-1 text-left"
                    >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">#{ticket.id} {ticket.subject}</p>
                        <p className="mt-1 truncate text-sm text-gray-500">{ticket.user.firstName} {ticket.user.lastName} · {ticket.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span>
                        {sla && <span className={`rounded-full px-2 py-1 text-xs font-medium ${sla.className}`}>{sla.label}</span>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`rounded-full px-2 py-1 font-medium ${statusStyles[ticket.status]}`}>{ticket.status.replace("_", " ")}</span>
                      <span className="text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                    </button>
                  </div>
                  );
                })}
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
