import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface Resource {
  id: string;
  imageUrl: string;
  category: string;
  categoryColor: string;
  readTime: string;
  title: string;
  link: string;
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a 
      href={resource.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-[280px] flex-shrink-0 group rounded-xl overflow-hidden transition-all duration-300"
      style={{ background: "rgba(13,13,26,0.6)", border: "1px solid var(--jm-seller-border)" }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <img 
          src={resource.imageUrl} 
          alt={resource.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
      </div>
      <div className="p-4 flex flex-col h-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${resource.categoryColor}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
            {resource.readTime} READ
          </span>
        </div>
        <h3 className="text-[15px] font-bold text-white leading-tight line-clamp-2 group-hover:underline mb-auto">
          {resource.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-4 text-[13px] font-bold transition-colors" style={{ color: "var(--jm-violet)" }}>
          <BookOpen className="w-4 h-4" />
          <span>Read article</span>
        </div>
      </div>
    </a>
  );
}

export default function ResourcesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const mockResources: Resource[] = [
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Marketing",
      categoryColor: "bg-purple-500",
      readTime: "5 MIN",
      title: "How to Market Your Freelance Business in 2026",
      link: "#"
    },
    {
      id: "2",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop",
      category: "Sales",
      categoryColor: "bg-blue-500",
      readTime: "7 MIN",
      title: "Pricing Strategies: How to Charge What You're Worth",
      link: "#"
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=500&h=300&fit=crop",
      category: "Productivity",
      categoryColor: "bg-orange-500",
      readTime: "4 MIN",
      title: "Time Management Tips for Top Rated Sellers",
      link: "#"
    },
    {
      id: "4",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=300&fit=crop",
      category: "Success",
      categoryColor: "bg-green-500",
      readTime: "6 MIN",
      title: "Building Long-Term Client Relationships",
      link: "#"
    }
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300; // approximate width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Resources for you</h2>
          <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>Grow your skills and your business</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ border: "1px solid var(--jm-seller-border)", background: "rgba(255,255,255,0.05)" }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ border: "1px solid var(--jm-seller-border)", background: "rgba(255,255,255,0.05)" }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockResources.map(resource => (
            <div key={resource.id} className="snap-start">
              <ResourceCard resource={resource} />
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-[#0D0D1A] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
