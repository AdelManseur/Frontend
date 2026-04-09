"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getMe } from "@/app/(public)/req-res";
import { getSimpleOrderMessagesByUsers } from "./req-res";
import type { SimpleOrderMessage } from "./interfaces";
import styles from "./styles.module.css";

export default function SellerProjectChatPage() {
  const params = useParams<{ userId: string; orderId: string }>();
  const orderId = params?.orderId ?? "";

  const [sellerId, setSellerId] = useState("");
  const [message, setMessage] = useState<SimpleOrderMessage | null>(null);
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

        const oneMessage = await getSimpleOrderMessagesByUsers(myId, orderId);
        if (!mounted) return;
        setMessage(oneMessage);
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

  // ✅ Hook must be before returns
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [message]);

  if (loading) return <div className={styles.chatView}><p className={styles.muted}>Loading messages...</p></div>;
  if (error) return <div className={styles.chatView}><p className={styles.error}>{error}</p></div>;
  if (!message) return <div className={styles.chatView}><p className={styles.muted}>No message found for this project.</p></div>;

  const mine = message.from === sellerId;

  return (
    <div className={styles.chatView}>
      <div ref={messagesRef} className={styles.messages}>
        <div className={`${styles.row} ${mine ? styles.rowMine : styles.rowOther}`}>
          <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleOther}`}>
            <p>{message.content}</p>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}