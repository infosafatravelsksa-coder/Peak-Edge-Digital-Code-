import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Check, Sparkles, Layers } from 'lucide-react';
import { INNOVATION_PILLS, CLIENT_SECTOR_TAGS, PillColumn } from '../data/innovationData';

export const InnovationSection: React.FC = () => {
  const [selectedPillId, setSelectedPillId] = useState<string>('saas');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const selectedPill = INNOVATION_PILLS.find((p) => p.id === selectedPillId) || INNOVATION_PILLS[0];

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  return (
    <section
      id="innovation"
      className="relative w-full bg-[#0a0d0b] text-white py-16 sm:py-24 border-t border-b border-white/[0.08] overflow-hidden"
      aria-label="Brand image in the service of innovation"
    >
      {/* Background glow effects */}
      <div
        className="absolute -top-32 right-1/4 w-[480px] h-[480px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 opacity-20"
        style={{ backgroundColor: selectedPill.pillBg }}
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: Heading, description, and sector tags */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ECOSYSTEM EXPERTISE</span>
              </div>
              <h2
                id="brand-image-heading"
                className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white tracking-tight leading-[1.12]"
              >
                Brand image in the <br className="hidden sm:inline" />
                service of innovation
              </h2>
            </div>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              For over ten years, we have been supporting innovation stakeholders and B2B clients in building
              their brand identity. Our understanding of these economic ecosystems guides the structuring of
              our offerings and allows us to deliver comprehensive and functional solutions.
            </p>

            {/* SECTORS OF ACTIVITY TAGS */}
            <div className="pt-4 border-t border-white/10">
              <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 block mb-3 font-semibold">
                OUR CLIENTS' SECTORS OF ACTIVITY:
              </span>
              <div className="flex flex-wrap gap-2">
                {CLIENT_SECTOR_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs scale-105'
                          : 'bg-[#121614] text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Pill Details Info Card */}
            <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-mono">SELECTED SEGMENT</span>
                <div className="text-sm font-semibold text-white mt-0.5">{selectedPill.name}</div>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedPill.sectors.slice(0, 2).map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 Angled Capsule Pills with Bottom Labels ON THE SAME LINE */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center pt-8 pb-4">
            {/* The 4 Pills Container with Perspective & Angle */}
            <div className="w-full max-w-[560px] flex justify-center items-end relative overflow-visible py-6">
              <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-end w-full">
                {INNOVATION_PILLS.map((pill) => {
                  const isSelected = selectedPillId === pill.id;
                  return (
                    <div key={pill.id} className="flex flex-col items-center">
                      {/* Diagonal Capsule Pill */}
                      <div className="w-full h-[320px] sm:h-[350px] flex justify-center items-end relative overflow-visible">
                        <button
                          type="button"
                          onClick={() => setSelectedPillId(pill.id)}
                          style={{
                            transform: 'rotate(20deg)',
                            transformOrigin: '50% 88%',
                            backgroundColor: pill.pillBg,
                            boxShadow: isSelected
                              ? `0 12px 32px -4px ${pill.glowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.4)`
                              : `0 6px 18px -4px ${pill.glowColor}`,
                          }}
                          className={`w-[68px] sm:w-[78px] md:w-[84px] h-[310px] sm:h-[335px] rounded-full p-2 flex flex-col justify-between items-center transition-all duration-300 cursor-pointer ${
                            isSelected ? 'ring-2 ring-white scale-[1.03]' : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                          }`}
                          aria-label={`View clients for ${pill.name}`}
                        >
                          {/* Inner client bubbles / nodes */}
                          {pill.id === 'saas' ? (
                            <div className="w-full h-full flex flex-col justify-between items-center py-1">
                              {pill.clients.map((client) => (
                                <div
                                  key={client.id}
                                  style={{
                                    background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #111111 80%)',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                                  }}
                                  className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full text-white flex flex-col items-center justify-center p-1 text-center border border-white/10 shrink-0 hover:scale-105 transition-transform"
                                  title={client.name}
                                >
                                  {client.id === 'lemlist' && (
                                    <div className="flex items-center gap-0.5">
                                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-[9px] font-bold flex items-center justify-center">e</span>
                                      <span className="text-[8px] sm:text-[9px] font-bold">lemlist</span>
                                    </div>
                                  )}
                                  {client.id === 'pvt' && (
                                    <span className="text-[8px] sm:text-[9px] font-bold tracking-tight">pvt.fr</span>
                                  )}
                                  {client.id === 'growth-machine' && (
                                    <div className="flex flex-col items-center leading-none">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mb-0.5" />
                                      <span className="text-[6.5px] sm:text-[7.5px] font-semibold">La Growth</span>
                                      <span className="text-[6px] sm:text-[7px]">Machine</span>
                                    </div>
                                  )}
                                  {client.id === 'askr' && (
                                    <div className="flex flex-col items-center leading-none">
                                      <span className="text-[7.5px] sm:text-[8.5px] font-bold">ask_r.ai</span>
                                      <span className="text-[5.5px] text-neutral-400 mt-0.5">chat data</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col justify-end items-center pb-2">
                              <div
                                style={{
                                  background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #111111 80%)',
                                  boxShadow: '0 5px 12px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                                }}
                                className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full text-white flex items-center justify-center border border-white/10 hover:scale-110 transition-transform"
                              >
                                <ArrowUpRight className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Pill Bottom Label & Underline: ENSURED TO COME IN THE SAME LINE */}
                      <button
                        type="button"
                        onClick={() => setSelectedPillId(pill.id)}
                        className="w-full mt-5 text-left cursor-pointer group focus:outline-hidden"
                      >
                        {/* Accent Bar Underline */}
                        <div
                          className={`w-full h-[2.5px] rounded-full mb-2.5 transition-colors duration-300 ${
                            isSelected ? 'bg-orange-500' : 'bg-white/20 group-hover:bg-white/40'
                          }`}
                        />

                        {/* Text strictly on the SAME LINE */}
                        <div className="overflow-visible">
                          <span
                            className={`inline-block whitespace-nowrap text-xs sm:text-[13px] md:text-sm transition-colors duration-200 ${
                              isSelected
                                ? 'text-white font-bold'
                                : 'text-neutral-400 font-medium group-hover:text-neutral-200'
                            }`}
                          >
                            {pill.label}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expanded Client List for selected pill */}
            <div className="w-full mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Featured Clients:</span>
                <span className="font-semibold text-white">
                  {selectedPill.clients.map((c) => c.name).join(', ')}
                </span>
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-neutral-400">
                100% Responsive Grid
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
