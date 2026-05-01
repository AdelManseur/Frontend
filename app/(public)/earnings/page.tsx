"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import type { CompletedOrderItem, EarningsSummary } from "./interfaces";
import { getCompletedOrders, getEarningsSummary } from "./req-res";

export default function EarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary>({
    lastMonth: 0,
    lastYear: 0,
    totalOrdersEver: 0,
  });
  const [orders, setOrders] = useState<CompletedOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = useMemo(
    () =>
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "",
    []
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [sum, list] = await Promise.all([
          getEarningsSummary(token),
          getCompletedOrders(token, page, limit),
        ]);

        if (!mounted) return;

        setSummary({
          ...sum,
          totalOrdersEver: sum.totalOrdersEver || list.total,
        });
        setOrders(list.orders);
        setTotal(list.total);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load earnings.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, page, limit]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Earnings Dashboard</h1>
        <p className={styles.subtitle}>Overview of your completed work revenue</p>
      </div>

      {loading ? <p className={styles.state}>Loading earnings...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && (
        <>
          <div className={styles.cards}>
            <article className={styles.card}>
              <p className={styles.cardLabel}>Last Month</p>
              <h2 className={styles.cardValue}>${summary.lastMonth.toLocaleString()}</h2>
            </article>

            <article className={styles.card}>
              <p className={styles.cardLabel}>Last Year</p>
              <h2 className={styles.cardValue}>${summary.lastYear.toLocaleString()}</h2>
            </article>

            <article className={styles.card}>
              <p className={styles.cardLabel}>Total Orders Ever</p>
              <h2 className={styles.cardValue}>{summary.totalOrdersEver.toLocaleString()}</h2>
            </article>
          </div>

          <section className={styles.tableSection}>
            <h3 className={styles.tableTitle}>Completed Orders</h3>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Buyer</th>
                    <th>Price</th>
                    <th>Completed At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.empty}>
                        No completed orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const key = o._id || o.id || `${o.orderNumber}-${o.createdAt}`;
                      return (
                        <tr key={key}>
                          <td>{o.orderNumber || o._id || o.id || "-"}</td>
                          <td>{o.title || "-"}</td>
                          <td>{o.buyerName || "-"}</td>
                          <td>${Number(o.price || 0).toLocaleString()}</td>
                          <td>{o.completedAt ? new Date(o.completedAt).toLocaleString() : "-"}</td>
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
                Page {page} / {totalPages} • {total} orders
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
          </section>
        </>
      )}
    </div>
  );
}