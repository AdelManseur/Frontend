"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/app/(public)/req-res";
import { getSellerConversations } from "./req-res";
import type { SellerConversationListItem } from "./interfaces";
import styles from "./layout.module.css";

export default function ChatsModifiedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<SellerConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (!me.logged) return;
        const rows = await getSellerConversations(me.user._id);
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

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>Chats</h2>

        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>No conversations.</p>
        ) : (
          <div className={styles.list}>
            {items.map((item) => {
              const href = `/chats/${item.otherUser._id}`;
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