"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { adminService, type RegistrationSuggestions } from "@/services/admin.service";

export default function SuggestionsPage() {
  const [data, setData] = useState<RegistrationSuggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    adminService.getRegistrationSuggestions().then((result) => {
      if (result.success && result.data) setData(result.data);
      else setError(result.message || "Failed to load suggestions.");
    }).finally(() => setLoading(false));
  }, []);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1500);
  };

  const section = (title: string, values: string[], href: string) => (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-gray-900">{title}</h2><p className="text-sm text-gray-500">{values.length} unique suggestions</p></div>
        <Link href={href} className="text-sm font-medium text-primary-600 hover:underline">Manage catalogue →</Link>
      </div>
      {values.length === 0 ? <p className="py-6 text-center text-gray-500">No suggestions submitted.</p> : (
        <div className="space-y-2">
          {values.map((value) => <div key={value} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"><span className="text-gray-800">{value}</span><button onClick={() => copy(value)} className="rounded border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">{copied === value ? "Copied" : "Copy"}</button></div>)}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">Registration Suggestions</h1><p className="mt-2 text-gray-600">Review custom university, faculty, and department names entered during registration.</p></div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {loading ? <Card><p className="py-12 text-center text-gray-500">Loading suggestions…</p></Card> : data && <><div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">These are suggestions only. Check spelling and duplicates before adding them to the official catalogue.</div><div className="grid gap-6 xl:grid-cols-3">{section("Universities", data.universities, "/universities")}{section("Faculties", data.faculties, "/faculties")}{section("Departments", data.departments, "/faculties")}</div></>}
    </div>
  );
}
