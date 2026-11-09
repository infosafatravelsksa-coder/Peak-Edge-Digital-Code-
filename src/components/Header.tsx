import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, Shield, Zap, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#08090d]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-40">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base sm:text-lg">
            <span className="w-6 h-6 rounded bg-white text-black font-mono font-black text-xs flex items-center justify-center">
              C
            </span>
            <span className="font-mono tracking-widest text-sm font-black text-white">COMINVI</span>
            <span className="text-white/30 text-xs">/</span>
            <span className="text-xs text-neutral-400 font-sans font-medium">ORBIT</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            60 FPS Fluid &bull; Zero CLS
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          <a
            href="#workshops"
            className="text-white font-medium hover:text-emerald-400 transition-colors"
          >
            01 / WORKSHOPS & INFRASTRUCTURE
          </a>
          <a
            href="#innovation"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            02 / INNOVATION ECOSYSTEM
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#workshops"
            className="px-3.5 py-1.5 rounded-lg bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1"
          >
            <span>Explore Sections</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1017] border-b border-white/10 px-4 py-4 space-y-3 font-mono text-xs">
          <a
            href="#workshops"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white font-semibold"
          >
            01 / WORKSHOPS & INFRASTRUCTURE
          </a>
          <a
            href="#innovation"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-neutral-300"
          >
            02 / INNOVATION ECOSYSTEM
          </a>
        </div>
      )}
    </header>
  );
};
