"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { chatService } from "@/services/chat.service";
import type { Conversation } from "@/types/chat";

export default function ModerationConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState("");
  const [contextTypeFilter, setContextTypeFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await chatService.getAllConversations({
        email: emailFilter || undefined,
        contextType: contextTypeFilter || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        setConversations(response.data.conversations);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chat Moderation</h1>
          <p className="text-gray-600">
            Any conversation, between any two users, is viewable here at any
            time for security oversight - no report is required first.
          </p>
        </div>
        <Link
          href="/moderation/blocked-messages"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          View Blocked Messages
        </Link>
      </div>

      <div className="flex gap-3 my-6">
        <input
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          placeholder="Filter by participant email..."
          className="border rounded-lg px-3 py-2 text-sm flex-1"
        />
        <select
          value={contextTypeFilter}
          onChange={(e) => setContextTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All contexts</option>
          <option value="general">General</option>
          <option value="course">Course</option>
          <option value="marketplace_item">Marketplace item</option>
          <option value="boarding_place">Boarding place</option>
          <option value="support">Support</option>
        </select>
        <button
          onClick={load}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          Loading...
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          No conversations found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Context</th>
                <th className="px-4 py-3">Last message</th>
                <th className="px-4 py-3">Flagged</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conversation) => (
                <tr key={conversation.id} className="border-t">
                  <td className="px-4 py-3">
                    {conversation.participantOne?.firstName}{" "}
                    {conversation.participantOne?.lastName} ↔{" "}
                    {conversation.participantTwo?.firstName}{" "}
                    {conversation.participantTwo?.lastName}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {conversation.contextType.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                    {conversation.lastMessagePreview || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {conversation.isFlagged ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        Flagged
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/moderation/conversations/${conversation.id}`}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
