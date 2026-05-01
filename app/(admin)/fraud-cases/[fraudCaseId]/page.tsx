"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import { getFraudCaseDetails, resolveFraudCase, reviewFraudCase } from "./req-res";
import type {
	FraudCaseDetails,
	FraudCaseReviewActionType,
	FraudCaseReviewDecision,
	FraudCaseSeverity,
	ResolveFraudCaseOutcome,
} from "./interfaces";

function formatDate(value?: string): string {
	if (!value) return "-";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function formatCurrency(value?: number): string {
	if (typeof value !== "number") return "-";
	return `$${value.toLocaleString()}`;
}

function severityClass(severity?: FraudCaseSeverity): string {
	switch (severity) {
		case "critical":
			return styles.severityCritical;
		case "high":
			return styles.severityHigh;
		case "medium":
			return styles.severityMedium;
		case "low":
			return styles.severityLow;
		default:
			return styles.severityOther;
	}
}

function scoreClass(score?: number): string {
	const safeScore = Number(score || 0);
	if (safeScore >= 85) return styles.scoreCritical;
	if (safeScore >= 70) return styles.scoreHigh;
	if (safeScore >= 50) return styles.scoreMedium;
	return styles.scoreLow;
}

function jsonText(data: unknown): string {
	if (!data) return "-";
	return JSON.stringify(data, null, 2);
}

const REVIEW_DECISIONS: Array<{ value: FraudCaseReviewDecision; label: string }> = [
	{ value: "pending", label: "Pending" },
	{ value: "confirmed", label: "Confirmed" },
	{ value: "dismissed", label: "Dismissed" },
	{ value: "needs_more_info", label: "Needs more info" },
];

const REVIEW_ACTIONS: Array<{ value: FraudCaseReviewActionType; label: string }> = [
	{ value: "account_suspended", label: "Account suspended" },
	{ value: "account_banned", label: "Account banned" },
	{ value: "funds_held", label: "Funds held" },
	{ value: "warning_issued", label: "Warning issued" },
	{ value: "no_action", label: "No action" },
];

const RESOLUTION_OUTCOMES: Array<{ value: ResolveFraudCaseOutcome; label: string }> = [
	{ value: "fraud_confirmed", label: "Fraud confirmed" },
	{ value: "false_alarm", label: "False alarm" },
	{ value: "preventive_action_taken", label: "Preventive action taken" },
];

export default function FraudCaseDetailsPage() {
	const params = useParams<{ fraudCaseId: string }>();
	const fraudCaseId = params?.fraudCaseId ?? "";

	const [fraudCase, setFraudCase] = useState<FraudCaseDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [reviewDecision, setReviewDecision] = useState<FraudCaseReviewDecision>("pending");
	const [reviewNotes, setReviewNotes] = useState("");
	const [reviewActionType, setReviewActionType] = useState<FraudCaseReviewActionType>("no_action");
	const [reviewActionDetails, setReviewActionDetails] = useState("");
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);
	const [reviewError, setReviewError] = useState("");
	const [reviewSuccess, setReviewSuccess] = useState("");

	const [resolveOutcome, setResolveOutcome] = useState<ResolveFraudCaseOutcome>("fraud_confirmed");
	const [resolveDetails, setResolveDetails] = useState("");
	const [isResolving, setIsResolving] = useState(false);
	const [resolveError, setResolveError] = useState("");
	const [resolveSuccess, setResolveSuccess] = useState("");

	useEffect(() => {
		let mounted = true;

		(async () => {
			if (!fraudCaseId) return;

			try {
				setLoading(true);
				setError("");

				const data = await getFraudCaseDetails(fraudCaseId);
				if (!mounted) return;
				setFraudCase(data.fraudCase || null);
			} catch (e) {
				if (!mounted) return;
				setError(e instanceof Error ? e.message : "Failed to load fraud case details.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [fraudCaseId]);

	useEffect(() => {
		if (!fraudCase) return;

		const mappedDecision = fraudCase.review?.decision;
		if (
			mappedDecision === "pending" ||
			mappedDecision === "confirmed" ||
			mappedDecision === "dismissed" ||
			mappedDecision === "needs_more_info"
		) {
			setReviewDecision(mappedDecision);
		}

		setReviewNotes(fraudCase.review?.notes || "");

		const mappedAction = fraudCase.review?.actionTaken?.type;
		if (
			mappedAction === "account_suspended" ||
			mappedAction === "account_banned" ||
			mappedAction === "funds_held" ||
			mappedAction === "warning_issued" ||
			mappedAction === "no_action"
		) {
			setReviewActionType(mappedAction);
		}

		setReviewActionDetails(fraudCase.review?.actionTaken?.details || "");
	}, [fraudCase]);

	const flags = useMemo(() => fraudCase?.flags ?? [], [fraudCase]);
	const patterns = useMemo(() => fraudCase?.suspiciousPatterns ?? [], [fraudCase]);
	const priorFlags = useMemo(() => fraudCase?.priorFlags ?? [], [fraudCase]);

	const onSubmitReview = async () => {
		if (!fraudCase?._id) return;

		setReviewError("");
		setReviewSuccess("");

		if (!reviewNotes.trim()) {
			setReviewError("Please add review notes.");
			return;
		}

		setIsSubmittingReview(true);

		try {
			const data = await reviewFraudCase(fraudCase._id, {
				decision: reviewDecision,
				notes: reviewNotes.trim(),
				actionTaken: {
					type: reviewActionType,
					details: reviewActionDetails.trim(),
				},
			});

			setFraudCase((prev) =>
				prev
					? {
						...prev,
						status: data.fraudCase.status ?? prev.status,
						review: data.fraudCase.review ?? prev.review,
						updatedAt: data.fraudCase.updatedAt ?? prev.updatedAt,
					}
					: prev
			);
			setReviewSuccess(data.message || "Fraud case reviewed successfully.");
		} catch (e) {
			setReviewError(e instanceof Error ? e.message : "Failed to review fraud case.");
		} finally {
			setIsSubmittingReview(false);
		}
	};

	const onResolveCase = async () => {
		if (!fraudCase?._id) return;

		setResolveError("");
		setResolveSuccess("");

		if (!resolveDetails.trim()) {
			setResolveError("Please add resolution details.");
			return;
		}

		setIsResolving(true);

		try {
			const data = await resolveFraudCase(fraudCase._id, {
				outcome: resolveOutcome,
				details: resolveDetails.trim(),
			});

			setFraudCase((prev) =>
				prev
					? {
						...prev,
						resolved: data.fraudCase.resolved ?? prev.resolved,
						resolvedAt: data.fraudCase.resolvedAt ?? prev.resolvedAt,
						resolution: data.fraudCase.resolution ?? prev.resolution,
						updatedAt: data.fraudCase.updatedAt ?? prev.updatedAt,
					}
					: prev
			);
			setResolveSuccess(data.message || "Fraud case resolved successfully.");
		} catch (e) {
			setResolveError(e instanceof Error ? e.message : "Failed to resolve fraud case.");
		} finally {
			setIsResolving(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.topRow}>
				<Link href="/fraud-cases" className={styles.backBtn}>
					← Back to fraud cases
				</Link>
			</div>

			<div className={styles.header}>
				<p className={styles.eyebrow}>Admin</p>
				<h1 className={styles.title}>Fraud case details</h1>
				<p className={styles.subtitle}>Full review for fraud case {fraudCaseId || "-"}.</p>
			</div>

			{loading ? <p className={styles.state}>Loading fraud case details...</p> : null}
			{error ? <p className={styles.error}>{error}</p> : null}

			{!loading && !error && fraudCase && (
				<>
					<div className={styles.badgeRow}>
						<span className={`${styles.badge} ${scoreClass(fraudCase.fraudScore)}`}>
							Score: {Number(fraudCase.fraudScore || 0)}
						</span>
						<span className={styles.badge}>{fraudCase.status || "-"}</span>
						<span className={styles.badge}>Resolved: {fraudCase.resolved ? "true" : "false"}</span>
						<span className={styles.badge}>
							Immediate risk: {fraudCase.riskAssessment?.immediateRisk ? "true" : "false"}
						</span>
					</div>

					<div className={styles.grid}>
						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Case summary</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Case ID</span>
									<span className={styles.value}>{fraudCase._id}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Status</span>
									<span className={styles.value}>{fraudCase.status || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Fraud score</span>
									<span className={styles.value}>{Number(fraudCase.fraudScore || 0)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Created</span>
									<span className={styles.value}>{formatDate(fraudCase.createdAt)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Updated</span>
									<span className={styles.value}>{formatDate(fraudCase.updatedAt)}</span>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>User</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Name</span>
									<span className={styles.value}>{fraudCase.user?.name || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Email</span>
									<span className={styles.value}>{fraudCase.user?.email || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Username</span>
									<span className={styles.value}>{fraudCase.user?.username || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Created</span>
									<span className={styles.value}>{formatDate(fraudCase.user?.createdAt)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Verified email</span>
									<span className={styles.value}>{fraudCase.user?.verifiedEmail ? "true" : "false"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Verified phone</span>
									<span className={styles.value}>{fraudCase.user?.verifiedPhone ? "true" : "false"}</span>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>AI analysis</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Model</span>
									<span className={styles.value}>{fraudCase.aiAnalysis?.model || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Confidence</span>
									<span className={styles.value}>
										{typeof fraudCase.aiAnalysis?.confidence === "number"
											? `${fraudCase.aiAnalysis.confidence}`
											: "-"}
									</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Detected at</span>
									<span className={styles.value}>{formatDate(fraudCase.aiAnalysis?.detectedAt)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Analysis version</span>
									<span className={styles.value}>{fraudCase.aiAnalysis?.analysisVersion || "-"}</span>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Risk assessment</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Immediate risk</span>
									<span className={styles.value}>{fraudCase.riskAssessment?.immediateRisk ? "true" : "false"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Recommended action</span>
									<span className={styles.value}>{fraudCase.riskAssessment?.recommendedAction || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Potential loss</span>
									<span className={styles.value}>{formatCurrency(fraudCase.riskAssessment?.potentialLoss)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Affected users</span>
									<span className={styles.value}>
										{typeof fraudCase.riskAssessment?.affectedUsers === "number"
											? fraudCase.riskAssessment.affectedUsers
											: "-"}
									</span>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Flags</h2>
							{flags.length === 0 ? (
								<p className={styles.value}>No flags.</p>
							) : (
								<div className={styles.list}>
									{flags.map((flag, idx) => (
										<article key={`${flag.description || "flag"}-${idx}`} className={styles.card}>
											<div className={styles.cardHeader}>
												<span className={styles.badge}>{flag.category || "-"}</span>
												<span className={`${styles.badge} ${severityClass(flag.severity)}`}>{flag.severity || "-"}</span>
												<span className={styles.muted}>{formatDate(flag.detectedAt)}</span>
											</div>
											<p className={styles.description}>{flag.description || "-"}</p>
											<pre className={styles.pre}>{jsonText(flag.evidence)}</pre>
										</article>
									))}
								</div>
							)}
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Suspicious patterns</h2>
							{patterns.length === 0 ? (
								<p className={styles.value}>No suspicious patterns.</p>
							) : (
								<div className={styles.list}>
									{patterns.map((pattern, idx) => (
										<article key={`${pattern.pattern || "pattern"}-${idx}`} className={styles.card}>
											<div className={styles.cardHeader}>
												<span className={styles.badge}>{pattern.pattern || "-"}</span>
												<span className={`${styles.badge} ${severityClass(pattern.severity)}`}>{pattern.severity || "-"}</span>
												<span className={styles.badge}>Occurrences: {pattern.occurrences ?? 0}</span>
											</div>
											<pre className={styles.pre}>{jsonText(pattern.examples)}</pre>
										</article>
									))}
								</div>
							)}
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Triggering event</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Type</span>
									<span className={styles.value}>{fraudCase.triggeringEvent?.type || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Reference ID</span>
									<span className={styles.value}>{fraudCase.triggeringEvent?.referenceId || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Timestamp</span>
									<span className={styles.value}>{formatDate(fraudCase.triggeringEvent?.timestamp)}</span>
								</div>
								<div className={styles.fieldFull}>
									<span className={styles.label}>Details</span>
									<pre className={styles.pre}>{jsonText(fraudCase.triggeringEvent?.details)}</pre>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>User snapshot</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}><span className={styles.label}>Account age (days)</span><span className={styles.value}>{fraudCase.userSnapshot?.accountAge ?? "-"}</span></div>
								<div className={styles.field}><span className={styles.label}>Total orders</span><span className={styles.value}>{fraudCase.userSnapshot?.totalOrders ?? "-"}</span></div>
								<div className={styles.field}><span className={styles.label}>Cancelled orders</span><span className={styles.value}>{fraudCase.userSnapshot?.cancelledOrders ?? "-"}</span></div>
								<div className={styles.field}><span className={styles.label}>Completed orders</span><span className={styles.value}>{fraudCase.userSnapshot?.completedOrders ?? "-"}</span></div>
								<div className={styles.field}><span className={styles.label}>Average order value</span><span className={styles.value}>{formatCurrency(fraudCase.userSnapshot?.averageOrderValue)}</span></div>
								<div className={styles.field}><span className={styles.label}>Total spent</span><span className={styles.value}>{formatCurrency(fraudCase.userSnapshot?.totalSpent)}</span></div>
								<div className={styles.field}><span className={styles.label}>Total earned</span><span className={styles.value}>{formatCurrency(fraudCase.userSnapshot?.totalEarned)}</span></div>
								<div className={styles.field}><span className={styles.label}>Verified email</span><span className={styles.value}>{fraudCase.userSnapshot?.verificationStatus?.email ? "true" : "false"}</span></div>
								<div className={styles.field}><span className={styles.label}>Verified phone</span><span className={styles.value}>{fraudCase.userSnapshot?.verificationStatus?.phone ? "true" : "false"}</span></div>
								<div className={styles.field}><span className={styles.label}>Verified identity</span><span className={styles.value}>{fraudCase.userSnapshot?.verificationStatus?.identity ? "true" : "false"}</span></div>
								<div className={styles.field}><span className={styles.label}>Orders last 24h</span><span className={styles.value}>{fraudCase.userSnapshot?.recentActivity?.ordersLast24h ?? "-"}</span></div>
								<div className={styles.field}><span className={styles.label}>Orders last 7 days</span><span className={styles.value}>{fraudCase.userSnapshot?.recentActivity?.ordersLast7days ?? "-"}</span></div>
								<div className={styles.field}><span className={styles.label}>Messages last 24h</span><span className={styles.value}>{fraudCase.userSnapshot?.recentActivity?.messagesLast24h ?? "-"}</span></div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Review</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Decision</span>
									<span className={styles.value}>{fraudCase.review?.decision || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Reviewed by</span>
									<span className={styles.value}>{fraudCase.review?.reviewedBy?.name || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Reviewed at</span>
									<span className={styles.value}>{formatDate(fraudCase.review?.reviewedAt)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Action type</span>
									<span className={styles.value}>{fraudCase.review?.actionTaken?.type || "-"}</span>
								</div>
								<div className={styles.fieldFull}>
									<span className={styles.label}>Notes</span>
									<span className={styles.textBlock}>{fraudCase.review?.notes || "-"}</span>
								</div>
								<div className={styles.fieldFull}>
									<span className={styles.label}>Action details</span>
									<span className={styles.textBlock}>{fraudCase.review?.actionTaken?.details || "-"}</span>
								</div>
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Review Case Action</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<label className={styles.label}>Decision</label>
									<select
										className={styles.input}
										title="Review decision"
										aria-label="Review decision"
										value={reviewDecision}
										onChange={(e) => setReviewDecision(e.target.value as FraudCaseReviewDecision)}
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
										title="Action type"
										aria-label="Action type"
										value={reviewActionType}
										onChange={(e) => setReviewActionType(e.target.value as FraudCaseReviewActionType)}
										disabled={isSubmittingReview}
									>
										{REVIEW_ACTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>

								<div className={styles.fieldFull}>
									<label className={styles.label}>Review notes</label>
									<textarea
										className={styles.input}
										title="Review notes"
										aria-label="Review notes"
										rows={4}
										value={reviewNotes}
										onChange={(e) => setReviewNotes(e.target.value)}
										disabled={isSubmittingReview}
										placeholder="Write review notes"
									/>
								</div>

								<div className={styles.fieldFull}>
									<label className={styles.label}>Action details</label>
									<textarea
										className={styles.input}
										title="Action details"
										aria-label="Action details"
										rows={3}
										value={reviewActionDetails}
										onChange={(e) => setReviewActionDetails(e.target.value)}
										disabled={isSubmittingReview}
										placeholder="Describe the action taken"
									/>
								</div>

								<div className={styles.actionsRow}>
									<button
										type="button"
										className={styles.primaryBtn}
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
							<h2 className={styles.panelTitle}>Resolve Case</h2>
							<div className={styles.fieldGrid}>
								<div className={styles.field}>
									<span className={styles.label}>Resolved</span>
									<span className={styles.value}>{fraudCase.resolved ? "true" : "false"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Resolved at</span>
									<span className={styles.value}>{formatDate(fraudCase.resolvedAt)}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Outcome</span>
									<span className={styles.value}>{fraudCase.resolution?.outcome || "-"}</span>
								</div>
								<div className={styles.field}>
									<span className={styles.label}>Resolved by</span>
									<span className={styles.value}>{fraudCase.resolution?.resolvedBy?.name || "-"}</span>
								</div>
								<div className={styles.fieldFull}>
									<span className={styles.label}>Resolution details</span>
									<span className={styles.textBlock}>{fraudCase.resolution?.details || "-"}</span>
								</div>

								<div className={styles.field}>
									<label className={styles.label}>Final outcome</label>
									<select
										className={styles.input}
										title="Resolution outcome"
										aria-label="Resolution outcome"
										value={resolveOutcome}
										onChange={(e) => setResolveOutcome(e.target.value as ResolveFraudCaseOutcome)}
										disabled={isResolving || Boolean(fraudCase.resolved)}
									>
										{RESOLUTION_OUTCOMES.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>

								<div className={styles.fieldFull}>
									<label className={styles.label}>Outcome details</label>
									<textarea
										className={styles.input}
										title="Outcome details"
										aria-label="Outcome details"
										rows={4}
										value={resolveDetails}
										onChange={(e) => setResolveDetails(e.target.value)}
										disabled={isResolving || Boolean(fraudCase.resolved)}
										placeholder="Write final resolution details"
									/>
								</div>

								<div className={styles.actionsRow}>
									<button
										type="button"
										className={styles.primaryBtn}
										onClick={onResolveCase}
										disabled={isResolving || Boolean(fraudCase.resolved)}
									>
										{isResolving ? "Resolving..." : fraudCase.resolved ? "Already Resolved" : "Resolve Case"}
									</button>
								</div>

								{resolveError ? <p className={styles.error}>{resolveError}</p> : null}
								{resolveSuccess ? <p className={styles.success}>{resolveSuccess}</p> : null}
							</div>
						</section>

						<section className={styles.panel}>
							<h2 className={styles.panelTitle}>Prior flags</h2>
							{priorFlags.length === 0 ? (
								<p className={styles.value}>No prior flags.</p>
							) : (
								<div className={styles.list}>
									{priorFlags.map((item, idx) => (
										<article key={`${item.reason || "prior"}-${idx}`} className={styles.card}>
											<div className={styles.cardHeader}>
												<span className={styles.badge}>Resolved: {item.resolved ? "true" : "false"}</span>
												<span className={styles.badge}>{item.resolution || "-"}</span>
												<span className={styles.muted}>{formatDate(item.flaggedAt)}</span>
											</div>
											<p className={styles.description}>{item.reason || "-"}</p>
										</article>
									))}
								</div>
							)}
						</section>
					</div>
				</>
			)}
		</div>
	);
}
