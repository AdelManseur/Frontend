"use client";

import { useEffect, useMemo, useState } from "react";
import { getGigCategories, getSimpleGigs } from "./req-res";
import { getMe } from "../../req-res";
import Link from "next/link";
import type { BuyerGig } from "./interfaces";

export default function BrowsePage() {
  const [gigs, setGigs] = useState<BuyerGig[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [myUserId, setMyUserId] = useState<string>("");

  const loadGigs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [result, me] = await Promise.all([
        getSimpleGigs({
          search,
          category: selectedCategory || undefined,
          page: 1,
          limit: 50,
        }),
        getMe(),
      ]);

      const currentUserId = me?.logged ? me.user?._id : "";
      setMyUserId(currentUserId || "");

      // hide my own gigs + only active gigs
      const visible = (result.gigs ?? []).filter((g: any) => {
        const ownerId =
          g?.seller?._id ||
          g?.user?._id ||
          g?.userId ||
          g?.ownerId ||
          "";

        return g.isActive !== false && ownerId !== currentUserId;
      });

      setGigs(visible);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const cats = await getGigCategories();
      setCategories(cats);
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadGigs();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    gigs.forEach((g) => (g.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [gigs]);

  const filteredGigs = useMemo(() => {
    if (selectedTags.length === 0) return gigs;
    return gigs.filter((gig) => gig.tags?.some((tag) => selectedTags.includes(tag)));
  }, [gigs, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Browse Gigs</h1>
      <p className="mt-2 text-gray-400">Find the right service from all sellers.</p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gigs by title, description, or relevant words..."
          className="w-full rounded-md bg-white/5 px-3 py-2 text-sm outline outline-1 outline-white/10 focus:outline-indigo-500"
        />

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md bg-white/5 px-3 py-2 text-sm outline outline-1 outline-white/10 focus:outline-indigo-500"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="text-black">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.length === 0 && <span className="text-sm text-gray-500">No tags</span>}
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      active ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* 2-column grid */}
      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-h-[260px] animate-pulse rounded-xl border border-white/10 bg-white/5" />
          ))}

        {!isLoading && filteredGigs.length === 0 && (
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">
            No gigs found with current filters.
          </div>
        )}

        {!isLoading &&
          filteredGigs.map((gig) => {
            const image = gig.images?.[0] || "https://placehold.co/800x450/111827/9ca3af?text=No+Image";

            return (
              <Link key={gig._id} href={`/buyer/browse/${gig._id}`} className="block">
                <article className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-indigo-400/40 hover:bg-white/[0.07]">
                  <div className="h-[170px] w-full bg-black/20">
                    <img src={image} alt={gig.title} className="h-full w-full object-cover" />
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-1 text-lg font-semibold">{gig.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">{gig.description}</p>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="rounded bg-white/10 px-2 py-1 text-gray-300">{gig.category}</span>
                      <span className="font-semibold text-indigo-300">${gig.price}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{gig.deliveryTime} day(s)</span>
                      <span>
                        ⭐ {gig.rating?.average?.toFixed?.(1) ?? "0.0"} ({gig.rating?.count ?? 0})
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
      </div>
    </div>
  );
}