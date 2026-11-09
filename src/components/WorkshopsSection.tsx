import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Wrench, Sparkles, SlidersHorizontal } from 'lucide-react';
import { WORKSHOP_TABS, WorkshopTabItem } from '../data/workshopsData';

interface WorkshopsSectionProps {
  onSelectTab?: (index: number) => void;
  externalActiveIndex?: number;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({
  onSelectTab,
  externalActiveIndex,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(externalActiveIndex ?? 0);
  const [viewMode, setViewMode] = useState<'sticky-scroll' | 'tab-fade'>('sticky-scroll');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserClicking = useRef<boolean>(false);

  // Sync if external index changes
  useEffect(() => {
    if (externalActiveIndex !== undefined && externalActiveIndex !== activeIndex) {
      setActiveIndex(externalActiveIndex);
    }
  }, [externalActiveIndex]);

  // Auto-play presentation timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % WORKSHOP_TABS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Scroll synchronization for desktop sticky view
  useEffect(() => {
    if (viewMode !== 'sticky-scroll') return;

    const handleScroll = () => {
      if (isUserClicking.current) return;

      const viewportCenter = window.innerHeight * 0.45;
      let closestIdx = activeIndex;
      let minDistance = Infinity;

      imageRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - viewportCenter);

        if (
          dist < minDistance &&
          rect.top < window.innerHeight * 0.85 &&
          rect.bottom > window.innerHeight * 0.15
        ) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      if (closestIdx !== activeIndex) {
        setActiveIndex(closestIdx);
        onSelectTab?.(closestIdx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [viewMode, activeIndex, onSelectTab]);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
    onSelectTab?.(index);

    if (viewMode === 'sticky-scroll') {
      isUserClicking.current = true;
      const targetEl = imageRefs.current[index];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => {
        isUserClicking.current = false;
      }, 750);
    }
  };

  const handleNext = () => {
    handleTabChange((activeIndex + 1) % WORKSHOP_TABS.length);
  };

  const handlePrev = () => {
    handleTabChange((activeIndex - 1 + WORKSHOP_TABS.length) % WORKSHOP_TABS.length);
  };

  const currentTab = WORKSHOP_TABS[activeIndex] || WORKSHOP_TABS[0];

  return (
    <section
      id="workshops"
      className="relative w-full bg-[#08090d] text-white py-12 sm:py-16 lg:py-24 border-t border-b border-white/[0.08] transition-colors"
      aria-label="Workshops and Maintenance Infrastructure"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Sub-header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12 border-b border-white/[0.07] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-semibold">
                OPERATIONAL INFRASTRUCTURE &bull; SECTION S.03
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-1">
              Industrial Heavy Maintenance Facility
            </h2>
          </div>

          {/* Interactive Mode & Presentation Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="bg-[#12151f] p-1 rounded-lg border border-white/10 flex items-center gap-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('sticky-scroll')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'sticky-scroll'
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Continuous synchronized scroll mode"
              >
                Sync Scroll
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tab-fade')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'tab-fade'
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Instant animated tab switcher"
              >
                Instant Tab
              </button>
            </div>

            {/* Auto Play Presentation */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#12151f] text-neutral-300 border-white/10 hover:border-white/25 hover:text-white'
              }`}
              title={isPlaying ? 'Pause auto-cycling' : 'Auto cycle through tabs like video'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Auto-Playing' : 'Auto-Play'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left White Card + Right Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT CARD: Pure White Container matching the video exactly */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 w-full z-20">
            <div className="bg-white text-neutral-900 rounded-[28px] p-6 sm:p-9 lg:p-11 shadow-2xl flex flex-col justify-between min-h-[500px] sm:min-h-[540px] lg:min-h-[590px] border border-neutral-100 relative overflow-hidden transition-all duration-300">
              {/* Top Row: Outlined Badge on left + Numeric Tabs on right */}
              <div className="flex items-center justify-between w-full pb-6 border-b border-neutral-100">
                {/* Outlined Badge: [ 1 / 03 ] #WORKSHOPS */}
                <div className="border border-neutral-900/90 rounded-md px-2.5 py-1.5 flex flex-col items-start gap-0.5 bg-neutral-50/70 shadow-xs">
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-neutral-900 tracking-wider leading-none">
                    {currentTab.badgeIndex}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black text-neutral-900 tracking-widest uppercase leading-none">
                    {currentTab.badgeCategory}
                  </span>
                </div>

                {/* Tabs 01, 02, 03 */}
                <div
                  className="bg-[#eef1f5] rounded-xl p-1 flex items-center gap-1 shadow-inner border border-neutral-200/50"
                  role="tablist"
                  aria-label="Workshops Navigation"
                >
                  {WORKSHOP_TABS.map((tab, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`workshop-panel-${tab.id}`}
                        id={`workshop-tab-${tab.id}`}
                        onClick={() => handleTabChange(idx)}
                        className={`min-w-[44px] sm:min-w-[48px] py-2 px-3 rounded-lg text-xs sm:text-[13px] font-mono font-bold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-black text-white shadow-md scale-[1.02]'
                            : 'bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                        }`}
                      >
                        {tab.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle Section: Title (in ONE SAME LINE as requested) + Smooth Transitions */}
              <div className="my-auto py-8 lg:py-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* The Title: Ensured to come strictly on the SAME LINE */}
                    <div className="overflow-x-auto overflow-y-hidden py-1 no-scrollbar">
                      <h3
                        id="workshops-heading"
                        className="text-xl sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[40px] font-extrabold text-neutral-900 tracking-tight leading-tight whitespace-nowrap select-text"
                        title={currentTab.title}
                      >
                        {currentTab.title}
                      </h3>
                    </div>

                    {/* Operational Metric Tag */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200/60 text-xs font-mono font-medium text-neutral-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{currentTab.stat.value}</span>
                      <span className="text-neutral-400">&bull;</span>
                      <span className="text-neutral-600">{currentTab.stat.label}</span>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-[13.5px] sm:text-[14.5px] text-neutral-700 leading-[1.7] font-normal max-w-[500px]">
                      {currentTab.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Row: Feature pills + Next/Prev Quick Navigation */}
              <div className="pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentTab.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium border border-neutral-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow Controls */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous workshop tab"
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black hover:border-black transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next workshop tab"
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black hover:border-black transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media Gallery matching the video photography */}
          <div className="lg:col-span-7 w-full">
            {viewMode === 'sticky-scroll' ? (
              /* Continuous scroll gallery: Each panel aligns with the sticky left card */
              <div className="flex flex-col gap-12 sm:gap-16 lg:gap-24">
                {/* Tab 01 Images: Two split images (Technicians top, Facility floor bottom) */}
                <div
                  ref={(el) => {
                    imageRefs.current[0] = el;
                  }}
                  id="workshop-panel-tab-01"
                  className={`w-full transition-all duration-500 rounded-[26px] p-2 sm:p-3 border ${
                    activeIndex === 0 ? 'border-white/20 bg-white/[0.03]' : 'border-white/[0.05] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between px-2 py-2 mb-2 text-xs font-mono text-neutral-400">
                    <span className="font-bold text-white">01 / MAINTENANCE INFRASTRUCTURE</span>
                    <span>DUAL FACILITY VIEW</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Top Image: Technicians */}
                    <div className="w-full h-[240px] sm:h-[280px] lg:h-[300px] rounded-[20px] overflow-hidden bg-neutral-900 shadow-xl relative group">
                      <img
                        src={WORKSHOP_TABS[0].images.top}
                        alt={WORKSHOP_TABS[0].images.altTop}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs text-white/90 font-medium">
                          Precision engine rebuild & certified diagnostic station
                        </span>
                      </div>
                    </div>

                    {/* Bottom Image: Facility floor */}
                    <div className="w-full h-[240px] sm:h-[280px] lg:h-[300px] rounded-[20px] overflow-hidden bg-neutral-900 shadow-xl relative group">
                      <img
                        src={WORKSHOP_TABS[0].images.bottom}
                        alt={WORKSHOP_TABS[0].images.altBottom}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs text-white/90 font-medium">
                          Heavy vehicle maintenance bay & continuous tooling line
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab 02 Image: Central service workshop with 10,000kg bridge crane */}
                <div
                  ref={(el) => {
                    imageRefs.current[1] = el;
                  }}
                  id="workshop-panel-tab-02"
                  className={`w-full transition-all duration-500 rounded-[26px] p-2 sm:p-3 border ${
                    activeIndex === 1 ? 'border-white/20 bg-white/[0.03]' : 'border-white/[0.05] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between px-2 py-2 mb-2 text-xs font-mono text-neutral-400">
                    <span className="font-bold text-white">02 / CENTRAL SERVICE WORKSHOP</span>
                    <span>10,000 KG BRIDGE CRANE FACILITY</span>
                  </div>
                  <div className="w-full h-[490px] sm:h-[570px] lg:h-[610px] rounded-[20px] overflow-hidden bg-neutral-900 shadow-xl relative group">
                    <img
                      src={WORKSHOP_TABS[1].images.single}
                      alt={WORKSHOP_TABS[1].images.altSingle}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/90">
                      <div className="font-semibold text-white">Main Overhaul & Rebuild Hall</div>
                      <div className="text-neutral-300 text-[11px] mt-0.5">
                        Featuring 10,000 kg overhead bridge crane for complete powertrain extractions and heavy chassis alignment.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab 03 Image: On-site service workshop & safety auditor */}
                <div
                  ref={(el) => {
                    imageRefs.current[2] = el;
                  }}
                  id="workshop-panel-tab-03"
                  className={`w-full transition-all duration-500 rounded-[26px] p-2 sm:p-3 border ${
                    activeIndex === 2 ? 'border-white/20 bg-white/[0.03]' : 'border-white/[0.05] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between px-2 py-2 mb-2 text-xs font-mono text-neutral-400">
                    <span className="font-bold text-white">03 / ON-SITE SERVICE WORKSHOPS</span>
                    <span>FIELD SAFETY & RAPID DISPATCH</span>
                  </div>
                  <div className="w-full h-[490px] sm:h-[570px] lg:h-[610px] rounded-[20px] overflow-hidden bg-neutral-900 shadow-xl relative group">
                    <img
                      src={WORKSHOP_TABS[2].images.single}
                      alt={WORKSHOP_TABS[2].images.altSingle}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/90">
                      <div className="font-semibold text-white">Continuous On-Site Inspection (IPERCC Protocol)</div>
                      <div className="text-neutral-300 text-[11px] mt-0.5">
                        Decentralized field teams conducting daily mechanical inspections and 24/7 proactive fault diagnostics.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Instant animated tab switcher mode: Great for mobile, tablet, and quick direct preview */
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-[26px] p-2 sm:p-3 bg-white/[0.03] border border-white/10 shadow-2xl"
                  >
                    <div className="flex items-center justify-between px-3 py-2 mb-2 text-xs font-mono text-neutral-400">
                      <span className="font-bold text-white uppercase">{currentTab.number} / {currentTab.title}</span>
                      <span className="text-emerald-400 font-semibold">{currentTab.stat.value} {currentTab.stat.label}</span>
                    </div>

                    {currentTab.layout === 'split' ? (
                      <div className="flex flex-col gap-4">
                        <div className="w-full h-[250px] sm:h-[280px] lg:h-[300px] rounded-[20px] overflow-hidden bg-neutral-900 relative">
                          <img
                            src={currentTab.images.top}
                            alt={currentTab.images.altTop}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full h-[250px] sm:h-[280px] lg:h-[300px] rounded-[20px] overflow-hidden bg-neutral-900 relative">
                          <img
                            src={currentTab.images.bottom}
                            alt={currentTab.images.altBottom}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[510px] sm:h-[570px] lg:h-[615px] rounded-[20px] overflow-hidden bg-neutral-900 relative">
                        <img
                          src={currentTab.images.single}
                          alt={currentTab.images.altSingle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
