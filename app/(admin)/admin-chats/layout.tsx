"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSellerConversations, getSimpleUserDetails } from "./req-res";
import type { SellerConversationListItem } from "./interfaces";
import styles from "./layout.module.css";

export default function ChatsModifiedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearchUserId = searchParams.get("userId") || "";
  const [items, setItems] = useState<SellerConversationListItem[]>([]);
  const [searchUserId, setSearchUserId] = useState(initialSearchUserId);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchUserId(initialSearchUserId);
  }, [initialSearchUserId]);

  const pushUserIntoList = useCallback(
    (user: { _id: string; name: string; email?: string; phone?: string; pfp?: string }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.otherUser._id === user._id);
        if (existing) return prev;
        return [
          {
            convId: `manual-${user._id}`,
            otherUser: user,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profileRaw = localStorage.getItem("adminProfile");
        const profile = profileRaw ? (JSON.parse(profileRaw) as { id?: string }) : null;
        const adminId = profile?.id ? String(profile.id) : "";
        if (!adminId) return;

        const rows = await getSellerConversations(adminId);
        if (!mounted) return;
        setItems(rows);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const performSearch = useCallback(async (rawUserId: string) => {
    const userId = rawUserId.trim();
    if (!userId) return;

    try {
      setSearching(true);
      setSearchError("");
      const user = await getSimpleUserDetails(userId);
      pushUserIntoList(user);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Failed to search user.");
    } finally {
      setSearching(false);
    }
  }, [pushUserIntoList]);

  useEffect(() => {
    if (!initialSearchUserId.trim()) return;
    void performSearch(initialSearchUserId);
  }, [initialSearchUserId, performSearch]);

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(searchUserId);
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>Chats</h2>

        <form onSubmit={onSearchSubmit} className={styles.searchWrap}>
          <label htmlFor="admin-chat-search" className={styles.searchLabel}>
            Search by userId
          </label>
          <div className={styles.searchRow}>
            <input
              id="admin-chat-search"
              className={styles.searchInput}
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="userId"
            />
            <button type="submit" className={styles.searchBtn} disabled={searching || !searchUserId.trim()}>
              {searching ? "..." : "Go"}
            </button>
          </div>
          {searchError ? <p className={styles.searchError}>{searchError}</p> : null}
        </form>

        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>No conversations.</p>
        ) : (
          <div className={styles.list}>
            {items.map((item) => {
              const href = `/admin-chats/${item.otherUser._id}`;
              const active = pathname?.startsWith(href);
              return (
                <Link key={item.convId} href={href} className={`${styles.row} ${active ? styles.rowActive : ""}`}>
                  <div className={styles.avatar}>
                    {item.otherUser.pfp ? (
                      <img src={item.otherUser.pfp} alt={item.otherUser.name || "User"} className={styles.avatarImg} />
                    ) : (
                      <span>{(item.otherUser.name || "?").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.name}>{item.otherUser.name || "Unknown buyer"}</p>
                    <p className={styles.sub}>{item.otherUser._id}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}