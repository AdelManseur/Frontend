"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Search, ShieldCheck, Briefcase, MessageSquare } from "lucide-react";

interface MeResponse {
  logged: boolean;
  user?: {
    name: string;
    email: string;
  };
}

// Mock function - replace with actual
const getMe = async (): Promise<MeResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ logged: false });
    }, 800);
  });
};

export default function HomePage() {
  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Trigger animations after mount
    setTimeout(() => setHasLoaded(true), 100);
  }, []);

  useEffect(() => {
    // Typewriter animation - types and deletes character by character
    const categories = ["Design", "Development", "Marketing", "Translation", "Video", "Writing"];
    const currentWord = categories[categoryIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentWord) {
        // Word is complete, wait before deleting
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && displayText === "") {
        // Word is deleted, move to next word
        setIsDeleting(false);
        setCategoryIndex((prev) => (prev + 1) % categories.length);
      } else if (isDeleting) {
        // Delete one character
        setDisplayText(currentWord.substring(0, displayText.length - 1));
      } else {
        // Type one character
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }
    }, isDeleting ? 50 : (displayText === currentWord ? 1500 : 100));

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, categoryIndex]);

  useEffect(() => {
    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getMe();
        if (mounted) setSession(me);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <p className="text-sm text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Loading...
        </p>
      </main>
    );
  }

  // Logged in view
  if (session?.logged) {
    return (
      <main className="min-h-screen bg-white px-6 py-20 text-[#1d1d1f]">
        <section className="mx-auto max-w-5xl">
          <div className="mb-16">
            <h1 className="text-5xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700, letterSpacing: '-0.015em' }}>
              Welcome back, {session.user?.name || "User"}
            </h1>
            <p className="mt-4 text-xl text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              You are logged in successfully.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Browse Gigs", desc: "Discover talented freelancers", href: "/buyer/browse", primary: true },
              { label: "Your Gigs", desc: "Manage your services", href: "/seller/your-gigs", primary: false },
              { label: "Profile", desc: "Edit your information", href: "/seller/profile", primary: false },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded-[18px] px-7 py-6 transition-all duration-200 ${
                  item.primary
                    ? "bg-[#1a6b3c] text-white hover:bg-[#1e7d46]"
                    : "bg-[#f5f5f7] text-[#1d1d1f]"
                }`}
              >
                <h3 className="text-lg" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                  {item.label}
                </h3>
                <p className={`mt-2 text-sm ${item.primary ? "text-white/80" : "text-[#6e6e73]"}`} style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {item.desc}
                </p>
              </a>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // Landing page
  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      <style>{`
        @keyframes sonarPulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .sonar-ring {
          animation: sonarPulse 3s ease-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .typewriter-text {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      {/* Navbar with frosted glass effect */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-white/85 border-[#1d1d1f]/10" : "bg-transparent border-transparent"
        }`}
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#1d1d1f]">
                <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-xl" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                JobMe
              </span>
            </div>
            <div className="flex gap-3">
              <a
                href="/login"
                className="rounded-[980px] border border-[#1a6b3c]/25 px-5 py-1.5 text-sm text-[#1a6b3c] transition-colors hover:border-[#1a6b3c]/40 hover:text-[#1e7d46]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                Log in
              </a>
              <a
                href="/signup"
                className="rounded-[980px] bg-[#1a6b3c] px-5 py-1.5 text-sm text-white transition-colors hover:bg-[#1e7d46]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 overflow-hidden">
        {/* Algeria map background - very subtle */}
        <svg 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          width="900" 
          height="700" 
          viewBox="0 0 900 700" 
          fill="none"
          style={{ opacity: 0.25 }}
        >
          <path 
            d="M 200 300 L 250 250 L 320 240 L 380 220 L 450 200 L 520 195 L 580 200 L 640 210 L 690 240 L 720 280 L 740 330 L 750 390 L 740 450 L 710 500 L 660 530 L 590 550 L 510 560 L 430 550 L 360 530 L 300 500 L 250 460 L 210 410 L 200 350 Z" 
            stroke="#f0f0f0" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>

        <div className="relative grid items-start gap-12 lg:grid-cols-12">
          {/* Left column - Headline (asymmetric, pushed left, dominant) */}
          <div 
            className={`lg:col-span-7 transition-all duration-400 ${
              hasLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{
              transitionTimingFunction: 'ease-out',
            }}
          >
            <div className="inline-block rounded-[980px] bg-[#1a6b3c] px-4 py-1.5 text-xs text-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              Freelance marketplace
            </div>
            
            <h1 className="mt-6 text-[56px] leading-[1.05]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Algeria's first freelance marketplace.
            </h1>

            {/* Typewriter animation */}
            <div className="mt-5 flex items-center gap-1">
              <span 
                className="text-[22px] text-[#1a6b3c] transition-all duration-300 typewriter-text"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}
              >
                {displayText}
              </span>
              <span 
                className={`inline-block h-6 w-0.5 bg-[#1a6b3c] transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                style={{ marginLeft: '2px' }}
              />
            </div>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              JobMe connects Algerian talent with clients — securely, simply, and entirely in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/signup"
                className="group relative inline-flex items-center gap-2 rounded-[980px] bg-[#1a6b3c] px-6 py-3 text-sm text-white transition-colors hover:bg-[#1e7d46]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                {/* Sonar pulse ring */}
                <span className="sonar-ring absolute inset-0 rounded-[980px] border-2 border-[#1a6b3c]" />
                Create account
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-[980px] border border-[#1a6b3c]/25 px-6 py-3 text-sm text-[#1a6b3c] transition-all hover:border-[#1a6b3c]/40 hover:text-[#1e7d46]"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}
              >
                I already have an account
              </a>
            </div>
          </div>

          {/* Right column - Feature Card (floating, slightly overlapping) */}
          <div 
            className={`lg:col-span-5 transition-all duration-500 ${
              hasLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
            }`}
            style={{
              transitionTimingFunction: 'ease-out',
              transitionDelay: '150ms',
            }}
          >
            <div className="rounded-[18px] bg-[#f5f5f7] p-8 border-2 border-[#1a6b3c]/20">
              <div className="mb-6">
                <h3 className="text-xl text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                  Why JobMe
                </h3>
                <p className="mt-2 text-sm text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                  Built for Algeria's talent economy
                </p>
              </div>
              
              <div className="space-y-5">
                {[
                  { 
                    icon: Search, 
                    title: "Smart discovery", 
                    desc: "Find exactly what you need with advanced category and tag filters"
                  },
                  { 
                    icon: ShieldCheck, 
                    title: "Face verification", 
                    desc: "Built-in security with facial authentication for every user"
                  },
                  { 
                    icon: Briefcase, 
                    title: "Seller dashboard", 
                    desc: "Create, manage, and optimize your gigs in one powerful workspace"
                  },
                  { 
                    icon: MessageSquare, 
                    title: "Seamless workflow", 
                    desc: "From chat to delivery, handle everything without leaving the platform"
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="group">
                      <div className="flex items-start gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a6b3c]/10 transition-colors group-hover:bg-[#1a6b3c]/15">
                          <Icon className="h-4 w-4 text-[#1a6b3c]" strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-[15px] text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm leading-relaxed text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1d1d1f]/10 pt-8 md:flex-row">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#1d1d1f]">
                <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M7 8V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-sm text-[#1d1d1f]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                JobMe
              </span>
            </div>
            <p className="text-xs text-[#6e6e73]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
              © 2026 JobMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}