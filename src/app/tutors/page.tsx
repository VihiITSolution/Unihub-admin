"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { adminService, type TutorProfile } from "@/services/admin.service";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTutors = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminService.getTutorApplications({ approvalStatus: status || undefined, page, limit: 20 });
    if (result.success && result.data) {
      setTutors(result.data.tutorProfiles);
      setTotalPages(Math.max(1, result.data.pagination.totalPages));
    } else setError(result.message || "Failed to load tutors.");
    setLoading(false);
  }, [page, status]);

  useEffect(() => { loadTutors(); }, [loadTutors]);

  const shownTutors = tutors.filter((profile) => {
    const value = search.toLowerCase();
    return !value || `${profile.user?.firstName || ""} ${profile.user?.lastName || ""} ${profile.user?.email || ""}`.toLowerCase().includes(value);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-gray-900">Tutors</h1><p className="mt-2 text-gray-600">View every tutor profile and its approval status.</p></div><Link href="/tutors/pending" className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white">Pending applications</Link></div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="rounded-lg border border-gray-300 px-3 py-2"/><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
        {loading ? <p className="py-12 text-center text-gray-500">Loading tutors…</p> : shownTutors.length === 0 ? <p className="py-12 text-center text-gray-500">No tutors found.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Tutor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3"></th></tr></thead><tbody>{shownTutors.map((profile) => <tr key={profile.id} className="border-t"><td className="px-4 py-3"><p className="font-medium text-gray-900">{profile.user?.firstName} {profile.user?.lastName}</p><p className="text-xs text-gray-500">{profile.user?.email}</p></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${profile.approvalStatus === "approved" ? "bg-green-100 text-green-800" : profile.approvalStatus === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{profile.approvalStatus || "pending"}</span></td><td className="px-4 py-3 text-gray-600">{profile.yearsOfExperience || 0} years</td><td className="px-4 py-3 text-gray-500">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</td><td className="px-4 py-3 text-right"><Link href={`/tutors/${profile.id}`} className="font-medium text-primary-600 hover:underline">View profile</Link></td></tr>)}</tbody></table></div>
        )}
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></div>
      </Card>
    </div>
  );
}
