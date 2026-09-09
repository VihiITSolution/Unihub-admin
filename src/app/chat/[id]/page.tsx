"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Compatibility route for old /admin/chat/:id bookmarks.
 * Conversation oversight moved to /admin/moderation/conversations/:id.
 */
export default function LegacyAdminChatRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/moderation/conversations/${id}`);
  }, [id, router]);

  return (
    <div className="grid min-h-64 place-items-center text-sm text-slate-500">
      Opening conversation…
    </div>
  );
}
