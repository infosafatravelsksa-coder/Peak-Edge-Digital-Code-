import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  X,
  ChevronDown,
  ArrowRight,
  Compass,
  Search,
  Megaphone,
  Monitor,
  Feather,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Youtube,
  LogIn,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Header: React.FC = () => {
  const {
    headerConfig,
    isPillExpanded,
    togglePillExpanded,
    isMegaMenuOpen,
    toggleMegaMenu,
    setIsMegaMenuOpen,
    isBriefDrawerOpen,
    toggleBriefDrawer,
    setIsBriefDrawerOpen,
    closeAllOverlays,
  } = useNavigation();

  // Helper for services icon
  const renderServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'compass':
        return <Compass className="w-4 h-4 text-slate-700" />;
      case 'search':
        return <Search className="w-4 h-4 text-slate-700" />;
      case 'megaphone':
        return <Megaphone className="w-4 h-4 text-slate-700" />;
      case 'monitor':
        return <Monitor className="w-4 h-4 text-slate-700" />;
      case 'feather':
        return <Feather className="w-4 h-4 text-slate-700" />;
      case 'trending-up':
      default:
        return <TrendingUp className="w-4 h-4 text-slate-700" />;
    }
  };

  const navItems = headerConfig.navItems || [
    { id: '1', label: 'Selected Work', url: '#workshops' },
    { id: '2', label: 'What We Do', url: '#innovation', isDropdown: true },
    { id: '3', label: 'Our Story', url: '#about' },
    { id: '4', label: 'Insights', url: '#journal' },
    { id: '5', label: 'Marketing Calendar', url: '#calendar', hasDot: true, dotColor: '#ff5533' },
  ];

  return (
    <>
      {/* 1. TOP STICKY HEADER (Branded Top Bar with Active CMS Config) */}
      <header className="w-full bg-[#08090d]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base sm:text-lg">
              <span className="font-mono tracking-widest text-sm font-black text-white">
                {headerConfig.logoText?.replace('*', '').trim() || 'ORBIT'}
              </span>
              <span className="text-[#ff5533] font-black text-lg">*</span>
              <span className="text-white/30 text-xs ml-1 font-mono">CMS</span>
            </a>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Synced
            </span>
          </div>

          {/* Top Quick Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
            {navItems.slice(0, 4).map((item: any) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => {
                  if (item.isDropdown) {
                    e.preventDefault();
                    toggleMegaMenu();
                  }
                }}
                className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>{item.label}</span>
                {item.isDropdown && <ChevronDown className="w-3 h-3 text-neutral-500" />}
                {item.hasDot && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.dotColor || '#ff5533' }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Top CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleBriefDrawer}
              className="px-3.5 py-1.5 rounded-full bg-linear-to-r from-[#ff5533] to-[#ff3b14] text-white font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-md"
            >
              {headerConfig.primaryCtaText || 'Start Brief →'}
            </button>
          </div>
        </div>
      </header>

      {/* 2. FLOATING BOTTOM NAVIGATION PILL DOCK (image_89a65d8e & image_ec894c43) */}
      <div className="fixed bottom-6 inset-x-0 z-45 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto">
          {isPillExpanded ? (
            /* EXPANDED FLOATING PILL (image_89a65d8e) */
            <div className="inline-flex items-center gap-2 sm:gap-3.5 bg-[#121620]/95 border border-white/20 rounded-full px-3.5 sm:px-4 py-2 text-white shadow-2xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200">
              {/* Brand Logo */}
              <div className="flex items-center gap-1 font-bold text-xs pl-1">
                <span>{headerConfig.logoText?.replace('*', '').trim() || 'orbit'}</span>
                <span className="text-[#ff5533] text-sm font-black">*</span>
              </div>

              {/* Close Button (Toggles between Open and Collapsed or Closes Overlays) */}
              <button
                type="button"
                onClick={() => {
                  if (isMegaMenuOpen || isBriefDrawerOpen) {
                    closeAllOverlays();
                  } else {
                    togglePillExpanded();
                  }
                }}
                className="px-3 py-1 rounded-full bg-[#ff5533] hover:bg-[#ff6a4a] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
                <span>Close</span>
              </button>

              {/* Navigation Links */}
              <div className="hidden sm:flex items-center gap-3 md:gap-4 text-xs font-medium text-neutral-300">
                {navItems.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.isDropdown) {
                        toggleMegaMenu();
                      } else if (item.url.startsWith('#')) {
                        const target = document.querySelector(item.url);
                        target?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = item.url;
                      }
                    }}
                    className={`hover:text-white cursor-pointer transition-colors flex items-center gap-1 py-1 px-1.5 rounded ${
                      item.isDropdown && isMegaMenuOpen ? 'text-[#ff5533] font-bold' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isDropdown && <ChevronDown className="w-3 h-3 text-neutral-400" />}
                    {item.hasDot && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.dotColor || '#ff5533' }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* CTA 1: Start Brief */}
              <button
                type="button"
                onClick={toggleBriefDrawer}
                className="px-3 sm:px-4 py-1.5 rounded-full bg-linear-to-r from-[#ff5533] to-[#ff3b14] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer active:scale-95 transition-all"
              >
                <span>{headerConfig.primaryCtaText || 'Start Brief →'}</span>
              </button>

              {/* CTA 2: Let's talk */}
              <button
                type="button"
                onClick={toggleBriefDrawer}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{headerConfig.secondaryCtaText?.replace('•', '').trim() || "Let's talk"}</span>
              </button>
            </div>
          ) : (
            /* COLLAPSED FLOATING PILL (image_ec894c43) */
            <div className="inline-flex items-center gap-2.5 sm:gap-3 bg-[#121620]/95 border border-white/20 rounded-full px-3.5 py-2 text-white shadow-2xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200">
              {/* Brand Logo */}
              <div className="flex items-center gap-1 font-bold text-xs pl-1">
                <span>{headerConfig.logoText?.replace('*', '').trim() || 'orbit'}</span>
                <span className="text-[#ff5533] text-sm font-black">*</span>
              </div>

              {/* Menu Button */}
              <button
                type="button"
                onClick={() => {
                  togglePillExpanded();
                  toggleMegaMenu();
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <MenuIcon className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>

              {/* CTA 1: Start Brief */}
              <button
                type="button"
                onClick={toggleBriefDrawer}
                className="px-3.5 sm:px-4 py-1.5 rounded-full bg-[#ff5533] hover:bg-[#ff6a4a] text-white font-bold text-xs flex items-center gap-1 shadow-md hover:brightness-110 cursor-pointer active:scale-95 transition-all"
              >
                <span>{headerConfig.primaryCtaText || 'Start Brief →'}</span>
              </button>

              {/* CTA 2: Let's talk */}
              <button
                type="button"
                onClick={toggleBriefDrawer}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{headerConfig.secondaryCtaText?.replace('•', '').trim() || "Let's talk"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. INTERACTIVE MEGA MENU MODAL (image_fdc43855)                     */}
      {/* =================================================================== */}
      {isMegaMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 mb-20 sm:mb-0">
            {/* Header / Close bar */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>{headerConfig.logoText?.replace('*', '').trim() || 'orbit'}</span>
                <span className="text-[#ff5533]">*</span>
                <span className="text-slate-400 text-xs font-mono ml-2">NAVIGATION &amp; SERVICES</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mega Menu 3-Column Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Column 1: Our Services (6 Items) */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block border-b border-slate-100 pb-2">
                  — {headerConfig.servicesTitle || 'OUR SERVICES'}
                </span>
                <div className="space-y-3.5">
                  {(headerConfig.services || [
                    { id: '1', title: 'Growth Consultancy', description: 'Strategic roadmaps, market audits & scaling.', icon: 'compass' },
                    { id: '2', title: 'SEO & Search Intelligence', description: 'AEO, technical infrastructure & authority.', icon: 'search' },
                    { id: '3', title: 'Paid Media & Performance', description: 'Targeted ads across Google, Meta & LinkedIn.', icon: 'megaphone' },
                    { id: '4', title: 'Website Design & Development', description: 'Modern, fast and scalable digital experiences.', icon: 'monitor' },
                    { id: '5', title: 'Brand Strategy & Creative', description: 'Memorable identities, narrative & PR.', icon: 'feather' },
                    { id: '6', title: 'Conversion Optimization (CRO)', description: 'Rapid experimentation & checkout optimization.', icon: 'trending-up' },
                  ]).map((srv: any) => (
                    <div
                      key={srv.id}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-start gap-3 group cursor-pointer p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                        {renderServiceIcon(srv.icon)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {srv.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {srv.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Get In Touch */}
              <div className="lg:col-span-3 space-y-4">
                <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block border-b border-slate-100 pb-2">
                  — GET IN TOUCH
                </span>
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-[11px] whitespace-pre-line leading-relaxed">
                      {headerConfig.contact?.address || "14 St. John's Lane, Farringdon\nLondon EC1M 4BF · United Kingdom"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-[11px] font-mono">
                      {headerConfig.contact?.phone || '+44 (0) 20 7946 0912'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-[11px] truncate">
                      {headerConfig.contact?.email || 'partnerships@orbitdigital.agency'}
                    </span>
                  </div>
                </div>

                {/* Promo Solution Card */}
                <div
                  onClick={() => {
                    setIsMegaMenuOpen(false);
                    toggleBriefDrawer();
                  }}
                  className="p-4 rounded-2xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/80 mt-6 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-orange-950">
                      {headerConfig.contact?.solutionCardTitle || 'Need a custom solution?'}
                    </div>
                    <div className="text-[11px] text-orange-900/80 mt-0.5">
                      {headerConfig.contact?.solutionCardDesc || "Let's discuss your project and find the perfect approach."}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Column 3: Featured Work Card */}
              <div className="lg:col-span-4 bg-[#0a0d14] text-white p-6 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 text-orange-400 font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    {headerConfig.featuredWork?.badgeText || 'FEATURED WORK'}
                  </span>
                  <span>{headerConfig.featuredWork?.sliderTotal || '01 / 03'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
                  <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center font-bold text-[10px]">
                    P
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">
                      {headerConfig.featuredWork?.projectTag?.split('·')[0] || 'PACE Athletics'}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Brand Strategy &bull; Paid Media
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-bold leading-snug">
                  {headerConfig.featuredWork?.headline || 'Transforming ideas into digital experiences.'}
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {headerConfig.featuredWork?.subtext ||
                    'Explore how we help ambitious brands scale with high-velocity creative, paid media, and connected e-commerce.'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsMegaMenuOpen(false);
                    toggleBriefDrawer();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#ff5533] hover:bg-[#ff6a4a] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>{headerConfig.featuredWork?.ctaText || 'View Case Study'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. INTERACTIVE BRIEF BUILDER DRAWER (image_aa8d26fd)                */}
      {/* =================================================================== */}
      {isBriefDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 mb-20 sm:mb-0">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>{headerConfig.logoText?.replace('*', '').trim() || 'orbit'}</span>
                <span className="text-[#ff5533]">*</span>
                <span className="text-slate-400 text-xs font-mono ml-2">PROJECT INTAKE</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBriefDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Big Headline & Intro */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>{headerConfig.logoText?.replace('*', '').trim() || 'orbit'}</span>
                  <span className="text-[#ff5533]">*</span>
                  <span className="text-slate-400 text-xs font-mono ml-2">
                    STRATEGY / CREATIVE / PERFORMANCE
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {headerConfig.briefDrawerHeadline || 'Let’s create something extraordinary.'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {headerConfig.briefDrawerSubtext ||
                    'We help ambitious brands turn bold ideas into high-velocity digital experiences that make an impact.'}
                </p>

                {/* Social Icons */}
                <div className="flex items-center gap-2 pt-2">
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors">
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors">
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a href="/" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Middle Column: Brief Builder Action Card */}
              <div className="lg:col-span-4 bg-orange-50/80 border border-orange-200 rounded-3xl p-6 space-y-3.5 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-orange-600 font-bold">
                  PROJECT BRIEF BUILDER
                </span>
                <h4 className="text-lg font-bold text-slate-900 leading-snug">Have a project in mind?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Answer a few simple questions and receive a comprehensive proposal tailored directly to your growth objectives.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsBriefDrawerOpen(false);
                    const contactSection = document.getElementById('contact') || document.getElementById('workshops');
                    contactSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#ff5533] hover:bg-[#ff6a4a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <span>{headerConfig.briefButtonText || 'Start a Project →'}</span>
                </button>
              </div>

              {/* Right Column: Contact Us & Portal */}
              <div className="lg:col-span-3 space-y-3 text-xs">
                <div
                  onClick={() => {
                    setIsBriefDrawerOpen(false);
                    const c = document.getElementById('contact');
                    c?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">Contact Us</div>
                    <div className="text-[10px] text-slate-500">We're just a message away</div>
                  </div>
                  <span className="text-indigo-600 font-bold text-xs">Get in Touch &rarr;</span>
                </div>

                <div
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).__openCmsAdmin) {
                      (window as any).__openCmsAdmin();
                    }
                  }}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">Client Login</div>
                    <div className="text-[10px] text-slate-500">Access your admin portal</div>
                  </div>
                  <span className="text-indigo-600 font-bold text-xs">Login &rarr;</span>
                </div>

                {/* Artwork Accent */}
                <div className="p-4 rounded-2xl bg-[#0e121b] text-white border border-white/10 text-center space-y-1">
                  <div className="text-xs font-bold text-orange-400">Big ideas. Real impact.</div>
                  <div className="text-[10px] text-neutral-400">Engineering high-converting digital velocity.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
