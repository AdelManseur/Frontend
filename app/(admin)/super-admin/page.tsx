"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe } from "../req-res";
import type { MeResponse } from "../interfaces";

export default function SuperAdminHomePage() {
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

  if (session?.logged) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white p-8">
        <section className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-gray-400">You are logged in successfully.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0f172a] text-white">
      <p className="text-sm text-gray-300">You are not logged in.</p>
      <Link
        href="/super-admin/login"
        className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
      >
        Go to Login
      </Link>
    </main>
  );
}