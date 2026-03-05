"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "./req-res";
import styles from "./styles.module.css";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): string | null => {
    if (!otp.trim()) return "OTP is required.";
    if (!/^\d{6}$/.test(otp.trim())) return "OTP must be exactly 6 digits.";
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp({ otp: otp.trim() });
      setSuccess(result.message || "OTP verified successfully.");
      setTimeout(() => router.push("/login"), 1200);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Verify OTP</h1>
        <p className={styles.subtitle}>Enter the 6-digit code sent to your email.</p>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <label htmlFor="otp" className={styles.label}>
            OTP Code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className={styles.input}
          />

          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </div>
    </main>
  );
}