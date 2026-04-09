"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe } from "./req-res";
import type { MeResponse } from "./interfaces";

export default function HomePage() {
  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMe();
        if (mounted) setSession(me);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0f172a] text-white">
        <p className="text-sm text-gray-300">Loading...</p>
      </main>
    );
  }

  // Logged in view (kept minimal and consistent)
  if (session?.logged) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white p-8">
        <section className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
          <p className="mt-2 text-gray-400">You are logged in successfully.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/buyer/browse"
              className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
            >
              Browse Gigs
            </Link>
            <Link
              href="/seller/your-gigs"
              className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Your Gigs
            </Link>
            <Link
              href="/seller/profile"
              className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Profile
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Not logged -> landing page
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">JobMe</h1>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400">
              Get started
            </Link>
          </div>
        </header>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
              Freelance marketplace
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight">
              Hire top talent or sell your skills with confidence
            </h2>
            <p className="mt-4 text-gray-300">
              JobMe connects buyers and sellers with secure messaging, streamlined orders, and verified profiles.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-md bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400">
                Create account
              </Link>
              <Link href="/login" className="rounded-md bg-white/10 px-5 py-3 text-sm hover:bg-white/20">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Why JobMe</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              <li className="rounded-md bg-white/5 p-3">• Browse gigs with category and tag filters</li>
              <li className="rounded-md bg-white/5 p-3">• Secure login with OTP verification</li>
              <li className="rounded-md bg-white/5 p-3">• Seller tools for creating and managing gigs</li>
              <li className="rounded-md bg-white/5 p-3">• Real-time chat and order workflow</li>
            </ul>
          </div>
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 className="font-semibold">For Buyers</h4>
            <p className="mt-2 text-sm text-gray-400">Find reliable freelancers and place orders quickly.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 className="font-semibold">For Sellers</h4>
            <p className="mt-2 text-sm text-gray-400">Publish gigs, showcase work, and grow your earnings.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 className="font-semibold">Safe & Simple</h4>
            <p className="mt-2 text-sm text-gray-400">Authentication, profile management, and clean UX.</p>
          </div>
        </section>
      </section>
    </main>
  );
}