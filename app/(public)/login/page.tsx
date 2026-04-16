"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Replace this with your actual loginUser function from ./req-res
// import { loginUser } from "./req-res";

// Mock login function - REPLACE THIS with your actual import
const loginUser = async (data: { email: string; password: string }) => {
  // This is a mock implementation. Replace with your actual API call
  return new Promise<{ message: string }>((resolve, reject) => {
    setTimeout(() => {
      if (data.email && data.password) {
        resolve({ message: "Logged in successfully" });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000);
  });
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUser({
        email: email.trim(),
        password: password,
      });

      setSuccess(result.message || "Logged in successfully");
      router.push("/"); // redirect to home after successful login
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Navbar */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-white/85 border-[#1d1d1f]/10" : "bg-white border-[#1d1d1f]/10"
        }`}
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#1d1d1f]">
                <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                JobMe
              </span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="rounded-[980px] bg-[#1a6b3c] px-5 py-1.5 text-sm text-white transition-colors hover:bg-[#1e7d46]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-12">
        <div className="text-center">
          <div className="inline-block rounded-[980px] bg-[#1a6b3c] px-4 py-1.5 text-xs text-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
            Welcome back
          </div>
          <h1 className="mt-6 text-5xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Log in to JobMe
          </h1>
          <p className="mt-4 text-lg text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
            Continue your journey on Algeria's first freelance marketplace
          </p>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="mx-auto max-w-md px-6 pb-24">
        <div className="rounded-[18px] border border-[#1d1d1f]/10 bg-[#f5f5f7] p-8 sm:p-10">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full rounded-[8px] border border-[#1d1d1f]/20 bg-white px-3 py-2.5 text-[#1d1d1f] transition-all focus:border-[#1a6b3c] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mt-6 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-800" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  {error}
                </p>
              </div>
            )}
            {success && (
              <div className="mt-6 rounded-[8px] bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  {success}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-[980px] bg-[#1a6b3c] px-6 py-2.5 text-sm text-white transition-all hover:bg-[#1e7d46] disabled:opacity-50 disabled:cursor-not-allowed text-center"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button className="text-sm text-[#1a6b3c] transition-colors hover:text-[#1e7d46]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Signup Link */}
        <p className="mt-8 text-center text-sm text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#1a6b3c] transition-colors hover:text-[#1e7d46]">
            Create account
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#1d1d1f]/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#1d1d1f]">
                <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                JobMe
              </span>
            </div>
            <p className="text-xs text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              © 2026 JobMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
