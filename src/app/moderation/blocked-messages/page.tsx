"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { chatService } from "@/services/chat.service";
import type { BlockedMessageLog } from "@/types/chat";

export default function BlockedMessagesPage() {
  const [logs, setLogs] = useState<BlockedMessageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await chatService.getBlockedMessages({ limit: 50 });
        if (response.success && response.data) {
          setLogs(response.data.blockedMessages);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blocked Messages</h1>
          <p className="text-gray-600">
            Messages rejected by the contact-info filter - attempts to share a
            phone number, email, or off-platform contact method.
          </p>
        </div>
        <Link
          href="/moderation/conversations"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          ← Chat Moderation
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          Loading...
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          No blocked messages recorded.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Attempted message</th>
                <th className="px-4 py-3">Matched patterns</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-3">
                    {log.sender.firstName} {log.sender.lastName}
                    <div className="text-xs text-gray-400">{log.sender.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-sm truncate">
                    {log.attemptedBody}
                  </td>
                  <td className="px-4 py-3">
                    {log.matchedPatterns.map((pattern) => (
                      <span
                        key={pattern}
                        className="inline-block px-2 py-0.5 mr-1 bg-amber-100 text-amber-800 rounded text-xs font-medium"
                      >
                        {pattern.replace("_", " ")}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/moderation/conversations/${log.conversationId}`}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      View conversation
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
