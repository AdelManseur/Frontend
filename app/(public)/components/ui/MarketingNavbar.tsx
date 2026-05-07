"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { getMe } from '../../req-res';

interface MarketingNavbarProps {
  forceScrolled?: boolean;
  hideBecomeSeller?: boolean;
}

const MarketingNavbar = ({ forceScrolled = false, hideBecomeSeller = false }: MarketingNavbarProps) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    getMe().then(me => {
      if (me?.logged) setIsLogged(true);
    });

    if (!forceScrolled) {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [forceScrolled]);

  const navLinks = [
    { name: 'Find Work', href: '/find-work' },
    { name: 'How it Works', href: '/how-it-works' }
  ];

  if (!hideBecomeSeller) {
    navLinks.splice(1, 0, { name: 'Become a Seller', href: '/become-a-seller' });
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
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
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors relative ${
                      scrolled 
                        ? (isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900') 
                        : (isActive ? 'text-white' : 'text-white/70 hover:text-white')
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 ${scrolled ? 'bg-neutral-900' : 'bg-white'}`}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {isLogged ? (
              <Link
                href="/browse"
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  scrolled
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'bg-white text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Go to Browse
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className={`w-6 h-6 ${scrolled ? 'text-neutral-900' : 'text-white'}`} />
          </button>
        </div>
      </motion.nav>

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
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={`text-3xl font-semibold tracking-tighter transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="h-px bg-neutral-100 my-4" />
              {isLogged ? (
                <Link href="/browse" className="text-xl font-medium text-neutral-900">Go to Browse</Link>
              ) : (
                <>
                  <Link href="/login" className="text-xl font-medium text-neutral-500">Sign In</Link>
                  <Link href="/signup" className="text-xl font-medium text-neutral-900">Join JobMe</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarketingNavbar;
