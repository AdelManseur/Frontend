"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./styles.module.css";
import type { ChatMessage } from "./interfaces";
import { sendChatMessage } from "./req-res";

export default function AdminUserChatPage() {
  const params = useParams<{ userId: string }>();
  const targetUserId = params?.userId || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const adminId = useMemo(() => {
    try {
      const raw = localStorage.getItem("adminProfile");
      if (!raw) return "";
      const admin = JSON.parse(raw) as { id?: string; _id?: string };
      return admin.id || admin._id || "";
    } catch {
      return "";
    }
  }, []);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !adminId || !targetUserId || sending) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic: ChatMessage = {
      _id: tempId,
      from: adminId,
      to: targetUserId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    try {
      setSending(true);
      setError("");
      setMessages((prev) => [...prev, optimistic]);
      setDraft("");

      const saved = await sendChatMessage({
        from: adminId,
        to: targetUserId,
        content,
      });

      setMessages((prev) => prev.map((m) => (m._id === tempId ? saved : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ...existing chat header/messages... */}

      {error ? <p className={styles.error}>{error}</p> : null}

      <form className={styles.composer} onSubmit={onSend}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
        />
        <button className={styles.sendBtn} type="submit" disabled={!draft.trim() || sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}