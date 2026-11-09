import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Compass,
  Search,
  Megaphone,
  TrendingUp,
  BarChart2,
  Code,
  Users,
  Award,
  Mail,
  Play,
  Pause,
  RotateCw,
  Check,
  Shield,
  Zap,
  Layers,
  Globe,
  ChevronDown,
  X,
  Menu,
  Phone,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

// Brand Orbit Nodes
interface OrbitNode {
  id: string;
  name: string;
  orbit: 'inner' | 'middle' | 'outer';
  angle: number;
  icon: any;
  metric: string;
  metricLabel: string;
  desc: string;
}

const ORBIT_NODES: OrbitNode[] = [
  {
    id: 'strategy',
    name: 'Brand Strategy',
    orbit: 'inner',
    angle: 45,
    icon: Compass,
    metric: '3.8x',
    metricLabel: 'ARR Velocity Lift',
    desc: 'Commercial positioning, unit economics modeling, and market expansion architecture.',
  },
  {
    id: 'seo',
    name: 'SEO & AI Search',
    orbit: 'inner',
    angle: 225,
    icon: Search,
    metric: '+240%',
    metricLabel: 'Organic Revenue',
    desc: 'Technical Core Web Vitals, entity-based knowledge graph optimization, and GEO search.',
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    orbit: 'middle',
    angle: 120,
    icon: Award,
    metric: '14.2M+',
    metricLabel: 'Targeted Impressions',
    desc: 'Distinctive visual identities, native short-form vertical video, and interactive campaign assets.',
  },
  {
    id: 'performance',
    name: 'Paid Media',
    orbit: 'middle',
    angle: 300,
    icon: Megaphone,
    metric: '4.2x',
    metricLabel: 'Blended Client ROAS',
    desc: 'First-party audience modeling across Meta, Google PMax, TikTok, and LinkedIn ABM.',
  },
  {
    id: 'retention',
    name: 'Email & Lifecycle',
    orbit: 'outer',
    angle: 15,
    icon: Mail,
    metric: '38%',
    metricLabel: 'Of Total Store Revenue',
    desc: 'Algorithmic Klaviyo/CRM journeys, predictive replenishment, and VIP segment gating.',
  },
  {
    id: 'analytics',
    name: 'Data & Server CAPI',
    orbit: 'outer',
    angle: 195,
    icon: BarChart2,
    metric: '99.4%',
    metricLabel: 'Attribution Match Rate',
    desc: 'Server-side GTM pipelines, custom Looker dashboards, and incrementality lift experiments.',
  },
];

export default function App() {
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);
  const [orbitSpeed, setOrbitSpeed] = useState<'normal' | 'fast' | 'paused'>('normal');
  const [activeFilter, setActiveFilter] = useState<'all' | 'inner' | 'middle' | 'outer'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefSubmitted, setBriefSubmitted] = useState(false);
  const [selectedService, setSelectedService] = useState('Full-Funnel Growth Engine');
  const [companyName, setCompanyName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [budgetRange, setBudgetRange] = useState('$25k - $50k');

  const filteredNodes = activeFilter === 'all'
    ? ORBIT_NODES
    : ORBIT_NODES.filter((n) => n.orbit === activeFilter);

  const handleBriefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBriefSubmitted(true);
    setTimeout(() => {
      setBriefSubmitted(false);
      setBriefModalOpen(false);
      setCompanyName('');
      setClientEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#0f121a] flex flex-col font-sans selection:bg-[#ff5533]/20">
      {/* 1. TOP BAR HEADER CONTRACT (Zone 1: Brand Wordmark | Zone 2: Navigation Links | Zone 3: Primary CTA) */}
      <header className="sticky top-0 z-40 bg-[#fcfcfd]/90 backdrop-blur-md border-b border-neutral-200/80 px-6 sm:px-10 lg:px-14 py-4 transition-all">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="flex items-center gap-1 text-2xl font-black tracking-tight text-[#0f121a] lowercase select-none shrink-0"
            aria-label="Orbit Digital Home"
          >
            <span>orbit</span>
            <span className="text-2xl text-[#ff5533] leading-none">*</span>
          </a>

          {/* Zone 2: 4-5 single-line clean text links with hover styling */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-600">
            <a href="#work" className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0">
              Selected Work
            </a>
            <a href="#capabilities" className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#results" className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0">
              Client Results
            </a>
            <a href="#process" className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0">
              Process
            </a>
            <a href="#journal" className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0">
              Journal & Intel
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setBriefModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff5533] hover:bg-[#ff6a4a] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-[#ff5533]/20 hover:shadow-lg hover:shadow-[#ff5533]/30 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Start Project Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-6 px-4 border-t border-neutral-200 mt-3 space-y-3 animate-in fade-in duration-200">
            <a
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-800 py-2 border-b border-neutral-100"
            >
              Selected Work
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-800 py-2 border-b border-neutral-100"
            >
              Capabilities & Disciplines
            </a>
            <a
              href="#results"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-800 py-2 border-b border-neutral-100"
            >
              Client Results ($180M+ Managed)
            </a>
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-800 py-2 border-b border-neutral-100"
            >
              How We Work
            </a>
            <a
              href="#journal"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-800 py-2 border-b border-neutral-100"
            >
              Insights & Journal
            </a>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setBriefModalOpen(true);
                }}
                className="w-full py-3 rounded-full bg-[#ff5533] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2"
              >
                <span>Start Your Project Brief</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN HERO SECTION */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-20 pb-16 sm:pb-24 border-b border-neutral-200/80">
          {/* Subtle atmospheric ambient glow */}
          <div
            className="pointer-events-none absolute top-12 right-12 w-[600px] h-[600px] bg-gradient-to-b from-[#ff5533]/8 via-[#ffa726]/4 to-transparent rounded-full blur-3xl -z-10"
            aria-hidden="true"
          />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
            {/* Split Hero Grid: Left Content (1.2fr) vs Right Kinetic Orbit Diagram (0.8fr) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              {/* Left Column: Bold Typographic Statement & Value Proposition */}
              <div className="lg:col-span-7 flex flex-col items-start justify-center space-y-6">
                {/* Clean unboxed metadata kicker */}
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <span className="text-[#ff5533] font-bold">FULL-SERVICE MARKETING</span>
                  <span aria-hidden="true">·</span>
                  <span>COMMERCIAL GROWTH SQUAD</span>
                  <span aria-hidden="true">·</span>
                  <span>GLOBAL SCALE</span>
                </div>

                {/* Primary Display Headline */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold text-[#0f121a] tracking-tight leading-[1.03]">
                  Make your brand{' '}
                  <span className="italic font-normal text-neutral-500 font-serif">
                    impossible
                  </span>{' '}
                  to ignore<span className="text-[#ff5533]">.</span>
                </h1>

                {/* Sub-headline / Narrative */}
                <p className="text-base sm:text-lg md:text-xl text-neutral-600 font-normal leading-relaxed max-w-2xl text-wrap-balance">
                  We engineer connected commercial engines across Brand Strategy, High-Velocity Creative,
                  Search Intelligence, and Performance Media for market leaders ready to scale.
                </p>

                {/* Action Controls Zone */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setBriefModalOpen(true)}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ff5533] hover:bg-[#ff6a4a] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-[#ff5533]/25 hover:shadow-lg hover:shadow-[#ff5533]/35 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Start Your Project Brief</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#capabilities"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 hover:border-neutral-400 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Explore 9 Capabilities</span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-500" />
                  </a>
                </div>

                {/* Proof & Benchmark Ticker Bar */}
                <div className="pt-8 border-t border-neutral-200/80 w-full grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0f121a] tracking-tight tabular-nums">
                      $180M+
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 font-medium">
                      Media Spend Managed
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#ff5533] tracking-tight tabular-nums">
                      4.2x
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 font-medium">
                      Average Client ROAS
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0f121a] tracking-tight tabular-nums">
                      98%
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 font-medium">
                      Annual Retention Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0f121a] tracking-tight tabular-nums">
                      14
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 font-medium">
                      Global Markets Scaled
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Kinetic Orbit System */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[480px] bg-white rounded-3xl border border-neutral-200/90 shadow-xl shadow-black/[0.04] p-6 sm:p-7 relative overflow-hidden">
                  {/* Orbit Control Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#ff5533] uppercase">
                        INTERACTIVE ENGINE
                      </span>
                      <h2 className="text-sm font-bold text-[#0f121a]">
                        Orbit Gravitational Architecture
                      </h2>
                    </div>

                    {/* Orbit Speed & Pause Toggles */}
                    <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setOrbitSpeed(orbitSpeed === 'paused' ? 'normal' : 'paused')}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          orbitSpeed === 'paused'
                            ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                        title={orbitSpeed === 'paused' ? 'Resume Motion' : 'Pause Motion'}
                        aria-label="Pause or Resume Orbit Animation"
                      >
                        {orbitSpeed === 'paused' ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrbitSpeed(orbitSpeed === 'fast' ? 'normal' : 'fast')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                          orbitSpeed === 'fast'
                            ? 'bg-[#ff5533] text-white shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                        title="Toggle 2x Speed"
                      >
                        2x
                      </button>
                    </div>
                  </div>

                  {/* Filter Segmented Control (Inner / Middle / Outer / All) */}
                  <div className="pt-3 pb-2 flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-neutral-400 font-medium hidden sm:inline">Rings:</span>
                    <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg border border-neutral-200 w-full sm:w-auto justify-between">
                      {(['all', 'inner', 'middle', 'outer'] as const).map((ring) => (
                        <button
                          key={ring}
                          type="button"
                          onClick={() => setActiveFilter(ring)}
                          className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium cursor-pointer ${
                            activeFilter === ring
                              ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {ring}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* The Interactive SVG Concentric Orbit Simulation */}
                  <div className="relative w-full aspect-square max-w-[380px] mx-auto my-2 flex items-center justify-center">
                    <svg
                      viewBox="0 0 400 400"
                      className="w-full h-full select-none"
                      aria-label="Concentric orbit diagram depicting strategy, creative, search and performance disciplines"
                    >
                      {/* Radiating Cartesian Grid Lines */}
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                        <line
                          key={deg}
                          x1="200"
                          y1="200"
                          x2={200 + Math.cos((deg * Math.PI) / 180) * 185}
                          y2={200 + Math.sin((deg * Math.PI) / 180) * 185}
                          stroke="#e5e7eb"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Outer Ring (Radius 175) */}
                      <circle
                        cx="200"
                        cy="200"
                        r="175"
                        fill="none"
                        stroke={activeFilter === 'outer' || activeFilter === 'all' ? '#d1d5db' : '#f3f4f6'}
                        strokeWidth="1.5"
                        strokeDasharray={activeFilter === 'outer' ? 'none' : '4 4'}
                        className="transition-colors duration-300"
                      />

                      {/* Middle Ring (Radius 120) */}
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        fill="none"
                        stroke={activeFilter === 'middle' || activeFilter === 'all' ? '#cbd5e1' : '#f3f4f6'}
                        strokeWidth="1.5"
                        className="transition-colors duration-300"
                      />

                      {/* Inner Ring (Radius 70) */}
                      <circle
                        cx="200"
                        cy="200"
                        r="70"
                        fill="none"
                        stroke={activeFilter === 'inner' || activeFilter === 'all' ? '#94a3b8' : '#f3f4f6'}
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                        className="transition-colors duration-300"
                      />

                      {/* Kinetic Spinning Group: Outer Track */}
                      <g
                        className={
                          orbitSpeed === 'paused'
                            ? ''
                            : orbitSpeed === 'fast'
                            ? 'animate-orbit-slow'
                            : 'animate-orbit-slow'
                        }
                        style={{
                          animationDuration: orbitSpeed === 'fast' ? '18s' : '48s',
                          animationPlayState: orbitSpeed === 'paused' ? 'paused' : 'running',
                        }}
                      >
                        <circle cx="200" cy="25" r="7" fill="#ff5533" />
                        <circle cx="25" cy="200" r="5" fill="#0f121a" />
                        <rect x="368" y="194" width="12" height="12" fill="#0f121a" rx="3" />
                      </g>

                      {/* Kinetic Spinning Group: Middle Track (Counter-Rotation) */}
                      <g
                        className={
                          orbitSpeed === 'paused'
                            ? ''
                            : orbitSpeed === 'fast'
                            ? 'animate-orbit-rev'
                            : 'animate-orbit-rev'
                        }
                        style={{
                          animationDuration: orbitSpeed === 'fast' ? '14s' : '32s',
                          animationPlayState: orbitSpeed === 'paused' ? 'paused' : 'running',
                        }}
                      >
                        <circle cx="200" cy="80" r="6.5" fill="#ff7755" />
                        <rect
                          x="74"
                          y="194"
                          width="12"
                          height="12"
                          fill="#f1f5f9"
                          stroke="#ff5533"
                          strokeWidth="2"
                          rx="3"
                          transform="rotate(45 80 200)"
                        />
                      </g>

                      {/* Kinetic Spinning Group: Inner Track (Fast) */}
                      <g
                        className={
                          orbitSpeed === 'paused'
                            ? ''
                            : orbitSpeed === 'fast'
                            ? 'animate-orbit-fast'
                            : 'animate-orbit-fast'
                        }
                        style={{
                          animationDuration: orbitSpeed === 'fast' ? '8s' : '18s',
                          animationPlayState: orbitSpeed === 'paused' ? 'paused' : 'running',
                        }}
                      >
                        <circle cx="270" cy="200" r="5" fill="#ff5533" />
                      </g>

                      {/* Brand Core Nucleus */}
                      <g className="cursor-pointer" onClick={() => setSelectedNode(null)}>
                        <circle cx="200" cy="200" r="32" fill="#0f121a" />
                        <circle cx="200" cy="200" r="28" fill="#1e2433" />
                        <text
                          x="200"
                          y="204"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="700"
                          fontFamily="sans-serif"
                        >
                          orbit*
                        </text>
                      </g>
                    </svg>

                    {/* Interactive Satellite Node Buttons placed above SVG for direct click/hover */}
                    {filteredNodes.map((node) => {
                      const radius = node.orbit === 'inner' ? 68 : node.orbit === 'middle' ? 118 : 172;
                      const rad = (node.angle * Math.PI) / 180;
                      const leftPercent = 50 + ((radius * Math.cos(rad)) / 200) * 50;
                      const topPercent = 50 + ((radius * Math.sin(rad)) / 200) * 50;
                      const isSelected = selectedNode?.id === node.id;
                      const IconComponent = node.icon;

                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedNode(isSelected ? null : node)}
                          style={{
                            left: `${leftPercent}%`,
                            top: `${topPercent}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          className={`absolute w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
                            isSelected
                              ? 'bg-[#ff5533] text-white border-white scale-125 z-30 shadow-lg shadow-[#ff5533]/40'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-[#ff5533] hover:scale-110 z-20'
                          }`}
                          title={`Inspect ${node.name}`}
                          aria-label={`Inspect ${node.name}`}
                        >
                          <IconComponent className="w-4 h-4 stroke-[2]" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Node Detail Card or Default Instruction */}
                  <div className="pt-3 border-t border-neutral-100 min-h-[96px] flex flex-col justify-center">
                    {selectedNode ? (
                      <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <selectedNode.icon className="w-4 h-4 text-[#ff5533]" />
                            <span className="text-xs font-bold text-neutral-900">
                              {selectedNode.name}
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#ff5533] tabular-nums">
                            {selectedNode.metric}{' '}
                            <span className="text-[10px] text-neutral-500 font-normal">
                              {selectedNode.metricLabel}
                            </span>
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                          {selectedNode.desc}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-neutral-500">
                          Click any orbital node above to inspect its capability role and commercial benchmark.
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Strategy · Creative · Search & AI · Performance · Retention · Analytics
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. THREE DOMAIN-NATIVE PILLAR CARDS (Below the hero split, spatial rhythm) */}
            <div className="mt-16 sm:mt-24 pt-12 border-t border-neutral-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-sm hover:border-[#ff5533]/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#ff5533] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                  01. CREATIVE TRUTH
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mt-1 mb-2">
                  Earn Attention
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Creative and visual narrative that people actively choose to engage with. We craft distinctive
                  brand worlds that build long-term memory structures.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-sm hover:border-[#ff5533]/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#ff5533] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                  02. INTENT GRAPH
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mt-1 mb-2">
                  Algorithmic Precision
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Reach high-intent audiences across generative search, social feeds, and programmatic video
                  without burning margin through ad fatigue.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-sm hover:border-[#ff5533]/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#ff5533] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                  03. COMMERCIAL RIGOR
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mt-1 mb-2">
                  Engineered to Scale
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Start focused, test hypotheses with scientific speed, and scale unit economics with server-side
                  attribution and automated lifecycle retention.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. INFINITE MARQUEE TICKER (Channel Continuity) */}
        <div className="border-b border-neutral-200/80 bg-neutral-900 text-white py-4 overflow-hidden select-none">
          <div className="animate-marquee flex items-center gap-8 sm:gap-12">
            {[
              'PACE Athletics +185% Revenue',
              'LilaConnect 307% Paid Search ROI',
              'Shuttercraft +111% Social Reach',
              'Aura Living 4.8x Blended ROAS',
              'Kinetic AI +320% Qualified Pipeline',
              'Solaris Energy -64% Blended CPA',
              'Form Skincare +240% Lift in E-Com',
              'Vertex Cloud 15.2k Enterprise MQLs',
              'Dream Doors +67% Goal Conversions',
              'Lumen Health 5.1x Media ROAS',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-wide shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5533]" />
                <span className="text-neutral-300">{text}</span>
              </div>
            ))}
            {/* Duplicated for seamless CSS loop */}
            {[
              'PACE Athletics +185% Revenue',
              'LilaConnect 307% Paid Search ROI',
              'Shuttercraft +111% Social Reach',
              'Aura Living 4.8x Blended ROAS',
              'Kinetic AI +320% Qualified Pipeline',
              'Solaris Energy -64% Blended CPA',
              'Form Skincare +240% Lift in E-Com',
              'Vertex Cloud 15.2k Enterprise MQLs',
              'Dream Doors +67% Goal Conversions',
              'Lumen Health 5.1x Media ROAS',
            ].map((text, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-wide shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5533]" />
                <span className="text-neutral-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. BRIEF BUILDER MODAL */}
        {briefModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="brief-modal-title"
          >
            <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 text-neutral-900 relative">
              <button
                type="button"
                onClick={() => setBriefModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-[#ff5533] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5533]">
                PROJECT INTAKE SPRINT
              </span>
              <h2 id="brief-modal-title" className="text-xl font-bold text-neutral-900 mt-1 mb-2">
                Configure Your Growth Scope
              </h2>
              <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
                Tell us about your brand challenge. We will formulate an audited execution blueprint and initial roadmap.
              </p>

              <form onSubmit={handleBriefSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Primary Service Focus
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-xs text-neutral-900 outline-none focus:border-[#ff5533] focus:ring-1 focus:ring-[#ff5533]"
                  >
                    <option>Full-Funnel Growth Engine</option>
                    <option>Brand Strategy & Identity</option>
                    <option>Technical SEO & GEO Search</option>
                    <option>Paid Media & Performance Ads</option>
                    <option>Website Design & Headless Development</option>
                    <option>Email Retention & CRM Flows</option>
                    <option>Conversion Rate Optimization (CRO)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Wearables"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs outline-none focus:border-[#ff5533]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs outline-none focus:border-[#ff5533]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Anticipated Monthly Investment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['$10k - $25k', '$25k - $50k', '$50k+'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setBudgetRange(range)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          budgetRange === range
                            ? 'border-[#ff5533] bg-orange-50 text-[#ff5533]'
                            : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {briefSubmitted ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Brief received! Our practice directors will reach out within 4 business hours.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setBriefModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-[#ff5533] hover:bg-[#ff6a4a] text-white text-xs font-semibold shadow-md shadow-[#ff5533]/25 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Submit Intake Brief</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 6. CLEAN MINIMALIST FOOTER */}
      <footer className="border-t border-neutral-200 py-8 px-6 sm:px-10 lg:px-14 bg-white text-neutral-500 text-xs">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-800 font-bold">
            <span>orbit</span>
            <span className="text-[#ff5533] font-black">*</span>
            <span className="text-neutral-500 font-normal">
              © {new Date().getFullYear()} Orbit Digital Marketing Agency. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#work" className="hover:text-neutral-900 transition-colors">
              Portfolio
            </a>
            <a href="#capabilities" className="hover:text-neutral-900 transition-colors">
              Capabilities
            </a>
            <button
              type="button"
              onClick={() => setBriefModalOpen(true)}
              className="text-[#ff5533] font-semibold hover:underline cursor-pointer"
            >
              Start Project Brief
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
