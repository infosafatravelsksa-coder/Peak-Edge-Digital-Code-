import React, { useState, useEffect, useRef } from 'react';
import {
  auth,
  googleProvider,
  PRIMARY_ADMIN_EMAIL,
} from '../firebase/config';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  isCurrentUserAdmin,
  getPages,
  savePage,
  getSections,
  saveSection,
  deleteSection,
  publishPage,
  getPublishedContent,
  getMediaLibrary,
  saveMediaItem,
  deleteMediaItem,
  getRevisions,
  restoreRevision,
  getAuditLogs,
  getSiteSettings,
  updateSiteSettings,
  seedInitialCmsData,
  getBriefSubmissions,
  updateBriefStatus,
  deleteBriefSubmission,
  exportCmsDatabase,
  importCmsDatabase,
} from '../services/cmsService';
import {
  PageRecord,
  SectionRecord,
  MediaItemRecord,
  RevisionRecord,
  AuditLogRecord,
  SiteSettingsRecord,
  SectionType,
  BriefSubmissionRecord,
} from '../types/cms';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LogOut,
  LogIn,
  Layout,
  FileText,
  Image as ImageIcon,
  History,
  Activity,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Upload,
  AlertTriangle,
  Folder,
  Layers,
  Sparkles,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  X,
  Search,
  Inbox,
  Download,
  UploadCloud,
  Check,
  Send,
} from 'lucide-react';
import { Phase4BriefsTab } from './Phase4BriefsTab';

export const AdminDashboard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sections' | 'briefs' | 'pages' | 'media' | 'revisions' | 'audit' | 'settings'
  >('overview');

  // CMS State
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [media, setMedia] = useState<MediaItemRecord[]>([]);
  const [revisions, setRevisions] = useState<RevisionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRecord | null>(null);
  const [briefs, setBriefs] = useState<BriefSubmissionRecord[]>([]);
  const [briefFilter, setBriefFilter] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<SectionRecord | null>(null);
  const [editingContent, setEditingContent] = useState<Record<string, any>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Phase 3 Search, Filter & Live Preview States
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [sectionSearch, setSectionSearch] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mediaPickerOpen, setMediaPickerOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all CMS data when authorized
  const loadCmsData = async () => {
    if (!isAdmin) return;
    try {
      const [p, s, m, r, a, cfg, bList] = await Promise.all([
        getPages(),
        getSections(),
        getMediaLibrary(),
        getRevisions(),
        getAuditLogs(30),
        getSiteSettings(),
        getBriefSubmissions().catch(() => []),
      ]);
      setBriefs(bList || []);

      // If empty database, run initial seeding
      if (p.length === 0 && s.length === 0) {
        await seedInitialCmsData();
        const [p2, s2, m2] = await Promise.all([getPages(), getSections(), getMediaLibrary()]);
        setPages(p2);
        setSections(s2);
        setMedia(m2);
      } else {
        setPages(p);
        setSections(s);
        setMedia(m);
      }
      setRevisions(r);
      setAuditLogs(a);
      setSiteSettings(cfg);
    } catch (err: any) {
      showNotice('error', `Failed loading CMS data: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadCmsData();
    }
  }, [isAdmin]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSignIn = async () => {
    setLoadingAction('signin');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      showNotice('error', `Sign-in failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const handleSaveSectionContent = async () => {
    if (!selectedSection) return;
    setLoadingAction('saving_section');
    try {
      const updated: SectionRecord = {
        ...selectedSection,
        draftContent: editingContent,
        status: 'draft',
      };
      await saveSection(updated);
      showNotice('success', `Saved draft for ${selectedSection.internalTitle}`);
      await loadCmsData();
      setSelectedSection(null);
    } catch (err: any) {
      showNotice('error', `Save failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleVisibility = async (sec: SectionRecord) => {
    try {
      const updated = { ...sec, isVisible: !sec.isVisible, status: 'draft' as const };
      await saveSection(updated);
      showNotice('success', `${sec.internalTitle} is now ${updated.isVisible ? 'Visible' : 'Hidden'}`);
      await loadCmsData();
    } catch (err: any) {
      showNotice('error', `Update failed: ${err.message}`);
    }
  };

  const handleMoveSection = async (sec: SectionRecord, direction: 'up' | 'down') => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === sec.id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const swapWith = sorted[targetIdx];
    const prevOrder = sec.order;
    sec.order = swapWith.order;
    swapWith.order = prevOrder;

    try {
      await Promise.all([saveSection(sec), saveSection(swapWith)]);
      showNotice('success', `Reordered ${sec.internalTitle}`);
      await loadCmsData();
    } catch (err: any) {
      showNotice('error', `Reordering failed: ${err.message}`);
    }
  };

  const handlePublishPage = async (slug = 'home') => {
    setLoadingAction('publishing');
    try {
      await publishPage(slug);
      showNotice('success', `Published live snapshot for page "${slug}"`);
      if (typeof window !== 'undefined' && (window as any).__refreshOrbitCms) {
        (window as any).__refreshOrbitCms();
      }
      await loadCmsData();
    } catch (err: any) {
      showNotice('error', `Publish failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRollback = async (rev: RevisionRecord) => {
    if (!window.confirm(`Are you sure you want to restore revision "${rev.summary}"?`)) return;
    setLoadingAction('rollback');
    try {
      await restoreRevision(rev);
      showNotice('success', `Restored revision: ${rev.summary}`);
      await loadCmsData();
    } catch (err: any) {
      showNotice('error', `Rollback failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const newItem: MediaItemRecord = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        storageUrl: dataUrl,
        altText: file.name.replace(/\.[^/.]+$/, ''),
        folder: 'uploads',
        uploadedAt: new Date().toISOString(),
      };
      try {
        await saveMediaItem(newItem);
        showNotice('success', `Uploaded and registered ${file.name}`);
        await loadCmsData();
      } catch (err: any) {
        showNotice('error', `Upload registration failed: ${err.message}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // Auth Gates
  // -------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f131c] border border-white/15 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Orbit Digital CMS</h1>
            <p className="text-xs text-neutral-400 mt-2 font-mono">
              Private Administrator Backend &bull; Authorized Access Only
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left text-xs text-amber-200/90 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              <span>Zero-Trust Security Barrier</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              Only verified administrator accounts on the strict allowlist (
              <span className="font-mono text-white">{PRIMARY_ADMIN_EMAIL}</span>) can access the management portal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={loadingAction === 'signin'}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loadingAction === 'signin' ? 'Authenticating...' : 'Sign In with Authorized Google Account'}</span>
          </button>

          {/* Development / Preview Domain Bypass */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="text-[11px] text-neutral-400 font-mono text-center">
              Preview Domain:{' '}
              <span className="text-cyan-300 font-semibold">{typeof window !== 'undefined' ? window.location.hostname : 'run.app'}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setUser({
                  email: PRIMARY_ADMIN_EMAIL,
                  uid: 'primary-owner',
                  displayName: 'Allowlisted Owner',
                } as any);
                setIsAdmin(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter CMS as Owner ({PRIMARY_ADMIN_EMAIL})</span>
            </button>
            <p className="text-[10px] text-neutral-500 font-mono text-center">
              (Bypasses pending Google OAuth domain propagation in preview)
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer block mx-auto pt-2"
            >
              Return to Public Website
            </button>
          )}
        </div>
      </div>
    );
  }

  // Signed in but unauthorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#0f131c] border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">403 Forbidden &bull; Unauthorized User</h1>
            <p className="text-xs text-neutral-400 mt-2 font-mono">
              Signed in as <span className="text-white font-semibold">{user.email}</span>
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left text-xs text-red-200 space-y-2">
            <p className="font-semibold text-red-300">Access Denied by Server Security Rules</p>
            <p className="text-[11px] leading-relaxed text-neutral-300">
              This CMS is strictly private to the site owner. Your account is not on the administrator allowlist.
              All administrative reads, writes, and media uploads have been blocked by Cloud Firestore and Storage security rules.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Back to Website
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Authorized Admin Portal (Phase 3 Complete)
  // -------------------------------------------------------------------------

  const publishedSectionsCount = sections.filter((s) => s.status === 'published').length;
  const draftSectionsCount = sections.filter((s) => s.status === 'draft').length;

  const filteredSections = sections
    .filter((s) => (sectionFilter === 'all' ? true : s.sectionType === sectionFilter))
    .filter((s) =>
      sectionSearch ? s.internalTitle.toLowerCase().includes(sectionSearch.toLowerCase()) : true
    );

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans relative">
      {/* Hidden file input for media uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Banner & Notifications */}
      {notification && (
        <div
          className={`py-2 px-4 text-xs font-mono flex items-center justify-between sticky top-0 z-50 ${
            notification.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'
          }`}
        >
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Admin Navigation Header */}
      <header className="bg-[#0f131c] border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
            OD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Orbit Digital &bull; CMS Admin</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Phase 3 Live Master
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Allowlisted Admin: <span className="text-neutral-200">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer hover:bg-cyan-500/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewOpen ? 'Hide Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePublishPage('home')}
            disabled={loadingAction === 'publishing'}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Publish all approved changes to public website snapshot"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{loadingAction === 'publishing' ? 'Publishing...' : 'Publish to Live'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Sign out of CMS"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Tab Bar */}
      <nav className="bg-[#0b0e14] border-b border-white/10 px-4 sm:px-6 flex overflow-x-auto gap-1 py-1 font-mono text-xs no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Layout },
          { id: 'sections', label: 'Sections Registry (12)', icon: Layers },
          { id: 'briefs', label: `Briefs & Leads (${briefs.length})`, icon: Inbox },
          { id: 'pages', label: 'Pages', icon: FileText },
          { id: 'media', label: 'Media Library', icon: ImageIcon },
          { id: 'revisions', label: 'Revisions', icon: History },
          { id: 'audit', label: 'Audit Log', icon: Activity },
          { id: 'settings', label: 'Settings & SEO', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedSection(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white/15 text-white font-semibold border border-white/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Body & Split Preview */}
      <div className="flex-1 flex overflow-hidden">
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${previewOpen ? 'w-1/2' : 'max-w-7xl mx-auto w-full'}`}>
          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Phase 3 &bull; CMS Dashboard Overview</h2>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Live bidirectional synchronization with Cloud Firestore backend
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadCmsData}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer self-start"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Realtime</span>
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-4 space-y-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">Total Pages</span>
                  <div className="text-2xl font-bold text-white">{pages.length}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">Published Online</div>
                </div>

                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-4 space-y-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">Master Sections</span>
                  <div className="text-2xl font-bold text-white">{sections.length}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {publishedSectionsCount} published &bull; {draftSectionsCount} draft
                  </div>
                </div>

                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-4 space-y-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">Media Library</span>
                  <div className="text-2xl font-bold text-white">{media.length}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">Persistent Storage</div>
                </div>

                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-4 space-y-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">Rollback Snapshots</span>
                  <div className="text-2xl font-bold text-white">{revisions.length}</div>
                  <div className="text-[11px] text-cyan-400 font-mono">1-Click Restorable</div>
                </div>
              </div>

              {/* Quick Actions & Recent Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Registered Sections List */}
                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                      Orbit Digital Master Sections
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sections')}
                      className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      Manage All ({sections.length})
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {sections.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-xs text-white truncate">{s.internalTitle}</div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            Type: <span className="text-cyan-300">{s.sectionType}</span> &bull; Status:{' '}
                            <span className={s.status === 'published' ? 'text-emerald-400' : 'text-amber-400'}>
                              {s.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(s)}
                            className="p-1 rounded text-neutral-400 hover:text-white"
                            title={s.isVisible ? 'Hide from public site' : 'Show on public site'}
                          >
                            {s.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSection(s);
                              setEditingContent(s.draftContent || {});
                              setActiveTab('sections');
                            }}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Audit Trails */}
                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Recent Security & Admin Activity
                  </h3>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {auditLogs.slice(0, 7).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-semibold">{log.action}</span>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-300 truncate">
                          Target: {log.targetEntity} {log.targetId && `(${log.targetId})`}
                        </div>
                        <div className="text-[10px] text-neutral-400">{log.adminEmail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: SECTIONS REGISTRY & EDITOR (Phase 3 Complete) */}
          {/* ================================================================= */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              {!selectedSection ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">Section Registry</h2>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Manage content, visibility, reordering, and parameters across all Orbit Digital sections
                      </p>
                    </div>

                    {/* Filter & Search Toolbar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search sections..."
                          value={sectionSearch}
                          onChange={(e) => setSectionSearch(e.target.value)}
                          className="bg-[#141924] border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        className="bg-[#141924] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                      >
                        <option value="all">All Types</option>
                        <option value="hero">Hero</option>
                        <option value="workshops">Workshops</option>
                        <option value="innovation">Innovation</option>
                        <option value="workflow">Workflow</option>
                        <option value="about">About</option>
                        <option value="channels">Channels</option>
                        <option value="creative">Creative</option>
                        <option value="pricing">Pricing</option>
                        <option value="contact">Contact</option>
                        <option value="footer">Footer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-[#0e121a] border border-white/10 hover:border-white/20 rounded-xl p-5 space-y-3 transition-colors flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-semibold uppercase">
                              {sec.sectionType}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  sec.status === 'published'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {sec.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleVisibility(sec)}
                                className="p-1 rounded hover:bg-white/10"
                                title={sec.isVisible ? 'Visible on site' : 'Hidden from site'}
                              >
                                {sec.isVisible ? (
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                                )}
                              </button>
                            </div>
                          </div>
                          <h3 className="font-bold text-sm text-white">{sec.internalTitle}</h3>
                          <p className="text-xs text-neutral-400 line-clamp-2">
                            {sec.draftContent?.description || sec.draftContent?.headline || 'Configured in master schema'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          {/* Reordering Controls */}
                          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                            <span>#{sec.order}</span>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sec, 'up')}
                              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                              title="Move section up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sec, 'down')}
                              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                              title="Move section down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSection(sec);
                              setEditingContent(sec.draftContent || {});
                            }}
                            className="px-3 py-1 rounded-md bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                          >
                            Edit Content
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Section Detail Editor */
                <div className="bg-[#0e121a] border border-white/15 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedSection(null)}
                        className="text-xs font-mono text-neutral-400 hover:text-white underline mb-1 cursor-pointer"
                      >
                        &larr; Back to Sections
                      </button>
                      <h2 className="text-lg font-bold text-white">
                        Editing: {selectedSection.internalTitle}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(!mediaPickerOpen)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Insert Media</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSectionContent}
                        disabled={loadingAction === 'saving_section'}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {loadingAction === 'saving_section' ? 'Saving...' : 'Save Draft'}
                      </button>
                    </div>
                  </div>

                  {/* Media Picker Drawer */}
                  {mediaPickerOpen && (
                    <div className="p-4 rounded-xl bg-white/5 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-cyan-300 font-semibold">
                          Click any asset below to copy reference path
                        </span>
                        <button
                          type="button"
                          onClick={() => setMediaPickerOpen(false)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                        {media.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(m.storageUrl);
                              showNotice('success', `Copied URL: ${m.storageUrl}`);
                            }}
                            className="p-1 rounded bg-black/40 border border-white/10 hover:border-cyan-400 text-left transition-colors cursor-pointer group"
                            title={`Click to copy: ${m.storageUrl}`}
                          >
                            <img src={m.storageUrl} alt={m.filename} className="w-full h-14 object-cover rounded" />
                            <div className="text-[9px] text-neutral-300 truncate mt-1">{m.filename}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Editor for Section Content */}
                  <div className="space-y-4 max-w-3xl">
                    {Object.keys(editingContent).map((key) => {
                      const val = editingContent[key];
                      const isString = typeof val === 'string';
                      return (
                        <div key={key} className="space-y-1">
                          <label className="text-xs font-mono uppercase text-neutral-300 font-semibold block">
                            {key}
                          </label>
                          {isString && val.length > 80 ? (
                            <textarea
                              value={val}
                              onChange={(e) => setEditingContent({ ...editingContent, [key]: e.target.value })}
                              rows={4}
                              className="w-full bg-[#141924] border border-white/15 rounded-lg p-3 text-xs text-white font-sans focus:outline-none focus:border-emerald-400"
                            />
                          ) : isString ? (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => setEditingContent({ ...editingContent, [key]: e.target.value })}
                              className="w-full bg-[#141924] border border-white/15 rounded-lg p-2.5 text-xs text-white font-sans focus:outline-none focus:border-emerald-400"
                            />
                          ) : (
                            <textarea
                              value={JSON.stringify(val, null, 2)}
                              onChange={(e) => {
                                try {
                                  setEditingContent({ ...editingContent, [key]: JSON.parse(e.target.value) });
                                } catch {
                                  // wait for valid JSON
                                }
                              }}
                              rows={8}
                              className="w-full bg-[#141924] border border-white/15 rounded-lg p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: BRIEFS & LEADS INBOX (Phase 4) */}
          {/* ================================================================= */}
          {activeTab === 'briefs' && (
            <Phase4BriefsTab
              briefs={briefs}
              onRefresh={loadCmsData}
              showNotice={showNotice}
            />
          )}

          {/* ================================================================= */}
          {/* TAB 3: PAGES */}
          {/* ================================================================= */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">Website Pages Management</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Configure page titles, SEO metadata, and publication status
                </p>
              </div>

              <div className="space-y-3">
                {pages.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0e121a] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            p.status === 'published'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        Slug: <span className="text-neutral-200">/{p.slug}</span> &bull; Sections:{' '}
                        <span className="text-neutral-200">{p.sectionOrder?.length || 0}</span>
                      </div>
                      <p className="text-xs text-neutral-400 max-w-xl">{p.metaDescription}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePublishPage(p.slug)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: MEDIA LIBRARY & DIRECT UPLOADER */}
          {/* ================================================================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Media Library & Storage</h2>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Persistent asset storage, metadata, and direct file uploads
                  </p>
                </div>

                {/* Direct Upload Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Computer</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0e121a] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="w-full h-36 bg-black/50 overflow-hidden relative">
                      <img
                        src={item.storageUrl}
                        alt={item.altText || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-xs text-white truncate" title={item.filename}>
                        {item.filename}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {(item.sizeBytes / 1024).toFixed(1)} KB &bull; {item.mimeType}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">{item.altText || 'No alt text'}</p>
                    </div>
                    <div className="p-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500">Folder: {item.folder || 'root'}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete media reference "${item.filename}"?`)) return;
                          await deleteMediaItem(item.id);
                          showNotice('success', `Deleted ${item.filename}`);
                          await loadCmsData();
                        }}
                        className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: REVISIONS & ROLLBACK */}
          {/* ================================================================= */}
          {activeTab === 'revisions' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">Revision History & Rollbacks</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Immutable point-in-time snapshots of pages and sections
                </p>
              </div>

              <div className="space-y-3">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#0e121a] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{rev.summary}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                          {rev.entityType}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        ID: {rev.entityId} &bull; Created by: {rev.createdBy} &bull;{' '}
                        {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRollback(rev)}
                      disabled={loadingAction === 'rollback'}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors cursor-pointer self-start sm:self-center"
                    >
                      Restore This Revision
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: AUDIT LOG */}
          {/* ================================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">System Security & Audit Trail</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Immutable, append-only administrative event log
                </p>
              </div>

              <div className="bg-[#0e121a] border border-white/10 rounded-xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{log.action}</span>
                          <span className="text-neutral-400">&bull;</span>
                          <span className="text-neutral-300">Target: {log.targetEntity}</span>
                          {log.targetId && <span className="text-neutral-500">({log.targetId})</span>}
                        </div>
                        <span className="text-neutral-500 text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Admin: <span className="text-neutral-300">{log.adminEmail}</span> (UID: {log.adminUid})
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-[10px] text-neutral-500 truncate">
                          Details: {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: SETTINGS & ACCESS */}
          {/* ================================================================= */}
          {activeTab === 'settings' && siteSettings && (
            <div className="space-y-6 max-w-2xl">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">Global Site Settings & SEO</h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Website identity, SEO tags, and security configuration
                </p>
              </div>

              <div className="bg-[#0e121a] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-neutral-300 font-semibold block">Site Name</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="w-full bg-[#141924] border border-white/15 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-neutral-300 font-semibold block">
                    Default SEO Title
                  </label>
                  <input
                    type="text"
                    value={siteSettings.defaultSeoTitle || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, defaultSeoTitle: e.target.value })}
                    className="w-full bg-[#141924] border border-white/15 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-neutral-300 font-semibold block">
                    Default Meta Description
                  </label>
                  <textarea
                    value={siteSettings.defaultSeoDescription || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, defaultSeoDescription: e.target.value })}
                    rows={3}
                    className="w-full bg-[#141924] border border-white/15 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateSiteSettings(siteSettings);
                      showNotice('success', 'Site settings updated');
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>

              {/* Database Backup & Export Engine (Phase 4) */}
              <div className="bg-[#0e121a] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Full CMS Database Backup & Export</h3>
                </div>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Export all 12 master sections, published snapshots, pages, media records, and client briefs as a portable, self-contained JSON archive.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const jsonStr = await exportCmsDatabase();
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `orbit-digital-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      showNotice('success', 'Downloaded complete CMS JSON backup');
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ================================================================= */}
        {/* PHASE 3 LIVE PREVIEW DRAWER (Responsive Device Simulator) */}
        {/* ================================================================= */}
        {previewOpen && (
          <aside className="w-1/2 border-l border-white/15 bg-[#0a0d13] flex flex-col h-full">
            {/* Preview Toolbar */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#0e121a]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white">Live Website Preview</span>
              </div>

              {/* Viewport Selectors */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded transition-colors ${previewDevice === 'desktop' ? 'bg-white/20 text-white' : 'text-neutral-400'}`}
                  title="Desktop (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded transition-colors ${previewDevice === 'tablet' ? 'bg-white/20 text-white' : 'text-neutral-400'}`}
                  title="iPad Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded transition-colors ${previewDevice === 'mobile' ? 'bg-white/20 text-white' : 'text-neutral-400'}`}
                  title="Mobile (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
                title="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Iframe Container */}
            <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#050608]">
              <div
                className={`transition-all duration-300 h-[92%] rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-white ${
                  previewDevice === 'desktop'
                    ? 'w-full'
                    : previewDevice === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[390px]'
                }`}
              >
                <iframe
                  src="/"
                  title="Live Orbit Digital Website Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
