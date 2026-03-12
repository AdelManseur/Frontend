"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getMe } from "@/app/req-res";
import { connectChatSocket, getAllUsers, getMessagesBetween, sendMessage } from "./req-res";
import type { ChatMessage, PublicUser } from "./interfaces";
import styles from "./styles.module.css";

type ChatSlot = { user: PublicUser; lastMessage: ChatMessage };

export default function SellerChatsPage() {
  const [myId, setMyId] = useState("");
  const [slots, setSlots] = useState<ChatSlot[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMe();
        if (!me.logged) throw new Error("Not logged in.");
        if (!mounted) return;
        setMyId(me.user._id);

        //const users = await getAllUsers();
        //const others = users.filter((u) => u._id !== me.user._id);
        const others = [
            {
                _id: "69a9b56e2b0756912896cef0",
                name: "Adel Manseur",
                email: "adelmans2005@gmail.com",
            }
        ];

        const results = await Promise.allSettled(
          others.map(async (u) => {
            const conv = await getMessagesBetween(me.user._id, u._id);
            if (!conv.length) return null;
            return { user: u, lastMessage: conv[conv.length - 1] } as ChatSlot;
          })
        );

        const built = results
          .map((r) => (r.status === "fulfilled" ? r.value : null))
          .filter((x): x is ChatSlot => !!x)
          .sort(
            (a, b) =>
              new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
          );

        if (!mounted) return;
        setSlots(built);
        if (built.length) setSelectedUserId(built[0].user._id);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed loading chats");
      } finally {
        if (mounted) setIsLoadingSlots(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!myId || !selectedUserId) {
        setMessages([]);
        return;
      }
      setIsLoadingMessages(true);
      try {
        const conv = await getMessagesBetween(myId, selectedUserId);
        if (mounted) setMessages(conv);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed loading messages");
      } finally {
        if (mounted) setIsLoadingMessages(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [myId, selectedUserId]);

  useEffect(() => {
    if (!myId) return;
    const socket = connectChatSocket(myId);

    socket.on("newMessage", (raw: any) => {
      const msg: ChatMessage = {
        _id: String(raw?._id ?? `rt-${Date.now()}`),
        from: String(raw?.from ?? ""),
        to: String(raw?.to ?? ""),
        content: String(raw?.content ?? ""),
        createdAt: String(raw?.createdAt ?? new Date().toISOString()),
        read: Boolean(raw?.read),
      };

      const otherId = msg.from === myId ? msg.to : msg.from;

      setSlots((prev) => {
        const idx = prev.findIndex((s) => s.user._id === otherId);
        if (idx < 0) return prev; // appears when user exists in slots build
        const copy = [...prev];
        copy[idx] = { ...copy[idx], lastMessage: msg };
        copy.sort(
          (a, b) =>
            new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );
        return copy;
      });

      if (selectedUserId && (msg.from === selectedUserId || msg.to === selectedUserId)) {
        setMessages((prev) =>
          [...prev, msg].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );
      }
    });

    return () => socket.disconnect();
  }, [myId, selectedUserId]);

  const selected = useMemo(
    () => slots.find((s) => s.user._id === selectedUserId) ?? null,
    [slots, selectedUserId]
  );

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !myId || !selectedUserId) return;

    try {
      const msg = await sendMessage({ from: myId, to: selectedUserId, content });
      setDraft("");
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed sending");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Seller Chats</h1></div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {isLoadingSlots ? (
            <p className={styles.muted}>Loading chats...</p>
          ) : slots.length === 0 ? (
            <p className={styles.muted}>No chats yet.</p>
          ) : (
            slots.map((s) => (
              <button
                key={s.user._id}
                onClick={() => setSelectedUserId(s.user._id)}
                className={`${styles.slot} ${selectedUserId === s.user._id ? styles.slotActive : ""}`}
              >
                <p className={styles.name}>{s.user.name}</p>
                <p className={styles.preview}>{(s.lastMessage.content || "").split("\n")[0]}</p>
              </button>
            ))
          )}
        </aside>

        <section className={styles.chat}>
          {!selected ? (
            <p className={styles.muted}>Select a chat.</p>
          ) : (
            <>
              <div className={styles.chatTop}>{selected.user.name}</div>
              <div className={styles.messages}>
                {isLoadingMessages ? (
                  <p className={styles.muted}>Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className={styles.muted}>No messages yet.</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.from === myId;
                    return (
                      <div
                        key={m._id}
                        className={`${styles.row} ${mine ? styles.rowMine : styles.rowOther}`}
                      >
                        <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleOther}`}>
                          <p className={styles.bubbleText}>{m.content}</p>
                          <span className={styles.bubbleTime}>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={onSend} className={styles.composer}>
                <input className={styles.input} value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button className={styles.send}>Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}