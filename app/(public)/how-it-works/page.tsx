"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import MarketingNavbar from '../components/ui/MarketingNavbar';
import Footer from '../components/ui/Footer';
import { Search, UserCheck, CheckCircle, Package, Send, DollarSign, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const buyerSteps = [
    { 
      num: '01', 
      icon: Search, 
      title: 'Search for a Service', 
      desc: 'Browse categories or search specifically for what you need. Compare profiles and portfolios.' 
    },
    { 
      num: '02', 
      icon: Send, 
      title: 'Contact or Order', 
      desc: 'Send a message to discuss your project or place an order directly if the gig matches your needs.' 
    },
    { 
      num: '03', 
      icon: Package, 
      title: 'Receive Quality Work', 
      desc: 'The professional works on your request. You review the delivery and request changes if needed.' 
    },
    { 
      num: '04', 
      icon: CheckCircle, 
      title: 'Approve & Pay', 
      desc: 'Once you are 100% satisfied, approve the work. Payment is securely released to the seller.' 
    },
  ];

  const sellerSteps = [
    { 
      num: '01', 
      icon: UserCheck, 
      title: 'Become a Seller', 
      desc: 'Complete your profile and verify your identity to join our professional community.' 
    },
    { 
      num: '02', 
      icon: Package, 
      title: 'Post your Gigs', 
      desc: 'Create services with clear descriptions, pricing, and images to showcase your talent.' 
    },
    { 
      num: '03', 
      icon: Send, 
      title: 'Deliver Great Work', 
      desc: 'Manage orders through your dashboard. Communicate with clients and submit high-quality results.' 
    },
    { 
      num: '04', 
      icon: DollarSign, 
      title: 'Get Paid', 
      desc: 'Withdraw your earnings securely once the buyer approves your delivery.' 
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar hideBecomeSeller={true} />
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden pt-32 pb-24 px-6 text-center">
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 mix-blend-overlay">
            <source src="https://res.cloudinary.com/dztptq6q1/video/upload/v1778119189/6473943-uhd_3840_2160_25fps_y3vc4b.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-8 leading-tight">
              Simple. Secure. <br />
              <span className="text-neutral-400">Streamlined.</span>
            </h1>
            <p className="text-xl text-neutral-300 font-light leading-relaxed max-w-2xl mx-auto">
              JobMe makes it easy to hire talent or sell your skills. Here is exactly how it works from start to finish.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Buyer Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">Buying on JobMe</h2>
          <div className="h-px bg-neutral-100 flex-1 hidden md:block mx-12" />
          <p className="text-sm font-bold tracking-widest uppercase text-neutral-400">Hire in 4 steps</p>
        </div>

        <div className="grid md:grid-cols-4 gap-12">
          {buyerSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-8 group"
            >
              <div className="relative">
                <div className="text-8xl font-black text-neutral-100 absolute -top-10 -left-6 z-0 group-hover:text-neutral-200 transition-colors">{step.num}</div>
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center relative z-10 shadow-xl transition-transform group-hover:-translate-y-1">
                  <step.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-3">{step.title}</h3>
                <p className="text-neutral-500 font-light leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Seller Section */}
      <section className="py-24 px-6 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900">Selling on JobMe</h2>
            <div className="h-px bg-neutral-200 flex-1 hidden md:block mx-12" />
            <p className="text-sm font-bold tracking-widest uppercase text-neutral-400">Earn in 4 steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            {sellerSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-8 group"
              >
                <div className="relative">
                  <div className="text-8xl font-black text-neutral-200 absolute -top-10 -left-6 z-0 group-hover:text-neutral-300 transition-colors">{step.num}</div>
                  <div className="w-16 h-16 rounded-2xl bg-white text-neutral-900 border border-neutral-200 flex items-center justify-center relative z-10 shadow-xl shadow-neutral-200/50 transition-transform group-hover:-translate-y-1">
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-3">{step.title}</h3>
                  <p className="text-neutral-500 font-light leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tighter text-neutral-900 mb-12">Ready to join?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-10 py-5 bg-neutral-900 text-white rounded-full font-bold text-lg hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-900/10"
            >
              Start for Free
            </Link>
            <Link 
              href="/browse" 
              className="w-full sm:w-auto px-10 py-5 bg-white border border-neutral-200 text-neutral-900 rounded-full font-bold text-lg hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
            >
              Browse Services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
