"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMyGigs } from "../req-res";
import { getMe } from "@/app/req-res";
import type { SellerGig } from "../interfaces";

export default function YourGigExpandedPage() {
  const searchParams = useSearchParams();
  const gigId = searchParams.get("gigId") ?? "";

  const [gig, setGig] = useState<SellerGig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!gigId) throw new Error("Missing gig id.");

        const me = await getMe();
        if (!me.logged) throw new Error("Not logged in.");

        const gigs = await getMyGigs(me.user._id);
        const found = gigs.find((g) => g._id === gigId) ?? null;
        if (!found) throw new Error("Gig not found.");

        if (mounted) setGig(found);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [gigId]);

  const ratingText = useMemo(() => {
    if (!gig?.rating) return "0.0 (0)";
    if (typeof gig.rating === "number") return `${gig.rating.toFixed(1)} (0)`;
    const avg = typeof gig.rating.average === "number" ? gig.rating.average : 0;
    const count = typeof gig.rating.count === "number" ? gig.rating.count : 0;
    return `${avg.toFixed(1)} (${count})`;
  }, [gig]);

  if (isLoading) {
    return <div className="grid min-h-[220px] place-items-center text-gray-400">Loading gig...</div>;
  }

  if (!gig) {
    return (
      <div>
        <Link
          href="/seller/your-gigs"
          className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
        >
          <span>←</span>
          <span>Back to Your Gigs</span>
        </Link>
        <p className="text-sm text-red-400">{error || "Gig not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/seller/your-gigs"
        className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
      >
        <span>←</span>
        <span>Back to Your Gigs</span>
      </Link>

      <div className="border-b border-white/10 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Seller Gig</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{gig.title}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-300">{gig.description}</p>
      </div>

      <section className="grid grid-cols-1 gap-6 border-b border-white/10 py-8 md:grid-cols-4">
        <div>
          <p className="text-sm text-gray-400">Category</p>
          <p className="mt-2 text-sm text-white">{gig.category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Price</p>
          <p className="mt-2 text-sm font-semibold text-indigo-300">${gig.price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Delivery</p>
          <p className="mt-2 text-sm text-white">{gig.deliveryTime} day(s)</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Revisions</p>
          <p className="mt-2 text-sm text-white">{gig.revisions}</p>
        </div>
      </section>

      <section className="border-b border-white/10 py-8">
        <h2 className="text-lg font-semibold text-white">Tags</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(gig.tags ?? []).length ? (
            gig.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No tags added.</p>
          )}
        </div>
      </section>

      <section className="border-b border-white/10 py-8">
        <h2 className="text-lg font-semibold text-white">Features</h2>
        <div className="mt-4 space-y-2">
          {(gig.features ?? []).length ? (
            gig.features.map((feature, i) => (
              <p key={`${feature}-${i}`} className="text-sm text-gray-300">
                • {feature}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-400">No features added.</p>
          )}
        </div>
      </section>

      <section className="border-b border-white/10 py-8">
        <h2 className="text-lg font-semibold text-white">Performance</h2>
        <p className="mt-3 text-sm text-gray-300">Rating: {ratingText}</p>
      </section>

      <section className="py-8">
        <h2 className="text-lg font-semibold text-white">Images</h2>
        {(gig.images ?? []).length ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gig.images.map((src, i) => (
              <div key={`${src}-${i}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img src={src} alt={`Gig image ${i + 1}`} className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-400">No images added.</p>
        )}
      </section>
    </div>
  );
}