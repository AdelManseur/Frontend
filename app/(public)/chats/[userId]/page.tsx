"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getMe } from "@/app/req-res";
import { getMessagesBetween, markMessageAsRead, sendChatMessage } from "./req-res";
import type { ChatMessage } from "./interfaces";
import styles from "./styles.module.css";

export default function ChatPage() {
  const params = useParams<{ userId: string }>();
  const buyerId = params?.userId ?? "";

  const [sellerId, setSellerId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!buyerId) return;

      try {
        setLoading(true);
        setError("");

        const me = await getMe();
        if (!me.logged) throw new Error("Not logged in.");
        if (!mounted) return;
        const myId = me.user._id;
        setSellerId(myId);

        const rows = await getMessagesBetween(myId, buyerId);
        if (!mounted) return;
        const sorted = [...rows].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);

        // Mark last message sent by the other user as read
        const lastIncoming = [...sorted]
          .filter((m) => m.from === buyerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (lastIncoming && !lastIncoming.read) {
          await markMessageAsRead(lastIncoming._id);

          if (!mounted) return;
          setMessages((prev) =>
            prev.map((m) => (m._id === lastIncoming._id ? { ...m, read: true } : m))
          );
        }
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load chat.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [buyerId]);

  // ✅ Hook must be before returns
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !sellerId || !buyerId || sending) return;

    try {
      setSending(true);
      setSendError("");

      const sent = await sendChatMessage({
        from: sellerId,
        to: buyerId,
        content,
      });

      // append new message immediately
      setMessages((prev) => [...prev, sent]);
      setDraft("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const meId = sellerId;

  const lastSeenMyMessageId = useMemo(() => {
    // only messages sent by current user that are read
    const myReadMessages = messages.filter((m) => m.from === meId && m.read === true);
    if (!myReadMessages.length) return null;

    const latest = myReadMessages.reduce((a, b) =>
      new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? a : b
    );

    return latest._id;
  }, [messages, meId]);

  if (loading) return <div className={styles.chatView}><p className={styles.muted}>Loading...</p></div>;
  if (error) return <div className={styles.chatView}><p className={styles.error}>{error}</p></div>;
  if (!messages.length) return <div className={styles.chatView}><p className={styles.muted}>No messages yet.</p></div>;

  return (
    <div className={styles.chatView}>
      <div ref={messagesRef} className={styles.messages}>
        {messages.map((m) => {
          const mine = m.from === meId;
          const showSeen = mine && m._id === lastSeenMyMessageId;

          return (
            <div key={m._id} className={`${styles.row} ${mine ? styles.rowMine : styles.rowOther}`}>
              <div className={`${styles.messageCol} ${mine ? styles.messageColMine : styles.messageColOther}`}>
                <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleOther}`}>
                  <p className={styles.text}>{m.content}</p>
                  <span className={styles.time}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {showSeen ? <span className={styles.seenOutside}>seen</span> : null}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSendMessage} className={styles.composer}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" disabled={sending || !draft.trim()} className={styles.sendBtn}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {sendError ? <p className={styles.error}>{sendError}</p> : null}
    </div>
  );
}