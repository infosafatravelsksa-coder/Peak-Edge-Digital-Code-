import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, PRIMARY_ADMIN_EMAIL } from '../firebase/config';
import {
  isCurrentUserAdmin,
  getPages,
  savePage,
  deletePage,
  getSections,
  saveSection,
  deleteSection,
  publishPage,
  getMediaLibrary,
  saveMediaItem,
  deleteMediaItem,
  getSiteSettings,
  updateSiteSettings,
  getBriefSubmissions,
  seedInitialCmsData,
  exportCmsDatabase,
  getPosts,
  savePost,
  deletePost,
  getMenuTemplates,
  saveMenuTemplate,
  getRedirects,
  saveRedirect,
  deleteRedirect,
  getSitemapConfig,
  saveSitemapConfig,
  getRobotsConfig,
  saveRobotsConfig,
} from '../services/cmsService';
import {
  PageRecord,
  SectionRecord,
  MediaItemRecord,
  SiteSettingsRecord,
  BriefSubmissionRecord,
  PostRecord,
  MenuTemplateRecord,
  RedirectRecord,
  SitemapConfigRecord,
  RobotsConfigRecord,
} from '../types/cms';
import { Sidebar, MainNavId, ContentSubNav, SettingsSubNav } from './Sidebar';
import { TopNav } from './TopNav';
import { DashboardView } from './DashboardView';
import { PagesView } from './PagesView';
import { PostsView } from './PostsView';
import { MediaView } from './MediaView';
import { MenusView } from './MenusView';
import { SectionsView } from './SectionsView';
import { SettingsView } from './SettingsView';
import { Phase4BriefsTab } from './Phase4BriefsTab';
import {
  Eye,
  Code2,
  Type,
  Menu as MenuIcon,
  Image as ImageIcon,
  Upload,
  Save,
  Check,
  RotateCcw,
  X,
  Layers,
  Palette,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Columns,
  Maximize2,
  Minimize2,
  Zap,
  Radio,
  FileCheck,
  HelpCircle,
  Copy,
  Sliders,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose?: () => void;
  onDockModeChange?: (mode: 'split' | 'modal') => void;
  isStandalone?: boolean;
}

// Available fonts for custom styling
const FONT_OPTIONS = [
  { id: 'Plus Jakarta Sans, sans-serif', label: 'Plus Jakarta Sans (Modern UI)' },
  { id: 'Inter, sans-serif', label: 'Inter (Clean Tech)' },
  { id: 'DM Sans, sans-serif', label: 'DM Sans (Geometric Editorial)' },
  { id: 'Outfit, sans-serif', label: 'Outfit (Contemporary Bold)' },
  { id: 'Syne, sans-serif', label: 'Syne (Agency & Creative)' },
  { id: 'JetBrains Mono, monospace', label: 'JetBrains Mono (Developer / Minimal)' },
  { id: 'Playfair Display, serif', label: 'Playfair Display (Luxury Serif)' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onDockModeChange,
  isStandalone = false,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Active full-cms navigation
  const [activeNav, setActiveNav] = useState<MainNavId>('dashboard');
  const [contentSubNav, setContentSubNav] = useState<ContentSubNav>('pages');
  const [settingsSubNav, setSettingsSubNav] = useState<SettingsSubNav>('sitemap');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Section Studio Modal state
  const [isSectionStudioOpen, setIsSectionStudioOpen] = useState<boolean>(false);
  const [dockMode, setDockMode] = useState<'split' | 'modal'>('split');
  const [studioTab, setStudioTab] = useState<'content' | 'code'>('content');

  // Real-time Preview & Temporary State for Section Studio
  const [liveAutoSync, setLiveAutoSync] = useState<boolean>(true);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [previewPulse, setPreviewPulse] = useState<boolean>(false);

  // Application Data States
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-workshops');
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [media, setMedia] = useState<MediaItemRecord[]>([]);
  const [briefs, setBriefs] = useState<BriefSubmissionRecord[]>([]);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [menus, setMenus] = useState<MenuTemplateRecord[]>([]);
  const [redirects, setRedirects] = useState<RedirectRecord[]>([]);
  const [sitemapConfig, setSitemapConfig] = useState<SitemapConfigRecord>({
    mode: 'auto',
    sitemapUrl: 'https://yoursite.com/sitemap.xml',
    lastGenerated: 'Today, 09:12 · 40 URLs',
    urlsCount: 40,
    includePages: true,
    includePosts: true,
    includeMedia: false,
    includeDrafts: false,
  });
  const [robotsConfig, setRobotsConfig] = useState<RobotsConfigRecord>({
    mode: 'auto',
    content: 'User-agent: *\nAllow: /\nSitemap: https://yoursite.com/sitemap.xml',
    isValid: true,
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRecord>({
    siteName: 'Orbit Digital',
    defaultSeoTitle: 'Orbit Digital — Full-Service Growth & Marketing Agency',
    defaultSeoDescription: 'Orbit Digital is a full-service digital marketing agency.',
    maintenanceMode: false,
  });

  // Section Studio Form Fields
  const [sectionName, setSectionName] = useState<string>('Maintenance Infrastructure');
  const [headline, setHeadline] = useState<string>('Maintenance Infrastructure & Workshops');
  const [subtext, setSubtext] = useState<string>('At our company, maintenance is not just an operational function, it is a strategic commitment to safety and equipment reliability.');
  const [buttonText, setButtonText] = useState<string>('Schedule Facility Inspection');
  const [buttonUrl, setButtonUrl] = useState<string>('#contact');
  const [imageUrl, setImageUrl] = useState<string>('assets/workshops/tab1_technicians_full.jpg');
  const [imageAlt, setImageAlt] = useState<string>('Certified technicians performing heavy machinery maintenance in industrial facility');
  const [imageCaption, setImageCaption] = useState<string>('Heavy equipment diagnostic bay');
  const [customTailwind, setCustomTailwind] = useState<string>('');
  const [customCss, setCustomCss] = useState<string>('/* Custom CSS Overrides */');
  const [bgColor, setBgColor] = useState<string>('#06070a');
  const [fontFamily, setFontFamily] = useState<string>('Plus Jakarta Sans, sans-serif');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [spacing, setSpacing] = useState<string>('Normal');
  const [customHtml, setCustomHtml] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const adminCheck = await isCurrentUserAdmin();
        setIsAdmin(adminCheck || currentUser.email === PRIMARY_ADMIN_EMAIL);
      } else {
        setIsAdmin(true); // Development owner bypass for instant access
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Initial Data Load
  const loadCmsData = async () => {
    try {
      await seedInitialCmsData();
      const [secList, pageList, mediaList, briefsList, postList, menuList, redList, sitemap, robots, cfg] =
        await Promise.all([
          getSections(),
          getPages(),
          getMediaLibrary(),
          getBriefSubmissions(),
          getPosts(),
          getMenuTemplates(),
          getRedirects(),
          getSitemapConfig(),
          getRobotsConfig(),
          getSiteSettings(),
        ]);

      setSections(secList || []);
      setPages(pageList || []);
      setMedia(mediaList || []);
      setBriefs(briefsList || []);
      setPosts(postList || []);
      setMenus(menuList || []);
      setRedirects(redList || []);
      if (sitemap) setSitemapConfig(sitemap);
      if (robots) setRobotsConfig(robots);
      if (cfg) setSiteSettings(cfg);
    } catch (err: any) {
      console.warn('CMS data load note:', err);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  // Section synchronization into studio form
  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const loadSectionToForm = (sec: SectionRecord) => {
    setSelectedSectionId(sec.id);
    setSectionName(sec.internalTitle.replace(/^S\.\d+\s*/, ''));
    setHeadline(sec.draftContent?.headline || sec.internalTitle.replace(/^S\.\d+\s*/, ''));
    setSubtext(sec.draftContent?.description || sec.draftContent?.subtext || '');
    setButtonText(sec.draftContent?.primaryCtaText || sec.draftContent?.buttonText || 'Learn More');
    setButtonUrl(sec.draftContent?.buttonUrl || '#contact');
    setImageUrl(sec.draftContent?.image || sec.thumbnailUrl || '');
    setImageAlt(sec.draftContent?.imageAlt || sec.internalTitle);
    setImageCaption(sec.draftContent?.caption || '');
    setCustomTailwind(sec.designSettings?.customTailwindClasses || '');
    setCustomCss(sec.designSettings?.customCss || '');
    setBgColor(sec.designSettings?.backgroundColor || '#06070a');
    setFontFamily(sec.designSettings?.fontFamily || 'Plus Jakarta Sans, sans-serif');
    setTextAlign((sec.designSettings?.textAlign as any) || 'left');
    setSpacing(sec.designSettings?.paddingY || 'Normal');
    setCustomHtml(sec.draftContent?.customHtml || '');
    setIsDirty(false);
  };

  useEffect(() => {
    if (currentSection) {
      loadSectionToForm(currentSection);
    }
  }, [selectedSectionId, sections.length]);

  // Construct Temporary State Object for zero-refresh live sync
  const buildTemporaryStateObject = (): SectionRecord => {
    return {
      ...(currentSection || ({} as SectionRecord)),
      id: selectedSectionId,
      internalTitle: sectionName,
      draftContent: {
        ...(currentSection?.draftContent || {}),
        headline,
        description: subtext,
        subtext,
        buttonText,
        primaryCtaText: buttonText,
        buttonUrl,
        image: imageUrl,
        imageAlt,
        caption: imageCaption,
        customHtml,
      },
      designSettings: {
        ...(currentSection?.designSettings || {}),
        backgroundColor: bgColor,
        fontFamily,
        textAlign,
        paddingY: spacing,
        customTailwindClasses: customTailwind,
        customCss,
      },
      thumbnailUrl: imageUrl,
    };
  };

  const applyTemporaryPreview = (pulse = false) => {
    if (typeof window === 'undefined') return;
    const temporaryState = buildTemporaryStateObject();

    if ((window as any).__orbitApplyTemporaryPreview) {
      (window as any).__orbitApplyTemporaryPreview(temporaryState, selectedSectionId);
    }

    setIsPreviewActive(true);
    if (pulse) {
      setPreviewPulse(true);
      setTimeout(() => setPreviewPulse(false), 800);
      showNotice('success', `Live temporary state synced for "${sectionName}"`);
    }
  };

  const handleFieldChange = (setter: (v: any) => void, val: any) => {
    setter(val);
    setIsDirty(true);
    if (liveAutoSync) {
      setTimeout(() => applyTemporaryPreview(false), 50);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showNotice('error', 'File size exceeds 50MB security constraint');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      handleFieldChange(setImageUrl, dataUrl);
      showNotice('success', `Uploaded ${file.name} successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      const temporaryState = buildTemporaryStateObject();
      const updatedSec: SectionRecord = {
        ...temporaryState,
        status: 'published',
        updatedAt: new Date().toISOString(),
      };

      await saveSection(updatedSec);
      setSections((prev) => prev.map((s) => (s.id === updatedSec.id ? updatedSec : s)));
      setIsDirty(false);

      await publishPage('home');
      if (typeof window !== 'undefined' && (window as any).__refreshOrbitCms) {
        (window as any).__refreshOrbitCms();
      }

      showNotice('success', `Saved & published changes for "${sectionName}" across the site!`);
    } catch (err: any) {
      showNotice('error', `Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardPreview = () => {
    if (currentSection) {
      loadSectionToForm(currentSection);
      if (typeof window !== 'undefined' && (window as any).__orbitApplyTemporaryPreview) {
        (window as any).__orbitApplyTemporaryPreview(currentSection, currentSection.id);
      }
      setIsPreviewActive(false);
      showNotice('success', `Reverted preview changes for "${currentSection.internalTitle}"`);
    }
  };

  // Section direct save
  const handleSaveSectionDirect = async (sec: SectionRecord) => {
    try {
      await saveSection(sec);
      setSections((prev) => prev.map((s) => (s.id === sec.id ? sec : s)));
      showNotice('success', `Section "${sec.internalTitle}" saved successfully!`);
    } catch (err: any) {
      showNotice('error', `Failed to save section: ${err?.message || 'Unknown error'}`);
    }
  };

  const handlePublishAll = async () => {
    try {
      await publishPage('home');
      if (typeof window !== 'undefined' && (window as any).__refreshOrbitCms) {
        (window as any).__refreshOrbitCms();
      }
      showNotice('success', 'All pages and sections published live!');
    } catch (err: any) {
      showNotice('error', `Publish failed: ${err?.message || 'Unknown error'}`);
    }
  };

  // Media Handlers
  const handleSaveMediaItemDirect = async (item: MediaItemRecord) => {
    try {
      await saveMediaItem(item);
      setMedia((prev) => prev.map((m) => (m.id === item.id ? item : m)));
      showNotice('success', `Media asset "${item.title || item.filename}" saved!`);
    } catch (err: any) {
      showNotice('error', `Failed to save media: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteMediaDirect = async (mediaId: string) => {
    try {
      await deleteMediaItem(mediaId);
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      showNotice('success', 'Media asset permanently deleted');
    } catch (err: any) {
      showNotice('error', `Delete failed: ${err?.message || 'Unknown error'}`);
    }
  };

  // Menu Save
  const handleSaveMenu = async (menu: MenuTemplateRecord) => {
    try {
      await saveMenuTemplate(menu);
      setMenus((prev) => {
        const idx = prev.findIndex((m) => m.id === menu.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = menu;
          return updated;
        }
        return [...prev, menu];
      });
      window.dispatchEvent(new CustomEvent('orbit-cms-menu-update', { detail: menu }));
      showNotice('success', `Menu "${menu.name}" updated & live synced across app!`);
    } catch (err: any) {
      showNotice('error', `Failed to save menu: ${err?.message || 'Unknown error'}`);
    }
  };

  // Auth Handlers
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
    setUser(null);
  };

  // Breadcrumb Title Helper
  const getBreadcrumbTitle = (): string => {
    if (activeNav === 'dashboard') return 'Dashboard';
    if (activeNav === 'menus') return 'Menus';
    if (activeNav === 'sections') return 'Sections';
    if (activeNav === 'briefs') return 'Client Briefs';
    if (activeNav === 'content') {
      if (contentSubNav === 'pages') return 'Content / Pages';
      if (contentSubNav === 'posts') return 'Content / Posts';
      if (contentSubNav === 'media') return 'Content / Media';
      return 'Content';
    }
    if (activeNav === 'settings') {
      if (settingsSubNav === 'sitemap') return 'Settings / Sitemap';
      if (settingsSubNav === 'robots') return 'Settings / Robots.txt';
      if (settingsSubNav === 'redirects') return 'Settings / Redirects';
      if (settingsSubNav === 'general') return 'Settings / General & Backups';
      return 'Settings';
    }
    return 'Dashboard';
  };

  // Unauthenticated screen
  if (!isAdmin && !authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Orbit CMS Admin</h1>
            <p className="text-xs text-slate-500 mt-1">Authorized Owner Access Required</p>
          </div>
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Authorized Google Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true);
              setUser({ email: PRIMARY_ADMIN_EMAIL, uid: 'dev-owner' } as any);
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Enter CMS as Owner ({PRIMARY_ADMIN_EMAIL})
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 underline">
              Return to Website
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN COMPLETE ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex bg-white font-sans text-slate-900 antialiased overflow-hidden select-none">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-6 z-100 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/30'
              : 'bg-red-600 text-white border-red-700 shadow-red-900/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. LEFT SIDEBAR (Matching cms-01 to cms-13) */}
      <Sidebar
        activeNav={activeNav}
        contentSubNav={contentSubNav}
        settingsSubNav={settingsSubNav}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          setIsSectionStudioOpen(false);
        }}
        onSelectContentSubNav={(sub) => {
          setActiveNav('content');
          setContentSubNav(sub);
          setIsSectionStudioOpen(false);
        }}
        onSelectSettingsSubNav={(sub) => {
          setActiveNav('settings');
          setSettingsSubNav(sub);
          setIsSectionStudioOpen(false);
        }}
        userName="Ayesha K."
        userRole="Owner"
        onSignOut={handleSignOut}
        briefsCount={briefs.length}
      />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-slate-50/50">
        {/* Top bar */}
        <div className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">{getBreadcrumbTitle()}</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
              Live &bull; 60 FPS
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Live Section Studio Button */}
            <button
              type="button"
              onClick={() => setIsSectionStudioOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
              title="Open the real-time visual section studio"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Section Studio</span>
            </button>

            {/* View Site / Close */}
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                else window.open('/', '_blank');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Site</span>
            </button>
          </div>
        </div>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto">
          {activeNav === 'dashboard' && (
            <DashboardView
              pages={pages}
              sections={sections}
              posts={posts}
              briefs={briefs}
              media={media}
              onViewSite={() => {
                if (onClose) onClose();
                else window.open('/', '_blank');
              }}
              onNewPage={() => {
                setActiveNav('content');
                setContentSubNav('pages');
              }}
              onNewPost={() => {
                setActiveNav('content');
                setContentSubNav('posts');
              }}
              onUploadMedia={() => {
                setActiveNav('content');
                setContentSubNav('media');
              }}
              onNavigateTab={(tab, sub) => {
                setActiveNav(tab as any);
                if (sub) {
                  if (tab === 'content') setContentSubNav(sub as any);
                  if (tab === 'settings') setSettingsSubNav(sub as any);
                }
              }}
            />
          )}

          {activeNav === 'content' && contentSubNav === 'pages' && (
            <PagesView
              pages={pages}
              allSections={sections}
              onSavePage={async (page) => {
                await savePage(page);
                setPages((prev) => prev.map((p) => (p.id === page.id ? page : p)));
                showNotice('success', `Saved page "${page.title}"`);
              }}
              onDeletePage={async (pageId) => {
                await deletePage(pageId);
                setPages((prev) => prev.filter((p) => p.id !== pageId));
                showNotice('success', 'Page deleted successfully');
              }}
              onNavigateSubNav={setContentSubNav}
              showNotice={showNotice}
            />
          )}

          {activeNav === 'content' && contentSubNav === 'posts' && (
            <PostsView
              posts={posts}
              onSavePost={async (post) => {
                await savePost(post);
                setPosts((prev) => {
                  const idx = prev.findIndex((p) => p.id === post.id);
                  if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = post;
                    return copy;
                  }
                  return [post, ...prev];
                });
                showNotice('success', `Saved post "${post.title}"`);
              }}
              onDeletePost={async (postId) => {
                await deletePost(postId);
                setPosts((prev) => prev.filter((p) => p.id !== postId));
                showNotice('success', 'Post removed');
              }}
              onNavigateSubNav={setContentSubNav}
              showNotice={showNotice}
            />
          )}

          {activeNav === 'content' && contentSubNav === 'media' && (
            <MediaView
              media={media}
              onUploadMedia={handleImageFileUpload}
              onSaveMediaItem={handleSaveMediaItemDirect}
              onDeleteMedia={handleDeleteMediaDirect}
              onNavigateSubNav={setContentSubNav}
              showNotice={showNotice}
            />
          )}

          {activeNav === 'menus' && (
            <MenusView
              menus={menus}
              onSaveMenu={handleSaveMenu}
              showNotice={showNotice}
            />
          )}

          {activeNav === 'sections' && (
            <SectionsView
              sections={sections}
              pages={pages}
              media={media}
              onSaveSection={handleSaveSectionDirect}
              onReorderSections={async (reordered) => {
                setSections(reordered);
                for (let i = 0; i < reordered.length; i++) {
                  await saveSection({ ...reordered[i], order: i });
                }
                showNotice('success', 'Section order updated!');
              }}
              onPublishAll={handlePublishAll}
              onTogglePreview={() => setIsSectionStudioOpen(true)}
              showNotice={showNotice}
            />
          )}

          {activeNav === 'settings' && (
            <SettingsView
              subTab={settingsSubNav}
              onSelectSubTab={setSettingsSubNav}
              sitemapConfig={sitemapConfig}
              onSaveSitemap={async (cfg) => {
                await saveSitemapConfig(cfg);
                setSitemapConfig(cfg);
                showNotice('success', 'Sitemap configuration updated');
              }}
              robotsConfig={robotsConfig}
              onSaveRobots={async (cfg) => {
                await saveRobotsConfig(cfg);
                setRobotsConfig(cfg);
                showNotice('success', 'Robots.txt updated');
              }}
              redirects={redirects}
              onSaveRedirect={async (r) => {
                await saveRedirect(r);
                setRedirects((prev) => {
                  const idx = prev.findIndex((red) => red.id === r.id);
                  if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = r;
                    return copy;
                  }
                  return [r, ...prev];
                });
                showNotice('success', `Saved redirect ${r.from} -> ${r.to}`);
              }}
              onDeleteRedirect={async (id) => {
                await deleteRedirect(id);
                setRedirects((prev) => prev.filter((r) => r.id !== id));
                showNotice('success', 'Redirect deleted');
              }}
              siteSettings={siteSettings}
              onSaveSiteSettings={async (s) => {
                await updateSiteSettings(s);
                setSiteSettings(s);
                showNotice('success', 'General site settings updated');
              }}
              onExportDatabase={async () => {
                const json = await exportCmsDatabase();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orbit-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showNotice('success', 'CMS Database export downloaded successfully!');
              }}
              showNotice={showNotice}
            />
          )}

          {activeNav === 'briefs' && (
            <div className="p-8 max-w-7xl mx-auto">
              <Phase4BriefsTab
                briefs={briefs}
                onRefresh={loadCmsData}
                showNotice={showNotice}
              />
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. SECTION STUDIO MODAL / SPLIT DRAWER                             */}
      {/* =================================================================== */}
      {isSectionStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto pointer-events-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-2xl w-full max-w-5xl max-h-[92vh] h-[860px]">
            {/* Header */}
            <header className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-600/30 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs tracking-tight text-slate-900">SECTION STUDIO</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-100 text-indigo-700 font-bold shrink-0">
                      LIVE SYNC
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Editing:</span>
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="bg-white border border-slate-300 focus:border-indigo-500 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 outline-none cursor-pointer max-w-[210px] truncate shadow-2xs"
                    >
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.internalTitle.replace(/^S\.\d+\s*/, '')} {s.sectionType === 'custom' ? '(Custom Code)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Studio Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setStudioTab('content')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    studioTab === 'content' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudioTab('code')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    studioTab === 'code' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code Overrides</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyTemporaryPreview(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm ${
                    previewPulse ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPublish}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Publish'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSectionStudioOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Studio Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {studioTab === 'content' && (
                <div className="space-y-5 max-w-3xl mx-auto">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Section Internal Title</label>
                    <input
                      type="text"
                      value={sectionName}
                      onChange={(e) => handleFieldChange(setSectionName, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Section Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => handleFieldChange(setHeadline, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Description / Subtext</label>
                    <textarea
                      rows={3}
                      value={subtext}
                      onChange={(e) => handleFieldChange(setSubtext, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none leading-relaxed"
                    />
                  </div>

                  {/* Image Row */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Section Image</label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={handleImageFileUpload}
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-200 overflow-hidden shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => handleFieldChange(setImageUrl, e.target.value)}
                        placeholder="Image URL (e.g. assets/workshops/tab1.jpg)"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* CTA Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">Button Text</label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => handleFieldChange(setButtonText, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">Button URL</label>
                      <input
                        type="text"
                        value={buttonUrl}
                        onChange={(e) => handleFieldChange(setButtonUrl, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {studioTab === 'code' && (
                <div className="space-y-5 max-w-3xl mx-auto">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Custom Tailwind Classes</label>
                    <input
                      type="text"
                      value={customTailwind}
                      onChange={(e) => handleFieldChange(setCustomTailwind, e.target.value)}
                      placeholder="e.g. bg-slate-950 border-b border-indigo-500/20 py-16"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Custom CSS Stylesheet</label>
                    <textarea
                      rows={6}
                      value={customCss}
                      onChange={(e) => handleFieldChange(setCustomCss, e.target.value)}
                      className="w-full bg-[#0d1117] text-emerald-400 font-mono border border-slate-800 rounded-xl p-3 text-xs leading-relaxed outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Background Color</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => handleFieldChange(setBgColor, e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer bg-white border border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => handleFieldChange(setFontFamily, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Vertical Spacing</label>
                      <select
                        value={spacing}
                        onChange={(e) => handleFieldChange(setSpacing, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                      >
                        <option value="Compact">Compact (py-8)</option>
                        <option value="Normal">Normal (py-12)</option>
                        <option value="Large">Large (py-16)</option>
                        <option value="XLarge">Extra Large (py-24)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Studio Footer */}
            <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleDiscardPreview}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                Discard Temporary Preview
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSectionStudioOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close Studio
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPublish}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
