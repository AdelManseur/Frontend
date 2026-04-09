"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import type { UserItem } from "./interfaces";
import { getUsersList, updateUserStatus } from "./req-res";
import Link from "next/link";

type StatusFilter = "all" | "true" | "false";

export default function ControlUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const token = useMemo(
    () =>
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("adminToken") ||
      sessionStorage.getItem("token") ||
      "",
    []
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const status =
          statusFilter === "all" ? undefined : statusFilter === "true";

        const data = await getUsersList(token, {
          search,
          status,
          page,
          limit,
        });

        if (!mounted) return;
        setUsers(data.users);
        setTotal(data.total);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to fetch users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, search, statusFilter, page, limit]);

  const onToggleUserStatus = async (user: UserItem) => {
    const userId = user._id || user.id;
    if (!userId || /*!token ||*/ updatingId) return;

    try {
      setUpdatingId(userId);
      await updateUserStatus(token, userId, { status: !user.status });

      setUsers((prev) =>
        prev.map((u) => {
          const id = u._id || u.id;
          return id === userId ? { ...u, status: !u.status } : u;
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Control Users</h1>
        <p className={styles.subtitle}>Search and monitor platform users</p>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.input}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {loading ? <p className={styles.state}>Loading users...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.empty}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const key = u._id || u.id || `${u.email}-${u.name}`;
                    const userId = u._id || u.id;
                    const rowUpdating = updatingId === userId;

                    return (
                      <tr key={key}>
                        <td>
                          {userId ? (
                            <Link href={`/control-users/${userId}`} className={styles.userLink}>
                              {u.name}
                            </Link>
                          ) : (
                            u.name
                          )}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              u.status ? styles.active : styles.inactive
                            }`}
                          >
                            {u.status ? "active" : "inactive"}
                          </span>
                        </td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            disabled={!userId || rowUpdating}
                            onClick={() => onToggleUserStatus(u)}
                          >
                            {rowUpdating
                              ? "Updating..."
                              : u.status
                              ? "Set Inactive"
                              : "Set Active"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>

            <span className={styles.pageInfo}>
              Page {page} / {totalPages} • {total} users
            </span>

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}