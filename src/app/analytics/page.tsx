"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { adminService, type Statistics } from "@/services/admin.service";

export default function AnalyticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const result = await adminService.getStatistics();
    if (result.success && result.data) setStatistics(result.data);
    else setError(result.message || "Failed to load operational analytics.");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="py-16 text-center text-gray-500">Loading operational analytics…</div>;
  if (error || !statistics) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"><p>{error || "Statistics unavailable."}</p><button onClick={load} className="mt-2 underline">Try again</button></div>;

  const totals = [
    ["Registered users", statistics.users.total],
    ["Tutors", statistics.users.tutors],
    ["Published courses", statistics.courses.published],
    ["Enrollments", statistics.enrollments],
    ["Marketplace items", statistics.marketplace.totalItems],
    ["Completed-payment revenue", `Rs. ${Number(statistics.payments.revenue).toLocaleString()}`],
  ];
  const queues = [
    ["Tutor applications", statistics.operations.pendingTutorApplications, "/tutors/pending"],
    ["Courses awaiting review", statistics.operations.pendingCourses, "/courses/pending"],
    ["Marketplace approvals", statistics.operations.pendingMarketplaceItems, "/marketplace"],
    ["Boarding approvals", statistics.operations.pendingBoardingPlaces, "/boarding"],
    ["Bank transfers", statistics.operations.pendingBankTransfers, "/marketplace/bank-transfers"],
    ["Unresolved support tickets", statistics.operations.unresolvedSupportTickets, "/support"],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-bold text-gray-900">Operational Analytics</h1><p className="mt-2 text-gray-600">Live platform totals and work queues from the UniHub database.</p></div><button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Refresh</button></div>
      {statistics.operations.criticalSupportTickets > 0 && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-800">{statistics.operations.criticalSupportTickets} critical support ticket{statistics.operations.criticalSupportTickets === 1 ? " requires" : "s require"} attention.</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{totals.map(([label, value]) => <Card key={label as string}><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p></Card>)}</div>
      <Card title="Operational queues">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{queues.map(([label, count, href]) => <Link key={label} href={href} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50"><span className="font-medium text-gray-800">{label}</span><span className={`rounded-full px-3 py-1 text-sm font-bold ${count > 0 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{count}</span></Link>)}</div>
      </Card>
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">This page intentionally shows only metrics currently measured by the backend. Traffic, conversion, and session-duration figures are omitted until a verified analytics source is integrated.</div>
    </div>
  );
}
