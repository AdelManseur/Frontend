"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => (
  <footer className="bg-neutral-50 border-t border-neutral-200 pt-24 pb-12 w-full">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
        {[
          { 
            title: 'Categories', 
            links: [
              { label: 'Graphics & Design', href: '/browse?category=Graphics %26 Design' },
              { label: 'Programming & Tech', href: '/browse?category=Programming %26 Tech' },
              { label: 'Digital Marketing', href: '/browse?category=Digital Marketing' },
              { label: 'Video & Animation', href: '/browse?category=Video %26 Animation' }
            ] 
          },
          { 
            title: 'About', 
            links: [
              { label: 'How it Works', href: '/how-it-works' },
              { label: 'Press & News', href: '#' },
              { label: 'Partnerships', href: '#' },
              { label: 'Privacy Policy', href: '#' }
            ] 
          },
          { 
            title: 'Support', 
            links: [
              { label: 'Help & Support', href: '#' },
              { label: 'Trust & Safety', href: '#' },
              { label: 'Selling on JobMe', href: '/become-a-seller' },
              { label: 'Buying on JobMe', href: '/browse' }
            ] 
          },
          { 
            title: 'Community', 
            links: [
              { label: 'Events', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Forum', href: '#' }
            ] 
          },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="mb-6 text-sm font-semibold tracking-tight text-neutral-900">{col.title}</h4>
            <ul className="space-y-4">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-semibold tracking-tighter text-neutral-900">JobMe.</Link>
          <span className="text-sm font-medium text-neutral-400">© 2026 JobMe Inc.</span>
        </div>
        <div className="flex items-center gap-8">
          {['Terms', 'Privacy', 'Cookies'].map((l) => (
            <Link key={l} href="#" className="text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors">{l}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
