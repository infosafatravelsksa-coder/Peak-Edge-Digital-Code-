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
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  paddingY?: string;
  borderRadius?: string;
  animationType?: string;
  animationDuration?: number;
  reducedMotionFallback?: boolean;
  customTailwindClasses?: string;
  customCss?: string;
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
  thumbnailUrl?: string;
  pagesAssigned?: string[];
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

export type MediaCategory = 'images' | 'videos' | 'icons' | 'svg' | 'pdf';

export interface MediaItemRecord {
  id: string;
  filename: string;
  originalName: string;
  title?: string;
  altText?: string;
  caption?: string;
  description?: string;
  mimeType: string;
  category?: MediaCategory;
  sizeBytes: number;
  storageUrl: string;
  dimensions?: { width: number; height: number };
  duration?: string;
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

export interface PostRecord {
  id: string;
  title: string;
  slug: string;
  category: 'Strategy' | 'Creative' | 'Media' | 'SEO' | 'Growth' | string;
  author: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  date: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  url: string;
  isDropdown?: boolean;
  hasDot?: boolean;
  dotColor?: string;
  badge?: string;
}

export interface MegaMenuServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  url: string;
}

export interface MegaMenuContactInfo {
  address: string;
  phone: string;
  email: string;
  solutionCardTitle?: string;
  solutionCardDesc?: string;
  solutionCardUrl?: string;
}

export interface MegaMenuFeaturedWork {
  badgeText: string;
  projectTag: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaUrl: string;
  sliderTotal?: string;
  imageUrl?: string;
}

export interface HeaderMenuConfig {
  logoText?: string;
  pillState?: 'collapsed' | 'expanded';
  navItems?: HeaderMenuItem[];
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  hasLiveStatusDot?: boolean;
  servicesTitle?: string;
  services?: MegaMenuServiceItem[];
  contact?: MegaMenuContactInfo;
  featuredWork?: MegaMenuFeaturedWork;
  briefDrawerHeadline?: string;
  briefDrawerSubtext?: string;
  briefButtonText?: string;
  clientLoginUrl?: string;
  contactUsUrl?: string;
}

export interface FooterMenuConfig {
  tagline?: string;
  copyright?: string;
  legalLinks?: { label: string; url: string }[];
  columns?: { title: string; links: { label: string; url: string }[] }[];
  socialLinks?: { platform: string; url: string }[];
}

export interface MenuTemplateRecord {
  id: string;
  name: string;
  type: 'header' | 'footer';
  scope: string;
  status: 'Active' | 'Disabled';
  items: string[];
  columns?: number;
  linksCount?: number;
  headerConfig?: HeaderMenuConfig;
  footerConfig?: FooterMenuConfig;
}

export interface RedirectRecord {
  id: string;
  from: string;
  to: string;
  type: '301' | '302';
  hits: number;
  active: boolean;
}

export interface SitemapConfigRecord {
  mode: 'auto' | 'manual';
  sitemapUrl: string;
  lastGenerated: string;
  urlsCount: number;
  includePages: boolean;
  includePosts: boolean;
  includeMedia: boolean;
  includeDrafts: boolean;
}

export interface RobotsConfigRecord {
  mode: 'auto' | 'manual';
  content: string;
  isValid: boolean;
}

