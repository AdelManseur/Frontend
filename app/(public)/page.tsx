"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Star, Check, Play, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

// Subcomponents for cleaner Next.js-like architecture
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-2xl border-neutral-200/50 py-4 shadow-sm' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className={`text-2xl font-semibold tracking-tighter ${scrolled ? 'text-neutral-900' : 'text-white'}`}>
              JobMe.
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {['Explore', 'Find Work', 'Become a Seller', 'How it Works'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className={`text-sm font-medium transition-colors ${
                    scrolled 
                      ? 'text-neutral-500 hover:text-neutral-900' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/login" 
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                scrolled 
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                  : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Join JobMe
            </Link>
          </div>
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className={`w-6 h-6 ${scrolled ? 'text-neutral-900' : 'text-white'}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white"
          >
            <div className="p-6 flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-neutral-900" />
              </button>
            </div>
            <div className="px-6 py-8 flex flex-col gap-6">
              {['Explore', 'Find Work', 'Become a Seller', 'How it Works'].map((item) => (
                <a key={item} href="#" className="text-3xl font-semibold tracking-tighter text-neutral-900">
                  {item}
                </a>
              ))}
              <div className="h-px bg-neutral-100 my-4" />
              <Link href="/login" className="text-xl font-medium text-neutral-500">Sign In</Link>
              <Link href="/signup" className="text-xl font-medium text-neutral-900">Join JobMe</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => (
  <footer className="bg-neutral-50 border-t border-neutral-200 pt-24 pb-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
        {[
          { title: 'Categories', links: ['Graphics & Design', 'Programming & Tech', 'Digital Marketing', 'Video & Animation'] },
          { title: 'About', links: ['Careers', 'Press & News', 'Partnerships', 'Privacy Policy'] },
          { title: 'Support', links: ['Help & Support', 'Trust & Safety', 'Selling on JobMe', 'Buying on JobMe'] },
          { title: 'Community', links: ['Events', 'Blog', 'Forum', 'Affiliates'] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="mb-6 text-sm font-semibold tracking-tight text-neutral-900">{col.title}</h4>
            <ul className="space-y-4">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold tracking-tighter text-neutral-900">JobMe.</span>
          <span className="text-sm font-medium text-neutral-400">© 2026 JobMe Inc.</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors">Terms</a>
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors">Privacy</a>
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const popularServices = [
    { id: '1', name: 'Logo Design', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop', category: 'Graphics & Design' },
    { id: '2', name: 'Website Development', image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop', category: 'Programming & Tech' },
    { id: '3', name: 'Video Editing', image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop', category: 'Video & Animation' },
    { id: '4', name: 'Content Writing', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop', category: 'Writing & Translation' },
    { id: '5', name: 'Mobile App Design', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop', category: 'Digital Design' },
    { id: '6', name: 'SEO Services', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', category: 'Digital Marketing' },
    { id: '7', name: 'Voice Over', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&h=400&fit=crop', category: 'Music & Audio' },
    { id: '8', name: 'Social Media', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop', category: 'Marketing' },
  ];

  const featuredGigs = [
    { id: '1', seller: 'Sarah M.', title: 'I will design a modern minimal logo', rating: 4.9, reviews: 1240, price: 45, image: 'https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=500&h=350&fit=crop', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
    { id: '2', seller: 'James K.', title: 'I will build a responsive React website', rating: 5.0, reviews: 892, price: 150, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&h=350&fit=crop', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop' },
    { id: '3', seller: 'Anna L.', title: 'I will edit your video professionally', rating: 4.8, reviews: 567, price: 75, image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=500&h=350&fit=crop', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
    { id: '4', seller: 'Mike R.', title: 'I will write SEO blog articles for you', rating: 4.9, reviews: 2103, price: 30, image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=350&fit=crop', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
  ];

  const trustedCompanies = ['Meta', 'Google', 'Netflix', 'P&G', 'PayPal'];

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-neutral-900 selection:text-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          >
            <source src="https://res.cloudinary.com/dztptq6q1/video/upload/v1777254835/7252516-hd_1920_1080_25fps_zaxunm.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tighter text-white mb-8 leading-[1.05]">
              Find the perfect <br />
              <span className="text-neutral-400">freelance service.</span>
            </h1>
            <p className="text-lg md:text-2xl text-neutral-300 mb-12 leading-relaxed font-light max-w-2xl text-balance">
              Connect with top-tier professionals to bring your ideas to life. Fast, secure, and purely brilliant.
            </p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl md:rounded-full overflow-hidden shadow-2xl p-2 border border-white/10 focus-within:bg-white focus-within:border-white transition-all duration-500 group"
            >
              <Search className="w-6 h-6 text-white group-focus-within:text-neutral-400 ml-4 flex-shrink-0 transition-colors" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-4 text-lg outline-none bg-transparent placeholder:text-white/60 text-white group-focus-within:text-neutral-900 group-focus-within:placeholder:text-neutral-400 font-light w-full"
              />
              <button className="hidden md:block px-8 py-4 bg-white text-neutral-900 rounded-full font-medium hover:bg-neutral-100 transition-all active:scale-95 shadow-sm">
                Search
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <span className="text-sm font-medium text-neutral-400">Trending:</span>
              {['Website Development', 'Logo Design', 'Video Editing'].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-1.5 text-sm font-medium text-neutral-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white hover:text-neutral-900 transition-all"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <div className="border-b border-neutral-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 md:gap-16 opacity-50 grayscale"
          >
            <span className="text-sm font-semibold tracking-widest uppercase text-neutral-500">Trusted by modern teams</span>
            <div className="flex items-center gap-12 flex-wrap justify-center">
              {trustedCompanies.map((company) => (
                <span key={company} className="text-2xl font-bold tracking-tighter text-neutral-800">{company}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Popular Services */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="flex items-end justify-between mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-neutral-900">Popular services.</h2>
          <a href="#" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:gap-2 transition-all">
            See all services <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {popularServices.map((service) => (
            <motion.a
              variants={fadeUpVariant}
              key={service.id}
              href="#"
              className="group flex flex-col gap-4"
            >
              <div className="aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl bg-neutral-100 relative">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900 mb-1 group-hover:text-neutral-600 transition-colors">{service.name}</h3>
                <p className="text-sm text-neutral-500 font-medium">{service.category}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* Value Proposition Banner */}
      <section className="py-32 px-6 bg-neutral-950 text-white selection:bg-white selection:text-neutral-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeUpVariant} className="text-sm font-semibold tracking-widest uppercase text-neutral-500 mb-6">A whole world of talent</motion.p>
            <motion.h2 variants={fadeUpVariant} className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white mb-10 leading-[1.05]">
              Break down <br />
              <span className="text-neutral-500 font-light">every barrier.</span>
            </motion.h2>
            <motion.ul variants={staggerContainer} className="space-y-6">
              {[
                'Access a curated global network of skilled freelancers.',
                'Quality work delivered on time, every time.',
                '24/7 dedicated enterprise-grade customer support.',
                'Secure milestone-based payments and guarantees.',
              ].map((item) => (
                <motion.li variants={fadeUpVariant} key={item} className="flex items-start gap-5 group">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 transition-colors group-hover:bg-white/20">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xl text-neutral-400 font-light leading-relaxed group-hover:text-neutral-200 transition-colors">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            <motion.button variants={fadeUpVariant} className="mt-12 px-8 py-4 bg-white text-neutral-900 rounded-full font-medium hover:bg-neutral-200 transition-colors inline-flex items-center gap-3 active:scale-95">
              <Play className="w-4 h-4 fill-neutral-900" />
              <span>Watch the story</span>
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-white/10"
          >
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=1000&fit=crop"
              alt="Working together"
              fill
              className="object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="py-32 px-6 max-w-7xl mx-auto bg-neutral-50/50 rounded-[3rem] my-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-neutral-900 mb-4">Featured by JobMe.</h2>
            <p className="text-xl text-neutral-500 font-light">Hand-picked professionals delivering premium quality.</p>
          </div>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredGigs.map((gig) => (
            <motion.a
              variants={fadeUpVariant}
              key={gig.id}
              href="#"
              className="group flex flex-col gap-5 p-4 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 relative">
                <Image
                  src={gig.image}
                  alt={gig.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="px-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0 relative">
                    <Image src={gig.avatar} alt={gig.seller} fill className="object-cover" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-neutral-900">{gig.seller}</span>
                </div>
                <h3 className="text-lg font-medium tracking-tight text-neutral-800 mb-3 leading-snug group-hover:text-neutral-900 transition-colors line-clamp-2">{gig.title}</h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-neutral-900 text-neutral-900" />
                    <span className="text-sm font-bold tracking-tight text-neutral-900">{gig.rating}</span>
                    <span className="text-sm text-neutral-400 font-medium">({gig.reviews})</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-neutral-900">${gig.price}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-neutral-900">How it works.</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24"
          >
            {[
              { num: '1', title: 'Post your project.', desc: 'Tell us what you need done and get free quotes from expert freelancers within minutes.' },
              { num: '2', title: 'Choose a professional.', desc: 'Compare profiles, portfolios, reviews, and quotes. Then hire your absolute favorite.' },
              { num: '3', title: 'Get it done.', desc: 'Approve the final work and securely release payment only when you are 100% satisfied.' },
            ].map((step) => (
              <motion.div variants={fadeUpVariant} key={step.num} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-8 group-hover:bg-neutral-900 transition-colors duration-300">
                  <span className="text-3xl font-bold tracking-tighter text-neutral-400 group-hover:text-white transition-colors duration-300">{step.num}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-4">{step.title}</h3>
                <p className="text-neutral-500 font-light leading-relaxed max-w-sm text-balance">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="bg-neutral-100 rounded-[3rem] p-12 md:p-24 grid md:grid-cols-2 gap-16 items-center overflow-hidden relative group"
        >
          <div className="relative z-10">
            <p className="text-sm font-bold tracking-widest uppercase text-neutral-500 mb-6">JobMe Business</p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 mb-8 leading-[1.05]">Built for teams <br /> that demand more.</h2>
            <p className="text-xl text-neutral-600 font-light mb-10 leading-relaxed text-balance">
              Upgrade to a curated enterprise experience packed with advanced tools, invoicing, and top 1% talent.
            </p>
            <button className="px-8 py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all active:scale-95 inline-flex items-center gap-2">
              <span>Explore JobMe Business</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative z-10 aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop"
              alt="Business team"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
