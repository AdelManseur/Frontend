"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getMe } from "@/app/req-res";
import { getMessagesBetween } from "./req-res";
import type { ChatMessage } from "./interfaces";
import styles from "./styles.module.css";

export default function SellerGeneralChatPage() {
  const params = useParams<{ userId: string }>();
  const buyerId = params?.userId ?? "";

  const [sellerId, setSellerId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        setMessages(
          [...rows].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load general chat.");
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

  if (loading) return <div className={styles.chatView}><p className={styles.muted}>Loading...</p></div>;
  if (error) return <div className={styles.chatView}><p className={styles.error}>{error}</p></div>;
  if (!messages.length) return <div className={styles.chatView}><p className={styles.muted}>No messages yet.</p></div>;

  return (
    <div className={styles.chatView}>
      <div ref={messagesRef} className={styles.messages}>
        {messages.map((m) => {
          const mine = m.from === sellerId;
          return (
            <div key={m._id} className={`${styles.row} ${mine ? styles.rowMine : styles.rowOther}`}>
              <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleOther}`}>
                <p className={styles.text}>{m.content}</p>
                <span className={styles.time}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}