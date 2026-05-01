"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import type { FraudCaseItem, FraudCaseStatus, FraudStatistics } from "./interfaces";
import { getFraudCases, getFraudStatistics } from "./req-res";

type StatusFilter = "all" | "pending_review" | "confirmed_fraud" | "false_positive" | "monitoring";
type TriStateFilter = "all" | "true" | "false";

function toBooleanOrUndefined(value: TriStateFilter): boolean | undefined {
	if (value === "true") return true;
	if (value === "false") return false;
	return undefined;
}

function scoreClass(score: number): string {
	if (score >= 85) return styles.scoreCritical;
	if (score >= 70) return styles.scoreHigh;
	if (score >= 50) return styles.scoreMedium;
	return styles.scoreLow;
}

export default function FraudCasesPage() {
	const [cases, setCases] = useState<FraudCaseItem[]>([]);
	const [statistics, setStatistics] = useState<FraudStatistics>({
		totalCases: 0,
		pendingReview: 0,
		confirmedFraud: 0,
		falsePositives: 0,
		immediateRiskCases: 0,
		averageFraudScore: 0,
		recentCases: 0,
		topCategories: [],
	});

	const [status, setStatus] = useState<StatusFilter>("all");
	const [minScore, setMinScore] = useState("70");
	const [maxScore, setMaxScore] = useState("100");
	const [resolved, setResolved] = useState<TriStateFilter>("all");
	const [immediateRisk, setImmediateRisk] = useState<TriStateFilter>("all");

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);
	const [total, setTotal] = useState(0);
	const [pages, setPages] = useState(1);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		setPage(1);
	}, [status, minScore, maxScore, resolved, immediateRisk, limit]);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setLoading(true);
				setError("");

				const [response, stats] = await Promise.all([
					getFraudCases({
						status: status === "all" ? undefined : (status as FraudCaseStatus),
						minScore: minScore.trim() === "" ? undefined : Number(minScore),
						maxScore: maxScore.trim() === "" ? undefined : Number(maxScore),
						resolved: toBooleanOrUndefined(resolved),
						immediateRisk: toBooleanOrUndefined(immediateRisk),
						page,
						limit,
					}),
					getFraudStatistics(),
				]);

				if (!mounted) return;

				setCases(response.fraudUsers);
				setTotal(response.pagination.total);
				setPages(response.pagination.pages || 1);
				setStatistics(stats);
			} catch (e) {
				if (!mounted) return;
				setError(e instanceof Error ? e.message : "Failed to load fraud cases.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [status, minScore, maxScore, resolved, immediateRisk, page, limit]);

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1 className={styles.title}>Fraud Cases</h1>
				<p className={styles.subtitle}>Review all flagged users, risk score, status, and fraud indicators.</p>
			</div>

			<div className={styles.filters}>
				<select
					className={styles.input}
					value={status}
					title="Filter by fraud case status"
					aria-label="Filter by fraud case status"
					onChange={(e) => setStatus(e.target.value as StatusFilter)}
				>
					<option value="all">All statuses</option>
					<option value="pending_review">pending_review</option>
					<option value="confirmed_fraud">confirmed_fraud</option>
					<option value="false_positive">false_positive</option>
					<option value="monitoring">monitoring</option>
				</select>

				<input
					className={styles.input}
					type="number"
					min={0}
					max={100}
					placeholder="Min score"
					value={minScore}
					onChange={(e) => setMinScore(e.target.value)}
				/>

				<input
					className={styles.input}
					type="number"
					min={0}
					max={100}
					placeholder="Max score"
					value={maxScore}
					onChange={(e) => setMaxScore(e.target.value)}
				/>

				<select
					className={styles.input}
					value={resolved}
					title="Filter by resolved state"
					aria-label="Filter by resolved state"
					onChange={(e) => setResolved(e.target.value as TriStateFilter)}
				>
					<option value="all">Resolved: all</option>
					<option value="true">Resolved: true</option>
					<option value="false">Resolved: false</option>
				</select>

				<select
					className={styles.input}
					value={immediateRisk}
					title="Filter by immediate risk"
					aria-label="Filter by immediate risk"
					onChange={(e) => setImmediateRisk(e.target.value as TriStateFilter)}
				>
					<option value="all">Immediate risk: all</option>
					<option value="true">Immediate risk: true</option>
					<option value="false">Immediate risk: false</option>
				</select>

				<select
					className={styles.input}
					value={String(limit)}
					title="Items per page"
					aria-label="Items per page"
					onChange={(e) => setLimit(Number(e.target.value) || 20)}
				>
					<option value="10">10 / page</option>
					<option value="20">20 / page</option>
					<option value="50">50 / page</option>
				</select>
			</div>

			<section className={styles.dashboard}>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>Total Cases</p>
					<p className={styles.statValue}>{statistics.totalCases}</p>
				</div>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>Pending Review</p>
					<p className={styles.statValue}>{statistics.pendingReview}</p>
				</div>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>Confirmed Fraud</p>
					<p className={styles.statValue}>{statistics.confirmedFraud}</p>
				</div>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>False Positives</p>
					<p className={styles.statValue}>{statistics.falsePositives}</p>
				</div>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>Immediate Risk Cases</p>
					<p className={styles.statValue}>{statistics.immediateRiskCases}</p>
				</div>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>Average Fraud Score</p>
					<p className={styles.statValue}>{statistics.averageFraudScore.toFixed(1)}</p>
				</div>
				<div className={styles.statCard}>
					<p className={styles.statLabel}>Recent Cases</p>
					<p className={styles.statValue}>{statistics.recentCases}</p>
				</div>
				<div className={styles.statCardWide}>
					<p className={styles.statLabel}>Top Categories</p>
					<div className={styles.categoriesWrap}>
						{statistics.topCategories.length === 0 ? (
							<p className={styles.categoriesEmpty}>No category data.</p>
						) : (
							statistics.topCategories.map((item) => (
								<span key={`${item._id}-${item.count}`} className={styles.categoryBadge}>
									{item._id}: {item.count}
								</span>
							))
						)}
					</div>
				</div>
			</section>

			{loading ? <p className={styles.state}>Loading fraud cases...</p> : null}
			{error ? <p className={styles.error}>{error}</p> : null}

			{!loading && !error && (
				<>
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>User</th>
									<th>Email</th>
									<th>Fraud Score</th>
									<th>Status</th>
									<th>Immediate Risk</th>
									<th>Resolved</th>
									<th>Flags</th>
									<th>Detected At</th>
									<th>Details</th>
								</tr>
							</thead>
							<tbody>
								{cases.length === 0 ? (
									<tr>
										<td colSpan={9} className={styles.empty}>
											No fraud cases found.
										</td>
									</tr>
								) : (
									cases.map((fraudCase) => (
										<tr key={fraudCase._id}>
											<td>{fraudCase.user?.name || fraudCase.user?._id || "-"}</td>
											<td>{fraudCase.user?.email || "-"}</td>
											<td>
												<span className={`${styles.scorePill} ${scoreClass(Number(fraudCase.fraudScore || 0))}`}>
													{Number(fraudCase.fraudScore || 0)}
												</span>
											</td>
											<td>{fraudCase.status || "-"}</td>
											<td>{fraudCase.riskAssessment?.immediateRisk ? "true" : "false"}</td>
											<td>{fraudCase.resolved ? "true" : "false"}</td>
											<td>{fraudCase.flags?.length ?? 0}</td>
											<td>
												{fraudCase.aiAnalysis?.detectedAt
													? new Date(fraudCase.aiAnalysis.detectedAt).toLocaleString()
													: fraudCase.createdAt
													? new Date(fraudCase.createdAt).toLocaleString()
													: "-"}
											</td>
											<td>
												<Link href={`/fraud-cases/${fraudCase._id}`} className={styles.detailsLink}>
													View
												</Link>
											</td>
										</tr>
									))
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
							Page {page} / {Math.max(1, pages)} • {total} cases
						</span>

						<button
							type="button"
							className={styles.pageBtn}
							onClick={() => setPage((p) => Math.min(Math.max(1, pages), p + 1))}
							disabled={page >= Math.max(1, pages)}
						>
							Next
						</button>
					</div>
				</>
			)}
		</div>
	);
}
