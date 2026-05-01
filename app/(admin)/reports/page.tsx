"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import { getAllReports, getSellerReports } from "./req-res";
import type {
  AdminReportItem,
  ReportCategory,
  ReportPriority,
  ReportStatus,
  GetSellerReportsResponse,
} from "./interfaces";

type ViewMode = "all" | "seller";

const REPORT_STATUSES: Array<{ value: ReportStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const REPORT_PRIORITIES: Array<{ value: ReportPriority | "all"; label: string }> = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const REPORT_CATEGORIES: Array<{ value: ReportCategory | "all"; label: string }> = [
  { value: "all", label: "All categories" },
  { value: "non_delivery", label: "Non-delivery" },
  { value: "fake_service", label: "Fake service" },
  { value: "poor_quality", label: "Poor quality" },
  { value: "scam", label: "Scam" },
  { value: "overcharge", label: "Overcharge" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function badgeClassForStatus(status?: string) {
  switch (status) {
    case "pending":
      return styles.statusPending;
    case "under_review":
      return styles.statusUnderReview;
    case "accepted":
      return styles.statusAccepted;
    case "rejected":
      return styles.statusRejected;
    default:
      return styles.statusOther;
  }
}

function badgeClassForPriority(priority?: string) {
  switch (priority) {
    case "low":
      return styles.priorityLow;
    case "medium":
      return styles.priorityMedium;
    case "high":
      return styles.priorityHigh;
    case "urgent":
      return styles.priorityUrgent;
    default:
      return styles.statusOther;
  }
}

export default function AdminReportsPage() {
  const [mode, setMode] = useState<ViewMode>("all");
  const [sellerIdInput, setSellerIdInput] = useState("");
  const [sellerIdQuery, setSellerIdQuery] = useState("");

  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [priority, setPriority] = useState<ReportPriority | "all">("all");
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  const [minCredibility, setMinCredibility] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, pages: 1 });
  const [sellerStats, setSellerStats] = useState<GetSellerReportsResponse["stats"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => Math.max(1, pagination.pages || Math.ceil(pagination.total / limit) || 1), [pagination.pages, pagination.total, limit]);

  useEffect(() => {
    setPage(1);
  }, [status, priority, category, minCredibility]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        if (mode === "seller") {
          if (!sellerIdQuery.trim()) {
            setReports([]);
            setSellerStats(null);
            setLoading(false);
            return;
          }

          const data = await getSellerReports(sellerIdQuery.trim());
          if (!mounted) return;

          setReports(data.reports);
          setSellerStats(data.stats);
          setPagination({ page: 1, limit: data.reports.length || 1, total: data.reports.length, pages: 1 });
          return;
        }

        const data = await getAllReports({
          status: status === "all" ? undefined : status,
          priority: priority === "all" ? undefined : priority,
          category: category === "all" ? undefined : category,
          reportedUserId: sellerIdQuery.trim() || undefined,
          minCredibility: minCredibility.trim() ? Number(minCredibility) : undefined,
          page,
          limit,
        });

        if (!mounted) return;
        setReports(data.reports);
        setSellerStats(null);
        setPagination(data.pagination);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to fetch reports.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mode, sellerIdQuery, status, priority, category, minCredibility, page, limit]);

  const onSubmitSellerSearch = () => {
    setSellerIdQuery(sellerIdInput.trim());
    setMode("seller");
  };

  const onClearSellerSearch = () => {
    setSellerIdInput("");
    setSellerIdQuery("");
    setMode("all");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Admin</p>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.subtitle}>Review all reports or inspect every report filed against a seller by user ID.</p>
      </div>

      <div className={styles.modeBar}>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === "all" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("all")}
        >
          All reports
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === "seller" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("seller")}
        >
          Seller search
        </button>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.input}
          placeholder="Search by seller userId..."
          value={sellerIdInput}
          onChange={(e) => setSellerIdInput(e.target.value)}
        />
        <div className={styles.modeBar}>
          <button type="button" className={styles.actionBtn} onClick={onSubmitSellerSearch}>
            Search seller
          </button>
          <button type="button" className={styles.actionBtn} onClick={onClearSellerSearch}>
            Clear
          </button>
        </div>
      </div>

      {mode === "all" && (
        <div className={styles.filters}>
          <select
            className={styles.select}
            title="Filter reports by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus | "all")}
          >
            {REPORT_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            title="Filter reports by priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ReportPriority | "all")}
          >
            {REPORT_PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            title="Filter reports by category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory | "all")}
          >
            {REPORT_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            className={styles.input}
            type="number"
            min="0"
            placeholder="Min credibility"
            value={minCredibility}
            onChange={(e) => setMinCredibility(e.target.value)}
          />

          <input
            className={styles.input}
            value={sellerIdQuery}
            onChange={(e) => setSellerIdQuery(e.target.value)}
            placeholder="Optional reported userId filter"
          />
        </div>
      )}

      {sellerStats && mode === "seller" && (
        <div className={styles.panelGrid}>
          <div className={styles.summaryCard}>
            <p className={styles.statsLabel}>Total reports</p>
            <p className={styles.statsValue}>{sellerStats.total}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.statsLabel}>Pending</p>
            <p className={styles.statsValue}>{sellerStats.pending}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.statsLabel}>Accepted</p>
            <p className={styles.statsValue}>{sellerStats.accepted}</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.statsLabel}>Rejected</p>
            <p className={styles.statsValue}>{sellerStats.rejected}</p>
          </div>
        </div>
      )}

      {mode === "seller" && sellerStats?.byCategory && (
        <div className={styles.summaryCard}>
          <p className={styles.statsLabel}>By category</p>
          <div className={styles.pillRow}>
            {Object.entries(sellerStats.byCategory).map(([key, value]) => (
              <span key={key} className={`${styles.badge} ${styles.statusOther}`}>
                {key.replace("_", " ")}: {value ?? 0}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? <p className={styles.state}>Loading reports...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reporter</th>
                  <th>Reported user</th>
                  <th>Order</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className={styles.empty}>
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const reporterId = report.reporter?._id;
                    const reportedUserId = report.reportedUser?._id;

                    return (
                      <tr key={report._id}>
                        <td>
                          {reporterId ? (
                            <Link href={`/control-users/${reporterId}`} className={styles.reporterLink}>
                              {report.reporter?.name || reporterId}
                            </Link>
                          ) : (
                            report.reporter?.name || "-"
                          )}
                          <div className={styles.meta}>{report.reporter?.email || report.reporter?.username || ""}</div>
                        </td>
                        <td>
                          {reportedUserId ? (
                            <Link href={`/control-users/${reportedUserId}`} className={styles.reporterLink}>
                              {report.reportedUser?.name || reportedUserId}
                            </Link>
                          ) : (
                            report.reportedUser?.name || "-"
                          )}
                          <div className={styles.meta}>{report.reportedUser?.email || report.reportedUser?.username || ""}</div>
                        </td>
                        <td>
                          <Link href={`/reports/${report._id}`} className={styles.reportLink}>
                            {report._id}
                          </Link>
                          <div className={styles.meta}>
                            {report.order?._id ? `Order: ${report.order._id}` : "Order: -"}
                          </div>
                        </td>
                        <td>{report.category.replace("_", " ")}</td>
                        <td>{report.severity || "-"}</td>
                        <td>
                          <span className={`${styles.badge} ${badgeClassForStatus(report.status)}`}>
                            {report.status || "-"}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${badgeClassForPriority(report.priority)}`}>
                            {report.priority || "-"}
                          </span>
                        </td>
                        <td>{formatDate(report.createdAt)}</td>
                        <td>
                          <Link href={`/reports/${report._id}`} className={styles.reportLink}>
                            View
                          </Link>
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
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1 || mode === "seller"}
            >
              Prev
            </button>

            <span className={styles.pageInfo}>
              {mode === "seller"
                ? `Seller reports • ${reports.length} report(s)`
                : `Page ${pagination.page} / ${totalPages} • ${pagination.total} report(s)`}
            </span>

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages || mode === "seller"}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}