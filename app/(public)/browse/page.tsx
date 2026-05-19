"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getGigCategories, getGigs, getRecommendations } from "./req-res";
import { getMe, saveGig, unsaveGig, getSavedGigs } from "../req-res";
import Link from "next/link";
import type { BuyerGig } from "./interfaces";
import { Search, Heart, Star, Sparkles, Filter, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";


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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedGigIds, setSavedGigIds] = useState<Set<string>>(new Set());

  // "For You" filter state
  const [forYouActive, setForYouActive] = useState(false);
  const [forYouGigs, setForYouGigs] = useState<BuyerGig[]>([]);
  const [forYouLoading, setForYouLoading] = useState(false);
  const [forYouSource, setForYouSource] = useState<"personalized" | "interests" | "trending" | null>(null);

  const router = useRouter();
  const [filterSearch, setFilterSearch] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  // Collapsible Sections
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer

  const refreshRecommendations = async (currentUserId: string) => {
    setForYouLoading(true);
    try {
      const rec = await getRecommendations();
      if (rec && rec.gigs.length > 0) {
        const filtered = (rec.gigs as any[]).filter((g: any) => {
          const ownerId = String(g?.seller?._id || g?.seller || "");
          return g.isActive !== false && ownerId !== currentUserId;
        });
        setForYouGigs(filtered as BuyerGig[]);
        setForYouSource(rec.source);
      }
    } catch (err) {
      console.error("Failed to refresh recommendations:", err);
    } finally {
      setForYouLoading(false);
    }
  };

  const loadGigs = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [result, me] = await Promise.all([
        getGigs({
          search: querySearch || undefined,
          category: queryCategory || undefined,
          minPrice,
          maxPrice,
          page: 1,
          limit: 50,
        }),
        getMe(),
      ]);

      const currentUserId = me?.logged ? me.user?._id : "";
      setMyUserId(currentUserId || "");
      setIsLoggedIn(!!me?.logged);

      if (me?.logged) {
        getSavedGigs().then(saved => {
          setSavedGigIds(new Set(saved.map((g: any) => g._id || g)));
        }).catch(console.error);

        // Pre-fetch "For You" recommendations
        void refreshRecommendations(currentUserId);
      }

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
  }, [querySearch, queryCategory, minPrice, maxPrice]);

  // Turn off "For You" when a search/category is active
  useEffect(() => {
    if (querySearch || queryCategory) setForYouActive(false);
  }, [querySearch, queryCategory]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    gigs.forEach((g) => (g.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [gigs]);

  const filteredTags = useMemo(() => {
    if (!filterSearch) return allTags;
    return allTags.filter(t => t.toLowerCase().includes(filterSearch.toLowerCase()));
  }, [allTags, filterSearch]);

  // When "For You" is active use recommendation gigs, otherwise the normal filtered list
  const displayGigs = useMemo(() => {
    if (forYouActive) return forYouGigs;
    if (selectedTags.length === 0) return gigs;
    return gigs.filter((gig) => gig.tags?.some((tag) => selectedTags.includes(tag)));
  }, [forYouActive, forYouGigs, gigs, selectedTags]);

  const isDisplayLoading = forYouActive ? forYouLoading : isLoading;

  const toggleTag = (tag: string) => {
    setForYouActive(false); // deactivate "For You" when a tag is selected
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const applyPriceFilter = () => {
    setMinPrice(minPriceInput ? Number(minPriceInput) : undefined);
    setMaxPrice(maxPriceInput ? Number(maxPriceInput) : undefined);
  };
  
  const handleCategorySelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (queryCategory === cat) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`?${params.toString()}`);
  };

  const handleToggleSave = async (e: React.MouseEvent, gigId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!myUserId) {
      alert("Please log in to save gigs.");
      return;
    }

    const isSaved = savedGigIds.has(gigId);
    setSavedGigIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(gigId);
      else next.add(gigId);
      return next;
    });

    try {
      if (isSaved) await unsaveGig(gigId);
      else await saveGig(gigId);
      
      // Delay slightly to allow the backend interaction log to complete before re-querying the AI
      setTimeout(() => {
        void refreshRecommendations(myUserId);
      }, 500);
    } catch (err) {
      console.error("Failed to toggle save state", err);
      setSavedGigIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(gigId);
        else next.delete(gigId);
        return next;
      });
    }
  };

  const SOURCE_LABEL: Record<string, string> = {
    personalized: "Recommended for You",
    interests: "Based on Your Interests",
    trending: "Trending Right Now",
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="pb-6 mb-6 flex items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: "var(--jm-text)" }}>
            {queryCategory ? `${queryCategory} Services` : querySearch ? `Results for "${querySearch}"` : "Explore Services"}
          </h1>
          <p className="mt-2 text-lg" style={{ color: "var(--jm-muted)" }}>
            Discover professional services tailored to your needs.
          </p>
        </div>
        
        {/* Mobile Filter Toggle */}
        <button 
          className="lg:hidden p-2.5 rounded-xl border bg-white shadow-sm flex items-center gap-2 mt-2 md:mt-0"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Filter className="w-4 h-4 text-gray-700" />
          <span className="font-semibold text-gray-700 text-sm">Filters</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ── Left Sidebar Filter Panel ─────────────────────────────────── */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-full lg:h-[calc(100vh-120px)] w-[85vw] max-w-[320px] lg:w-72 
          bg-white lg:bg-transparent z-50 lg:z-auto 
          overflow-y-auto no-scrollbar
          p-6 lg:p-0 border-r lg:border-r-0 border-gray-200 lg:border-none
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8 pb-10">
            {/* For You toggle */}
            {isLoggedIn && !querySearch && !queryCategory && (
              <button
                type="button"
                onClick={() => {
                  setForYouActive(v => !v);
                  setSelectedTags([]); 
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200"
                style={forYouActive ? {
                  background: "var(--jm-grad)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                } : {
                  background: "rgba(124,58,237,0.05)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "var(--jm-violet)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {forYouActive && forYouSource ? SOURCE_LABEL[forYouSource] : "For You"}
                </div>
                {forYouActive && <Check className="w-4 h-4" />}
              </button>
            )}

            {/* Quick Filter Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find a filter..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="border-b border-gray-200 pb-6">
              <button 
                className="flex items-center justify-between w-full font-bold text-gray-900 mb-4"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                Categories
                {isCategoriesOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              
              {isCategoriesOpen && (
                <div className="flex flex-col gap-2.5">
                  {categories.map((cat) => {
                    if (filterSearch && !cat.toLowerCase().includes(filterSearch.toLowerCase())) return null;
                    const isActive = queryCategory === cat;
                    return (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isActive ? "bg-violet-600 border-violet-600" : "bg-white border-gray-300 group-hover:border-violet-400"}`}>
                          {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${isActive ? "font-semibold text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>{cat}</span>
                        <input type="checkbox" checked={isActive} onChange={() => handleCategorySelect(cat)} className="hidden" />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="border-b border-gray-200 pb-6">
              <button 
                className="flex items-center justify-between w-full font-bold text-gray-900 mb-4"
                onClick={() => setIsPriceOpen(!isPriceOpen)}
              >
                Price (DA)
                {isPriceOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              
              {isPriceOpen && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Min</span>
                      <input 
                        type="number" 
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Max</span>
                      <input 
                        type="number" 
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        placeholder="Any"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-11 pr-3 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={applyPriceFilter}
                    className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Apply Price
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {!forYouActive && (
              <div>
                <button 
                  className="flex items-center justify-between w-full font-bold text-gray-900 mb-4"
                  onClick={() => setIsTagsOpen(!isTagsOpen)}
                >
                  Tags
                  {isTagsOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                
                {isTagsOpen && (
                  <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-2">
                    {filteredTags.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No tags found</p>
                    ) : (
                      filteredTags.map((tag) => {
                        const isActive = selectedTags.includes(tag);
                        return (
                          <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isActive ? "bg-violet-600 border-violet-600" : "bg-white border-gray-300 group-hover:border-violet-400"}`}>
                              {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm ${isActive ? "font-semibold text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>{tag}</span>
                            <input type="checkbox" checked={isActive} onChange={() => toggleTag(tag)} className="hidden" />
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content Area ─────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          
          {/* Active Filters Summary */}
          {(selectedTags.length > 0 || minPrice || maxPrice) && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 mr-2">Active Filters:</span>
              {minPrice && <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">Min: {minPrice} DA</span>}
              {maxPrice && <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">Max: {maxPrice} DA</span>}
              {selectedTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => toggleTag(tag)}
                  className="bg-violet-50 text-violet-700 border border-violet-200 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 hover:bg-violet-100 transition-colors"
                >
                  {tag}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button 
                onClick={() => {
                  setSelectedTags([]);
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                  setMinPriceInput("");
                  setMaxPriceInput("");
                }}
                className="text-xs text-gray-500 hover:text-gray-900 font-medium underline underline-offset-2 ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Gigs Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {isDisplayLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.8)", height: "320px" }} />
          ))}

        {!isDisplayLoading && displayGigs.length === 0 && (
          <div className="col-span-full rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.8)" }}>
            <Search className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(124,58,237,0.3)" }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--jm-text)" }}>No services found</h3>
            <p style={{ color: "var(--jm-muted)" }}>Try adjusting your search or filters.</p>
          </div>
        )}

        {!isDisplayLoading &&
          displayGigs.map((gig) => {
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
        </main>
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