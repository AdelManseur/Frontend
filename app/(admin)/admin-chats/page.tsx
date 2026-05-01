"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./styles.module.css";

export default function SellerChatsModifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("userId") || "");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userId.trim();
    if (!trimmed) return;
    router.push(`/admin-chats?userId=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className={styles.emptyState}>     
      <p className={styles.muted}>Select a conversation from the left sidebar.</p>
    </div>
  );
}