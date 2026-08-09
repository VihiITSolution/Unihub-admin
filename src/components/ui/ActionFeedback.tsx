"use client";

export function FeedbackBanner({
  message,
  tone = "success",
}: {
  message: string;
  tone?: "success" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {message}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  processing = false,
  tone = "primary",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  processing?: boolean;
  tone?: "primary" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="action-dialog-title">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="action-dialog-title" className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-3 text-gray-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={processing} onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50">Cancel</button>
          <button
            type="button"
            disabled={processing}
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50 ${tone === "danger" ? "bg-red-600" : "bg-primary-600"}`}
          >
            {processing ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
