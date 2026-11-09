import React from 'react';
import { ArrowUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#06070a] text-neutral-400 py-12 border-t border-white/[0.08] text-xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="font-mono text-white font-bold">COMINVI &bull; ORBIT</div>
          <span className="text-neutral-600">|</span>
          <div className="text-[11px] text-neutral-400">
            Industrial Maintenance & Innovation Architecture Showcase
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Responsive WCAG AAA Ready</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1 text-white hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
