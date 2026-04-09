"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyGigs } from "./req-res";
import { getMe } from "@/app/(public)/req-res";
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

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Seller</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Your Gigs</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your published gigs and open any one to view full details.
          </p>
        </div>

        <Link
          href="/your-gigs/create-gig"
          className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          + Create Gig
        </Link>
      </div>

      {isLoading ? (
        <div className="grid min-h-[220px] place-items-center text-gray-400">Loading gigs...</div>
      ) : error ? (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      ) : gigs.length === 0 ? (
        <div className="py-10">
          <p className="text-sm text-gray-400">You have not created any gigs yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {gigs.map((gig) => {
            const image =
              gig.images?.[0] ||
              "https://placehold.co/800x450/111827/9ca3af?text=No+Image";

            return (
              <Link
                key={gig._id}
                href={`/your-gigs/your-gig-expanded?gigId=${gig._id}`}
                className="block"
              >
                <article className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/40 hover:bg-white/[0.07]">
                  <div className="h-[180px] w-full bg-black/20">
                    <img
                      src={image}
                      alt={gig.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-1 text-lg font-semibold text-white">{gig.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {gig.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="rounded bg-white/10 px-2 py-1 text-gray-300">
                        {gig.category}
                      </span>
                      <span className="font-semibold text-indigo-300">${gig.price}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{gig.deliveryTime} day(s)</span>
                      <span>{gig.revisions} revision(s)</span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}