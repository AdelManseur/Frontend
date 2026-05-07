"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getMe } from "@/app/(public)/req-res";
import {
  getMessagesBetween,
  getSimpleUserDetails,
  markMessageAsRead,
  sendChatMessage,
  getOrdersBetweenSellerBuyer,
} from "./req-res";
import type { ChatMessage, SimpleUserDetails, ProjectOrderSummary } from "./interfaces";
import { API_BASE_URL } from "@/lib/api-config";
import { MoreHorizontal, Send, Smile, Paperclip, CheckCheck, Check, AlertTriangle, X, ShieldX, Package, Clock, RefreshCw, ChevronRight } from "lucide-react";

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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
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
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");

  // Custom offer form (seller only)
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ title: "", description: "", price: "", deliveryTime: "", revisions: "1" });
  const [offerSending, setOfferSending] = useState(false);
  const [offerError, setOfferError] = useState("");

  // Accept/reject offer
  const [offerActioning, setOfferActioning] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myIdRef = useRef("");

  useEffect(() => { myIdRef.current = myId; }, [myId]);

  useEffect(() => {
    if (!otherId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const savedMode = window.localStorage.getItem("jobme.mode") as "buyer" | "seller" | null;
        if (savedMode) setMode(savedMode);

        const [me, other] = await Promise.all([getMe(), getSimpleUserDetails(otherId)]);
        if (!me.logged) throw new Error("Not logged in.");
        if (!mounted) return;

        const currentId = me.user._id;
        setMyId(currentId);
        myIdRef.current = currentId;
        setOtherUser(other);

        const rows = await getMessagesBetween(currentId, otherId);
        if (!mounted) return;

        const sorted = [...rows].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(sorted);

        const lastIncoming = [...sorted].filter(m => m.from === otherId && !m.read)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (lastIncoming) {
          await markMessageAsRead(lastIncoming._id).catch(() => {});
          if (mounted) setMessages(prev => prev.map(m => m._id === lastIncoming._id ? { ...m, read: true } : m));
        }

        const socket = getSocket(currentId);
        socketRef.current = socket;
        socket.emit("joinRoom", currentId);

        socket.on("newMessage", (msg: ChatMessage) => {
          if (!mounted) return;
          const relevant = (msg.from === otherId && msg.to === myIdRef.current) || (msg.from === myIdRef.current && msg.to === otherId);
          if (!relevant) return;
          setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
          if (msg.from === otherId) {
            markMessageAsRead(msg._id).catch(() => {});
            setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
          }
        });
        socket.on("messageRead", ({ messageId }: { messageId: string }) => {
          if (!mounted) return;
          setMessages(prev => prev.map(m => m._id === messageId ? { ...m, read: true } : m));
        });
        socket.on("userTyping", ({ from }: { from: string }) => { if (from === otherId && mounted) setIsOtherTyping(true); });
        socket.on("userStoppedTyping", ({ from }: { from: string }) => { if (from === otherId && mounted) setIsOtherTyping(false); });
        socket.on("onlineUsers", (ids: string[]) => { if (mounted) setIsOtherOnline(ids.includes(otherId)); });
        socket.on("userOnline", (uid: string) => { if (uid === otherId && mounted) setIsOtherOnline(true); });
        socket.on("userOffline", (uid: string) => { if (uid === otherId && mounted) setIsOtherOnline(false); });

      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load chat.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ["newMessage","messageRead","userTyping","userStoppedTyping","onlineUsers","userOnline","userOffline"]
        .forEach(ev => socketRef.current?.off(ev));
    };
  }, [otherId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOtherTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [draft]);

  const lastSeenMyMsgId = useMemo(() => {
    const myRead = messages.filter(m => m.from === myId && m.read);
    if (!myRead.length) return null;
    return myRead.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)._id;
  }, [messages, myId]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !myId || !otherId) return;
    socketRef.current.emit("typing", { to: otherId, from: myId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socketRef.current?.emit("stopTyping", { to: otherId, from: myId }), 1500);
  }, [myId, otherId]);

  const onSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || !myId || !otherId || sending) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit("stopTyping", { to: otherId, from: myId });
    setSending(true);
    try {
      const sent = await sendChatMessage({ from: myId, to: otherId, content });
      setMessages(prev => prev.some(m => m._id === sent._id) ? prev : [...prev, sent]);
      setDraft("");
      textareaRef.current?.focus();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }, [draft, myId, otherId, sending]);

  const handleSubmitReport = async () => {
    if (!reportReason || !myId || !otherId) return;
    setReportSubmitting(true);
    setReportError("");
    try {
      const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
      const res = await fetch(`${base}/reports/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId: otherId,
          category: "fraud",
          severity: "high",
          description: `Scam report from chat: ${reportReason}. Reported via chat with user ID ${otherId}.`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setReportError(data?.error || `Submission failed (${res.status})`);
        return;
      }
      setReportSent(true);
    } catch {
      setReportError("Network error. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSendOffer = async () => {
    const { title, description, price, deliveryTime, revisions } = offerForm;
    if (!title || !description || !price || !deliveryTime) { setOfferError("All fields are required."); return; }
    setOfferSending(true); setOfferError("");
    try {
      const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
      const res = await fetch(`${base}/chat/offer`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerId: otherId, title, description, price: Number(price), deliveryTime: Number(deliveryTime), revisions: Number(revisions) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setOfferError(data?.error || `Failed (${res.status})`); return; }
      // Append offer message locally
      setMessages(prev => prev.some(m => m._id === data.data._id) ? prev : [...prev, data.data]);
      setShowOfferForm(false);
      setOfferForm({ title: "", description: "", price: "", deliveryTime: "", revisions: "1" });
    } catch { setOfferError("Network error."); }
    finally { setOfferSending(false); }
  };

  const handleOfferAction = async (messageId: string, action: "accept" | "reject") => {
    setOfferActioning(messageId);
    try {
      const base = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
      const res = await fetch(`${base}/chat/offer/${messageId}/${action}`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { alert(data?.error || `Failed (${res.status})`); return; }
      // Update offer status locally
      setMessages(prev => prev.map(m =>
        m._id === messageId && m.offer
          ? { ...m, offer: { ...m.offer, status: action === "accept" ? "accepted" : "rejected" } }
          : m
      ));
      if (action === "accept" && data.convId) {
        // Redirect to the order-specific conversation
        window.location.href = `/chats/${otherId}?orderId=${data.orderId}`;
      }
    } catch { alert("Network error."); }
    finally { setOfferActioning(null); }
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    for (const m of messages) {
      const day = new Date(m.createdAt).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === day) last.messages.push(m);
      else groups.push({ date: day, messages: [m] });
    }
    return groups;
  }, [messages]);

  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();
  const isSeller = mode === "seller";

  // Color palette
  const pageBg    = isSeller ? "bg-[#080d16]" : "bg-[#f0f2f5]";
  const headerBg  = isSeller ? "bg-[#0d1117] border-white/[0.07]" : "bg-white border-neutral-200";
  const composerBg = isSeller ? "bg-[#0d1117] border-white/[0.07]" : "bg-white border-neutral-200";
  const myBubble  = isSeller ? "bg-indigo-600 text-white" : "bg-[#0084ff] text-white";
  const theirBubble = isSeller ? "bg-white/[0.1] text-white" : "bg-white text-neutral-900";
  const textPrimary = isSeller ? "text-white" : "text-neutral-900";
  const textMuted   = isSeller ? "text-white/40" : "text-neutral-500";
  const avatarBg  = isSeller ? { background: "rgba(99,102,241,0.25)", color: "#818cf8" } : { background: "#e5e7eb", color: "#374151" };

  if (loading) {
    return (
      <div className={`flex flex-1 flex-col ${pageBg}`}>
        <div className={`flex items-center gap-4 border-b px-6 py-4 animate-pulse ${headerBg}`}>
          <div className={`h-10 w-10 rounded-full flex-shrink-0 ${isSeller ? "bg-white/10" : "bg-neutral-200"}`} />
          <div className="space-y-2">
            <div className={`h-3 w-28 rounded-full ${isSeller ? "bg-white/10" : "bg-neutral-200"}`} />
            <div className={`h-2 w-16 rounded-full ${isSeller ? "bg-white/5" : "bg-neutral-100"}`} />
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
    <div className={`flex flex-1 flex-col overflow-hidden ${pageBg}`}>

      {/* ── Header ── */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 shadow-sm ${headerBg}`}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm" style={avatarBg}>
            {otherUser?.pfp
              ? <img src={otherUser.pfp} alt={otherUser.name} className="h-full w-full object-cover" />
              : initial}
          </div>
          {isOtherOnline && (
            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 ${isSeller ? "border-[#0d1117]" : "border-white"}`} />
          )}
        </div>

        {/* Name & status */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-[15px] leading-none ${textPrimary}`}>{otherUser?.name || "User"}</p>
          <p className="text-[12px] mt-1">
            {isOtherTyping
              ? <span className="text-[#0084ff] font-medium">typing…</span>
              : isOtherOnline
                ? <span className="text-emerald-500 font-medium">Active now</span>
                : <span className={textMuted}>Offline</span>}
          </p>
        </div>

        {/* Actions */}
        <div className="relative flex items-center gap-2">
          {/* Seller-only: Send Custom Offer */}
          {isSeller && (
            <button
              onClick={() => { setShowOfferForm(true); setOfferError(""); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/20"
            >
              <Package className="w-3.5 h-3.5" />
              Send Offer
            </button>
          )}

          <button
            onClick={() => setShowMenu(v => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition ${isSeller ? "text-indigo-400 hover:bg-white/5" : "text-neutral-500 hover:bg-neutral-100"}`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className={`absolute right-0 top-10 z-50 min-w-[180px] rounded-2xl shadow-xl border overflow-hidden ${
                isSeller ? "bg-[#1a2236] border-white/10" : "bg-white border-neutral-100"
              }`}>
                <button
                  onClick={() => { setShowMenu(false); setShowReportModal(true); setReportSent(false); setReportReason(""); }}
                  className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition ${
                    isSeller ? "text-red-400 hover:bg-white/5" : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  <ShieldX className="w-4 h-4" />
                  Report Scam
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isOtherTyping ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-bold text-2xl mx-auto shadow-lg" style={avatarBg}>
              {otherUser?.pfp ? <img src={otherUser.pfp} alt="" className="w-full h-full object-cover" /> : initial}
            </div>
            <div>
              <p className={`font-bold text-lg ${textPrimary}`}>{otherUser?.name}</p>
              <p className={`text-sm mt-1 ${textMuted}`}>You're now connected. Say hi! 👋</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {groupedMessages.map(group => (
              <div key={group.date}>
                {/* Date pill */}
                <div className="flex justify-center my-4">
                  <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${isSeller ? "bg-white/10 text-white/40" : "bg-neutral-200 text-neutral-500"}`}>
                    {formatDateLabel(group.messages[0].createdAt)}
                  </span>
                </div>

                {group.messages.map((m, idx) => {
                  const mine = m.from === myId;
                  const isLastInGroup = idx === group.messages.length - 1 || group.messages[idx + 1].from !== m.from;
                  const isFirstInGroup = idx === 0 || group.messages[idx - 1].from !== m.from;
                  const showSeen = mine && m._id === lastSeenMyMsgId;

                  // bubble rounding - Messenger-style per-group
                  let rounded = "rounded-2xl";
                  if (mine) {
                    if (!isFirstInGroup && !isLastInGroup) rounded = "rounded-2xl rounded-tr-md rounded-br-md";
                    else if (!isFirstInGroup) rounded = "rounded-2xl rounded-tr-md";
                    else if (!isLastInGroup) rounded = "rounded-2xl rounded-br-md";
                  } else {
                    if (!isFirstInGroup && !isLastInGroup) rounded = "rounded-2xl rounded-tl-md rounded-bl-md";
                    else if (!isFirstInGroup) rounded = "rounded-2xl rounded-tl-md";
                    else if (!isLastInGroup) rounded = "rounded-2xl rounded-bl-md";
                  }

                  return (
                    <div key={m._id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                      {/* Their avatar only on last of group */}
                      {!mine && (
                        <div className="w-7 flex-shrink-0 flex items-end">
                          {isLastInGroup ? (
                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold" style={avatarBg}>
                              {otherUser?.pfp ? <img src={otherUser.pfp} alt="" className="w-full h-full object-cover" /> : initial}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[72%]`}>
                        {m.type === "custom_offer" && m.offer ? (
                          // ── Custom Offer Card ──
                          <div className={`rounded-2xl overflow-hidden shadow-md w-72 ${mine ? "border border-indigo-400/20" : "border border-neutral-200"} ${isSeller ? "bg-[#1a2236]" : "bg-white"}`}>
                            <div className={`px-4 py-3 flex items-center gap-2 ${isSeller ? "bg-indigo-600/20 border-b border-indigo-500/20" : "bg-blue-50 border-b border-blue-100"}`}>
                              <Package className={`w-4 h-4 flex-shrink-0 ${isSeller ? "text-indigo-400" : "text-blue-500"}`} />
                              <span className={`text-[12px] font-bold uppercase tracking-wide ${isSeller ? "text-indigo-300" : "text-blue-600"}`}>Custom Offer</span>
                            </div>
                            <div className="px-4 py-3">
                              <p className={`font-bold text-[14px] mb-1 ${isSeller ? "text-white" : "text-neutral-900"}`}>{m.offer.title}</p>
                              <p className={`text-[12.5px] leading-relaxed mb-3 ${isSeller ? "text-white/50" : "text-neutral-500"}`}>{m.offer.description}</p>
                              <div className="flex items-center gap-3 mb-3">
                                <span className={`text-[16px] font-bold ${isSeller ? "text-indigo-300" : "text-neutral-900"}`}>{m.offer.price} DA</span>
                                <span className={`flex items-center gap-1 text-[12px] ${isSeller ? "text-white/40" : "text-neutral-400"}`}>
                                  <Clock className="w-3 h-3" />{m.offer.deliveryTime}d
                                </span>
                                <span className={`flex items-center gap-1 text-[12px] ${isSeller ? "text-white/40" : "text-neutral-400"}`}>
                                  <RefreshCw className="w-3 h-3" />{m.offer.revisions} rev
                                </span>
                              </div>
                              {/* Action buttons — only for buyer on pending offers */}
                              {!mine && m.offer.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    disabled={offerActioning === m._id}
                                    onClick={() => handleOfferAction(m._id, "reject")}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${isSeller ? "border-white/10 text-white/40 hover:bg-white/5" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}
                                  >Decline</button>
                                  <button
                                    disabled={offerActioning === m._id}
                                    onClick={() => handleOfferAction(m._id, "accept")}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#0084ff] text-white hover:bg-blue-500 transition flex items-center justify-center gap-1"
                                  >
                                    {offerActioning === m._id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ChevronRight className="w-3.5 h-3.5" />Accept</>}
                                  </button>
                                </div>
                              )}
                              {m.offer.status !== "pending" && (
                                <div className={`text-center text-[12px] font-semibold py-1.5 rounded-xl ${
                                  m.offer.status === "accepted" ? "bg-emerald-500/10 text-emerald-500" : "bg-neutral-100 text-neutral-400"
                                }`}>
                                  {m.offer.status === "accepted" ? "✓ Accepted" : "✕ Declined"}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className={`px-3.5 py-2.5 text-[14.5px] leading-snug break-words whitespace-pre-wrap shadow-sm ${rounded} ${mine ? myBubble : theirBubble}`}>
                            {m.content}
                          </div>
                        )}

                        {/* Timestamp + seen - only last in group */}
                        {isLastInGroup && (
                          <div className={`flex items-center gap-1 mt-1 px-1 ${mine ? "flex-row-reverse" : ""}`}>
                            <span className={`text-[11px] ${textMuted}`}>{formatTime(m.createdAt)}</span>
                            {mine && (
                              <span className={showSeen ? "text-[#0084ff]" : textMuted}>
                                {showSeen ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {isOtherTyping && (
              <div className="flex items-end gap-2 mt-3 justify-start">
                <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold" style={avatarBg}>
                  {otherUser?.pfp ? <img src={otherUser.pfp} alt="" className="w-full h-full object-cover" /> : initial}
                </div>
                <div className={`flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-bl-md shadow-sm ${theirBubble}`}>
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:160ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:320ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Composer ── */}
      <div className={`flex-shrink-0 px-4 py-3 border-t ${composerBg}`}>
        <div className="flex items-end gap-2">
          {/* Emoji / attachment buttons */}
          <button className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition ${isSeller ? "text-indigo-400 hover:bg-white/5" : "text-[#0084ff] hover:bg-[#0084ff]/10"}`}>
            <Smile className="w-5 h-5" />
          </button>
          <button className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition ${isSeller ? "text-indigo-400 hover:bg-white/5" : "text-[#0084ff] hover:bg-[#0084ff]/10"}`}>
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={e => { setDraft(e.target.value); emitTyping(); }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
              }}
              placeholder="Aa"
              style={{ resize: "none", overflowY: "hidden" }}
              className={`w-full rounded-2xl px-4 py-2.5 text-[14px] outline-none transition leading-snug ${
                isSeller
                  ? "bg-white/[0.07] text-white placeholder-white/30 focus:bg-white/[0.1]"
                  : "bg-neutral-100 text-neutral-900 placeholder-neutral-400 focus:bg-neutral-50"
              }`}
            />
          </div>

          {/* Send button */}
          <button
            onClick={onSend}
            disabled={!draft.trim() || sending}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition disabled:opacity-30 active:scale-95 ${
              isSeller ? "bg-indigo-500 text-white hover:bg-indigo-400" : "bg-[#0084ff] text-white hover:bg-blue-500"
            }`}
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>

      {/* ── Report Scam Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden ${isSeller ? "bg-[#141a28] border-white/10" : "bg-white border-neutral-100"}`}>
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isSeller ? "border-white/[0.07]" : "border-neutral-100"}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className={`font-bold text-[15px] ${isSeller ? "text-white" : "text-neutral-900"}`}>Report Scam</p>
                  <p className={`text-[12px] ${isSeller ? "text-white/30" : "text-neutral-400"}`}>
                    Reporting: {otherUser?.name || "this user"}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isSeller ? "text-white/40 hover:bg-white/5" : "text-neutral-400 hover:bg-neutral-100"}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSent ? (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldX className="w-7 h-7 text-emerald-500" />
                </div>
                <p className={`font-bold text-[16px] mb-2 ${isSeller ? "text-white" : "text-neutral-900"}`}>Report Submitted</p>
                <p className={`text-sm leading-relaxed ${isSeller ? "text-white/40" : "text-neutral-500"}`}>
                  Thank you. Our trust & safety team will review this conversation within 24 hours.
                </p>
                <button onClick={() => setShowReportModal(false)} className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition">
                  Close
                </button>
              </div>
            ) : (
              <div className="px-6 py-5">
                <p className={`text-sm mb-4 leading-relaxed ${isSeller ? "text-white/50" : "text-neutral-500"}`}>
                  Select the reason that best describes the suspicious behaviour you experienced.
                </p>

                <div className="space-y-2 mb-5">
                  {[
                    "Requesting payment outside JobMe",
                    "Asking for personal information",
                    "Fake identity / impersonation",
                    "Threatening or aggressive behaviour",
                    "Other suspicious activity",
                  ].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[13.5px] font-medium border transition ${
                        reportReason === reason
                          ? isSeller
                            ? "border-red-500/50 bg-red-500/10 text-red-400"
                            : "border-red-400 bg-red-50 text-red-600"
                          : isSeller
                            ? "border-white/[0.07] text-white/60 hover:bg-white/[0.04]"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition ${isSeller ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.09]" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!reportReason || reportSubmitting}
                    onClick={handleSubmitReport}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 transition flex items-center justify-center gap-2"
                  >
                    {reportSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {reportSubmitting ? "Submitting…" : "Submit Report"}
                  </button>
                </div>
                {reportError && (
                  <p className="mt-3 text-xs text-red-500 text-center leading-relaxed">{reportError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Custom Offer Form Modal (Seller Only) ── */}
      {showOfferForm && isSeller && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl shadow-2xl border bg-[#141a28] border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Package className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-bold text-[15px] text-white">Create Custom Offer</p>
                  <p className="text-[12px] text-white/40">For {otherUser?.name || "this buyer"}</p>
                </div>
              </div>
              <button onClick={() => setShowOfferForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full transition text-white/40 hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Website Design"
                  value={offerForm.title}
                  onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe exactly what you will deliver..."
                  value={offerForm.description}
                  onChange={e => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1">Price (DA)</label>
                  <input
                    type="number"
                    min="5"
                    placeholder="e.g. 5000"
                    value={offerForm.price}
                    onChange={e => setOfferForm({ ...offerForm, price: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1">Delivery (Days)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={offerForm.deliveryTime}
                    onChange={e => setOfferForm({ ...offerForm, deliveryTime: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1">Revisions</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1"
                    value={offerForm.revisions}
                    onChange={e => setOfferForm({ ...offerForm, revisions: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-indigo-500/50 outline-none transition"
                  />
                </div>
              </div>

              {offerError && <p className="text-xs text-red-400 text-center mt-2">{offerError}</p>}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold transition bg-white/[0.06] text-white/60 hover:bg-white/[0.09]"
                >
                  Cancel
                </button>
                <button
                  disabled={offerSending || !offerForm.title || !offerForm.description || !offerForm.price || !offerForm.deliveryTime}
                  onClick={handleSendOffer}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  {offerSending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {offerSending ? "Sending…" : "Send Offer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}