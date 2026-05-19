"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Sparkles, TrendingUp, Compass } from "lucide-react";
import { getRecommendations } from "../../browse/req-res";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecommendedGig {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  tags?: string[];
  price: {
    basic: { price: number };
    standard?: { price: number };
    premium?: { price: number };
  };
  seller: {
    _id: string;
    name: string;
    pfp?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  totalOrders?: number;
}

type RecommendationSource = "personalized" | "interests" | "trending";

const SOURCE_LABEL: Record<RecommendationSource, { text: string; icon: React.ReactNode; color: string }> = {
  personalized: {
    text: "Recommended for You",
    icon: <Sparkles className="w-5 h-5" />,
    color: "var(--jm-violet)",
  },
  interests: {
    text: "Based on Your Interests",
    icon: <Compass className="w-5 h-5" />,
    color: "#0ea5e9",
  },
  trending: {
    text: "Trending Right Now",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "#f59e0b",
  },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.8)",
        height: "320px",
      }}
    />
  );
}

// ─── Gig Card ─────────────────────────────────────────────────────────────────
function RecommendedGigCard({ gig }: { gig: RecommendedGig }) {
  const image =
    gig.images?.[0] ||
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
  const price = gig.price?.basic?.price;

  return (
    <Link href={`/browse/${gig._id}`} className="block group">
      <article
        className="overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.85)",
          boxShadow: "0 4px 20px rgba(124,58,237,0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 12px 40px rgba(124,58,237,0.22)";
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(124,58,237,0.25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 20px rgba(124,58,237,0.06)";
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(255,255,255,0.85)";
        }}
      >
        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={gig.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(124,58,237,0.1)",
                color: "var(--jm-violet)",
              }}
            >
              {gig.category}
            </span>
            <div
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: "var(--jm-text)" }}
            >
              <Star
                className="w-3.5 h-3.5"
                style={{ color: "var(--jm-pink)", fill: "var(--jm-pink)" }}
              />
              {gig.rating?.average?.toFixed(1) ?? "0.0"}
              <span
                className="font-normal text-xs"
                style={{ color: "var(--jm-muted)" }}
              >
                ({gig.rating?.count ?? 0})
              </span>
            </div>
          </div>

          <h3
            className="text-[15px] font-semibold leading-snug line-clamp-2 mb-2 group-hover:underline"
            style={{ color: "var(--jm-text)" }}
          >
            {gig.title}
          </h3>

          {/* Seller */}
          <div className="flex items-center gap-2 mt-1 mb-2">
            <img
              src={
                gig.seller?.pfp ||
                "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"
              }
              alt={gig.seller?.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span
              className="text-xs font-medium truncate"
              style={{ color: "var(--jm-muted)" }}
            >
              {gig.seller?.name}
            </span>
          </div>

          <div
            className="mt-auto pt-4 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--jm-muted)" }}
            >
              Starting at
            </span>
            <span
              className="text-lg font-extrabold"
              style={{ color: "var(--jm-violet)" }}
            >
              {price || 0} DA
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecommendedGigs({ onLoad }: { onLoad?: (ids: string[]) => void }) {
  const [gigs, setGigs] = useState<RecommendedGig[]>([]);
  const [source, setSource] = useState<RecommendationSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getRecommendations();
        if (cancelled) return;
        if (data && data.gigs.length > 0) {
          setGigs(data.gigs);
          setSource(data.source);
          onLoad?.(data.gigs.map((g: any) => g._id));
        } else {
          onLoad?.([]);
        }
      } catch {
        onLoad?.([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Not logged in, no data, or still loading with no content yet
  if (!loading && gigs.length === 0) return null;

  const label = source ? SOURCE_LABEL[source] : null;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        {label && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{
              background: `color-mix(in srgb, ${label.color} 10%, transparent)`,
              color: label.color,
              border: `1px solid color-mix(in srgb, ${label.color} 20%, transparent)`,
            }}
          >
            {label.icon}
            {label.text}
          </div>
        )}
        {loading && !label && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold animate-pulse"
            style={{
              background: "rgba(124,58,237,0.08)",
              color: "var(--jm-violet)",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <Sparkles className="w-5 h-5" />
            Loading recommendations...
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && gigs.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : gigs.map((gig) => (
              <RecommendedGigCard key={gig._id} gig={gig} />
            ))}
      </div>
    </section>
  );
}
