import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Menu as MenuIcon,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  Inbox,
} from 'lucide-react';

export type MainNavId = 'dashboard' | 'content' | 'menus' | 'sections' | 'settings' | 'briefs';
export type ContentSubNav = 'pages' | 'posts' | 'media';
export type SettingsSubNav = 'sitemap' | 'robots' | 'redirects' | 'general';

interface SidebarProps {
  activeNav: MainNavId;
  contentSubNav: ContentSubNav;
  settingsSubNav: SettingsSubNav;
  onSelectNav: (nav: MainNavId) => void;
  onSelectContentSubNav: (sub: ContentSubNav) => void;
  onSelectSettingsSubNav: (sub: SettingsSubNav) => void;
  userName?: string;
  userRole?: string;
  onSignOut?: () => void;
  briefsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  contentSubNav,
  settingsSubNav,
  onSelectNav,
  onSelectContentSubNav,
  onSelectSettingsSubNav,
  userName = 'Ayesha K.',
  userRole = 'Owner',
  onSignOut,
  briefsCount = 0,
}) => {
  // Generate initials
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <div className="w-3.5 h-3.5 rounded-sm bg-white/90" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">orbit cms</span>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="p-3 space-y-1">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => onSelectNav('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeNav === 'dashboard'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeNav === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          {/* Content (Accordion with sub-items) */}
          <div>
            <button
              type="button"
              onClick={() => onSelectNav('content')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeNav === 'content'
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-4 h-4 ${activeNav === 'content' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Content</span>
              </div>
            </button>

            {/* Sub-navigation for Content */}
            {activeNav === 'content' && (
              <div className="mt-1 pl-10 pr-2 space-y-0.5">
                {[
                  { id: 'pages', label: 'Pages' },
                  { id: 'posts', label: 'Posts' },
                  { id: 'media', label: 'Media' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectContentSubNav(item.id as ContentSubNav)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      contentSubNav === item.id
                        ? 'bg-indigo-100/60 text-indigo-900 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menus */}
          <button
            type="button"
            onClick={() => onSelectNav('menus')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeNav === 'menus'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MenuIcon className={`w-4 h-4 ${activeNav === 'menus' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Menus</span>
          </button>

          {/* Sections */}
          <button
            type="button"
            onClick={() => onSelectNav('sections')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeNav === 'sections'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeNav === 'sections' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Sections</span>
          </button>

          {/* Settings */}
          <div>
            <button
              type="button"
              onClick={() => onSelectNav('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <SettingsIcon className={`w-4 h-4 ${activeNav === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Settings</span>
              </div>
            </button>

            {/* Sub-navigation for Settings */}
            {activeNav === 'settings' && (
              <div className="mt-1 pl-10 pr-2 space-y-0.5">
                {[
                  { id: 'sitemap', label: 'Sitemap' },
                  { id: 'robots', label: 'Robots.txt' },
                  { id: 'redirects', label: 'Redirects' },
                  { id: 'general', label: 'General & Backups' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSettingsSubNav(item.id as SettingsSubNav)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      settingsSubNav === item.id
                        ? 'bg-indigo-100/60 text-indigo-900 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Briefs & Inquiries */}
          <button
            type="button"
            onClick={() => onSelectNav('briefs')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeNav === 'briefs'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className={`w-4 h-4 ${activeNav === 'briefs' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Client Briefs</span>
            </div>
            {briefsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {briefsCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* User Profile Card (Bottom Left) */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
            {initials || 'AK'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">{userName}</div>
            <div className="text-[11px] text-slate-400 capitalize">{userRole}</div>
          </div>
        </div>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
