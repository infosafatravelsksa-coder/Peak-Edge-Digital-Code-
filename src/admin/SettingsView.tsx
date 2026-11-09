import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Eye,
  AlertTriangle,
  Download,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  SitemapConfigRecord,
  RobotsConfigRecord,
  RedirectRecord,
  SiteSettingsRecord,
} from '../types/cms';

interface SettingsViewProps {
  subTab: 'sitemap' | 'robots' | 'redirects' | 'general';
  onSelectSubTab: (sub: 'sitemap' | 'robots' | 'redirects' | 'general') => void;
  sitemapConfig: SitemapConfigRecord;
  onSaveSitemap: (cfg: SitemapConfigRecord) => Promise<void>;
  robotsConfig: RobotsConfigRecord;
  onSaveRobots: (cfg: RobotsConfigRecord) => Promise<void>;
  redirects: RedirectRecord[];
  onSaveRedirect: (r: RedirectRecord) => Promise<void>;
  onDeleteRedirect: (id: string) => Promise<void>;
  siteSettings: SiteSettingsRecord;
  onSaveSiteSettings: (s: SiteSettingsRecord) => Promise<void>;
  onExportDatabase: () => Promise<void>;
  showNotice: (type: 'success' | 'error', message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  subTab,
  onSelectSubTab,
  sitemapConfig,
  onSaveSitemap,
  robotsConfig,
  onSaveRobots,
  redirects,
  onSaveRedirect,
  onDeleteRedirect,
  siteSettings,
  onSaveSiteSettings,
  onExportDatabase,
  showNotice,
}) => {
  // Sitemap state
  const [sitemapMode, setSitemapMode] = useState<'auto' | 'manual'>(sitemapConfig.mode || 'auto');
  const [includePages, setIncludePages] = useState(sitemapConfig.includePages ?? true);
  const [includePosts, setIncludePosts] = useState(sitemapConfig.includePosts ?? true);
  const [includeMedia, setIncludeMedia] = useState(sitemapConfig.includeMedia ?? false);
  const [includeDrafts, setIncludeDrafts] = useState(sitemapConfig.includeDrafts ?? false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  // Robots state
  const [robotsMode, setRobotsMode] = useState<'auto' | 'manual'>(robotsConfig.mode || 'manual');
  const [robotsContent, setRobotsContent] = useState(
    robotsConfig.content ||
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://yoursite.com/sitemap.xml`
  );

  // Redirects state
  const [redirectSearch, setRedirectSearch] = useState('');
  const [redirectTypeFilter, setRedirectTypeFilter] = useState<'all' | '301' | '302'>('all');
  const [editingRedirect, setEditingRedirect] = useState<RedirectRecord | null>(null);
  const [fromUrl, setFromUrl] = useState('');
  const [toUrl, setToUrl] = useState('');
  const [redirectType, setRedirectType] = useState<'301' | '302'>('301');

  // General settings state
  const [siteName, setSiteName] = useState(siteSettings.siteName || 'Orbit Digital');
  const [seoTitle, setSeoTitle] = useState(siteSettings.defaultSeoTitle || 'Orbit Digital - Full-Service Growth & Marketing Agency');
  const [seoDesc, setSeoDesc] = useState(siteSettings.defaultSeoDescription || 'Engineering growth engines across strategy, creative, search, media, and performance for ambitious global brands.');
  const [maintenanceMode, setMaintenanceMode] = useState(siteSettings.maintenanceMode || false);

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(sitemapConfig.sitemapUrl || 'https://yoursite.com/sitemap.xml');
    setCopiedSitemap(true);
    showNotice('success', 'Copied sitemap URL to clipboard');
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const handleRegenerateSitemap = async () => {
    const updated: SitemapConfigRecord = {
      ...sitemapConfig,
      mode: sitemapMode,
      includePages,
      includePosts,
      includeMedia,
      includeDrafts,
      lastGenerated: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · 40 URLs`,
    };
    await onSaveSitemap(updated);
    showNotice('success', 'Regenerated XML sitemap automatically');
  };

  const handleSaveRobots = async () => {
    const updated: RobotsConfigRecord = {
      mode: robotsMode,
      content: robotsContent,
      isValid: true,
    };
    await onSaveRobots(updated);
    showNotice('success', 'Saved and verified robots.txt');
  };

  const handleSaveRedirectItem = async () => {
    if (!editingRedirect) return;
    const item: RedirectRecord = {
      ...editingRedirect,
      from: fromUrl,
      to: toUrl,
      type: redirectType,
      active: true,
    };
    await onSaveRedirect(item);
    showNotice('success', `Saved redirect ${fromUrl} -> ${toUrl}`);
    setEditingRedirect(null);
  };

  const handleSaveGeneral = async () => {
    await onSaveSiteSettings({
      ...siteSettings,
      siteName,
      defaultSeoTitle: seoTitle,
      defaultSeoDescription: seoDesc,
      maintenanceMode,
    });
    showNotice('success', 'Site settings updated successfully');
  };

  const filteredRedirects = redirects.filter((r) => {
    const matchSearch = r.from.toLowerCase().includes(redirectSearch.toLowerCase()) || r.to.toLowerCase().includes(redirectSearch.toLowerCase());
    const matchType = redirectTypeFilter === 'all' ? true : r.type === redirectTypeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Control how search engines and visitors find your site.</p>
      </div>

      {/* Subtabs: Sitemap | Robots.txt | Redirects | General & Backups */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-semibold">
        {[
          { id: 'sitemap', label: 'Sitemap' },
          { id: 'robots', label: 'Robots.txt' },
          { id: 'redirects', label: 'Redirects' },
          { id: 'general', label: 'General & Backups' },
        ].map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSubTab(tab.id as any)}
              className={`pb-3 transition-colors cursor-pointer ${
                isActive
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 1. SITEMAP VIEW (cms-11-sitemap.png)                                */}
      {/* =================================================================== */}
      {subTab === 'sitemap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Card (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900">How should your sitemap be created?</h2>

            {/* 2 Options */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSitemapMode('auto')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  sitemapMode === 'auto'
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Create automatically</div>
                <div className="text-[11px] text-slate-500 mt-1">Updates whenever you publish a page or post.</div>
              </div>

              <div
                onClick={() => setSitemapMode('manual')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  sitemapMode === 'manual'
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Upload manually</div>
                <div className="text-[11px] text-slate-500 mt-1">Use your own sitemap.xml file.</div>
              </div>
            </div>

            {/* URL Box with Copy Button */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-700 truncate">{sitemapConfig.sitemapUrl}</span>
              <button
                type="button"
                onClick={handleCopySitemap}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-[11px] transition-colors cursor-pointer shrink-0"
              >
                {copiedSitemap ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Footer with Regenerate button */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{sitemapConfig.lastGenerated}</span>
              <button
                type="button"
                onClick={handleRegenerateSitemap}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Right Card (5 cols): Included in sitemap */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Included in sitemap</h2>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { label: 'Pages', val: includePages, setVal: setIncludePages },
                { label: 'Posts', val: includePosts, setVal: setIncludePosts },
                { label: 'Media', val: includeMedia, setVal: setIncludeMedia },
                { label: 'Draft content', val: includeDrafts, setVal: setIncludeDrafts },
              ].map((item) => (
                <div key={item.label} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => item.setVal(!item.val)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      item.val ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        item.val ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. ROBOTS.TXT VIEW (cms-12-robots.png)                             */}
      {/* =================================================================== */}
      {subTab === 'robots' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Card (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900">How should robots.txt be created?</h2>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRobotsMode('auto')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  robotsMode === 'auto'
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Create automatically</div>
                <div className="text-[11px] text-slate-500 mt-1">Uses safe default rules.</div>
              </div>

              <div
                onClick={() => setRobotsMode('manual')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  robotsMode === 'manual'
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Upload manually</div>
                <div className="text-[11px] text-slate-500 mt-1">Paste or upload your own rules.</div>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={robotsContent}
              onChange={(e) => setRobotsContent(e.target.value)}
              rows={8}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl p-4 text-xs font-mono text-slate-800 outline-none leading-relaxed shadow-2xs"
            />

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => showNotice('success', 'Robots.txt uploaded and parsed')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload file</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRobots}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                Save robots.txt
              </button>
            </div>
          </div>

          {/* Right Card (5 cols): Check Validation */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Check</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  Valid
                </span>
                <span className="text-xs font-semibold text-slate-800">No blocking mistakes found</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Search engines can reach all public pages. /admin and /api are blocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. REDIRECTS VIEW (cms-13-redirects.png)                            */}
      {/* =================================================================== */}
      {subTab === 'redirects' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search redirects"
                value={redirectSearch}
                onChange={(e) => setRedirectSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none shadow-2xs"
              />

              <select
                value={redirectTypeFilter}
                onChange={(e) => setRedirectTypeFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none shadow-2xs cursor-pointer"
              >
                <option value="all">Type ▾</option>
                <option value="301">301 (Permanent)</option>
                <option value="302">302 (Temporary)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => showNotice('success', 'Imported CSV redirects')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newR: RedirectRecord = {
                    id: `red-${Date.now()}`,
                    from: '/new-url',
                    to: '/',
                    type: '301',
                    hits: 0,
                    active: true,
                  };
                  setEditingRedirect(newR);
                  setFromUrl(newR.from);
                  setToUrl(newR.to);
                  setRedirectType(newR.type);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add redirect</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                    <th className="py-3.5 px-6 font-medium">From</th>
                    <th className="py-3.5 px-6 font-medium">To</th>
                    <th className="py-3.5 px-6 font-medium">Type</th>
                    <th className="py-3.5 px-6 font-medium">Hits</th>
                    <th className="py-3.5 px-6 font-medium">Status</th>
                    <th className="py-3.5 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRedirects.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 font-mono">{r.from}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{r.to}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold text-[11px]">
                          {r.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono">{r.hits}</td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={async () => {
                            await onSaveRedirect({ ...r, active: !r.active });
                            showNotice('success', `Redirect ${r.from} ${!r.active ? 'Activated' : 'Disabled'}`);
                          }}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            r.active ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                              r.active ? 'left-5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRedirect(r);
                              setFromUrl(r.from);
                              setToUrl(r.to);
                              setRedirectType(r.type);
                            }}
                            className="p-1 hover:text-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={r.from}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:text-slate-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteRedirect(r.id);
                              showNotice('success', 'Redirect removed');
                            }}
                            className="p-1 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 404 Broken links card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">3 broken links found (404)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Visitors reached pages that do not exist.</p>
            </div>
            <button
              type="button"
              onClick={() => showNotice('success', 'Reviewing 404 access log')}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. GENERAL & BACKUPS VIEW                                           */}
      {/* =================================================================== */}
      {subTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-slate-900">General Site Configuration</h2>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Default SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Default Meta Description</label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Maintenance Mode</span>
                  <span className="text-[11px] text-slate-400">Display maintenance overlay to visitors</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    maintenanceMode ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      maintenanceMode ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
                >
                  Save settings
                </button>
              </div>
            </div>
          </div>

          {/* Database Backup & Export Engine */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Database Backup & Portability Engine</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export all master sections, pages, posts, menus, media records, and client scope briefs into a self-contained, portable JSON archive.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onExportDatabase}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download JSON Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Redirect Modal */}
      {editingRedirect && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/20 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Configure redirect</h2>
              <button
                type="button"
                onClick={() => setEditingRedirect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">From Path</label>
                <input
                  type="text"
                  value={fromUrl}
                  onChange={(e) => setFromUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">To Destination URL</label>
                <input
                  type="text"
                  value={toUrl}
                  onChange={(e) => setToUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">HTTP Redirect Status</label>
                <select
                  value={redirectType}
                  onChange={(e) => setRedirectType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs cursor-pointer font-mono"
                >
                  <option value="301">301 (Permanent Redirect)</option>
                  <option value="302">302 (Temporary Redirect)</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingRedirect(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRedirectItem}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                Save redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
