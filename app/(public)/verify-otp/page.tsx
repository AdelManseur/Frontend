"use client";

import { FormEvent, useState, useRef, KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "./req-res";

const resendOtp = async (email: string) => {
  return new Promise<{ message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ message: "New OTP sent to your email" });
    }, 1000);
  });
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp({ otp: otpValue });
      setSuccess(result.message || "Email verified successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email is missing. Please go back and sign up again.");
      return;
    }

    setResending(true);
    setError("");
    try {
      const result = await resendOtp(email);
      setSuccess(result.message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-6">
            <Mail className="w-8 h-8 text-neutral-900" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Check your email
          </h1>
          <p className="text-lg text-neutral-600">
            We sent a verification code to
          </p>
          <p className="text-lg font-medium text-neutral-900 mt-2">
            {email || "your email"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8"
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-8">
              <label className="block text-sm font-medium text-neutral-900 mb-4 text-center">
                Enter 6-digit code
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-semibold rounded-2xl border-2 border-neutral-300 bg-white text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  />
                ))}
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3"
              >
                <p className="text-sm text-red-800 text-center">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4 text-green-800" />
                <p className="text-sm text-green-800">{success}</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-neutral-900 font-medium hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-center"
        >
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← Back to signup
          </button>
        </motion.div>

        {/* Info hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-neutral-500">
            For demo purposes, use code: <span className="font-mono font-semibold">123456</span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
