"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import MarketingNavbar from '../components/ui/MarketingNavbar';
import Footer from '../components/ui/Footer';
import { Briefcase, DollarSign, Clock, Shield, ArrowRight, Star, Globe, TrendingUp } from 'lucide-react';

export default function FindWorkPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar forceScrolled={true} hideBecomeSeller={true} />
      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-white/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-neutral-400 font-bold tracking-widest uppercase text-sm mb-6">For Professionals</p>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 leading-tight">
              Work your way <br />
              <span className="text-white/40">on your terms.</span>
            </h1>
            <p className="text-xl text-white/60 font-light leading-relaxed mb-12 max-w-xl">
              Connect with clients who appreciate high-quality work. Whether you're a designer, developer, or writer, find projects that fit your skills.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/become-a-seller" 
                className="bg-white text-neutral-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-white/5"
              >
                Become a Seller <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/how-it-works" 
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center active:scale-95"
              >
                Learn how it works
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop" 
                alt="Freelancers working" 
                className="w-full h-full object-cover grayscale opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
            </div>
            
            {/* Float cards */}
            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl text-neutral-900 animate-bounce-slow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Earnings</p>
                  <p className="text-lg font-extrabold">+2,500 DA</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-neutral-900 mb-6">Why work on JobMe?</h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto font-light leading-relaxed">
            We've built a platform that puts professionals first. More freedom, better tools, and higher earnings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { 
              icon: Shield, 
              title: 'Secure Payments', 
              desc: 'Every project is protected. Payment is held securely and released automatically when you complete milestones.' 
            },
            { 
              icon: Globe, 
              title: 'Global Reach', 
              desc: 'Connect with clients from around the world. Expand your network and work on international projects.' 
            },
            { 
              icon: TrendingUp, 
              title: 'Growth Tools', 
              desc: 'Detailed analytics, portfolio management, and professional tools to help you scale your business.' 
            },
            { 
              icon: Clock, 
              title: 'Flexible Hours', 
              desc: "You're the boss. Work whenever and wherever you want. Manage your own schedule with ease." 
            },
            { 
              icon: Star, 
              title: 'Skill Recognition', 
              desc: 'Build your reputation through reviews and ratings. Let your great work speak for itself.' 
            },
            { 
              icon: Briefcase, 
              title: 'Quality Projects', 
              desc: 'Browse a wide range of categories and find the specific type of work that matches your expertise.' 
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 border border-neutral-100 shadow-sm transition-colors hover:bg-neutral-900 hover:text-white">
                <item.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-extrabold text-neutral-900 mb-2">24/7</p>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Support</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-neutral-900 mb-2">1M+</p>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Gigs Posted</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-neutral-900 mb-2">100%</p>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Secure Payments</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-neutral-900 mb-2">4.9/5</p>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">User Rating</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-neutral-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-black/20">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight">Ready to start earning?</h2>
            <p className="text-xl text-white/70 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the professional community on JobMe and take your career to the next level. Sign up today and publish your first gig.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-white text-neutral-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-neutral-100 transition-all active:scale-[0.98]"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
