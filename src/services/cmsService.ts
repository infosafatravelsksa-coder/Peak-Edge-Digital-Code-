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
// 7. Media Library
// ---------------------------------------------------------------------------

export async function getMediaLibrary(): Promise<MediaItemRecord[]> {
  const path = 'media';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map((d) => ({ ...(d.data() as MediaItemRecord), id: d.id }));
    return items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveMediaItem(item: MediaItemRecord): Promise<void> {
  const path = `media/${item.id}`;
  const user = auth.currentUser;
  try {
    await setDoc(doc(db, 'media', item.id), {
      ...item,
      uploadedAt: item.uploadedAt || new Date().toISOString(),
      uploadedBy: user?.email || 'admin',
    });
    await logAdminAction('upload_media', 'media', item.id, { filename: item.filename });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteMediaItem(mediaId: string): Promise<void> {
  const path = `media/${mediaId}`;
  try {
    await deleteDoc(doc(db, 'media', mediaId));
    await logAdminAction('delete_media', 'media', mediaId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
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

  // 3. Ensure Homepage record
  await setDoc(
    doc(db, 'pages', 'page-home'),
    {
      id: 'page-home',
      slug: 'home',
      title: 'Orbit Digital — Homepage',
      metaDescription: 'Full-service digital marketing agency engineering growth engines.',
      status: 'published',
      sectionOrder: ['sec-hero', 'sec-workshops', 'sec-innovation', 'sec-team', 'sec-contact'],
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    },
    { merge: true }
  );

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
