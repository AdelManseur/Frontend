"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import type { UserDetailsResponse } from "./interfaces";
import { getUserDetails, updateUserStatus } from "./req-res";

export default function UserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId || "";

  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = useMemo(
    () =>
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("adminToken") ||
      sessionStorage.getItem("token") ||
      "",
    []
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const details = await getUserDetails(token, userId);
        if (!mounted) return;
        setData(details);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load user details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, userId]);

  const onToggleStatus = async () => {
    if (!data?.user || updating) return;

    const nextStatus = !data.user.status;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      await updateUserStatus(token, userId, { status: nextStatus });

      setData((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                status: nextStatus,
              },
            }
          : prev
      );

      setSuccess(`User set to ${nextStatus ? "active" : "inactive"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/control-users" className={styles.backBtn} aria-label="Back to users">
            ←
          </Link>
          <h1 className={styles.title}>User Details</h1>
        </div>
      </div>

      {loading ? <p className={styles.state}>Loading user details...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      {!loading && !error && data && (
        <>
          <div className={styles.topActions}>
            <span className={`${styles.badge} ${data.user.status ? styles.active : styles.inactive}`}>
              {data.user.status ? "active" : "inactive"}
            </span>

            <button type="button" onClick={onToggleStatus} disabled={updating} className={styles.actionBtn}>
              {updating ? "Updating..." : data.user.status ? "Set Inactive" : "Set Active"}
            </button>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <p className={styles.label}>Name</p>
              <p className={styles.value}>{data.user.name}</p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>Email</p>
              <p className={styles.value}>{data.user.email}</p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>User ID</p>
              <p className={styles.value}>{data.user.id || data.user._id || "-"}</p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>Created At</p>
              <p className={styles.value}>
                {data.user.createdAt ? new Date(data.user.createdAt).toLocaleString() : "-"}
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>Orders</p>
              <p className={styles.value}>{data.orders}</p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>Fraud Cases</p>
              <p className={styles.value}>{data.fraudCases}</p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>Reports By</p>
              <p className={styles.value}>{data.reportsBy}</p>
            </div>

            <div className={styles.card}>
              <p className={styles.label}>Reports Against</p>
              <p className={styles.value}>{data.reportsAgainst}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}