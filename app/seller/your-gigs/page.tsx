"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyGigs } from "./req-res";
import { getMe } from "@/app/req-res";
import type { SellerGig } from "./interfaces";

export default function YourGigsPage() {
  const [gigs, setGigs] = useState<SellerGig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGigs = async () => {
    setError("");
    setIsLoading(true);
    try {
      const me = await getMe();
      if (!me.logged) throw new Error("Not logged in.");
      const result = await getMyGigs(me.user._id);
      setGigs(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGigs();
  }, []);

  const formatRating = (
    rating: number | { average?: number; count?: number } | undefined
  ): string => {
    if (typeof rating === "number") return `${rating}`;
    if (rating && typeof rating === "object") {
      const avg =
        typeof rating.average === "number" ? rating.average : 0;
      const count =
        typeof rating.count === "number" ? rating.count : 0;
      return `${avg.toFixed(1)} (${count})`;
    }
    return "0 (0)";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Your Gigs</h1>
      <p className="mt-2 text-gray-400">Manage and monitor all your created gigs.</p>

      {error && (
        <div className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* 2-column grid (always) */}
      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8">
        {/* First item always: Add Gig */}
        <Link
          href="/seller/your-gigs/create-gig"
          className="group flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-dashed border-indigo-400/60 bg-indigo-500/10 transition hover:bg-indigo-500/20"
        >
          <div className="flex h-[150px] items-center justify-center bg-indigo-500/10">
            <span className="text-5xl font-light text-indigo-300">+</span>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <span className="text-base font-semibold text-indigo-300">Add Gig</span>
          </div>
        </Link>

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="min-h-[260px] animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <div className="h-[150px] bg-white/10" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
                <div className="h-3 w-1/3 rounded bg-white/10" />
              </div>
            </div>
          ))}

        {/* Empty state (after Add Gig card) */}
        {!isLoading && gigs.length === 0 && (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-gray-300">No created gigs yet</p>
            <Link
              href="/seller/your-gigs/create-gig"
              className="mt-3 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold hover:bg-indigo-400"
            >
              Add gig
            </Link>
          </div>
        )}

        {/* Existing gigs cards */}
        {!isLoading &&
          gigs.map((gig) => {
            const imageUrl =
              gig.images?.[0] ||
              "https://placehold.co/800x450/111827/9ca3af?text=No+Image";

            return (
              <Link
                key={gig._id}
                href={`/seller/your-gigs/your-gig-expanded?gigId=${gig._id}`}
                className="block overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                {/* Image section */}
                <div className="h-[150px] w-full bg-black/20">
                  <img
                    src={imageUrl}
                    alt={gig.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Info section */}
                <div className="p-4">
                  <h2 className="line-clamp-1 text-lg font-semibold">{gig.title}</h2>
                  <p className="mt-1 text-sm text-gray-400">{gig.category}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <p>Price: ${gig.price}</p>
                    <p>Orders: {gig.orders ?? 0}</p>
                    <p>Status: {gig.status ?? "active"}</p>
                    <p>Rating: {formatRating(gig.rating)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}