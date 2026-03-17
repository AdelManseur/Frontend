"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe } from "@/app/req-res";
import { getOrdersBetweenSellerBuyer, getSimpleUserDetails } from "./req-res";
import type { ProjectOrderSummary, SimpleUserDetails } from "./interfaces";
import styles from "./layout.module.css";

export default function UserChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId ?? "";

  const [buyer, setBuyer] = useState<SimpleUserDetails | null>(null);
  const [toSell, setToSell] = useState<ProjectOrderSummary[]>([]);
  const [toBuy, setToBuy] = useState<ProjectOrderSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await getMe();
      if (!me.logged || !userId) return;

      const [buyerInfo, raw] = await Promise.all([
        getSimpleUserDetails(userId),
        getOrdersBetweenSellerBuyer(me.user._id, userId),
      ]);

      let sell: ProjectOrderSummary[] = [];
      let buy: ProjectOrderSummary[] = [];

      const anyRaw: any = raw;
      if (Array.isArray(anyRaw) && (Array.isArray(anyRaw[0]) || Array.isArray(anyRaw[1]))) {
        sell = Array.isArray(anyRaw[0]) ? anyRaw[0] : [];
        buy = Array.isArray(anyRaw[1]) ? anyRaw[1] : [];
      } else if (
        Array.isArray(anyRaw?.orders) &&
        (Array.isArray(anyRaw.orders[0]) || Array.isArray(anyRaw.orders[1]))
      ) {
        sell = Array.isArray(anyRaw.orders[0]) ? anyRaw.orders[0] : [];
        buy = Array.isArray(anyRaw.orders[1]) ? anyRaw.orders[1] : [];
      }

      if (!mounted) return;
      setBuyer(buyerInfo);
      setToSell(sell);
      setToBuy(buy);
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const generalHref = `/chats/${userId}`;

  return (
    <div className={styles.wrap}>
      <aside className={styles.tree}>
        <p className={styles.user}>{buyer?.name || userId}</p>

        <Link href={generalHref} className={`${styles.node} ${pathname === generalHref ? styles.nodeActive : ""}`}>
          General Chat
        </Link>

        <div className={styles.nodeTitle}>Project Chats</div>

        <div className={styles.projectsScroll}>
          <div className={styles.group}>
            <p className={styles.groupTitle}>Orders to Sell</p>
            {toSell.map((p, i) => {
              const href = `/chats/${userId}/projects/${p._id}`;
              return (
                <Link
                  key={`sell-${p._id}`}
                  href={href}
                  className={`${styles.leaf} ${pathname === href ? styles.nodeActive : ""}`}
                >
                  {`Project_${i + 1}: id: ${p._id} gig name: ${p.gig?.title || "Untitled gig"}`}
                </Link>
              );
            })}
          </div>

          <div className={styles.group}>
            <p className={styles.groupTitle}>Orders to Buy</p>
            {toBuy.map((p, i) => {
              const href = `/chats/${userId}/projects/${p._id}`;
              return (
                <Link
                  key={`buy-${p._id}`}
                  href={href}
                  className={`${styles.leaf} ${pathname === href ? styles.nodeActive : ""}`}
                >
                  {`Project_${i + 1}: id: ${p._id} gig name: ${p.gig?.title || "Untitled gig"}`}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      <section className={styles.panel}>{children}</section>
    </div>
  );
}