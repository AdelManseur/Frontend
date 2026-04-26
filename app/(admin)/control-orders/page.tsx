"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import type { OrderItem } from "./interfaces";
import { getOrdersList } from "./req-res";

type StatusFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled" | "refunded";

export default function ControlOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [status, minPrice, maxPrice]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrdersList(token, {
          status: status === "all" ? undefined : status,
          minPrice: minPrice.trim() === "" ? undefined : Number(minPrice),
          maxPrice: maxPrice.trim() === "" ? undefined : Number(maxPrice),
          page,
          limit,
        });

        if (!mounted) return;
        setOrders(data.orders);
        setTotal(data.total);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to fetch orders.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, status, minPrice, maxPrice, page, limit]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Control Orders</h1>
        <p className={styles.subtitle}>Browse and filter all platform orders</p>
      </div>

      <div className={styles.filters}>
        <select className={styles.input} value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
          <option value="refunded">refunded</option>
        </select>

        <input
          className={styles.input}
          type="number"
          min={0}
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          className={styles.input}
          type="number"
          min={0}
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {loading ? <p className={styles.state}>Loading orders...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Title</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const key = o._id || o.id || `${o.orderNumber}-${o.createdAt}`;
                    return (
                      <tr key={key}>
                        <td>{o.orderNumber || o._id || o.id || "-"}</td>
                        {/*<td>{o.title || "-"}</td>*/}
                        <td>{o.buyerName || o.buyer._id || "-"}</td>
                        <td>{o.sellerName || o.seller._id || "-"}</td>
                        <td>{o.status}</td>
                        <td>${Number(o.price || 0).toLocaleString()}</td>
                        <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
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
        </>
      )}
    </div>
  );
}