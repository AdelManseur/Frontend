"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyGigs } from "./req-res";
import { getMe } from "@/app/(public)/req-res";
import type { SellerGig } from "./interfaces";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Star, 
  Clock, 
  Zap, 
  Layers, 
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronRight
} from "lucide-react";

export default function YourGigsPage() {
  const [gigs, setGigs] = useState<SellerGig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredGigs = gigs.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl font-sans text-white pb-20">
      {/* Header Section */}
      <div className="relative mb-12 p-1 rounded-[2rem]" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(30,27,75,0) 100%)" }}>
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between p-10 rounded-[1.9rem] bg-white/[0.03] backdrop-blur-3xl border border-white/5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400">Inventory Management</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-4">Your Gig Portfolio</h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-2xl">
              Optimize your services, monitor performance, and expand your reach across the JobMe marketplace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter your gigs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-6 py-4 w-full sm:w-[280px] bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                />
             </div>
             <Link
                href="/your-gigs/create-gig"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5 hover:-translate-y-1"
              >
                <Plus className="w-4 h-4" />
                Create New Gig
              </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing your catalog...</p>
        </div>
      ) : error ? (
        <div className="p-10 rounded-3xl bg-red-500/5 border border-red-500/20 text-center max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-white mb-2">Sync Error</p>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button onClick={loadGigs} className="px-6 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">Retry Sync</button>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-32 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01]">
          <Layers className="w-16 h-16 text-gray-800 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Your Storefront is Empty</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-10">Start your journey on JobMe by creating your first service gig today.</p>
          <Link href="/your-gigs/create-gig" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all">
            Get Started <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredGigs.map((gig, idx) => {
              const image = gig.images?.[0] || "https://placehold.co/800x450/111827/9ca3af?text=No+Image";
              const ratingAvg = typeof gig.rating === 'number' ? gig.rating : (gig.rating as any)?.average || 5.0;

              return (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <Link href={`/your-gigs/your-gig-expanded?gigId=${gig._id}`} className="group block h-full">
                    <article className="relative h-full flex flex-col rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all duration-500 hover:bg-white/[0.06] hover:border-indigo-500/30 group-hover:shadow-2xl group-hover:shadow-indigo-500/5 group-hover:-translate-y-2">
                      
                      {/* Image Preview */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                        <img
                          src={image}
                          alt={gig.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-60" />
                        
                        {/* Overlay Tags */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-black uppercase tracking-widest text-indigo-300">
                            {gig.category}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {gig.title}
                          </h2>
                        </div>

                        <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                          {gig.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-sm font-black">{ratingAvg.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">{gig.price.basic.deliveryTime}d</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Starting From</p>
                            <p className="text-xl font-black text-white tracking-tighter">
                              {gig.price.basic.price.toLocaleString()} <span className="text-xs text-gray-500">DA</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hover Action Indicator */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}