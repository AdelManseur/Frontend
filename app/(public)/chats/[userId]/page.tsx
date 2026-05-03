"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getMe } from "@/app/(public)/req-res";
import { getMessagesBetween, getSimpleUserDetails, markMessageAsRead, sendChatMessage } from "./req-res";
import type { ChatMessage, SimpleUserDetails } from "./interfaces";
import { API_BASE_URL } from "@/lib/api-config";

let socketInstance: Socket | null = null;

function getSocket(userId: string): Socket {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(API_BASE_URL, {
      query: { userId },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}

export default function ChatPage() {
  const params = useParams<{ userId: string }>();
  const otherId = params?.userId ?? "";

  const [myId, setMyId] = useState("");
  const [otherUser, setOtherUser] = useState<SimpleUserDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myIdRef = useRef("");

  // Keep myIdRef in sync
  useEffect(() => { myIdRef.current = myId; }, [myId]);

  // Load initial data + set up socket
  useEffect(() => {
    if (!otherId) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const [me, other] = await Promise.all([
          getMe(),
          getSimpleUserDetails(otherId),
        ]);
        if (!me.logged) throw new Error("Not logged in.");
        if (!mounted) return;

        const currentId = me.user._id;
        setMyId(currentId);
        myIdRef.current = currentId;
        setOtherUser(other);

        // Load history
        const rows = await getMessagesBetween(currentId, otherId);
        if (!mounted) return;

        const sorted = [...rows].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);

        // Mark last unread incoming message
        const lastIncoming = [...sorted]
          .filter((m) => m.from === otherId && !m.read)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (lastIncoming) {
          await markMessageAsRead(lastIncoming._id).catch(() => {});
          if (mounted) {
            setMessages((prev) =>
              prev.map((m) => (m._id === lastIncoming._id ? { ...m, read: true } : m))
            );
          }
        }

        // —— Socket setup ——
        const socket = getSocket(currentId);
        socketRef.current = socket;

        socket.emit("joinRoom", currentId);

        // Receive new messages in real-time
        socket.on("newMessage", (msg: ChatMessage) => {
          if (!mounted) return;
          // Only append messages relevant to this conversation
          const isRelevant =
            (msg.from === otherId && msg.to === myIdRef.current) ||
            (msg.from === myIdRef.current && msg.to === otherId);

          if (!isRelevant) return;

          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });

          // Auto-mark as read if it's incoming
          if (msg.from === otherId) {
            markMessageAsRead(msg._id).catch(() => {});
            setMessages((prev) =>
              prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m))
            );
          }
        });

        // Seen receipts
        socket.on("messageRead", ({ messageId }: { messageId: string }) => {
          if (!mounted) return;
          setMessages((prev) =>
            prev.map((m) => (m._id === messageId ? { ...m, read: true } : m))
          );
        });

        // Typing indicators
        socket.on("userTyping", ({ from }: { from: string }) => {
          if (from === otherId && mounted) setIsOtherTyping(true);
        });
        socket.on("userStoppedTyping", ({ from }: { from: string }) => {
          if (from === otherId && mounted) setIsOtherTyping(false);
        });

        // Online presence
        // Handle initial snapshot of online users (for late-joiners)
        socket.on("onlineUsers", (onlineIds: string[]) => {
          if (mounted) setIsOtherOnline(onlineIds.includes(otherId));
        });
        socket.on("userOnline", (userId: string) => {
          if (userId === otherId && mounted) setIsOtherOnline(true);
        });
        socket.on("userOffline", (userId: string) => {
          if (userId === otherId && mounted) setIsOtherOnline(false);
        });

      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load chat.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      // Clean up listeners for this conversation only
      socketRef.current?.off("newMessage");
      socketRef.current?.off("messageRead");
      socketRef.current?.off("userTyping");
      socketRef.current?.off("userStoppedTyping");
      socketRef.current?.off("onlineUsers");
      socketRef.current?.off("userOnline");
      socketRef.current?.off("userOffline");
    };
  }, [otherId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const lastSeenMyMessageId = useMemo(() => {
    const myRead = messages.filter((m) => m.from === myId && m.read === true);
    if (!myRead.length) return null;
    return myRead.reduce((a, b) =>
      new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? a : b
    )._id;
  }, [messages, myId]);

  // Typing indicator logic
  const emitTyping = useCallback(() => {
    if (!socketRef.current || !myId || !otherId) return;
    socketRef.current.emit("typing", { to: otherId, from: myId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { to: otherId, from: myId });
    }, 1500);
  }, [myId, otherId]);

  const onDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    emitTyping();
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !myId || !otherId || sending) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit("stopTyping", { to: otherId, from: myId });

    setSending(true);
    setSendError("");

    try {
      const sent = await sendChatMessage({ from: myId, to: otherId, content });
      // Append optimistically (socket may also deliver, dedup handles it)
      setMessages((prev) => {
        if (prev.some((m) => m._id === sent._id)) return prev;
        return [...prev, sent];
      });
      setDraft("");
      inputRef.current?.focus();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    for (const m of messages) {
      const day = new Date(m.createdAt).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === day) {
        last.messages.push(m);
      } else {
        groups.push({ date: day, messages: [m] });
      }
    }
    return groups;
  }, [messages]);

  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-white/10" />
            <div className="h-2 w-20 rounded bg-white/10" />
          </div>
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-6 py-4">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-300">
          {otherUser?.pfp ? (
            <img src={otherUser.pfp} alt={otherUser.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            initial
          )}
          {/* Online indicator */}
          {isOtherOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b1220]" />
          )}
        </div>
        <div>
          <p className="font-semibold text-white">{otherUser?.name || "User"}</p>
          <p className="text-xs text-gray-500">
            {isOtherTyping ? (
              <span className="text-indigo-400 animate-pulse">typing...</span>
            ) : isOtherOnline ? (
              <span className="text-emerald-400">Online</span>
            ) : (
              otherUser?.email || otherId
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && !isOtherTyping ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="text-3xl">👋</span>
            <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-xs text-gray-600">{formatDate(group.messages[0].createdAt)}</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                {group.messages.map((m, idx) => {
                  const mine = m.from === myId;
                  const showSeen = mine && m._id === lastSeenMyMessageId;
                  const prevMine = idx > 0 && group.messages[idx - 1].from === m.from;

                  return (
                    <div
                      key={m._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"} ${prevMine ? "mt-0.5" : "mt-3"}`}
                    >
                      <div className={`flex max-w-[70%] flex-col ${mine ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            mine
                              ? "rounded-br-sm bg-indigo-500 text-white"
                              : "rounded-bl-sm bg-white/[0.08] text-gray-200"
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="mt-1 px-1 text-[10px] text-gray-600">
                          {formatTime(m.createdAt)}
                          {mine && (
                            <span className="ml-1">{showSeen ? "· Seen" : "· Sent"}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing indicator bubble */}
            {isOtherTyping && (
              <div className="mt-3 flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.08] px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 bg-white/[0.02] px-6 py-4">
        {sendError && <p className="mb-2 text-xs text-red-400">{sendError}</p>}
        <form onSubmit={onSend} className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={draft}
            onChange={onDraftChange}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:opacity-40"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 rotate-90">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}