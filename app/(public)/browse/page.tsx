"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { getGigCategories, getSimpleGigs, sendAIMessage, getAIChatHistory } from "./req-res";
import { getMe } from "../req-res";
import Link from "next/link";
import type { BuyerGig, AIMessage } from "./interfaces";
import styles from "./styles.module.css";

// Helper to format AI response with bold text
const formatAIText = (text: string) => {
  return text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
};

export default function BrowsePage() {
  const [gigs, setGigs] = useState<BuyerGig[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [myUserId, setMyUserId] = useState<string>("");
  const [aiPartner, setAiPartner] = useState<string>("");

  // AI Chat state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiDraft, setAiDraft] = useState("");
  const [aiSending, setAiSending] = useState(false);
  const [aiError, setAiError] = useState("");
  const aiMessagesRef = useRef<HTMLDivElement | null>(null);

  const loadGigs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [result, me] = await Promise.all([
        getSimpleGigs({
          search,
          category: selectedCategory || undefined,
          page: 1,
          limit: 50,
        }),
        getMe(),
      ]);

      const currentUserId = me?.logged ? me.user?._id : "";
      setMyUserId(currentUserId || "");
      setAiPartner("ai-bot");

      // hide my own gigs + only active gigs
      const visible = (result.gigs ?? []).filter((g: any) => {
        const ownerId =
          g?.seller?._id ||
          g?.user?._id ||
          g?.userId ||
          g?.ownerId ||
          "";

        return g.isActive !== false && ownerId !== currentUserId;
      });

      setGigs(visible);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const cats = await getGigCategories();
      setCategories(cats);
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadGigs();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory]);

  // Load AI chat history when opening chat
  useEffect(() => {
    if (!isAIChatOpen || !myUserId || !aiPartner) return;

    (async () => {
      try {
        const history = await getAIChatHistory(myUserId, aiPartner);
        setAiMessages(history);
        setAiError("");
      } catch (err) {
        setAiError(err instanceof Error ? err.message : "Failed to load chat history");
      }
    })();
  }, [isAIChatOpen, myUserId, aiPartner]);

  // Auto-scroll AI messages
  useEffect(() => {
    if (!aiMessagesRef.current) return;
    aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
  }, [aiMessages]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    gigs.forEach((g) => (g.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [gigs]);

  const filteredGigs = useMemo(() => {
    if (selectedTags.length === 0) return gigs;
    return gigs.filter((gig) => gig.tags?.some((tag) => selectedTags.includes(tag)));
  }, [gigs, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const onSendAIMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = aiDraft.trim();
    if (!content || aiSending || !myUserId || !aiPartner) return;

    try {
      setAiSending(true);
      setAiError("");

      // Send to backend
      const responses = await sendAIMessage({
        from: myUserId,
        to: aiPartner,
        content,
      });

      // Add both user message and AI response
      setAiMessages((prev) => [...prev, ...responses]);
      setAiDraft("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setAiSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Buyer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Browse Gigs</h1>
        <p className="mt-2 text-sm text-gray-400">
          Discover services from other sellers and open any gig for full details.
        </p>
      </div>

      <div className="py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-2xl">
            <label htmlFor="browse-search" className="mb-2 block text-sm text-gray-400">
              Search
            </label>
            <div className="flex items-center border-b border-white/10 bg-white/[0.03] px-0 py-2">
              <input
                id="browse-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs by title, keyword, or category..."
                className="w-full bg-transparent px-0 text-sm text-white placeholder:text-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="min-w-[220px]">
            <label htmlFor="category-filter" className="mb-2 block text-sm text-gray-400">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-b border-white/10 bg-transparent py-2 text-sm text-white focus:outline-none"
            >
              <option value="" className="bg-[#111827] text-white">
                All categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-[#111827] text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!!categories.length && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                !selectedCategory
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              All
            </button>

            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    active
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-h-[260px] animate-pulse rounded-xl border border-white/10 bg-white/5" />
          ))}

        {!isLoading && filteredGigs.length === 0 && (
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
            No gigs found with current filters.
          </div>
        )}

        {!isLoading &&
          filteredGigs.map((gig) => {
            const image = gig.images?.[0] || "https://placehold.co/800x450/111827/9ca3af?text=No+Image";

            return (
              <Link key={gig._id} href={`/browse/${gig._id}`} className="block">
                <article className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/40 hover:bg-white/[0.07]">
                  <div className="h-[170px] w-full bg-black/20">
                    <img src={image} alt={gig.title} className="h-full w-full object-cover" />
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-1 text-lg font-semibold">{gig.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">{gig.description}</p>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="rounded bg-white/10 px-2 py-1 text-gray-300">{gig.category}</span>
                      <span className="font-semibold text-indigo-300">${gig.price}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{gig.deliveryTime} day(s)</span>
                      <span>
                        ⭐ {gig.rating?.average?.toFixed?.(1) ?? "0.0"} ({gig.rating?.count ?? 0})
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
      </div>

      {/* AI Chat FAB */}
      <button
        type="button"
        onClick={() => setIsAIChatOpen((v) => !v)}
        className={styles.fab}
        title={isAIChatOpen ? "Close AI chat" : "Open AI chat"}
      >
        {isAIChatOpen ? "✕" : "💬"}
      </button>

      {/* AI Chat Panel */}
      {isAIChatOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3 className={styles.title}>AI Assistant</h3>
            <button
              type="button"
              onClick={() => setIsAIChatOpen(false)}
              className={styles.closeBtn}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div ref={aiMessagesRef} className={styles.messages}>
            {aiMessages.length === 0 ? (
              <p className={styles.empty}>Start chatting with AI...</p>
            ) : (
              aiMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`${styles.row} ${msg.role === "user" ? styles.rowUser : styles.rowAssistant}`}
                >
                  <div
                    className={`${styles.bubble} ${
                      msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant
                    }`}
                  >
                    <p
                      dangerouslySetInnerHTML={{
                        __html: formatAIText(msg.content),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {aiError && <p className={styles.error}>{aiError}</p>}

          <form onSubmit={onSendAIMessage} className={styles.composer}>
            <input
              value={aiDraft}
              onChange={(e) => setAiDraft(e.target.value)}
              placeholder="Ask me anything..."
              className={styles.input}
              disabled={aiSending}
            />
            <button
              type="submit"
              disabled={aiSending || !aiDraft.trim()}
              className={styles.sendBtn}
            >
              {aiSending ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}