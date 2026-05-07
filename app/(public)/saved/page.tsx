"use client";

import { useEffect, useState, Suspense } from "react";
import { getSavedGigs, unsaveGig, getMe } from "../req-res";
import Link from "next/link";
import { Search, Heart, Loader2 } from "lucide-react";

function SavedContent() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSavedGigs = async () => {
    setIsLoading(true);
    try {
      const me = await getMe();
      if (!me?.logged) {
        window.location.assign("/login");
        return;
      }
      const saved = await getSavedGigs();
      setGigs(saved.filter((g: any) => g !== null)); // Filter out any nulls from deleted gigs
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load saved gigs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedGigs();
  }, []);

  const handleUnsave = async (e: React.MouseEvent, gigId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    setGigs(prev => prev.filter(g => g._id !== gigId));
    
    try {
      await unsaveGig(gigId);
    } catch (err) {
      console.error("Failed to unsave gig", err);
      // If it fails, reload the list to get true state
      loadSavedGigs();
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 min-h-[70vh]">
      <div className="pb-6 mb-8 border-b border-neutral-100">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
          Saved Services
        </h1>
        <p className="mt-2 text-lg text-neutral-500">
          Your personal collection of favorite gigs.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="col-span-full rounded-3xl p-16 text-center bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center">
          <Heart className="w-16 h-16 mb-6 text-neutral-300" />
          <h3 className="text-2xl font-bold mb-3 text-neutral-900">No saved services yet</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-8 text-lg">
            When you see a service you like on the browse page, click the heart icon to save it here for later.
          </p>
          <Link href="/browse" className="px-8 py-4 bg-neutral-900 text-white rounded-full font-semibold hover:bg-neutral-800 transition-colors">
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gigs.map((gig) => {
            const image = gig.images?.[0] || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
            return (
              <Link key={gig._id} href={`/browse/${gig._id}`} className="block group">
                <article
                  className="overflow-hidden rounded-3xl h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 bg-white border border-neutral-200 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:border-neutral-300"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                    <img src={image} alt={gig.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <button
                      onClick={(e) => handleUnsave(e, gig._id)}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 shadow-sm hover:scale-110 hover:bg-white transition-all z-10"
                      title="Remove from saved"
                    >
                      <Heart 
                        className="w-5 h-5 transition-colors" 
                        fill="#ef4444" 
                        color="#ef4444" 
                      />
                    </button>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-600">
                        {gig.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
                        <span className="text-neutral-900">★</span>
                        {gig.rating?.average?.toFixed?.(1) ?? "0.0"}
                        <span className="font-medium text-xs text-neutral-400">({gig.rating?.count ?? 0})</span>
                      </div>
                    </div>
                    <h2 className="text-[17px] font-semibold leading-snug line-clamp-2 mb-4 group-hover:text-neutral-600 transition-colors text-neutral-900">
                      {gig.title}
                    </h2>
                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                         {gig.seller?.pfp ? (
                            <img src={gig.seller.pfp} alt={gig.seller.name || 'Seller'} className="w-6 h-6 rounded-full object-cover" />
                         ) : (
                            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                                {gig.seller?.name?.[0]?.toUpperCase() || 'S'}
                            </div>
                         )}
                         <span className="text-sm font-medium text-neutral-600">{gig.seller?.name || 'Seller'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Starting at</span>
                        <span className="text-lg font-bold text-neutral-900">{gig.price?.basic?.price || 0} DA</span>
                      </div>
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

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-neutral-400 animate-spin" /></div>}>
      <SavedContent />
    </Suspense>
  );
}
