"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Search, ShieldCheck, Briefcase, MessageSquare, Sparkles, Package, TrendingUp, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

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

export default function JobMeHomePage() {
  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => setHasLoaded(true), 100);
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
        <p className="text-sm text-neutral-500">Loading...</p>
      </main>
    );
  }

  // Logged in view
  if (session?.logged) {
    return (
      <main className="min-h-screen bg-neutral-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-semibold tracking-tight">JobMe</div>
              
              <div className="flex items-center gap-6">
                <button className="text-sm text-neutral-600 hover:text-neutral-900">
                  <MessageSquare size={20} />
                </button>
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-semibold tracking-tight mb-4"
            >
              Welcome back, {session.user?.name || "User"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-neutral-600"
            >
              Your dashboard is ready to help you succeed.
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[
              { 
                label: "Browse Gigs", 
                desc: "Discover talented freelancers", 
                href: "/buyer/browse", 
                icon: Sparkles,
                primary: true 
              },
              { 
                label: "Your Gigs", 
                desc: "Manage your services", 
                href: "/seller/your-gigs", 
                icon: Package,
                primary: false 
              },
              { 
                label: "Profile", 
                desc: "Edit your information", 
                href: "/seller/profile", 
                icon: TrendingUp,
                primary: false 
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group block rounded-3xl px-8 py-8 transition-all duration-300 ${
                    item.primary
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-white border border-neutral-200 hover:shadow-xl"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    item.primary ? "bg-white/10" : "bg-neutral-100"
                  }`}>
                    <Icon size={24} className={item.primary ? "text-white" : "text-neutral-900"} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {item.label}
                  </h3>
                  <p className={`text-sm ${item.primary ? "text-white/70" : "text-neutral-600"}`}>
                    {item.desc}
                  </p>
                </motion.a>
              );
            })}
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Active Orders", value: "12", change: "+3 this week", positive: true },
              { title: "Total Earnings", value: "$2,450", change: "+18% this month", positive: true },
              { title: "Your Gigs", value: "8", change: "2 pending review", positive: false },
              { title: "Messages", value: "24", change: "5 unread", positive: false },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="p-6 bg-white rounded-3xl border border-neutral-200"
              >
                <p className="text-sm text-neutral-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-semibold mb-2">{stat.value}</p>
                <p className={`text-sm ${stat.positive ? "text-green-600" : "text-neutral-500"}`}>
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Landing page
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "backdrop-blur-xl bg-white/80 border-b border-neutral-200" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">JobMe</div>
            
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="px-6 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Log in
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/signup"
                className="px-6 py-2 bg-neutral-900 text-white text-sm rounded-full hover:bg-neutral-800 transition-all"
              >
                Get Started
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="inline-block mb-6"
            >
              <span className="text-sm tracking-wider text-neutral-500 uppercase">
                Freelance Marketplace
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 tracking-tight"
            >
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-semibold mb-2">
                Hire Top Talent.
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-semibold text-neutral-400">
                Sell Your Skills.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg sm:text-xl text-neutral-600 mb-12 max-w-2xl mx-auto"
            >
              Connect with confidence through secure messaging, streamlined orders,
              and verified profiles on the marketplace built for professionals.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-all"
              >
                Create Account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="px-8 py-4 border border-neutral-300 text-neutral-900 rounded-full text-sm font-medium hover:border-neutral-400 transition-all"
              >
                Sign In
              </motion.a>
            </motion.div>

            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-20"
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                  alt="Freelance workspace"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
            >
              Everything You Need
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              A complete platform designed for seamless collaboration between
              buyers and sellers.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Browse & Discover",
                description: "Find the perfect talent with advanced category and tag filters.",
              },
              {
                icon: MessageSquare,
                title: "Real-time Chat",
                description: "Communicate instantly with buyers and sellers through live messaging.",
              },
              {
                icon: Package,
                title: "Order Management",
                description: "Streamlined workflow from order placement to completion.",
              },
              {
                icon: TrendingUp,
                title: "Grow Your Earnings",
                description: "Track your performance and maximize revenue with detailed analytics.",
              },
              {
                icon: Shield,
                title: "Secure & Verified",
                description: "OTP authentication and verified profiles for peace of mind.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized performance that keeps you productive and efficient.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-white border border-neutral-200 rounded-3xl hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why JobMe Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6"
              >
                Built for Algeria's
                <br />
                <span className="text-neutral-400">Talent Economy</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-neutral-600 mb-8"
              >
                JobMe connects Algerian talent with clients — securely, simply, and entirely in one place.
              </motion.p>
            </div>

            <div className="space-y-6">
              {[
                { 
                  icon: Search, 
                  title: "Smart Discovery", 
                  desc: "Find exactly what you need with advanced category and tag filters"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Face Verification", 
                  desc: "Built-in security with facial authentication for every user"
                },
                { 
                  icon: Briefcase, 
                  title: "Seller Dashboard", 
                  desc: "Create, manage, and optimize your gigs in one powerful workspace"
                },
                { 
                  icon: MessageSquare, 
                  title: "Seamless Workflow", 
                  desc: "From chat to delivery, handle everything without leaving the platform"
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group flex items-start gap-4 p-6 rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                      <Icon className="h-6 w-6 text-neutral-900" strokeWidth={2} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="text-lg font-semibold mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
          >
            Ready to Get
            <br />
            <span className="text-neutral-400">Started?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto"
          >
            Join thousands of professionals already using JobMe to grow their
            business and find quality work.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-all"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4">For Buyers</h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Browse Gigs</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Sellers</h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Sell Your Skills</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-200 text-sm text-neutral-500 text-center">
            © 2026 JobMe. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}