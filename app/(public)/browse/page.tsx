"use client";

import { useEffect, useMemo, useState, useRef, type FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getGigCategories, getGigs } from "./req-res";
import { getMe, saveGig, unsaveGig, getSavedGigs } from "../req-res";
import Link from "next/link";
import type { BuyerGig } from "./interfaces";
import { Search, Heart, Star } from "lucide-react";


function BrowseContent() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("q") || "";
  const queryCategory = searchParams.get("category") || "";

  const [gigs, setGigs] = useState<BuyerGig[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [myUserId, setMyUserId] = useState<string>("");
  const [savedGigIds, setSavedGigIds] = useState<Set<string>>(new Set());

  const loadGigs = async (overrideTags?: string[]) => {
    setIsLoading(true);
    setError("");

    try {
      const [result, me] = await Promise.all([
        getGigs({
          search: querySearch || undefined,
          category: queryCategory || undefined,
          page: 1,
          limit: 50,
        }),
        getMe(),
      ]);

      const currentUserId = me?.logged ? me.user?._id : "";
      setMyUserId(currentUserId || "");

      if (me?.logged) {
        getSavedGigs().then(saved => {
          setSavedGigIds(new Set(saved.map((g: any) => g._id || g)));
        }).catch(console.error);
      }

      // hide my own gigs + only active gigs
      const visible = (result.gigs ?? []).filter((g: any) => {
        const ownerId = String(g?.seller?._id || g?.seller || "");
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
  }, [querySearch, queryCategory]);


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

  const handleToggleSave = async (e: React.MouseEvent, gigId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!myUserId) {
      alert("Please log in to save gigs.");
      return;
    }

    const isSaved = savedGigIds.has(gigId);
    
    // Optimistic UI update
    setSavedGigIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(gigId);
      else next.add(gigId);
      return next;
    });

    try {
      if (isSaved) {
        await unsaveGig(gigId);
      } else {
        await saveGig(gigId);
      }
    } catch (err) {
      console.error("Failed to toggle save state", err);
      // Revert optimistic update on error
      setSavedGigIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(gigId);
        else next.delete(gigId);
        return next;
      });
    }
  };


  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="pb-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: "var(--jm-text)" }}>
          {queryCategory ? `${queryCategory} Services` : querySearch ? `Results for "${querySearch}"` : "Explore Services"}
        </h1>
        <p className="mt-2 text-lg" style={{ color: "var(--jm-muted)" }}>
          Discover professional services tailored to your needs.
        </p>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold" style={{ color: "var(--jm-muted)" }}>Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                  style={active ? {
                    background: "var(--jm-grad)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                  } : {
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "var(--jm-muted)",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.8)", height: "320px" }} />
          ))}

        {!isLoading && filteredGigs.length === 0 && (
          <div className="col-span-full rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.8)" }}>
            <Search className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(124,58,237,0.3)" }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--jm-text)" }}>No services found</h3>
            <p style={{ color: "var(--jm-muted)" }}>Try adjusting your search or filters.</p>
          </div>
        )}

        {!isLoading &&
          filteredGigs.map((gig) => {
            const image = gig.images?.[0] || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
            return (
              <Link key={gig._id} href={`/browse/${gig._id}`} className="block group">
                <article
                  className="overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124,58,237,0.06)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.22)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(124,58,237,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.85)"; }}
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <img src={image} alt={gig.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <button
                      onClick={(e) => handleToggleSave(e, gig._id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart 
                        className="w-5 h-5 transition-colors" 
                        fill={savedGigIds.has(gig._id) ? "#ef4444" : "transparent"} 
                        color={savedGigIds.has(gig._id) ? "#ef4444" : "#64748b"} 
                      />
                    </button>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "var(--jm-violet)" }}>{gig.category}</span>
                      <div className="flex items-center gap-1 text-sm font-bold" style={{ color: "var(--jm-text)" }}>
                        <Star className="w-3.5 h-3.5" style={{ color: "var(--jm-pink)", fill: "var(--jm-pink)" }} />
                        {gig.rating?.average?.toFixed?.(1) ?? "0.0"}
                        <span className="font-normal text-xs" style={{ color: "var(--jm-muted)" }}>({gig.rating?.count ?? 0})</span>
                      </div>
                    </div>
                    <h2 className="text-[15px] font-semibold leading-snug line-clamp-2 mb-2 group-hover:underline" style={{ color: "var(--jm-text)" }}>{gig.title}</h2>
                    <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}>
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--jm-muted)" }}>Starting at</span>
                      <span className="text-lg font-extrabold" style={{ color: "var(--jm-violet)" }}>{gig.price?.basic?.price || 0} DA</span>
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

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#1DBF73] border-t-transparent rounded-full animate-spin"></div></div>}>
      <BrowseContent />
    </Suspense>
  );
}