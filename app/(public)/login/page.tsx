"use client";

import { FormEvent, useState } from "react";
import { loginUser } from "./req-res";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = { email, password };

    setIsLoading(true);
    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess(result.message || "Logged in successfully");
      router.push("/"); // redirect to root after successful login
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* Brand side */}
          <div className="hidden lg:block">
            <p className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">
              Continue your journey on JobMe
            </h1>
            <p className="mt-3 text-gray-300">
              Sign in to manage your profile, browse gigs, and continue your orders.
            </p>
          </div>

          {/* Form side */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Log in</h2>
            <p className="mt-1 text-sm text-gray-400">Use your account credentials.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-white/5 px-3 py-2 outline outline-1 outline-white/10 focus:outline-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-green-400">{success}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-indigo-300 hover:text-indigo-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
