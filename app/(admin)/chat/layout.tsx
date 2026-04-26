"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
import type { SimpleUserDetails } from "./interfaces";
import { getSimpleUserDetails } from "./req-res";

export default function AdminChatLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [userIdInput, setUserIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<SimpleUserDetails[]>([]);

  const token = useMemo(
    () =>
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("adminToken") ||
      sessionStorage.getItem("token") ||
      "",
    []
  );

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!userIdInput.trim() || loading) return;

    try {
      setLoading(true);
      setError("");

      const data = await getSimpleUserDetails(userIdInput.trim(), token || undefined);

      setUsers((prev) => {
        const exists = prev.some((u) => u.userId === data.userId);
        return exists ? prev : [data, ...prev];
      });

      setUserIdInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.chatShell}>
      <aside className={styles.sidebar}>
        <form className={styles.searchBar} onSubmit={onSearch}>
          <input
            className={styles.input}
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="Enter user ID..."
          />
          <button
            className={styles.button}
            type="submit"
            disabled={loading || !userIdInput.trim()}
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.userList}>
          {users.length === 0 ? (
            <p className={styles.emptyUsers}>No searched users yet.</p>
          ) : (
            users.map((u) => {
              const active = pathname === `/chat/${u.userId}`;

              return (
                <Link
                  key={u.userId}
                  href={`/chat/${u.userId}`}
                  className={`${styles.userItem} ${active ? styles.userItemActive : ""}`}
                >
                  <img
                    className={styles.avatar}
                    src={u.pfp || "/default-avatar.png"}
                    alt={u.name}
                  />
                  <div className={styles.userMeta}>
                    <p className={styles.userName}>{u.name}</p>
                    <p className={styles.userEmail}>{u.email}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      <section className={styles.chatPane}>{children}</section>
    </div>
  );
}