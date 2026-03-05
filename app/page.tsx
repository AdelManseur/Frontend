"use client";

import { useEffect, useState } from "react";
import { getMe } from "./req-res";
import type { MeResponse } from "./interfaces";

export default function Home() {
  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const result = await getMe();
        if (mounted) setSession(result);
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
      <main className="flex min-h-screen items-center justify-center p-24">
        <p>Loading...</p>
      </main>
    );
  }

  if (session?.logged) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-24">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
        <p className="text-gray-400">{session.user.email}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold">Welcome to JobMe</h1>
      <p className="text-gray-400">Please login or sign up.</p>
    </main>
  );
}