"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
      const profileRaw = localStorage.getItem("adminProfile");
      const profile = profileRaw ? (JSON.parse(profileRaw) as { id?: string }) : null;
      const adminId = profile?.id ? String(profile.id) : "";
      if (!adminId || !userId) return;

      const [buyerInfo, raw] = await Promise.all([
        getSimpleUserDetails(userId),
        getOrdersBetweenSellerBuyer(adminId, userId),
      ]);

      let sell: ProjectOrderSummary[] = [];
      let buy: ProjectOrderSummary[] = [];

      if (Array.isArray(raw) && (Array.isArray(raw[0]) || Array.isArray(raw[1]))) {
        const grouped = raw as unknown as [ProjectOrderSummary[], ProjectOrderSummary[]];
        sell = Array.isArray(grouped[0]) ? grouped[0] : [];
        buy = Array.isArray(grouped[1]) ? grouped[1] : [];
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

  const generalHref = `/admin-chats/${userId}`;

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>{children}</section>
    </div>
  );
}