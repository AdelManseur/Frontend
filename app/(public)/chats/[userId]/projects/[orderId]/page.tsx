"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getMe } from "@/app/(public)/req-res";
import {
  getSimpleOrderMessagesByUsers,
  sendSimpleOrderMessageByUsers,
} from "./req-res";
import type { SimpleOrderMessage } from "./interfaces";
import styles from "./styles.module.css";

export default function SellerProjectChatPage() {
  const params = useParams<{ userId: string; orderId: string }>();
  const orderId = params?.orderId ?? "";
  const otherUserId = params?.userId ?? "";

  const [sellerId, setSellerId] = useState("");
  const [messages, setMessages] = useState<SimpleOrderMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        setError("");

        const me = await getMe();
        if (!me.logged) throw new Error("Not logged in.");
        if (!mounted) return;

        const myId = me.user._id;
        setSellerId(myId);

        const result = await getSimpleOrderMessagesByUsers(myId, orderId);
        if (!mounted) return;

        const list = Array.isArray(result)
          ? result
          : result
          ? [result]
          : [];
        setMessages(list);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load project chat.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const formatMsgTime = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toIdString = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const v = value as { _id?: string; id?: string };
      return v._id || v.id || "";
    }
    return "";
  };

  const normalizeMessage = (
    raw: any,
    fallback: SimpleOrderMessage
  ): SimpleOrderMessage => ({
    _id: String(raw?._id ?? fallback._id),
    from: toIdString(raw?.from) || toIdString(raw?.sender) || String(fallback.from),
    to: toIdString(raw?.to) || toIdString(raw?.receiver) || String(fallback.to),
    orderId: String(raw?.orderId ?? raw?.order?._id ?? fallback.orderId),
    content: String(raw?.content ?? raw?.message ?? fallback.content),
    createdAt: raw?.createdAt ?? raw?.created_at ?? fallback.createdAt,
  });

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !sellerId || !otherUserId || !orderId || sending) return;

    const tempMsg: SimpleOrderMessage = {
      _id: `tmp-${Date.now()}`,
      from: sellerId,
      to: otherUserId,
      orderId,
      content,
      createdAt: new Date().toISOString(),
    };

    try {
      setSending(true);
      setError("");

      // optimistic render
      setMessages((prev) => [...prev, tempMsg]);
      setDraft("");

      const created = await sendSimpleOrderMessageByUsers({
        from: sellerId,
        to: otherUserId,
        orderId,
        content,
      });

      const normalized = normalizeMessage(created, tempMsg);

      // replace temp with server message
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? normalized : m))
      );
    } catch (e) {
      // rollback optimistic message if send failed
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setError(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className={styles.chatView}><p className={styles.muted}>Loading messages...</p></div>;
  if (error) return <div className={styles.chatView}><p className={styles.error}>{error}</p></div>;

  return (
    <div className={styles.chatView}>
      <div ref={messagesRef} className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.muted}>No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const mine = toIdString(msg.from) === toIdString(sellerId);

            return (
              <div
                key={msg._id || `${msg.createdAt || "now"}-${msg.content}`}
                className={`${styles.row} ${mine ? styles.rowMine : styles.rowOther}`}
              >
                <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleOther}`}>
                  <p>{msg.content}</p>
                  <span>{formatMsgTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form className={styles.composer} onSubmit={onSend}>
        <input
          className={styles.input}
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className={styles.sendBtn} type="submit" disabled={!draft.trim() || sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}