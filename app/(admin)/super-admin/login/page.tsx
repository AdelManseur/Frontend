"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { superAdminLogin } from "./req-res";

export default function SuperAdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim() && password.trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setError("");

      const data = await superAdminLogin({
        email: email.trim(),
        password,
      });

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminProfile", JSON.stringify(data.admin));

      router.push("/super-admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>Super Admin Login</h1>
        <p className={styles.subtitle}>Sign in to manage the platform.</p>

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.submit} type="submit" disabled={!canSubmit || loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}