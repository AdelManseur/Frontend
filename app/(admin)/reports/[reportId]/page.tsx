"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import { getReportDetails, reviewReport } from "./req-res";
import type {
  ReportDetails,
  ReviewActionType,
  ReviewDecision,
} from "./interfaces";
import { useParams } from "next/navigation";

const REVIEW_DECISIONS: Array<{ value: ReviewDecision; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Invalid" },
  { value: "needs_investigation", label: "Needs investigation" },
];

const REVIEW_ACTIONS: Array<{ value: ReviewActionType; label: string }> = [
  { value: "warning_issued", label: "Warning issued" },
  { value: "seller_flagged", label: "Seller flagged" },
  { value: "seller_suspended", label: "Seller suspended" },
  { value: "no_action", label: "No action" },
  { value: "refund_issued", label: "Refund issued" },
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

export default function AdminReportDetailsPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = params?.reportId ?? "";

  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<ReviewDecision>("pending");
  const [notes, setNotes] = useState("");
  const [actionType, setActionType] = useState<ReviewActionType>("no_action");
  const [actionDetails, setActionDetails] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!reportId) return;

      try {
        setLoading(true);
        setError("");

        const data = await getReportDetails(reportId);
        if (!mounted) return;
        setReport(data.report);
        setDecision((data.report.review?.decision as ReviewDecision | undefined) || "pending");
        setNotes(data.report.review?.notes || "");
        setActionType((data.report.review?.actionTaken?.type as ReviewActionType | undefined) || "no_action");
        setActionDetails(data.report.review?.actionTaken?.details || "");
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load report details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [reportId]);

  const evidenceScreenshots = useMemo(() => report?.evidence?.screenshots ?? [], [report]);
  const evidenceMessages = useMemo(() => report?.evidence?.messages ?? [], [report]);

  const onSubmitReview = async () => {
    if (!report?._id) return;

    setReviewError("");
    setReviewSuccess("");

    if (!notes.trim()) {
      setReviewError("Please provide review notes.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const data = await reviewReport(report._id, {
        decision,
        notes: notes.trim(),
        actionTaken: {
          type: actionType,
          details: actionDetails.trim(),
        },
      });

      setReport((prev) =>
        prev
          ? {
              ...prev,
              status: data.report.status ?? prev.status,
              review: data.report.review ?? prev.review,
              updatedAt: data.report.updatedAt ?? prev.updatedAt,
            }
          : prev
      );
      setReviewSuccess(data.message || "Report reviewed successfully.");
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <Link href="/reports" className={styles.backBtn}>
          ← Back to reports
        </Link>
      </div>

      <div className={styles.header}>
        <p className={styles.eyebrow}>Admin</p>
        <h1 className={styles.title}>Report details</h1>
        <p className={styles.subtitle}>Full review for report {reportId || "-"}.</p>
      </div>

      {loading ? <p className={styles.state}>Loading report details...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && report && (
        <>
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${badgeClassForStatus(report.status)}`}>
              {report.status || "-"}
            </span>
            <span className={`${styles.badge} ${badgeClassForPriority(report.priority)}`}>
              {report.priority || "-"}
            </span>
            <span className={styles.badge}>{report.category.replace("_", " ")}</span>
            <span className={styles.badge}>{report.severity || "-"}</span>
          </div>

          <div className={styles.grid}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Report summary</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Report ID</span>
                  <span className={styles.value}>{report._id}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Description</span>
                  <span className={styles.textBlock}>{report.description || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Created</span>
                  <span className={styles.value}>{formatDate(report.createdAt)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Updated</span>
                  <span className={styles.value}>{formatDate(report.updatedAt)}</span>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Review</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Decision</span>
                  <span className={styles.value}>{report.review?.decision || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Reviewed by</span>
                  <span className={styles.value}>{report.review?.reviewedBy?.name || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Reviewed at</span>
                  <span className={styles.value}>{formatDate(report.review?.reviewedAt)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Notes</span>
                  <span className={styles.textBlock}>{report.review?.notes || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Action taken</span>
                  <span className={styles.value}>{report.review?.actionTaken?.type || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Action details</span>
                  <span className={styles.textBlock}>{report.review?.actionTaken?.details || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Impact</span>
                  <span className={styles.value}>
                    {typeof report.impact?.similarReports === "number"
                      ? `${report.impact.similarReports} similar report(s)`
                      : "-"}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Submit Admin Review</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Decision</label>
                  <select
                    className={styles.input}
                    title="Select review decision"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                    disabled={isSubmittingReview}
                  >
                    {REVIEW_DECISIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Action type</label>
                  <select
                    className={styles.input}
                    title="Select action taken"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ReviewActionType)}
                    disabled={isSubmittingReview}
                  >
                    {REVIEW_ACTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Review notes</label>
                  <textarea
                    className={styles.input}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    title="Review notes"
                    placeholder="Add review notes for this report"
                    disabled={isSubmittingReview}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Action details</label>
                  <textarea
                    className={styles.input}
                    value={actionDetails}
                    onChange={(e) => setActionDetails(e.target.value)}
                    rows={3}
                    title="Action details"
                    placeholder="Add action details"
                    disabled={isSubmittingReview}
                  />
                </div>

                <div className={styles.reviewActions}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={onSubmitReview}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>

                {reviewError ? <p className={styles.error}>{reviewError}</p> : null}
                {reviewSuccess ? <p className={styles.success}>{reviewSuccess}</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Reporter</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <span className={styles.value}>{report.reporter?.name || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{report.reporter?.email || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Username</span>
                  <span className={styles.value}>{report.reporter?.username || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Created</span>
                  <span className={styles.value}>{formatDate(report.reporter?.createdAt)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Verified email</span>
                  <span className={styles.value}>{report.reporter?.verifiedEmail ? "Yes" : "No"}</span>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Reported user</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <span className={styles.value}>{report.reportedUser?.name || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{report.reportedUser?.email || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Username</span>
                  <span className={styles.value}>{report.reportedUser?.username || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Created</span>
                  <span className={styles.value}>{formatDate(report.reportedUser?.createdAt)}</span>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Order</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Order ID</span>
                  <span className={styles.value}>{report.order?._id || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Price</span>
                  <span className={styles.value}>{typeof report.order?.price === "number" ? `$${report.order.price}` : "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Status</span>
                  <span className={styles.value}>{report.order?.status || "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Delivery time</span>
                  <span className={styles.value}>{typeof report.order?.deliveryTime === "number" ? `${report.order.deliveryTime} day(s)` : "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Created</span>
                  <span className={styles.value}>{formatDate(report.order?.createdAt)}</span>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Evidence</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Screenshots</span>
                  {evidenceScreenshots.length ? (
                    <div className={styles.imageGrid}>
                      {evidenceScreenshots.map((src, index) => (
                        <a
                          key={`${src}-${index}`}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open evidence screenshot ${index + 1}`}
                          className={styles.imageLink}
                        >
                          <Image src={src} alt={`Evidence screenshot ${index + 1}`} width={600} height={360} className={styles.image} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.value}>No screenshots provided.</span>
                  )}
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Messages</span>
                  {evidenceMessages.length ? (
                    <ul className={styles.list}>
                      {evidenceMessages.map((messageId, index) => (
                        <li key={`${messageId}-${index}`} className={styles.listItem}>
                          {messageId}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className={styles.value}>No message IDs provided.</span>
                  )}
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Additional info</span>
                  {report.evidence?.additionalInfo ? (
                    <pre className={styles.textBlock}>{JSON.stringify(report.evidence.additionalInfo, null, 2)}</pre>
                  ) : (
                    <span className={styles.value}>No additional info.</span>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Credibility</h2>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Credibility score</span>
                  <span className={styles.value}>{report.reporterCredibility?.credibilityScore ?? report.reporterCredibility?.priorReports ?? "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Fraud score</span>
                  <span className={styles.value}>{report.reporterCredibility?.fraudScore ?? "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Total orders</span>
                  <span className={styles.value}>{report.reporterCredibility?.totalOrders ?? "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Account age</span>
                  <span className={styles.value}>{report.reporterCredibility?.accountAge ?? "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Verified account</span>
                  <span className={styles.value}>{report.reporterCredibility?.verifiedAccount ? "Yes" : "No"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Prior reports</span>
                  <span className={styles.value}>{report.reporterCredibility?.priorReports ?? "-"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Prior accepted</span>
                  <span className={styles.value}>{report.reporterCredibility?.priorReportsAccepted ?? "-"}</span>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}