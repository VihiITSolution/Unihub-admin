"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { adminService, type AdminAuditLog } from "@/services/admin.service";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminService.getAuditLogs({
      page,
      limit: 50,
      targetType: targetType || undefined,
    });
    if (result.success && result.data) {
      setLogs(result.data.logs);
      setTotalPages(Math.max(1, result.data.pagination.totalPages));
    } else {
      setError(result.message || "Failed to load audit logs.");
    }
    setLoading(false);
  }, [page, targetType]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Audit Log</h1>
        <p className="mt-2 text-gray-600">Immutable records of sensitive administrative actions.</p>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <select value={targetType} onChange={(event) => { setTargetType(event.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
            <option value="">All target types</option>
            <option value="user">Users</option>
            <option value="tutor_profile">Tutors</option>
            <option value="course">Courses</option>
            <option value="marketplace_item">Marketplace</option>
            <option value="boarding_place">Boarding</option>
            <option value="payment">Payments</option>
            <option value="conversation">Conversations</option>
            <option value="support_ticket">Support tickets</option>
          </select>
          <button onClick={loadLogs} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Refresh</button>
        </div>
        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading audit records…</p>
        ) : logs.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No audit records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Administrator</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Request</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{log.actorAdmin ? `${log.actorAdmin.firstName} ${log.actorAdmin.lastName}` : "Deleted administrator"}</p><p className="text-xs text-gray-500">{log.actorAdmin?.email || `ID ${log.actorAdminId || "unavailable"}`}</p></td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{log.summary}</p><code className="text-xs text-gray-500">{log.action}</code></td>
                    <td className="px-4 py-3"><span className="rounded bg-gray-100 px-2 py-1">{log.targetType}</span>{log.targetId && <p className="mt-1 text-xs text-gray-500">ID {log.targetId}</p>}</td>
                    <td className="px-4 py-3 text-xs text-gray-500"><p>{log.metadata?.method} {log.metadata?.path}</p><p>{log.ipAddress || "IP not recorded"}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></div>
      </Card>
    </div>
  );
}
