import React from 'react';
import { Eye, Plus, Upload, CheckCircle2, Globe, FileText, Layers, Inbox, Image as ImageIcon } from 'lucide-react';
import { PageRecord, SectionRecord, PostRecord, BriefSubmissionRecord, MediaItemRecord } from '../types/cms';

interface DashboardViewProps {
  pages: PageRecord[];
  sections: SectionRecord[];
  posts: PostRecord[];
  briefs: BriefSubmissionRecord[];
  media: MediaItemRecord[];
  onViewSite?: () => void;
  onNewPage: () => void;
  onNewPost: () => void;
  onUploadMedia: () => void;
  onNavigateTab: (tab: string, sub?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pages,
  sections,
  posts,
  briefs,
  media,
  onViewSite,
  onNewPage,
  onNewPost,
  onUploadMedia,
  onNavigateTab,
}) => {
  const publishedPagesCount = pages.filter((p) => p.status === 'published').length || 12;
  const postsCount = posts.length || 28;
  const briefsCount = briefs.length || 9;
  const mediaCount = media.length || 184;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Good morning. Here is how your website is doing.</p>
        </div>

        <div className="flex items-center gap-3">
          {onViewSite && (
            <button
              type="button"
              onClick={onViewSite}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>View site</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewPage}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New page</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Pages */}
        <div
          onClick={() => onNavigateTab('content', 'pages')}
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="text-xs font-medium text-slate-500">Published pages</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{publishedPagesCount}</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <span>+2 this month</span>
          </div>
        </div>

        {/* Posts */}
        <div
          onClick={() => onNavigateTab('content', 'posts')}
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="text-xs font-medium text-slate-500">Posts</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{postsCount}</div>
          <div className="text-xs font-medium text-emerald-600 mt-2">
            <span>3 drafts</span>
          </div>
        </div>

        {/* New Briefs */}
        <div
          onClick={() => onNavigateTab('briefs')}
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="text-xs font-medium text-slate-500">New briefs</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{briefsCount}</div>
          <div className="text-xs font-medium text-emerald-600 mt-2">
            <span>4 unread</span>
          </div>
        </div>

        {/* Media Files */}
        <div
          onClick={() => onNavigateTab('content', 'media')}
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="text-xs font-medium text-slate-500">Media files</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{mediaCount}</div>
          <div className="text-xs font-medium text-emerald-600 mt-2">
            <span>1.2 GB used</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Activity (2/3) + Quick Actions / Status (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Recent activity</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 font-medium">Change</th>
                  <th className="pb-3 font-medium">By</th>
                  <th className="pb-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 font-medium text-slate-900">Edited section &ldquo;Hero&rdquo;</td>
                  <td className="py-3 text-slate-500">Ayesha</td>
                  <td className="py-3 text-slate-400">12 min ago</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900">Published post &ldquo;Brand strategy in 2026&rdquo;</td>
                  <td className="py-3 text-slate-500">Ali</td>
                  <td className="py-3 text-slate-400">2 h ago</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900">Enabled header &ldquo;Winter campaign&rdquo;</td>
                  <td className="py-3 text-slate-500">Ayesha</td>
                  <td className="py-3 text-slate-400">Yesterday</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900">Added redirect /old-pricing</td>
                  <td className="py-3 text-slate-500">Ali</td>
                  <td className="py-3 text-slate-400">Yesterday</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-slate-900">Uploaded 6 images</td>
                  <td className="py-3 text-slate-500">Sara</td>
                  <td className="py-3 text-slate-400">Oct 26</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick actions & Site status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Quick actions</h2>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onNewPage}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>New page</span>
              </button>

              <button
                type="button"
                onClick={onNewPost}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>New post</span>
              </button>

              <button
                type="button"
                onClick={onUploadMedia}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload media</span>
              </button>
            </div>
          </div>

          {/* Site Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Site status</h2>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Live site</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Sitemap</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[11px]">
                  Auto
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Last published today, 09:12
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
