"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { adminService, type SystemStatus } from "@/services/admin.service";

const statusClass = (healthy: boolean) =>
  healthy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

const StatusBadge = ({ healthy, label }: { healthy: boolean; label: string }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(healthy)}`}>
    {label}
  </span>
);

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

export default function SettingsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminService.getSystemStatus();
    if (result.data) setStatus(result.data);
    if (!result.success) setError(result.message || "System status is unavailable.");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="mt-2 text-gray-600">
            Secret-safe deployment configuration and service readiness checks.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStatus}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Refresh status"}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading && !status ? (
        <Card><p className="py-12 text-center text-gray-500">Checking services…</p></Card>
      ) : status ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm text-gray-500">Environment</p>
              <p className="mt-1 text-xl font-bold capitalize text-gray-900">{status.environment}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">API uptime</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{formatUptime(status.uptimeSeconds)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Last checked</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {new Date(status.checkedAt).toLocaleString()}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Services">
              <div className="divide-y">
                {[
                  ["API", status.services.api.status === "available", status.services.api.status],
                  ["Database", status.services.database.status === "connected", status.services.database.status],
                  ["Media uploads", status.services.mediaUploads.status === "configured", status.services.mediaUploads.status],
                  ["YouTube integration", status.services.youtube.status === "configured", status.services.youtube.status],
                ].map(([name, healthy, label]) => (
                  <div key={String(name)} className="flex items-center justify-between gap-4 py-3">
                    <span className="font-medium text-gray-800">{name}</span>
                    <StatusBadge healthy={Boolean(healthy)} label={String(label).replaceAll("_", " ")} />
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Security configuration">
              <div className="divide-y">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">JWT signing secret</span>
                  <StatusBadge healthy={status.security.jwtSecretConfigured} label={status.security.jwtSecretConfigured ? "Configured" : "Missing"} />
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">CORS allow-list</span>
                  <StatusBadge healthy={status.security.corsAllowlistConfigured} label={status.security.corsAllowlistConfigured ? "Configured" : "Missing"} />
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">Production mode</span>
                  <StatusBadge healthy={status.security.productionMode} label={status.security.productionMode ? "Production" : "Non-production"} />
                </div>
              </div>
            </Card>

            <Card title="Commercial configuration">
              <div className="divide-y">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">Marketplace free trial</span>
                  <StatusBadge healthy={status.commercial.freeMarketplaceTrialEnabled} label={status.commercial.freeMarketplaceTrialEnabled ? "Enabled" : "Disabled"} />
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">PayHere</span>
                  <StatusBadge healthy={status.commercial.payHere.configured} label={status.commercial.payHere.configured ? `Configured (${status.commercial.payHere.mode})` : "Not configured"} />
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">HelaPay</span>
                  <StatusBadge healthy={status.commercial.helaPay.configured} label={status.commercial.helaPay.configured ? `Configured (${status.commercial.helaPay.mode})` : "Not configured"} />
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-gray-800">Bank transfer details</span>
                  <StatusBadge healthy={status.commercial.bankTransferConfigured} label={status.commercial.bankTransferConfigured ? "Configured" : "Defaults in use"} />
                </div>
              </div>
            </Card>

            <Card title="Configuration policy">
              <div className="space-y-3 text-sm text-gray-600">
                <p>Secrets and account numbers are intentionally never returned to the browser.</p>
                <p>Deployment settings must be changed through environment configuration and a controlled restart.</p>
                <p>This page reports configuration presence; payment availability still requires staging verification and reconciliation.</p>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
