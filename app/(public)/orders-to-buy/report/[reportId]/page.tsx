"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getBuyerReportDetails } from "./req-res";
import type { BuyerReportDetails } from "./interfaces";
import styles from "./styles.module.css";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function BuyerReportDetailsPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = params?.reportId ?? "";

  const [report, setReport] = useState<BuyerReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!reportId) return;
      setLoading(true);
      setError("");

      try {
        const data = await getBuyerReportDetails(reportId);
        if (!mounted) return;
        setReport(data.report);
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

  const screenshots = useMemo(() => report?.evidence?.screenshots ?? [], [report]);
  const messages = useMemo(() => report?.evidence?.messages ?? [], [report]);

  return (
    <div className={styles.page}>
      <Link href="/orders-to-buy" className={styles.back}>
        ← Back to orders
      </Link>

      <section className={styles.header}>
        <h1 className={styles.title}>Your Report Details</h1>
        <p className={styles.subtitle}>Report ID: {reportId || "-"}</p>
      </section>

      {loading ? <p className={styles.state}>Loading report...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error && report && (
        <>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Status</h2>
            <div className={styles.badges}>
              <span className={styles.badge}>{report.status || "-"}</span>
              <span className={styles.badge}>{report.priority || "-"}</span>
              <span className={styles.badge}>{report.category.replace("_", " ")}</span>
              <span className={styles.badge}>{report.severity || "-"}</span>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Description</h2>
            <p className={styles.text}>{report.description || "-"}</p>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>People</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Reporter</span>
                <span className={styles.value}>{report.reporter?.name || "-"}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Reported User</span>
                <span className={styles.value}>{report.reportedUser?.name || "-"}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Reporter Email</span>
                <span className={styles.value}>{report.reporter?.email || "-"}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Reported Email</span>
                <span className={styles.value}>{report.reportedUser?.email || "-"}</span>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Order</h2>
            <div className={styles.grid}>
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
                <span className={styles.label}>Created</span>
                <span className={styles.value}>{formatDate(report.order?.createdAt)}</span>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Evidence</h2>

            <div className={styles.field}>
              <span className={styles.label}>Screenshots</span>
              {screenshots.length ? (
                <div className={styles.images}>
                  {screenshots.map((src, index) => (
                    <a
                      key={`${src}-${index}`}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      title={`Open screenshot ${index + 1}`}
                      className={styles.imgLink}
                    >
                      <Image
                        src={src}
                        alt={`Report screenshot ${index + 1}`}
                        width={600}
                        height={360}
                        className={styles.img}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <span className={styles.value}>No screenshots.</span>
              )}
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Messages</span>
              {messages.length ? (
                <ul className={styles.list}>
                  {messages.map((id, index) => (
                    <li key={`${id}-${index}`}>{id}</li>
                  ))}
                </ul>
              ) : (
                <span className={styles.value}>No message IDs.</span>
              )}
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Additional Info</span>
              <pre className={styles.text}>
                {report.evidence?.additionalInfo
                  ? JSON.stringify(report.evidence.additionalInfo, null, 2)
                  : "No additional info."}
              </pre>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Review Outcome</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Decision</span>
                <span className={styles.value}>{report.review?.decision || "-"}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Notes</span>
                <span className={styles.value}>{report.review?.notes || "-"}</span>
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
        </>
      )}
    </div>
  );
}