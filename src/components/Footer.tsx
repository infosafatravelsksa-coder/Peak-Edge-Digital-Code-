import React from 'react';
import {
  ArrowUp,
  CheckCircle2,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Youtube,
  ShieldCheck,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { footerConfig } = useNavigation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns = footerConfig.columns || [
    {
      title: 'Capabilities',
      links: [
        { label: 'Growth Strategy', url: '/services/growth' },
        { label: 'Paid Media & Performance', url: '/services/paid-media' },
        { label: 'Creative Direction', url: '/services/brand' },
        { label: 'Search Intelligence', url: '/services/seo' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Selected Work', url: '/selected-work' },
        { label: 'Our Story', url: '/our-story' },
        { label: 'Insights & Journal', url: '/insights' },
        { label: 'Marketing Calendar', url: '/marketing-calendar' },
      ],
    },
    {
      title: 'Get In Touch',
      links: [
        { label: 'Project Brief Builder', url: '/brief' },
        { label: 'Schedule Growth Audit', url: '/contact' },
        { label: 'Client Portal Login', url: '/login' },
      ],
    },
  ];

  const legalLinks = footerConfig.legalLinks || [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Cookies', url: '/cookies' },
  ];

  return (
    <footer className="w-full bg-[#06070a] text-neutral-400 pt-16 pb-24 border-t border-white/[0.08] text-xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Tier: Brand, Tagline, and Multi-Column Menus */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
              <span className="font-mono tracking-widest text-sm font-black text-white">ORBIT</span>
              <span className="text-[#ff5533] font-black text-lg">*</span>
              <span className="text-white/30 text-xs ml-1 font-mono">DIGITAL</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              {footerConfig.tagline || 'Orbit Digital — Full-Service Growth & Marketing Agency engineering high-velocity digital experiences.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2 text-neutral-400">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center hover:text-white transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center hover:text-white transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center hover:text-white transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="/" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center hover:text-white transition-colors">
                <Globe className="w-3.5 h-3.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center hover:text-white transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Navigation Columns (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {columns.map((col: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  {col.title}
                </div>
                <div className="space-y-2">
                  {col.links.map((link: any, lIdx: number) => (
                    <div key={lIdx}>
                      <a
                        href={link.url}
                        className="text-neutral-400 hover:text-white transition-colors text-xs inline-block"
                      >
                        {link.label}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Tier: Copyright, Legal Links, and Back to Top */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div data-orbit-copyright="true">
            {footerConfig.copyright || '© 2026 Orbit Digital. All rights reserved.'}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link: any, idx: number) => (
              <a
                key={idx}
                href={link.url}
                className="hover:text-neutral-300 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <span className="text-neutral-700 hidden sm:inline">&bull;</span>

            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
