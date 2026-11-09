import React from 'react';
import { Search, Eye } from 'lucide-react';

interface TopNavProps {
  breadcrumb: string;
  onViewSite?: () => void;
  onSearchChange?: (q: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ breadcrumb, onViewSite, onSearchChange }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      {/* Breadcrumb */}
      <div className="text-sm font-medium text-slate-500">
        {breadcrumb}
      </div>

      {/* Right Actions: Search & View Site */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 sm:w-72">
          <input
            type="text"
            placeholder="Search anything"
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-3.5 pr-9 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5 text-[11px] font-mono text-slate-400 font-semibold bg-white border border-slate-200 px-1 rounded shadow-2xs">
            <span>⌘K</span>
          </div>
        </div>

        {onViewSite && (
          <button
            type="button"
            onClick={onViewSite}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View site</span>
          </button>
        )}
      </div>
    </header>
  );
};
