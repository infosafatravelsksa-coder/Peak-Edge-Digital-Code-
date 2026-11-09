import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, PRIMARY_ADMIN_EMAIL } from '../firebase/config';
import { syncMediaToGoogleSchema } from './seoMediaHelper';
import {
  AdminAllowlistRecord,
  SiteSettingsRecord,
  PageRecord,
  SectionRecord,
  PublishedContentRecord,
  MediaItemRecord,
  RevisionRecord,
  AuditLogRecord,
  BriefSubmissionRecord,
  PostRecord,
  MenuTemplateRecord,
  RedirectRecord,
  SitemapConfigRecord,
  RobotsConfigRecord,
} from '../types/cms';

// ---------------------------------------------------------------------------
// 1. Authorization Verification
// ---------------------------------------------------------------------------

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || !user.email) return false;

  // Primary administrator allowlist check
  if (user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  // Check Firestore adminAllowlist collection
  try {
    const adminDoc = await getDoc(doc(db, 'adminAllowlist', user.uid));
    if (adminDoc.exists() && adminDoc.data()?.status === 'active') {
      return true;
    }
  } catch {
    // If permission denied or missing, user is not admin
  }
  return false;
}

export async function getAdminAllowlist(): Promise<AdminAllowlistRecord[]> {
  const path = 'adminAllowlist';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ ...(d.data() as AdminAllowlistRecord), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// ---------------------------------------------------------------------------
// 2. Audit Logging
// ---------------------------------------------------------------------------

export async function logAdminAction(
  action: string,
  targetEntity: string,
  targetId?: string,
  details?: Record<string, any>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `auditLogs/${logId}`;
  const logRecord: AuditLogRecord = {
    id: logId,
    action,
    targetEntity,
    targetId: targetId || '',
    details: details || {},
    adminEmail: user.email || '',
    adminUid: user.uid,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'auditLogs', logId), logRecord);
  } catch (err) {
    console.warn('Audit logging warning:', err);
  }
}

export async function getAuditLogs(maxCount = 50): Promise<AuditLogRecord[]> {
  const path = 'auditLogs';
  try {
    const snap = await getDocs(collection(db, path));
    const logs = snap.docs.map((d) => ({ ...(d.data() as AuditLogRecord), id: d.id }));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, maxCount);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// ---------------------------------------------------------------------------
// 3. Site Settings
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
  const path = 'siteSettings/general';
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'general'));
    if (!snap.exists()) {
      return {
        id: 'general',
        siteName: 'Orbit Digital',
        defaultSeoTitle: 'Orbit Digital - Full-Service Growth & Marketing Agency',
        defaultSeoDescription:
          'Engineering growth engines across strategy, creative, search, media, and performance for ambitious global brands.',
        maintenanceMode: false,
      };
    }
    return { ...(snap.data() as SiteSettingsRecord), id: snap.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettingsRecord>): Promise<void> {
  const path = 'siteSettings/general';
  const user = auth.currentUser;
  try {
    await setDoc(
      doc(db, 'siteSettings', 'general'),
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'admin',
      },
      { merge: true }
    );
    await logAdminAction('update_settings', 'siteSettings', 'general', settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ---------------------------------------------------------------------------
// 4. Page Management
// ---------------------------------------------------------------------------

export async function getPages(): Promise<PageRecord[]> {
  const path = 'pages';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ ...(d.data() as PageRecord), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getPage(pageId: string): Promise<PageRecord | null> {
  const path = `pages/${pageId}`;
  try {
    const snap = await getDoc(doc(db, 'pages', pageId));
    if (!snap.exists()) return null;
    return { ...(snap.data() as PageRecord), id: snap.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function savePage(page: PageRecord): Promise<void> {
  const path = `pages/${page.id}`;
  const user = auth.currentUser;
  try {
    await setDoc(doc(db, 'pages', page.id), {
      ...page,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'admin',
    });
    await logAdminAction('save_page', 'page', page.id, { slug: page.slug, status: page.status });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deletePage(pageId: string): Promise<void> {
  const path = `pages/${pageId}`;
  try {
    await deleteDoc(doc(db, 'pages', pageId));
    await logAdminAction('delete_page', 'page', pageId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// 5. Section Management
// ---------------------------------------------------------------------------

export async function getSections(pageId?: string): Promise<SectionRecord[]> {
  const path = 'sections';
  try {
    const snap = await getDocs(collection(db, path));
    let sections = snap.docs.map((d) => ({ ...(d.data() as SectionRecord), id: d.id }));
    if (pageId) {
      sections = sections.filter((s) => s.pageId === pageId);
    }
    return sections.sort((a, b) => a.order - b.order);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getSection(sectionId: string): Promise<SectionRecord | null> {
  const path = `sections/${sectionId}`;
  try {
    const snap = await getDoc(doc(db, 'sections', sectionId));
    if (!snap.exists()) return null;
    return { ...(snap.data() as SectionRecord), id: snap.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveSection(section: SectionRecord): Promise<void> {
  const path = `sections/${section.id}`;
  const user = auth.currentUser;
  try {
    await setDoc(doc(db, 'sections', section.id), {
      ...section,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'admin',
    });
    await createRevision('section', section.id, `Saved section ${section.internalTitle}`, section);
    await logAdminAction('save_section', 'section', section.id, {
      type: section.sectionType,
      status: section.status,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSection(sectionId: string): Promise<void> {
  const path = `sections/${sectionId}`;
  try {
    await deleteDoc(doc(db, 'sections', sectionId));
    await logAdminAction('delete_section', 'section', sectionId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// 6. Draft-to-Publish Workflow
// ---------------------------------------------------------------------------

export async function publishPage(pageSlug: string): Promise<void> {
  const user = auth.currentUser;
  const pages = await getPages();
  const page = pages.find((p) => p.slug === pageSlug) || pages[0];
  if (!page) throw new Error(`Page slug "${pageSlug}" not found to publish.`);

  const allSections = await getSections(page.id);
  const sectionsMap: Record<string, any> = {};

  allSections.forEach((s) => {
    if (s.isVisible) {
      sectionsMap[s.id] = {
        sectionType: s.sectionType,
        internalTitle: s.internalTitle,
        order: s.order,
        content: s.draftContent,
        design: s.designSettings,
        mediaRefs: s.mediaRefs,
      };
    }
  });

  const publishedRecord: PublishedContentRecord = {
    id: pageSlug,
    pageSlug: page.slug,
    pageTitle: page.title,
    metaDescription: page.metaDescription,
    version: Date.now(),
    publishedAt: new Date().toISOString(),
    publishedBy: user?.email || 'admin',
    sections: sectionsMap,
  };

  const path = `publishedContent/${pageSlug}`;
  try {
    // Write published snapshot for public consumption
    await setDoc(doc(db, 'publishedContent', pageSlug), publishedRecord);
    // Update page state to published
    await updateDoc(doc(db, 'pages', page.id), {
      status: 'published',
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'admin',
    });
    // Create revision snapshot
    await createRevision('page', page.id, `Published version ${publishedRecord.version}`, publishedRecord);
    await logAdminAction('publish_page', 'page', page.id, { slug: pageSlug, version: publishedRecord.version });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getPublishedContent(pageSlug = 'home'): Promise<PublishedContentRecord | null> {
  const path = `publishedContent/${pageSlug}`;
  try {
    const snap = await getDoc(doc(db, 'publishedContent', pageSlug));
    if (!snap.exists()) return null;
    return { ...(snap.data() as PublishedContentRecord), id: snap.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// ---------------------------------------------------------------------------
// 7. Media Library & Google Search Asset Registry
// ---------------------------------------------------------------------------

export const DEFAULT_MEDIA_ITEMS: MediaItemRecord[] = [
  // 1. IMAGES (cms-05-media-images.png)
  {
    id: 'img-1',
    filename: 'campaign-hero.jpg',
    originalName: 'campaign-hero.jpg',
    title: 'Orbit Digital Brand Campaign Hero',
    altText: 'Team working on digital marketing strategy and analytics in modern creative studio',
    caption: 'Global brand campaign flagship imagery',
    description: 'High-impact hero visual used on Home and Services pages for ambitious brand elevation.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 122880, // 120 KB
    storageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop',
    dimensions: { width: 1920, height: 1080 },
    usedBySections: ['hero', 'proven'],
    uploadedAt: '2026-10-24T10:14:00Z',
  },
  {
    id: 'img-2',
    filename: 'campaign-motion.jpg',
    originalName: 'campaign-motion.jpg',
    title: 'Motion Graphics & 3D Visuals',
    altText: '3D abstract futuristic geometric rendering with vivid neon gradients',
    caption: 'Creative motion showcase banner',
    description: 'Dynamic visual asset highlighting Orbit Digital creative direction.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 140288, // 137 KB
    storageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop',
    dimensions: { width: 1440, height: 960 },
    usedBySections: ['creative', 'portfolio'],
    uploadedAt: '2026-10-24T11:20:00Z',
  },
  {
    id: 'img-3',
    filename: 'campaign-form.jpg',
    originalName: 'campaign-form.jpg',
    title: 'Client Onboarding & Project Scoping Form',
    altText: 'Modern collaborative workspace with tablets displaying real-time analytics',
    caption: 'Agency client workflow visual',
    description: 'Editorial photography for the interactive brief configurator and contact workflows.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 157696, // 154 KB
    storageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop',
    dimensions: { width: 1200, height: 800 },
    usedBySections: ['about', 'contact', 'workflow'],
    uploadedAt: '2026-10-24T12:05:00Z',
  },
  {
    id: 'img-4',
    filename: 'hero-3d.jpg',
    originalName: 'hero-3d.jpg',
    title: 'Interactive 3D Spatial Environment',
    altText: 'Futuristic digital artwork showcasing architectural depth and deep dark theme',
    caption: 'Spatial computing background',
    description: 'Hero backdrop asset used across flagship landing experiences.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 175104, // 171 KB
    storageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop',
    dimensions: { width: 1600, height: 900 },
    usedBySections: ['hero'],
    uploadedAt: '2026-10-25T08:30:00Z',
  },
  {
    id: 'img-5',
    filename: 'journal-strategy.jpg',
    originalName: 'journal-strategy.jpg',
    title: 'Data-Driven Growth & Market Intelligence',
    altText: 'Marketing growth strategists analyzing customer retention cohorts on dashboard',
    caption: 'Growth journal cover asset',
    description: 'Header image for publications on multi-touch attribution and search scalability.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 192512, // 188 KB
    storageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop',
    dimensions: { width: 1200, height: 800 },
    usedBySections: ['journal', 'proven'],
    uploadedAt: '2026-10-25T09:45:00Z',
  },
  {
    id: 'img-6',
    filename: 'blog-strategy.png',
    originalName: 'blog-strategy.png',
    title: 'Enterprise SEO & Search Visibility',
    altText: 'Open laptop displaying rising organic traffic graphs and keyword rankings',
    caption: 'SEO strategy article visual',
    description: 'Visual asset illustrating organic search engine optimization methodologies.',
    mimeType: 'image/png',
    category: 'images',
    sizeBytes: 209920, // 205 KB
    storageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop',
    dimensions: { width: 1080, height: 720 },
    usedBySections: ['journal', 'services', 'channels'],
    uploadedAt: '2026-10-26T14:15:00Z',
  },
  {
    id: 'img-7',
    filename: 'blog-locks.png',
    originalName: 'blog-locks.png',
    title: 'Security, Privacy & Infrastructure Compliance',
    altText: 'Digital glowing lock icon representing SOC2 and HIPAA compliant data systems',
    caption: 'Security compliance graphic',
    description: 'Infrastructure and privacy policy trust indicator.',
    mimeType: 'image/png',
    category: 'images',
    sizeBytes: 227328, // 222 KB
    storageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop',
    dimensions: { width: 800, height: 600 },
    usedBySections: ['aboutValues'],
    uploadedAt: '2026-10-26T16:00:00Z',
  },
  {
    id: 'img-8',
    filename: 'blog-gift.png',
    originalName: 'blog-gift.png',
    title: 'Omnichannel Customer Loyalty & Retention',
    altText: 'Delightful glowing digital package illustrating customer loyalty rewards',
    caption: 'Ecommerce retention visual',
    description: 'Used in case studies on customer lifetime value maximization.',
    mimeType: 'image/png',
    category: 'images',
    sizeBytes: 244736, // 239 KB
    storageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&auto=format&fit=crop',
    dimensions: { width: 800, height: 600 },
    usedBySections: ['journal', 'portfolio'],
    uploadedAt: '2026-10-27T10:10:00Z',
  },
  {
    id: 'img-9',
    filename: 'campaign-hero-alt.jpg',
    originalName: 'campaign-hero-alt.jpg',
    title: 'Creative Studio Production Showcase',
    altText: 'Portrait of creative director fine-tuning video timeline and audio mastering',
    caption: 'Studio production behind-the-scenes',
    description: 'Studio credentials and creative craft showcase.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 262144, // 256 KB
    storageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop',
    dimensions: { width: 1200, height: 800 },
    usedBySections: ['workshops', 'team', 'creative'],
    uploadedAt: '2026-10-27T13:20:00Z',
  },
  {
    id: 'img-10',
    filename: 'campaign-motion-alt.jpg',
    originalName: 'campaign-motion-alt.jpg',
    title: 'Vibrant Holographic Spectrum Gradients',
    altText: 'Vibrant smooth color spectrum texture with liquid fluid typography',
    caption: 'Brand spectrum backdrop',
    description: 'Design system foundational color spectrum and backdrop palette.',
    mimeType: 'image/jpeg',
    category: 'images',
    sizeBytes: 279552, // 273 KB
    storageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop',
    dimensions: { width: 1600, height: 1000 },
    usedBySections: ['creative'],
    uploadedAt: '2026-10-27T15:40:00Z',
  },

  // 2. VIDEOS (cms-06-media-videos.png)
  {
    id: 'vid-1',
    filename: 'Sections_7eb91d09.mp4',
    originalName: 'Sections_7eb91d09.mp4',
    title: 'Interactive Workshops & Infrastructure Reel',
    altText: 'Video demonstration of responsive workshops and maintenance simulation',
    caption: 'Workshops 2026 Showcase Video',
    description: 'Primary product demonstration video showing machine diagnostics and workshop workflows.',
    mimeType: 'video/mp4',
    category: 'videos',
    sizeBytes: 9122611, // 8.7 MB
    duration: '0:12',
    storageUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    usedBySections: ['workshops', 'innovation'],
    uploadedAt: '2026-10-25T14:00:00Z',
  },
  {
    id: 'vid-2',
    filename: 'About_Services.mp4',
    originalName: 'About_Services.mp4',
    title: 'Orbit Digital Agency Capabilities Overview',
    altText: 'Behind the scenes video trailer of design systems, growth marketing, and software engineering',
    caption: 'Agency Capabilities Reel',
    description: 'Executive overview video covering performance media, creative execution, and technical architecture.',
    mimeType: 'video/mp4',
    category: 'videos',
    sizeBytes: 7340032, // 7.0 MB
    duration: '0:21',
    storageUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    usedBySections: ['about', 'services'],
    uploadedAt: '2026-10-25T15:20:00Z',
  },
  {
    id: 'vid-3',
    filename: 'Hero_loop.mp4',
    originalName: 'Hero_loop.mp4',
    title: 'Ambient 3D Spatial Motion Loop',
    altText: 'Continuous looping ambient motion background of glowing orbital particles',
    caption: 'Atmospheric Video Loop',
    description: 'Subtle ambient video loop optimized for high-performance canvas backgrounds.',
    mimeType: 'video/mp4',
    category: 'videos',
    sizeBytes: 5557452, // 5.3 MB
    duration: '0:30',
    storageUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    usedBySections: ['hero'],
    uploadedAt: '2026-10-26T09:10:00Z',
  },
  {
    id: 'vid-4',
    filename: 'Team_intro.mp4',
    originalName: 'Team_intro.mp4',
    title: 'Leadership, Culture & Engineering Excellence',
    altText: 'Interviews with senior leadership discussing engineering standards and client partnerships',
    caption: 'Culture & Leadership Showcase',
    description: 'Human-centered agency profile highlighting global distributed culture.',
    mimeType: 'video/mp4',
    category: 'videos',
    sizeBytes: 3774873, // 3.6 MB
    duration: '0:39',
    storageUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    usedBySections: ['team', 'about'],
    uploadedAt: '2026-10-26T11:45:00Z',
  },

  // 3. ICONS (cms-07-media-icons.png - 24 icons)
  ...Array.from({ length: 24 }, (_, i) => {
    const num = i + 1;
    const iconNames = [
      'analytics', 'security', 'code', 'rocket', 'database', 'cloud',
      'terminal', 'zap', 'globe', 'layers', 'shield', 'cpu',
      'activity', 'maximize', 'refresh', 'share', 'lock', 'server',
      'sliders', 'target', 'compass', 'feather', 'radio', 'wifi'
    ];
    const name = iconNames[i] || `asset-${num}`;
    return {
      id: `icon-${num}`,
      filename: `icon-${num}.svg`,
      originalName: `icon-${num}.svg`,
      title: `Icon: ${name.charAt(0).toUpperCase() + name.slice(1)} Indicator`,
      altText: `SVG vector icon representing ${name} system control`,
      caption: `System icon ${num}`,
      description: `Monochrome scalable SVG vector icon used in user interfaces and feature badges.`,
      mimeType: 'image/svg+xml',
      category: 'icons' as const,
      sizeBytes: 1420 + num * 45,
      storageUrl: `/assets/icons/icon-${num}.svg`,
      dimensions: { width: 24, height: 24 },
      usedBySections: ['services', 'workflow', 'channels'],
      uploadedAt: '2026-10-23T08:00:00Z',
    };
  }),

  // 4. SVG SHAPES (cms-08-media-svg.png - 24 shapes)
  ...Array.from({ length: 24 }, (_, i) => {
    const num = i + 1;
    const shapeNames = [
      'orbital-ring', 'hex-grid', 'galaxy-spiral', 'gradient-wave', 'crosshairs', 'starburst',
      'waveform', 'badge-shield', 'chevron-mesh', 'cube-lattice', 'torus-knot', 'infinity-loop',
      'prism-refraction', 'vector-nodes', 'circuit-trace', 'matrix-dots', 'fractal-leaf', 'radar-sweep',
      'hyperboloid', 'sine-wave', 'poly-mesh', 'atom-shell', 'quasar-burst', 'zenith-compass'
    ];
    const shape = shapeNames[i] || `shape-${num}`;
    return {
      id: `svg-${num}`,
      filename: `shape-${num}.svg`,
      originalName: `shape-${num}.svg`,
      title: `Shape: ${shape.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
      altText: `Custom scalable vector graphic illustrating ${shape.replace('-', ' ')}`,
      caption: `Vector shape ${num}`,
      description: `Mathematically defined vector ornament used in background layers and brand graphics.`,
      mimeType: 'image/svg+xml',
      category: 'svg' as const,
      sizeBytes: 2840 + num * 70,
      storageUrl: `/assets/shapes/shape-${num}.svg`,
      dimensions: { width: 120, height: 120 },
      usedBySections: ['creative', 'hero'],
      uploadedAt: '2026-10-23T09:30:00Z',
    };
  }),

  // 5. PDF DOCUMENTS (New PDF Tab requested by user)
  {
    id: 'pdf-1',
    filename: 'Orbit_Digital_Company_Profile.pdf',
    originalName: 'Orbit_Digital_Company_Profile.pdf',
    title: 'Orbit Digital 2026 Company Profile & Capability Prospectus',
    altText: 'Official agency brochure and capability prospectus for enterprise marketing and engineering leads',
    caption: 'Official Corporate Brochure 2026',
    description: 'Comprehensive overview of agency methodology, multi-channel growth systems, client case studies, and engineering team credentials.',
    mimeType: 'application/pdf',
    category: 'pdf',
    sizeBytes: 2457600, // 2.4 MB
    storageUrl: '/assets/documents/Orbit_Digital_Company_Profile.pdf',
    usedBySections: ['about', 'proven', 'contact'],
    uploadedAt: '2026-10-27T11:00:00Z',
  },
  {
    id: 'pdf-2',
    filename: 'Brand_Identity_Guidelines_v3.pdf',
    originalName: 'Brand_Identity_Guidelines_v3.pdf',
    title: 'Orbit Digital Brand Identity Guidelines v3.0',
    altText: 'Complete brand guidelines specification including color palette, typography hierarchy, logo clearance, and component rules',
    caption: 'Brand Identity Design Manual',
    description: 'Official design token documentation, logo geometry, tone of voice guidelines, and partner asset kit specifications.',
    mimeType: 'application/pdf',
    category: 'pdf',
    sizeBytes: 5347737, // 5.1 MB
    storageUrl: '/assets/documents/Brand_Identity_Guidelines_v3.pdf',
    usedBySections: ['creative', 'aboutValues'],
    uploadedAt: '2026-10-27T11:30:00Z',
  },
  {
    id: 'pdf-3',
    filename: 'SEO_Strategy_Whitepaper_2026.pdf',
    originalName: 'SEO_Strategy_Whitepaper_2026.pdf',
    title: 'Enterprise SEO & Search Visibility Architecture Whitepaper',
    altText: 'Executive research whitepaper on technical SEO, semantic structured data schemas, and organic growth engines',
    caption: 'Executive SEO Whitepaper',
    description: 'In-depth technical whitepaper detailing high-performance web architecture, Schema.org graph strategies, and Core Web Vitals optimization.',
    mimeType: 'application/pdf',
    category: 'pdf',
    sizeBytes: 1887436, // 1.8 MB
    storageUrl: '/assets/documents/SEO_Strategy_Whitepaper_2026.pdf',
    usedBySections: ['journal', 'channels'],
    uploadedAt: '2026-10-28T09:15:00Z',
  },
];

export async function getMediaLibrary(): Promise<MediaItemRecord[]> {
  const path = 'media';
  let items: MediaItemRecord[] = [];

  try {
    const snap = await getDocs(collection(db, path));
    if (!snap.empty) {
      items = snap.docs.map((d) => ({ ...(d.data() as MediaItemRecord), id: d.id }));
    }
  } catch (err) {
    console.warn('Firestore media read note (using local cache):', err);
  }

  // If Firestore is empty, check localStorage or merge with rich default seed
  if (items.length === 0) {
    try {
      const cached = localStorage.getItem('orbit_cms_media_items');
      if (cached) {
        items = JSON.parse(cached);
      }
    } catch (e) {}
  }

  if (items.length === 0) {
    items = DEFAULT_MEDIA_ITEMS;
    try {
      localStorage.setItem('orbit_cms_media_items', JSON.stringify(items));
    } catch (e) {}
  }

  // Ensure every item has appropriate category and fallbacks
  items = items.map((item) => {
    let cat = item.category;
    if (!cat) {
      if (item.mimeType === 'application/pdf' || item.filename.endsWith('.pdf')) cat = 'pdf';
      else if (item.mimeType.startsWith('video/') || item.filename.endsWith('.mp4')) cat = 'videos';
      else if (item.filename.startsWith('icon-') || item.originalName.startsWith('icon-')) cat = 'icons';
      else if (item.filename.endsWith('.svg') || item.mimeType === 'image/svg+xml') cat = 'svg';
      else cat = 'images';
    }
    return {
      ...item,
      category: cat,
      title: item.title || item.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      altText: item.altText || item.title || item.filename,
    };
  });

  const sorted = items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  // Googlebot & Search Engine Schema Synchronization
  syncMediaToGoogleSchema(sorted);

  return sorted;
}

export async function saveMediaItem(item: MediaItemRecord): Promise<void> {
  const path = `media/${item.id}`;
  const user = auth.currentUser;

  const enrichedItem: MediaItemRecord = {
    ...item,
    title: item.title || item.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    altText: item.altText || item.title || item.filename,
    uploadedAt: item.uploadedAt || new Date().toISOString(),
    uploadedBy: user?.email || 'admin',
  };

  try {
    await setDoc(doc(db, 'media', item.id), enrichedItem);
    await logAdminAction('save_media', 'media', item.id, {
      filename: enrichedItem.filename,
      title: enrichedItem.title,
      altText: enrichedItem.altText,
      category: enrichedItem.category,
    });
  } catch (err) {
    console.warn('Firestore write warning for media (caching locally):', err);
  }

  // Update localStorage cache
  try {
    const current = await getMediaLibrary();
    const idx = current.findIndex((m) => m.id === enrichedItem.id);
    if (idx >= 0) current[idx] = enrichedItem;
    else current.unshift(enrichedItem);
    localStorage.setItem('orbit_cms_media_items', JSON.stringify(current));
    syncMediaToGoogleSchema(current);
  } catch (e) {}
}

export async function deleteMediaItem(mediaId: string): Promise<void> {
  const path = `media/${mediaId}`;
  try {
    await deleteDoc(doc(db, 'media', mediaId));
    await logAdminAction('delete_media', 'media', mediaId);
  } catch (err) {
    console.warn('Firestore delete warning for media:', err);
  }

  // Update localStorage cache directly
  try {
    const raw = localStorage.getItem('orbit_cms_media_items');
    let list: MediaItemRecord[] = [];
    if (raw) {
      try { list = JSON.parse(raw); } catch (e) {}
    }
    if (list.length === 0) {
      list = [...DEFAULT_MEDIA_ITEMS];
    }
    const filtered = list.filter((m) => m.id !== mediaId);
    localStorage.setItem('orbit_cms_media_items', JSON.stringify(filtered));
    syncMediaToGoogleSchema(filtered);
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// 8. Revisions & Rollbacks
// ---------------------------------------------------------------------------

export async function createRevision(
  entityType: 'page' | 'section' | 'siteSettings',
  entityId: string,
  summary: string,
  snapshot: Record<string, any>
): Promise<string> {
  const user = auth.currentUser;
  const revId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `revisions/${revId}`;
  const revision: RevisionRecord = {
    id: revId,
    entityType,
    entityId,
    summary,
    snapshot,
    createdBy: user?.email || 'admin',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'revisions', revId), revision);
    return revId;
  } catch (err) {
    console.warn('Failed creating revision snapshot:', err);
    return '';
  }
}

export async function getRevisions(entityId?: string): Promise<RevisionRecord[]> {
  const path = 'revisions';
  try {
    const snap = await getDocs(collection(db, path));
    let revs = snap.docs.map((d) => ({ ...(d.data() as RevisionRecord), id: d.id }));
    if (entityId) {
      revs = revs.filter((r) => r.entityId === entityId);
    }
    return revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function restoreRevision(revision: RevisionRecord): Promise<void> {
  const user = auth.currentUser;
  if (revision.entityType === 'section') {
    await saveSection(revision.snapshot as SectionRecord);
  } else if (revision.entityType === 'page') {
    await savePage(revision.snapshot as PageRecord);
  } else if (revision.entityType === 'siteSettings') {
    await updateSiteSettings(revision.snapshot as SiteSettingsRecord);
  }
  await logAdminAction('restore_revision', revision.entityType, revision.entityId, {
    revisionId: revision.id,
    summary: revision.summary,
  });
}

// ---------------------------------------------------------------------------
// 9. Initial Seeding Helper
// ---------------------------------------------------------------------------

export async function seedInitialCmsData(): Promise<void> {
  const user = auth.currentUser;
  const adminEmail = user?.email || PRIMARY_ADMIN_EMAIL;

  // 1. Ensure admin allowlist document exists
  await setDoc(
    doc(db, 'adminAllowlist', 'primary-owner'),
    {
      email: adminEmail,
      role: 'owner',
      status: 'active',
      addedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // 2. Ensure General site settings
  await setDoc(
    doc(db, 'siteSettings', 'general'),
    {
      siteName: 'Orbit Digital',
      defaultSeoTitle: 'Orbit Digital - Full-Service Growth & Marketing Agency',
      defaultSeoDescription:
        'Engineering growth engines across strategy, creative, search, media, and performance for ambitious global brands.',
      maintenanceMode: false,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    },
    { merge: true }
  );

  // 3. Ensure Pages records matching CMS UI design
  const pagesToSeed: PageRecord[] = [
    {
      id: 'page-home',
      slug: '/',
      title: 'Home',
      metaDescription: 'Full-service digital marketing agency engineering growth engines.',
      status: 'published',
      sectionOrder: ['sec-hero', 'sec-channels', 'sec-creative', 'sec-innovation', 'sec-workshops', 'sec-faq', 'sec-contact'],
      updatedAt: 'Today, 09:12',
      updatedBy: adminEmail,
    },
    {
      id: 'page-about',
      slug: '/about',
      title: 'About us',
      metaDescription: 'Discover our story, mission, and the creative leadership driving global results.',
      status: 'published',
      sectionOrder: ['sec-about', 'sec-proven', 'sec-team'],
      updatedAt: 'Oct 26',
      updatedBy: adminEmail,
    },
    {
      id: 'page-services',
      slug: '/services',
      title: 'Services',
      metaDescription: 'Comprehensive growth, brand strategy, content production, and paid performance.',
      status: 'published',
      sectionOrder: ['sec-channels', 'sec-creative', 'sec-workshops'],
      updatedAt: 'Oct 24',
      updatedBy: adminEmail,
    },
    {
      id: 'page-pricing',
      slug: '/pricing',
      title: 'Pricing',
      metaDescription: 'Simple monthly plans for growing brands.',
      status: 'draft',
      sectionOrder: ['sec-hero', 'sec-pricing', 'sec-faq', 'sec-contact'],
      updatedAt: 'Oct 22',
      updatedBy: adminEmail,
    },
    {
      id: 'page-contact',
      slug: '/contact',
      title: 'Contact',
      metaDescription: 'Get in touch with our team to configure your project scope.',
      status: 'published',
      sectionOrder: ['sec-contact', 'sec-faq'],
      updatedAt: 'Oct 19',
      updatedBy: adminEmail,
    },
    {
      id: 'page-privacy',
      slug: '/privacy',
      title: 'Privacy policy',
      metaDescription: 'Transparent data protection and privacy practices.',
      status: 'draft',
      sectionOrder: ['sec-footer'],
      updatedAt: 'Nov 02',
      updatedBy: adminEmail,
    },
  ];

  for (const page of pagesToSeed) {
    await setDoc(doc(db, 'pages', page.id), page, { merge: true });
  }

  // 4. Seed structured sections matching all 12 Orbit master sections
  const initialSections: SectionRecord[] = [
    {
      id: "sec-hero",
      pageId: "page-home",
      sectionType: "hero",
      internalTitle: "S.01 Orbit Gravitational Architecture",
      isVisible: true,
      order: 1,
      status: "published",
      draftContent: {
        headline: "Orbit Gravitational Architecture",
        subheadline: "Full-Service Digital Growth Agency",
        description: "Engineering growth engines across strategy, creative, search, media, and performance for ambitious global brands.",
        primaryCtaText: "Configure Scope",
        primaryCtaUrl: "#pricing"
      },
      designSettings: {
        backgroundColor: "#090b10",
        textColor: "#ffffff",
        accentColor: "#ff5533",
        paddingY: "5rem"
      },
      mediaRefs: ["hero-3d.jpg"]
    },
    {
      id: "sec-channels",
      pageId: "page-home",
      sectionType: "channels",
      internalTitle: "Interactive Channel Grid",
      isVisible: true,
      order: 2,
      status: "published",
      draftContent: {
        badge: "CHANNELS & PLATFORMS",
        headline: "Engineered across every major growth surface",
        description: "Full-funnel execution across Paid Social, Performance Search, Spatial Media, and Programmatic."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#00e5ff" },
      mediaRefs: []
    },
    {
      id: "sec-creative",
      pageId: "page-home",
      sectionType: "creative",
      internalTitle: "Creative Showcase",
      isVisible: true,
      order: 3,
      status: "published",
      draftContent: {
        badge: "CREATIVE SHOWCASE",
        headline: "High-conversion design engineering",
        subheading: "Interactive browser and mobile experiences built to command attention."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#ff4081" },
      mediaRefs: []
    },
    {
      id: "sec-innovation",
      pageId: "page-home",
      sectionType: "innovation",
      internalTitle: "S.02 Brand Image in the Service of Innovation",
      isVisible: true,
      order: 4,
      status: "published",
      draftContent: {
        headline: "Brand image in the service of innovation",
        description: "For over ten years, we have been supporting innovation stakeholders and B2B clients in building their brand identity.",
        sectors: ["AI", "Marketing", "Automation", "Growth", "Professional tools"],
        pills: [
          { name: "SaaS", color: "#34d399" },
          { name: "Start-up", color: "#facc15" },
          { name: "Agencies", color: "#60a5fa" },
          { name: "Purpose-driven companies", color: "#f472b6" }
        ]
      },
      designSettings: {
        backgroundColor: "#0a0d0b",
        textColor: "#ffffff",
        accentColor: "#34d399",
        paddingY: "5rem"
      },
      mediaRefs: []
    },
    {
      id: "sec-workshops",
      pageId: "page-home",
      sectionType: "workshops",
      internalTitle: "S.03 Maintenance Infrastructure & Workshops",
      isVisible: true,
      order: 5,
      status: "published",
      draftContent: {
        badgeCategory: "#WORKSHOPS",
        tabs: [
          {
            number: "01",
            title: "Maintenance Infrastructure",
            description: "At our company, maintenance is not just an operational function, it is a strategic commitment to safety, mechanical availability, and equipment reliability across every project.",
            image: "assets/workshops/tab1_technicians_full.jpg"
          },
          {
            number: "02",
            title: "Central service workshop",
            description: "Our central facility is equipped to carry out complete overhauls, major repairs, and life cycle-driven component change-outs using advanced diagnostics.",
            image: "assets/workshops/tab2_crane_workshop.jpg"
          },
          {
            number: "03",
            title: "On-Site service workshops",
            description: "Each of our project sites features a fully equipped on-site workshop for scheduled maintenance, daily inspections, and rapid response to mechanical issues.",
            image: "assets/workshops/tab3_safety_auditor.jpg"
          }
        ]
      },
      designSettings: {
        backgroundColor: "#090b10",
        textColor: "#111111",
        accentColor: "#00e5ff",
        paddingY: "5.5rem"
      },
      mediaRefs: ["tab1_technicians_full.jpg", "tab2_crane_workshop.jpg", "tab3_safety_auditor.jpg"]
    },
    {
      id: "sec-workflow",
      pageId: "page-home",
      sectionType: "workflow",
      internalTitle: "5-Step Workflow & Kinetic Process",
      isVisible: true,
      order: 6,
      status: "published",
      draftContent: {
        badge: "PROCESS & PHYSICS",
        headline: "5-Step Workflow: From Discovery to Compound Scaling",
        steps: [
          { step: "01", title: "Diagnostic Audit", description: "Complete technical, creative, and analytics deep dive." },
          { step: "02", title: "Architecture & Thesis", description: "Strategic positioning, audience segmentation, and tech stack setup." },
          { step: "03", title: "Rapid Production", description: "Creative asset development and multivariant testing protocols." },
          { step: "04", title: "Channel Execution", description: "Algorithmic bidding, programmatic placement, and conversion tracking." },
          { step: "05", title: "Scale & Retention", description: "LTV maximization, lifecycle automation, and compounding growth." }
        ]
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#ff5533" },
      mediaRefs: []
    },
    {
      id: "sec-about",
      pageId: "page-home",
      sectionType: "about",
      internalTitle: "About Us & Team Architecture",
      isVisible: true,
      order: 7,
      status: "published",
      draftContent: {
        badge: "ABOUT ORBIT",
        headline: "A Collective of Senior Growth Operators",
        description: "We operate as an embedded senior extension of your leadership team, replacing bloated traditional agency structures."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#00e5ff" },
      mediaRefs: []
    },
    {
      id: "sec-proven",
      pageId: "page-home",
      sectionType: "proven",
      internalTitle: "Proven Results Staircase & Quotes",
      isVisible: true,
      order: 8,
      status: "published",
      draftContent: {
        badge: "PROVEN PROOF",
        headline: "$280M+ Capital Generated Across 60+ Ventures",
        description: "Verified revenue milestones and audited return on ad spend."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#ffd600" },
      mediaRefs: []
    },
    {
      id: "sec-journal",
      pageId: "page-home",
      sectionType: "journal",
      internalTitle: "Articles & Thought Leadership",
      isVisible: true,
      order: 9,
      status: "published",
      draftContent: {
        headline: "Insights & Growth Systems",
        description: "Perspectives on design engineering, algorithmic media, and B2B growth."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#00e5ff" },
      mediaRefs: []
    },
    {
      id: "sec-faq",
      pageId: "page-home",
      sectionType: "faq",
      internalTitle: "FAQ Accordion & Filters",
      isVisible: true,
      order: 10,
      status: "published",
      draftContent: {
        headline: "Frequently Asked Questions",
        description: "Answers to common partnership and technical queries."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#ff4081" },
      mediaRefs: []
    },
    {
      id: "sec-pricing",
      pageId: "page-home",
      sectionType: "pricing",
      internalTitle: "Growth Scope Configurator",
      isVisible: true,
      order: 11,
      status: "published",
      draftContent: {
        headline: "Transparent Investment & Scalable Sprints",
        description: "Select your deliverables, platforms, and growth tier in real time."
      },
      designSettings: { backgroundColor: "#090b10", textColor: "#ffffff", accentColor: "#ffd600" },
      mediaRefs: []
    },
    {
      id: "sec-footer",
      pageId: "page-home",
      sectionType: "footer",
      internalTitle: "Footer & Inquiries",
      isVisible: true,
      order: 12,
      status: "published",
      draftContent: {
        headline: "Let us Engineer Your Next Growth Phase",
        email: "hello@orbitdigital.agency",
        copyright: "© 2026 Orbit Digital. All rights reserved."
      },
      designSettings: { backgroundColor: "#06070a", textColor: "#94a3b8", accentColor: "#ff5533" },
      mediaRefs: []
    }
  ];

  for (const s of initialSections) {
    await setDoc(doc(db, 'sections', s.id), s, { merge: true });
  }

  // 5. Seed Media Library items from verified assets
  const initialMedia: MediaItemRecord[] = [
    {
      id: 'med-tech-full',
      filename: 'tab1_technicians_full.jpg',
      originalName: 'Industrial Maintenance Technicians',
      mimeType: 'image/jpeg',
      sizeBytes: 151812,
      storageUrl: '/assets/workshops/tab1_technicians_full.jpg',
      altText: 'Certified technicians performing heavy machinery maintenance in industrial facility',
      caption: 'Main overhaul bay diagnostics and component assembly',
      folder: 'workshops',
      usedBySections: ['sec-workshops'],
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'med-crane',
      filename: 'tab2_crane_workshop.jpg',
      originalName: 'Central Service Workshop 10T Crane',
      mimeType: 'image/jpeg',
      sizeBytes: 103746,
      storageUrl: '/assets/workshops/tab2_crane_workshop.jpg',
      altText: 'Central service workshop main hall equipped with 10000kg overhead bridge crane',
      caption: 'Overhead 10T bridge crane facility',
      folder: 'workshops',
      usedBySections: ['sec-workshops'],
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'med-auditor',
      filename: 'tab3_safety_auditor.jpg',
      originalName: 'Safety Auditor IPERCC',
      mimeType: 'image/jpeg',
      sizeBytes: 39322,
      storageUrl: '/assets/workshops/tab3_safety_auditor.jpg',
      altText: 'Field safety engineer in protective equipment and respirator conducting technical audits',
      caption: 'On-site field safety inspections',
      folder: 'workshops',
      usedBySections: ['sec-workshops'],
      uploadedAt: new Date().toISOString(),
    },
  ];

  for (const m of initialMedia) {
    await setDoc(doc(db, 'media', m.id), m, { merge: true });
  }

  // 6. Record audit log
  await logAdminAction('seed_database', 'system', 'initial-seed', {
    sections: initialSections.length,
    media: initialMedia.length,
  });
}

// ---------------------------------------------------------------------------
// 10. Phase 4: Brief Submissions & Inquiries Manager
// ---------------------------------------------------------------------------

export async function submitBrief(brief: Partial<BriefSubmissionRecord>): Promise<string> {
  const briefId = `brief-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `briefSubmissions/${briefId}`;
  const record: BriefSubmissionRecord = {
    id: briefId,
    clientTimestamp: new Date().toISOString(),
    contactName: brief.contactName || 'Anonymous Visitor',
    contactEmail: brief.contactEmail || '',
    companyName: brief.companyName || '',
    projectBudget: brief.projectBudget || 'Flexible Scope',
    timeline: brief.timeline || 'Q1 / Immediate',
    selectedServices: brief.selectedServices || ['Strategy', 'Full-Funnel Growth'],
    notes: brief.notes || '',
    status: 'new',
    receivedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'briefSubmissions', briefId), record);
    return briefId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getBriefSubmissions(): Promise<BriefSubmissionRecord[]> {
  const path = 'briefSubmissions';
  try {
    const snap = await getDocs(collection(db, path));
    const briefs = snap.docs.map((d) => ({ ...(d.data() as BriefSubmissionRecord), id: d.id }));
    return briefs.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateBriefStatus(briefId: string, status: BriefSubmissionRecord['status']): Promise<void> {
  const path = `briefSubmissions/${briefId}`;
  try {
    await updateDoc(doc(db, 'briefSubmissions', briefId), { status });
    await logAdminAction('update_brief_status', 'briefSubmissions', briefId, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteBriefSubmission(briefId: string): Promise<void> {
  const path = `briefSubmissions/${briefId}`;
  try {
    await deleteDoc(doc(db, 'briefSubmissions', briefId));
    await logAdminAction('delete_brief', 'briefSubmissions', briefId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// 11. Phase 4: Database Export & Restore Engine
// ---------------------------------------------------------------------------

export async function exportCmsDatabase(): Promise<string> {
  const [pages, sections, media, settings, briefs] = await Promise.all([
    getPages(),
    getSections(),
    getMediaLibrary(),
    getSiteSettings(),
    getBriefSubmissions().catch(() => []),
  ]);

  const backupPayload = {
    version: '4.0',
    exportedAt: new Date().toISOString(),
    siteSettings: settings,
    pages,
    sections,
    media,
    briefs,
  };

  await logAdminAction('export_database', 'system', 'backup', {
    sectionsCount: sections.length,
    pagesCount: pages.length,
  });

  return JSON.stringify(backupPayload, null, 2);
}

export async function importCmsDatabase(jsonBackup: string): Promise<{ success: boolean; sectionsImported: number }> {
  const data = JSON.parse(jsonBackup);
  if (!data.sections || !Array.isArray(data.sections)) {
    throw new Error('Invalid backup schema: missing sections array.');
  }

  for (const s of data.sections) {
    await saveSection(s);
  }

  if (data.pages && Array.isArray(data.pages)) {
    for (const p of data.pages) {
      await savePage(p);
    }
  }

  if (data.siteSettings) {
    await updateSiteSettings(data.siteSettings);
  }

  await logAdminAction('restore_database', 'system', 'import', {
    sectionsImported: data.sections.length,
  });

  return { success: true, sectionsImported: data.sections.length };
}

// ---------------------------------------------------------------------------
// 12. Upgrade Suite: Posts, Menus, Redirects, Sitemap & Robots.txt
// ---------------------------------------------------------------------------

export const DEFAULT_POSTS: PostRecord[] = [
  {
    id: 'post-1',
    title: 'Brand strategy in 2026',
    slug: 'brand-strategy-in-2026',
    category: 'Strategy',
    author: 'Ali',
    status: 'Published',
    date: 'Oct 27',
    excerpt: 'How modern businesses build timeless positioning in high-velocity competitive spaces.',
    content: 'Full editorial breakdown of brand positioning, customer retention loops, and narrative architecture.',
  },
  {
    id: 'post-2',
    title: 'Why motion sells',
    slug: 'why-motion-sells',
    category: 'Creative',
    author: 'Sara',
    status: 'Published',
    date: 'Oct 20',
    excerpt: 'Dynamic motion and video drive higher conversion across top-of-funnel acquisition channels.',
    content: 'Exploring 3D kinetic visuals, rapid pacing, and emotive product storytelling.',
  },
  {
    id: 'post-3',
    title: 'Gifting campaigns that work',
    slug: 'gifting-campaigns-that-work',
    category: 'Media',
    author: 'Ayesha',
    status: 'Draft',
    date: 'Oct 18',
    excerpt: 'Tactics for influencer gifting and curated client drops with organic virality.',
    content: 'Unboxing psychology and strategic VIP influencer gifting roadmaps.',
  },
  {
    id: 'post-4',
    title: 'Search demand, explained',
    slug: 'search-demand-explained',
    category: 'SEO',
    author: 'Ali',
    status: 'Published',
    date: 'Oct 12',
    excerpt: 'Capturing intent before competitors by optimizing for generative search and high-intent clusters.',
    content: 'Search intent matrices and zero-click SERP domination guidelines.',
  },
  {
    id: 'post-5',
    title: 'Lock-in and loyalty',
    slug: 'lock-in-and-loyalty',
    category: 'Growth',
    author: 'Sara',
    status: 'Scheduled',
    date: 'Nov 04',
    excerpt: 'Turning one-time transactions into lifetime recurring enterprise partnerships.',
    content: 'Post-purchase engagement and retention cohort optimization strategies.',
  },
];

export const DEFAULT_MENU_TEMPLATES: MenuTemplateRecord[] = [
  {
    id: 'menu-main-header',
    name: 'Main header',
    type: 'header',
    scope: 'Used on all pages',
    status: 'Active',
    items: ['Home', 'Services', 'About', 'Contact'],
  },
  {
    id: 'menu-winter-header',
    name: 'Winter campaign header',
    type: 'header',
    scope: 'Used on Home only',
    status: 'Disabled',
    items: ['Offer banner', 'Home', 'Contact'],
  },
  {
    id: 'menu-main-footer',
    name: 'Main footer',
    type: 'footer',
    scope: 'Used on all pages',
    status: 'Active',
    items: ['Company', 'Solutions', 'Legal', 'Social'],
    columns: 3,
    linksCount: 12,
  },
  {
    id: 'menu-minimal-footer',
    name: 'Minimal footer',
    type: 'footer',
    scope: 'Used on Contact',
    status: 'Disabled',
    items: ['Privacy', 'Terms', 'Direct Contact'],
    columns: 1,
    linksCount: 4,
  },
];

export const DEFAULT_REDIRECTS: RedirectRecord[] = [
  { id: 'red-1', from: '/old-pricing', to: '/pricing', type: '301', hits: 128, active: true },
  { id: 'red-2', from: '/blog/strategy', to: '/posts/brand-strategy', type: '301', hits: 64, active: true },
  { id: 'red-3', from: '/promo', to: '/services', type: '302', hits: 31, active: true },
  { id: 'red-4', from: '/team', to: '/about', type: '301', hits: 12, active: false },
];

export const DEFAULT_SITEMAP_CONFIG: SitemapConfigRecord = {
  mode: 'auto',
  sitemapUrl: 'https://yoursite.com/sitemap.xml',
  lastGenerated: 'Today, 09:12 · 40 URLs',
  urlsCount: 40,
  includePages: true,
  includePosts: true,
  includeMedia: false,
  includeDrafts: false,
};

export const DEFAULT_ROBOTS_CONFIG: RobotsConfigRecord = {
  mode: 'manual',
  content: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://yoursite.com/sitemap.xml`,
  isValid: true,
};

// Local storage caches for immediate snappy UX + Firestore persistence fallback
export async function getPosts(): Promise<PostRecord[]> {
  try {
    const raw = localStorage.getItem('orbit_cms_posts');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_POSTS;
}

export async function savePost(post: PostRecord): Promise<void> {
  const posts = await getPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  try {
    localStorage.setItem('orbit_cms_posts', JSON.stringify(posts));
  } catch (e) {}
}

export async function deletePost(postId: string): Promise<void> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  try {
    localStorage.setItem('orbit_cms_posts', JSON.stringify(filtered));
  } catch (e) {}
}

export async function getMenuTemplates(): Promise<MenuTemplateRecord[]> {
  try {
    const raw = localStorage.getItem('orbit_cms_menus');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_MENU_TEMPLATES;
}

export async function saveMenuTemplate(menu: MenuTemplateRecord): Promise<void> {
  const menus = await getMenuTemplates();
  const idx = menus.findIndex((m) => m.id === menu.id);
  if (idx >= 0) menus[idx] = menu;
  else menus.push(menu);
  try {
    localStorage.setItem('orbit_cms_menus', JSON.stringify(menus));
  } catch (e) {}
}

export async function getRedirects(): Promise<RedirectRecord[]> {
  try {
    const raw = localStorage.getItem('orbit_cms_redirects');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_REDIRECTS;
}

export async function saveRedirect(red: RedirectRecord): Promise<void> {
  const list = await getRedirects();
  const idx = list.findIndex((r) => r.id === red.id);
  if (idx >= 0) list[idx] = red;
  else list.unshift(red);
  try {
    localStorage.setItem('orbit_cms_redirects', JSON.stringify(list));
  } catch (e) {}
}

export async function deleteRedirect(id: string): Promise<void> {
  const list = await getRedirects();
  const filtered = list.filter((r) => r.id !== id);
  try {
    localStorage.setItem('orbit_cms_redirects', JSON.stringify(filtered));
  } catch (e) {}
}

export async function getSitemapConfig(): Promise<SitemapConfigRecord> {
  try {
    const raw = localStorage.getItem('orbit_cms_sitemap');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SITEMAP_CONFIG;
}

export async function saveSitemapConfig(cfg: SitemapConfigRecord): Promise<void> {
  try {
    localStorage.setItem('orbit_cms_sitemap', JSON.stringify(cfg));
  } catch (e) {}
}

export async function getRobotsConfig(): Promise<RobotsConfigRecord> {
  try {
    const raw = localStorage.getItem('orbit_cms_robots');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_ROBOTS_CONFIG;
}

export async function saveRobotsConfig(cfg: RobotsConfigRecord): Promise<void> {
  try {
    localStorage.setItem('orbit_cms_robots', JSON.stringify(cfg));
  } catch (e) {}
}

