import React, { useState } from 'react';
import { Plus, Edit2, Eye, Trash2, X, GripVertical, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { PageRecord, SectionRecord } from '../types/cms';

interface PagesViewProps {
  pages: PageRecord[];
  allSections: SectionRecord[];
  onSavePage: (page: PageRecord) => Promise<void>;
  onDeletePage?: (pageId: string) => Promise<void>;
  onNavigateSubNav: (sub: 'pages' | 'posts' | 'media') => void;
  showNotice: (type: 'success' | 'error', message: string) => void;
  isEditingNew?: boolean;
}

export const PagesView: React.FC<PagesViewProps> = ({
  pages,
  allSections,
  onSavePage,
  onDeletePage,
  onNavigateSubNav,
  showNotice,
  isEditingNew = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [editingPage, setEditingPage] = useState<PageRecord | null>(
    isEditingNew
      ? {
          id: `page-${Date.now()}`,
          title: 'New Page',
          slug: '/new-page',
          metaDescription: 'Description for this new page.',
          status: 'draft',
          sectionOrder: ['sec-hero', 'sec-contact'],
        }
      : null
  );

  // Form states for the slide-over drawer
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formSections, setFormSections] = useState<string[]>([]);
  const [sectionToggles, setSectionToggles] = useState<Record<string, boolean>>({});

  const openEditDrawer = (page: PageRecord) => {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormSeoTitle(page.title.includes('Orbit') ? page.title : `${page.title} | Orbit Digital`);
    setFormMetaDesc(page.metaDescription || '');
    const currentSecs = page.sectionOrder || ['sec-hero', 'sec-pricing', 'sec-faq', 'sec-contact'];
    setFormSections(currentSecs);
    const toggles: Record<string, boolean> = {};
    currentSecs.forEach((id) => (toggles[id] = true));
    setSectionToggles(toggles);
  };

  const closeDrawer = () => {
    setEditingPage(null);
  };

  const handleSaveDraft = async () => {
    if (!editingPage) return;
    const updated: PageRecord = {
      ...editingPage,
      title: formTitle,
      slug: formSlug,
      metaDescription: formMetaDesc,
      status: 'draft',
      sectionOrder: formSections.filter((id) => sectionToggles[id] !== false),
    };
    await onSavePage(updated);
    showNotice('success', `Saved draft for page "${formTitle}"`);
    closeDrawer();
  };

  const handlePublish = async () => {
    if (!editingPage) return;
    const updated: PageRecord = {
      ...editingPage,
      title: formTitle,
      slug: formSlug,
      metaDescription: formMetaDesc,
      status: 'published',
      sectionOrder: formSections.filter((id) => sectionToggles[id] !== false),
    };
    await onSavePage(updated);
    showNotice('success', `Published page "${formTitle}"`);
    closeDrawer();
  };

  // Filter pages
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : p.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pages</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage the pages of your website.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            const newP: PageRecord = {
              id: `page-${Date.now()}`,
              title: 'New Page',
              slug: '/new-page',
              metaDescription: '',
              status: 'draft',
              sectionOrder: ['sec-hero', 'sec-contact'],
            };
            openEditDrawer(newP);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New page</span>
        </button>
      </div>

      {/* Subtabs: Pages | Posts | Media */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onNavigateSubNav('pages')}
          className="pb-3 text-indigo-600 border-b-2 border-indigo-600 cursor-pointer"
        >
          Pages
        </button>
        <button
          type="button"
          onClick={() => onNavigateSubNav('posts')}
          className="pb-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Posts
        </button>
        <button
          type="button"
          onClick={() => onNavigateSubNav('media')}
          className="pb-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Media
        </button>
      </div>

      {/* Filters: Search, Status, Sort */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search pages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">Status ▾</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none shadow-2xs cursor-pointer">
            <option>Sort: Last edited ▾</option>
            <option>Sort: Title A-Z</option>
            <option>Sort: URL</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                <th className="py-3.5 px-6 font-medium">Title</th>
                <th className="py-3.5 px-6 font-medium">URL</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Last edited</th>
                <th className="py-3.5 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPages.map((page) => {
                const status = page.status.toLowerCase();
                return (
                  <tr key={page.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{page.title}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{page.slug}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : status === 'draft'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {page.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{page.updatedAt || 'Oct 26'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(page)}
                          className="p-1 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Edit page"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={page.slug === '/' ? '/' : page.slug}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:text-slate-800 transition-colors cursor-pointer"
                          title="View on site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        {onDeletePage && (
                          <button
                            type="button"
                            onClick={() => onDeletePage(page.id)}
                            className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* EDIT PAGE SLIDE-OVER DRAWER (Matches cms-03-pages-edit.png)        */}
      {/* =================================================================== */}
      {editingPage && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/20 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Edit page</h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">URL</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none shadow-2xs"
                />
              </div>

              {/* Sections on this page */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 block">Sections on this page ({formSections.length})</label>
                  <span className="text-[11px] text-slate-400">Use &uarr; &darr; to position</span>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {formSections.map((secId, idx) => {
                    const sec = allSections.find((s) => s.id === secId);
                    const title = sec ? sec.internalTitle.replace(/^S\.\d+\s*/, '') : secId;
                    const isToggled = sectionToggles[secId] !== false;
                    const thumbUrl =
                      sec?.thumbnailUrl ||
                      sec?.draftContent?.image ||
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop';

                    return (
                      <div key={secId} className="px-3 py-2 flex items-center justify-between bg-white hover:bg-slate-50/50 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Reorder Up / Down inside this page */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const newSecs = [...formSections];
                                const [m] = newSecs.splice(idx, 1);
                                newSecs.splice(idx - 1, 0, m);
                                setFormSections(newSecs);
                              }}
                              className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formSections.length - 1}
                              onClick={() => {
                                const newSecs = [...formSections];
                                const [m] = newSecs.splice(idx, 1);
                                newSecs.splice(idx + 1, 0, m);
                                setFormSections(newSecs);
                              }}
                              className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="w-8 h-6 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img src={thumbUrl} alt={title} className="w-full h-full object-cover" />
                          </div>

                          <span className="font-medium text-slate-800 text-xs truncate">{title}</span>
                          {sec?.sectionType === 'custom' && (
                            <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded shrink-0">
                              Custom
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {/* Toggle switch */}
                          <button
                            type="button"
                            onClick={() =>
                              setSectionToggles((prev) => ({
                                ...prev,
                                [secId]: !isToggled,
                              }))
                            }
                            className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                              isToggled ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                            title={isToggled ? 'Visible on page' : 'Hidden'}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                                isToggled ? 'left-4' : 'left-0.5'
                              }`}
                            />
                          </button>

                          {/* Delete from page */}
                          <button
                            type="button"
                            onClick={() => setFormSections((prev) => prev.filter((id) => id !== secId))}
                            className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-0.5"
                            title="Remove section from page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* + Add section to page dropdown selector */}
                <div className="pt-1 flex items-center gap-2">
                  <select
                    id="add-section-to-page-select"
                    className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    {allSections
                      .filter((s) => !formSections.includes(s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.internalTitle.replace(/^S\.\d+\s*/, '')} {s.sectionType === 'custom' ? '(Custom Code)' : ''}
                        </option>
                      ))}
                    {allSections.filter((s) => !formSections.includes(s.id)).length === 0 && (
                      <option disabled value="">All sections are already on this page</option>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('add-section-to-page-select') as HTMLSelectElement | null;
                      const val = sel?.value;
                      if (val && !formSections.includes(val)) {
                        setFormSections([...formSections, val]);
                        setSectionToggles((prev) => ({ ...prev, [val]: true }));
                        showNotice('success', 'Added section to this page!');
                      } else {
                        showNotice('error', 'Select a section to add');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to page</span>
                  </button>
                </div>
              </div>

              {/* SEO Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">SEO title</label>
                <input
                  type="text"
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none shadow-2xs"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">Meta description</label>
                <textarea
                  value={formMetaDesc}
                  onChange={(e) => setFormMetaDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
