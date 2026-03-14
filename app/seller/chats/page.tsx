"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getMe } from "@/app/req-res";
import { connectChatSocket, getAllUsers, getMessagesBetween, sendMessage, markMessageAsRead } from "./req-res";
import type { ChatMessage, PublicUser } from "./interfaces";
import styles from "./styles.module.css";

type ChatSlot = {
  user: PublicUser;
  lastMessage: ChatMessage;
  lastMessagesByMeAfterHim: ChatMessage[];
  seenMessageId: string | null;
};

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
            },
            {
                _id: "69aae86a10caabba532cd3ec",
                name: "Adel Manseur 2",
                email: "adelmans2005@gmail.com",
            }
        ];

        const results = await Promise.allSettled(
          others.map(async (u) => {
            const conv = await getMessagesBetween(me.user._id, u._id);
            if (!conv.length) return null;

            const sorted = [...conv].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // existing rule: keep only chats initiated by buyer
            const firstMessage = sorted[0];
            const firstMessageFromSeller = firstMessage.from === me.user._id;
            if (firstMessageFromSeller) return null;

            // NEW: messages by seller sent after the last buyer->seller message
            const lastIncomingIndex = sorted.findLastIndex(
              (m) => m.from === u._id && m.to === me.user._id
            );

            const lastMessagesByMeAfterHim =
              lastIncomingIndex === -1
                ? []
                : sorted.filter(
                    (m, idx) =>
                      idx > lastIncomingIndex &&
                      m.from === me.user._id &&
                      m.to === u._id
                  );

            const mostRecentReadByOther = [...lastMessagesByMeAfterHim]
              .reverse()
              .find((m) => m.read === true);

            return {
              user: u,
              lastMessage: sorted[sorted.length - 1],
              lastMessagesByMeAfterHim,
              seenMessageId: mostRecentReadByOther?._id ?? null,
            } as ChatSlot;
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
      setError("");

      try {
        const conv = await getMessagesBetween(myId, selectedUserId);
        if (!mounted) return;

        const sorted = [...conv].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);

        // last message sent TO seller (current user) by selected buyer
        const lastIncomingToSeller = [...sorted]
          .reverse()
          .find((m) => m.to === myId && m.from === selectedUserId && !m.read);

        if (lastIncomingToSeller?._id) {
          try {
            await markMessageAsRead(lastIncomingToSeller._id);
            if (!mounted) return;

            setMessages((prev) =>
              prev.map((m) =>
                m._id === lastIncomingToSeller._id ? { ...m, read: true } : m
              )
            );
          } catch {
            // non-blocking
          }
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load messages");
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

  const parseSimpleOrderContent = (content: string) => {
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    const faqs: { question: string; answer: string }[] = [];
    let customSpec = "";
    let inCustomSpec = false;

    for (let i = 0; i < lines.length; i++) {
      if (/^Custom Specifications:?$/i.test(lines[i])) {
        inCustomSpec = true;
        continue;
      }
      if (inCustomSpec) {
        customSpec += (customSpec ? "\n" : "") + lines[i];
        continue;
      }
      const qMatch = lines[i].match(/^Q\d+:\s*(.+)$/i);
      const aMatch = lines[i + 1]?.match(/^A\d+:\s*(.+)$/i);
      if (qMatch) {
        faqs.push({ question: qMatch[1], answer: aMatch?.[1] ?? "—" });
        i++; // skip answer line
      }
    }

    return { faqs, customSpec };
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
                    const isSeenMark =
                      mine &&
                      selected.seenMessageId != null &&
                      m._id === selected.seenMessageId;

                    // simple order message special UI
                    if (m.kind === "simpleOrderMessage") {
                      return (
                        <div key={m._id}>
                          <div className={`${styles.row} ${styles.rowOther}`}>
                            <div className={`${styles.bubble} ${styles.bubbleOther}`} style={{ borderLeft: "3px solid #818cf8", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300 mb-1">
                                🗂 Simple Order Requirements
                              </p>
                              <p className={styles.bubbleText} style={{ whiteSpace: "pre-wrap" }}>
                                {m.content}
                              </p>
                              <span className={styles.bubbleTime}>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // normal message UI — exactly as it was
                    return (
                      <div key={m._id}>
                        <div className={`${styles.row} ${mine ? styles.rowMine : styles.rowOther}`}>
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

                        {isSeenMark && (
                          <div className={`${styles.row} ${styles.rowMine}`}>
                            <span className={styles.seenMark}>Seen</span>
                          </div>
                        )}
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