export type SectionType =
  | 'nav'
  | 'hero'
  | 'channels'
  | 'creative'
  | 'innovation'
  | 'workshops'
  | 'workflow'
  | 'about'
  | 'proven'
  | 'journal'
  | 'clients'
  | 'faq'
  | 'pricing'
  | 'contact'
  | 'footer'
  | 'custom';

export interface AdminAllowlistRecord {
  id?: string;
  email: string;
  uid?: string;
  role: 'owner' | 'admin';
  addedAt: string;
  status: 'active' | 'suspended';
}

export interface SiteSettingsRecord {
  id?: string;
  siteName: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  maintenanceMode?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PageRecord {
  id: string;
  slug: string;
  title: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  sectionOrder: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface SectionDesignSettings {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  paddingY?: string;
  borderRadius?: string;
  animationType?: string;
  animationDuration?: number;
  reducedMotionFallback?: boolean;
}

export interface SectionRecord {
  id: string;
  pageId: string;
  sectionType: SectionType;
  internalTitle: string;
  isVisible: boolean;
  order: number;
  status: 'draft' | 'published';
  draftContent: Record<string, any>;
  designSettings: SectionDesignSettings;
  mediaRefs: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface PublishedContentRecord {
  id: string;
  pageSlug: string;
  pageTitle: string;
  metaDescription?: string;
  version: number;
  publishedAt: string;
  publishedBy: string;
  sections: Record<string, any>;
}

export interface MediaItemRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  altText?: string;
  caption?: string;
  folder?: string;
  usedBySections?: string[];
  uploadedAt: string;
  uploadedBy?: string;
}

export interface RevisionRecord {
  id: string;
  entityType: 'page' | 'section' | 'siteSettings';
  entityId: string;
  summary: string;
  snapshot: Record<string, any>;
  createdBy: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  details?: Record<string, any>;
  adminEmail: string;
  adminUid: string;
  timestamp: string;
}

export interface BriefSubmissionRecord {
  id: string;
  clientTimestamp: string;
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  projectBudget?: string;
  timeline?: string;
  selectedServices?: string[];
  notes?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  receivedAt: string;
}
