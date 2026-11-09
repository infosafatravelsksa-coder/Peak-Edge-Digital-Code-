import React, { useState, useRef } from 'react';
import {
  Eye,
  Edit2,
  Check,
  Save,
  Plus,
  Trash2,
  Code2,
  Laptop,
  Tablet,
  Smartphone,
  ArrowUp,
  ArrowDown,
  X,
  Layers,
  Upload,
  Image as ImageIcon,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileCheck,
  Globe,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { SectionRecord, PageRecord, MediaItemRecord } from '../types/cms';

interface SectionsViewProps {
  sections: SectionRecord[];
  pages?: PageRecord[];
  media?: MediaItemRecord[];
  onSaveSection: (sec: SectionRecord) => Promise<void>;
  onDeleteSection?: (sectionId: string) => Promise<void>;
  onReorderSections?: (reordered: SectionRecord[]) => Promise<void>;
  onSavePage?: (page: PageRecord) => Promise<void>;
  onPublishAll: () => Promise<void>;
  onTogglePreview: () => void;
  showNotice: (type: 'success' | 'error', message: string) => void;
}

// Available Font Families for zero-code typography customization
const FONT_FAMILIES = [
  { id: 'Plus Jakarta Sans, sans-serif', label: 'Plus Jakarta Sans (Modern UI)' },
  { id: 'Inter, sans-serif', label: 'Inter (Clean Tech)' },
  { id: 'DM Sans, sans-serif', label: 'DM Sans (Geometric Editorial)' },
  { id: 'Outfit, sans-serif', label: 'Outfit (Contemporary Bold)' },
  { id: 'Syne, sans-serif', label: 'Syne (Agency & Creative)' },
  { id: 'JetBrains Mono, monospace', label: 'JetBrains Mono (Developer / Minimal)' },
  { id: 'Playfair Display, serif', label: 'Playfair Display (Luxury Serif)' },
];

// Quick color presets
const COLOR_PRESETS = [
  { name: 'Dark Navy', hex: '#06070a' },
  { name: 'Slate Deep', hex: '#0f172a' },
  { name: 'Royal Indigo', hex: '#1e1b4b' },
  { name: 'Emerald Night', hex: '#042f2e' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Slate Light', hex: '#f8fafc' },
];

// Helper to bind content variables into custom code without touching code
function renderBoundCustomCode(
  code: string,
  content: Record<string, any>,
  design: Record<string, any>,
  imageUrl?: string
): string {
  if (!code) return '';
  let html = code;
  const headline = content?.headline || '';
  const subtext = content?.description || content?.subtext || '';
  const buttonText = content?.primaryCtaText || content?.buttonText || '';
  const buttonUrl = content?.buttonUrl || '#contact';
  const img = imageUrl || content?.image || '';
  const imgAlt = content?.imageAlt || headline || 'Section image';
  const bg = design?.backgroundColor || '#06070a';
  const font = design?.fontFamily || 'Plus Jakarta Sans, sans-serif';

  // Replace placeholders if user inserted them
  html = html
    .replace(/\{\{headline\}\}/g, headline)
    .replace(/\{\{subtext\}\}/g, subtext)
    .replace(/\{\{description\}\}/g, subtext)
    .replace(/\{\{buttonText\}\}/g, buttonText)
    .replace(/\{\{buttonUrl\}\}/g, buttonUrl)
    .replace(/\{\{image\}\}/g, img)
    .replace(/\{\{imageAlt\}\}/g, imgAlt)
    .replace(/\{\{bgColor\}\}/g, bg)
    .replace(/\{\{fontFamily\}\}/g, font);

  return html;
}

export const SectionsView: React.FC<SectionsViewProps> = ({
  sections,
  pages = [],
  media = [],
  onSaveSection,
  onDeleteSection,
  onReorderSections,
  onSavePage,
  onPublishAll,
  onTogglePreview,
  showNotice,
}) => {
  // Sort sections by order
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  // Active section currently selected for editing in right column
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sorted[0]?.id || 'sec-hero'
  );

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sorted[0];

  // Editor states for right column (modifiable without touching code)
  const [headline, setHeadline] = useState(
    selectedSection?.draftContent?.headline || 'Make your brand impossible to ignore.'
  );
  const [subtext, setSubtext] = useState(
    selectedSection?.draftContent?.description ||
      selectedSection?.draftContent?.subtext ||
      'Creative and content that people actively choose to engage with.'
  );
  const [buttonText, setButtonText] = useState(
    selectedSection?.draftContent?.primaryCtaText ||
      selectedSection?.draftContent?.buttonText ||
      'Start your project brief'
  );
  const [buttonUrl, setButtonUrl] = useState(
    selectedSection?.draftContent?.buttonUrl || '#contact'
  );
  const [sectionImageUrl, setSectionImageUrl] = useState(
    selectedSection?.draftContent?.image || selectedSection?.thumbnailUrl || ''
  );
  const [sectionImageAlt, setSectionImageAlt] = useState(
    selectedSection?.draftContent?.imageAlt || ''
  );

  // Custom design styling controls (modifiable without touching code)
  const [bgColor, setBgColor] = useState(
    selectedSection?.designSettings?.backgroundColor || '#06070a'
  );
  const [fontFamily, setFontFamily] = useState(
    selectedSection?.designSettings?.fontFamily || 'Plus Jakarta Sans, sans-serif'
  );
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>(
    (selectedSection?.designSettings?.textAlign as any) || 'left'
  );
  const [spacing, setSpacing] = useState(
    selectedSection?.designSettings?.paddingY || 'Large'
  );

  // Custom Code State for custom sections
  const [customHtmlEdit, setCustomHtmlEdit] = useState(
    selectedSection?.draftContent?.customHtml || ''
  );
  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');

  // Page insertion state for right column
  const [selectedPageToInsert, setSelectedPageToInsert] = useState(
    pages[0]?.id || 'page-home'
  );
  const [insertPlacement, setInsertPlacement] = useState<'top' | 'after-hero' | 'before-footer' | 'bottom'>('after-hero');
  const [isInsertingIntoPage, setIsInsertingIntoPage] = useState(false);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  // =========================================================================
  // ADD SECTION MODAL STATES (STRICTLY 2 TABS: CODE & PREVIEW)
  // Tab 1 ONLY: Section Name, Section Image, Custom Code Adding Area
  // Tab 2: Full Section Preview
  // =========================================================================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'code' | 'preview'>('code');

  // Tab 1 fields:
  const [newTitle, setNewTitle] = useState('Featured Promotion Section');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newImageFileName, setNewImageFileName] = useState<string>('');
  const [newImageSize, setNewImageSize] = useState<number>(0);
  const [customCode, setCustomCode] = useState(
`<div class="max-w-7xl mx-auto px-6 py-12">
  <div class="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-700 to-purple-800 p-8 md:p-12 text-white shadow-2xl">
    <div class="relative z-10 max-w-2xl space-y-4">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider text-indigo-200 uppercase">
        Special Announcement
      </span>
      <h2 class="text-3xl md:text-5xl font-black tracking-tight leading-tight">
        {{headline}}
      </h2>
      <p class="text-sm md:text-base text-indigo-100/90 leading-relaxed">
        {{subtext}}
      </p>
      <div class="pt-4 flex flex-wrap items-center gap-3">
        <a href="{{buttonUrl}}" class="px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20">
          {{buttonText}}
        </a>
      </div>
    </div>
  </div>
</div>`
  );

  // Tab 2 Preview states
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewDarkTheme, setPreviewDarkTheme] = useState(true);
  const [isSavingNewSection, setIsSavingNewSection] = useState(false);

  // File upload input ref for modal
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  // File upload input ref for right editor
  const editorFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when selected section changes
  const handleSelectSection = (sec: SectionRecord) => {
    setSelectedSectionId(sec.id);
    setHeadline(sec.draftContent?.headline || sec.internalTitle.replace(/^S\.\d+\s*/, ''));
    setSubtext(sec.draftContent?.description || sec.draftContent?.subheadline || sec.draftContent?.subtext || '');
    setButtonText(sec.draftContent?.primaryCtaText || sec.draftContent?.buttonText || 'Start your project brief');
    setButtonUrl(sec.draftContent?.buttonUrl || '#contact');
    setSectionImageUrl(sec.draftContent?.image || sec.thumbnailUrl || '');
    setSectionImageAlt(sec.draftContent?.imageAlt || '');
    setBgColor(sec.designSettings?.backgroundColor || '#06070a');
    setFontFamily(sec.designSettings?.fontFamily || 'Plus Jakarta Sans, sans-serif');
    setTextAlign((sec.designSettings?.textAlign as any) || 'left');
    setSpacing(sec.designSettings?.paddingY || 'Large');
    setCustomHtmlEdit(sec.draftContent?.customHtml || '');
    setEditMode('visual');
  };

  // Handle uploading section image in modal (Tab 1)
  const handleModalImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewImageUrl(reader.result as string);
      setNewImageFileName(file.name);
      setNewImageSize(file.size);
      showNotice('success', `Uploaded section image "${file.name}"`);
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading section image in right editor
  const handleEditorImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSectionImageUrl(dataUrl);
      if (!sectionImageAlt) {
        setSectionImageAlt(file.name.replace(/\.[^/.]+$/, ''));
      }
      showNotice('success', `Uploaded new image for section: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Visibility toggle
  const handleToggleVisibility = async (sec: SectionRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: SectionRecord = {
      ...sec,
      isVisible: !sec.isVisible,
      status: 'draft',
    };
    await onSaveSection(updated);
    showNotice('success', `${sec.internalTitle} is now ${updated.isVisible ? 'Visible' : 'Hidden'}`);
  };

  // Move section Up or Down
  const handleMoveSection = async (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const newSorted = [...sorted];
    const [moved] = newSorted.splice(index, 1);
    newSorted.splice(targetIdx, 0, moved);

    const reordered = newSorted.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    if (onReorderSections) {
      await onReorderSections(reordered);
    } else {
      for (const item of reordered) {
        await onSaveSection(item);
      }
    }
    showNotice('success', `Moved "${moved.internalTitle}" ${direction === 'up' ? 'up' : 'down'}`);
  };

  // Delete section
  const handleDeleteSection = async (secId: string) => {
    try {
      if (onDeleteSection) {
        await onDeleteSection(secId);
      }
      setDeletingSectionId(null);
      if (selectedSectionId === secId) {
        const remaining = sorted.filter((s) => s.id !== secId);
        if (remaining.length > 0) {
          handleSelectSection(remaining[0]);
        }
      }
      showNotice('success', 'Section permanently deleted');
    } catch (err: any) {
      showNotice('error', `Failed to delete: ${err.message}`);
    }
  };

  // Save changes to current section without touching code
  const handleSaveDraft = async () => {
    if (!selectedSection) return;
    setIsSaving(true);
    try {
      const updated: SectionRecord = {
        ...selectedSection,
        thumbnailUrl: sectionImageUrl || selectedSection.thumbnailUrl,
        draftContent: {
          ...selectedSection.draftContent,
          headline,
          description: subtext,
          subtext,
          primaryCtaText: buttonText,
          buttonText,
          buttonUrl,
          image: sectionImageUrl,
          imageAlt: sectionImageAlt,
          ...(selectedSection.sectionType === 'custom' ? { customHtml: customHtmlEdit } : {}),
        },
        designSettings: {
          ...selectedSection.designSettings,
          backgroundColor: bgColor,
          fontFamily,
          textAlign,
          paddingY: spacing,
        },
        status: 'draft',
      };
      await onSaveSection(updated);
      showNotice('success', `Saved changes for "${selectedSection.internalTitle}"`);
    } catch (err: any) {
      showNotice('error', `Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish all
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (selectedSection) {
        await handleSaveDraft();
      }
      await onPublishAll();
      showNotice('success', 'Published changes across live website!');
    } catch (err: any) {
      showNotice('error', `Publish failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Save new section from modal
  const handleSaveNewSection = async () => {
    if (!newTitle.trim()) {
      showNotice('error', 'Please enter a section name.');
      return;
    }
    if (!customCode.trim()) {
      showNotice('error', 'Section code cannot be empty.');
      return;
    }

    setIsSavingNewSection(true);

    try {
      const newId = `sec-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newSectionRecord: SectionRecord = {
        id: newId,
        pageId: 'page-home',
        sectionType: 'custom',
        internalTitle: newTitle.trim(),
        isVisible: true,
        order: sorted.length + 1,
        status: 'draft',
        thumbnailUrl: newImageUrl,
        draftContent: {
          headline: newTitle.trim(),
          subtext: 'Custom section content designed for high conversion.',
          buttonText: 'Explore More',
          buttonUrl: '#contact',
          image: newImageUrl,
          customHtml: customCode,
        },
        designSettings: {
          backgroundColor: '#06070a',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          textAlign: 'left',
          paddingY: 'Normal',
        },
        mediaRefs: [],
        pagesAssigned: ['page-home'],
        updatedAt: new Date().toISOString(),
      };

      await onSaveSection(newSectionRecord);

      // Re-normalize orders
      const updatedList = [...sorted, newSectionRecord].sort((a, b) => a.order - b.order);
      const renumbered = updatedList.map((item, idx) => ({ ...item, order: idx + 1 }));
      if (onReorderSections) {
        await onReorderSections(renumbered);
      }

      // Also automatically add to Home page if available
      const homePage = pages.find((p) => p.id === 'page-home' || p.slug === '/' || p.slug === '/home');
      if (homePage && onSavePage) {
        const currentOrder = homePage.sectionOrder || [];
        if (!currentOrder.includes(newId)) {
          await onSavePage({
            ...homePage,
            sectionOrder: [...currentOrder, newId],
          });
        }
      }

      setSelectedSectionId(newId);
      setIsAddModalOpen(false);
      showNotice('success', `Created section "${newTitle}"! You can now customize content and insert into any page.`);
    } catch (err: any) {
      showNotice('error', `Failed to create section: ${err.message}`);
    } finally {
      setIsSavingNewSection(false);
    }
  };

  // Insert current section into a specific page
  const handleInsertSectionIntoPage = async () => {
    if (!selectedSection) return;
    const targetPage = pages.find((p) => p.id === selectedPageToInsert);
    if (!targetPage) {
      showNotice('error', 'Please select a valid page to insert into.');
      return;
    }

    setIsInsertingIntoPage(true);
    try {
      const currentOrder = [...(targetPage.sectionOrder || [])];
      // Remove existing occurrence if already there
      const filtered = currentOrder.filter((id) => id !== selectedSection.id);

      let newOrder: string[] = [];
      if (insertPlacement === 'top') {
        newOrder = [selectedSection.id, ...filtered];
      } else if (insertPlacement === 'after-hero') {
        const heroIdx = filtered.indexOf('sec-hero');
        if (heroIdx !== -1) {
          filtered.splice(heroIdx + 1, 0, selectedSection.id);
          newOrder = filtered;
        } else {
          newOrder = [selectedSection.id, ...filtered];
        }
      } else if (insertPlacement === 'before-footer') {
        const footerIdx = filtered.indexOf('sec-footer');
        if (footerIdx !== -1) {
          filtered.splice(footerIdx, 0, selectedSection.id);
          newOrder = filtered;
        } else {
          newOrder = [...filtered, selectedSection.id];
        }
      } else {
        newOrder = [...filtered, selectedSection.id];
      }

      const updatedPage: PageRecord = {
        ...targetPage,
        sectionOrder: newOrder,
      };

      if (onSavePage) {
        await onSavePage(updatedPage);
      }

      // Also record in pagesAssigned
      const assigned = Array.from(new Set([...(selectedSection.pagesAssigned || []), targetPage.id]));
      await onSaveSection({
        ...selectedSection,
        pagesAssigned: assigned,
      });

      showNotice('success', `Inserted "${selectedSection.internalTitle}" into ${targetPage.title} (${targetPage.slug})!`);
    } catch (err: any) {
      showNotice('error', `Failed to insert into page: ${err.message}`);
    } finally {
      setIsInsertingIntoPage(false);
    }
  };

  // Remove section from a specific page
  const handleRemoveSectionFromPage = async (pageId: string) => {
    if (!selectedSection) return;
    const targetPage = pages.find((p) => p.id === pageId);
    if (!targetPage) return;

    try {
      const updatedOrder = (targetPage.sectionOrder || []).filter((id) => id !== selectedSection.id);
      if (onSavePage) {
        await onSavePage({
          ...targetPage,
          sectionOrder: updatedOrder,
        });
      }

      const assigned = (selectedSection.pagesAssigned || []).filter((id) => id !== pageId);
      await onSaveSection({
        ...selectedSection,
        pagesAssigned: assigned,
      });

      showNotice('success', `Removed "${selectedSection.internalTitle}" from ${targetPage.title}`);
    } catch (err: any) {
      showNotice('error', `Failed to remove: ${err.message}`);
    }
  };

  // Helper to determine which pages currently contain the selected section
  const pagesContainingSection = pages.filter(
    (p) =>
      p.sectionOrder?.includes(selectedSection?.id) ||
      selectedSection?.pagesAssigned?.includes(p.id)
  );

  // Thumbnail map for standard sections
  const DEFAULT_THUMBNAILS: Record<string, string> = {
    'sec-hero': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop',
    'sec-channels': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop',
    'sec-creative': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop',
    'sec-innovation': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
    'sec-workshops': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&fit=crop',
    'sec-workflow': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop',
    'sec-about': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format&fit=crop',
    'sec-proven': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop',
    'sec-journal': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop',
    'sec-clients': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop',
    'sec-faq': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop',
    'sec-pricing': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop',
    'sec-contact': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop',
    'sec-footer': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header with "Add Section" Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build custom code sections, modify text and styling without touching code, and insert anywhere across your pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Top-Right "Add Section" Button */}
          <button
            type="button"
            onClick={() => {
              setNewTitle('Featured Promotion Section');
              setNewImageUrl('');
              setNewImageFileName('');
              setModalTab('code');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Section</span>
          </button>

          <button
            type="button"
            onClick={onTogglePreview}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            <span>{isPublishing ? 'Publishing...' : 'Publish changes'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Master Sections List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs divide-y divide-slate-100">
          <div className="pb-3 px-2 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>PAGE SECTIONS ({sorted.length})</span>
            <span className="text-[11px] font-normal text-slate-400">Use &uarr; &darr; to order on page</span>
          </div>

          {sorted.map((sec, idx) => {
            const isSelected = sec.id === selectedSectionId;
            const isCustom = sec.sectionType === 'custom';
            const thumbUrl =
              sec.thumbnailUrl ||
              sec.draftContent?.image ||
              DEFAULT_THUMBNAILS[sec.id] ||
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop';
            const cleanTitle = sec.internalTitle.replace(/^S\.\d+\s*/, '');
            const excerpt =
              sec.draftContent?.headline ||
              sec.draftContent?.description ||
              sec.draftContent?.subtext ||
              (isCustom ? 'Custom designed section code.' : 'Configured section content.');

            return (
              <div
                key={sec.id}
                onClick={() => handleSelectSection(sec)}
                className={`py-3 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                  isSelected ? 'bg-indigo-50/70 border border-indigo-200/60' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Up / Down placement controls to reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => handleMoveSection(idx, 'up', e)}
                      className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sorted.length - 1}
                      onClick={(e) => handleMoveSection(idx, 'down', e)}
                      className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Section Image / Thumbnail */}
                  <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative flex items-center justify-center">
                    <img
                      src={thumbUrl}
                      alt={cleanTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop';
                      }}
                    />
                    {isCustom && (
                      <span className="absolute bottom-0 right-0 bg-indigo-600 text-[8px] font-bold text-white px-1 rounded-tl">
                        CODE
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">{cleanTitle}</span>
                      {isCustom && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-100 text-indigo-700 font-semibold shrink-0">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{excerpt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Position number */}
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>

                  {/* Active Visibility Toggle Switch */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleVisibility(sec, e)}
                    className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                      sec.isVisible !== false ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                    title={sec.isVisible !== false ? 'Visible on page' : 'Hidden'}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        sec.isVisible !== false ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>

                  {/* Delete Button with Inline Confirmation */}
                  {deletingSectionId === sec.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingSectionId(null)}
                        className="px-1.5 py-0.5 text-slate-500 rounded text-[10px] hover:bg-slate-200 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingSectionId(sec.id);
                      }}
                      className="p-1 text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (5 cols): Section Detail Editor (Modify without touching code) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5 sticky top-6 max-h-[88vh] overflow-y-auto">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {selectedSection?.sectionType === 'custom' ? 'Custom Section' : 'Standard Section'}
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedSection?.internalTitle?.replace(/^S\.\d+\s*/, '') || 'Section Editor'}
              </h2>
            </div>

            {/* Toggle between Visual Content & Code for custom sections */}
            {selectedSection?.sectionType === 'custom' ? (
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditMode('visual')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    editMode === 'visual' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Content &amp; Design
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode('code')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    editMode === 'code' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw Code
                </button>
              </div>
            ) : (
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Order #{sorted.findIndex((s) => s.id === selectedSection?.id) + 1}
              </span>
            )}
          </div>

          {/* EDIT MODE: RAW CODE */}
          {selectedSection?.sectionType === 'custom' && editMode === 'code' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">Custom Code (HTML &amp; Tailwind)</label>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle(selectedSection.internalTitle);
                    setCustomCode(customHtmlEdit);
                    setNewImageUrl(sectionImageUrl);
                    setModalTab('preview');
                    setIsAddModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview Full Section</span>
                </button>
              </div>
              <textarea
                value={customHtmlEdit}
                onChange={(e) => setCustomHtmlEdit(e.target.value)}
                rows={12}
                className="w-full bg-[#0d1117] text-emerald-400 font-mono border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs leading-relaxed outline-none shadow-inner"
                placeholder="<div>Custom section HTML & Tailwind...</div>"
                spellCheck={false}
              />
              <p className="text-[11px] text-slate-400">
                Tip: You can use <code className="text-indigo-600 font-mono">{'{{headline}}'}</code>,{' '}
                <code className="text-indigo-600 font-mono">{'{{subtext}}'}</code>,{' '}
                <code className="text-indigo-600 font-mono">{'{{buttonText}}'}</code>, and{' '}
                <code className="text-indigo-600 font-mono">{'{{image}}'}</code> to let team members modify content without touching code.
              </p>
            </div>
          ) : (
            /* EDIT MODE: VISUAL CONTENT & DESIGN (MODIFY WITHOUT TOUCHING CODE) */
            <div className="space-y-4 text-xs">
              {/* 1. TEXT CONTENT SECTION */}
              <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Text Content (No Code Needed)</span>
                </span>

                {/* Headline Field */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Section Headline / Title</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Enter headline..."
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                  />
                </div>

                {/* Subtext Field */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Subtitle / Description Text</label>
                  <textarea
                    value={subtext}
                    onChange={(e) => setSubtext(e.target.value)}
                    rows={2}
                    placeholder="Enter description..."
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-900 outline-none shadow-2xs"
                  />
                </div>

                {/* Button Text & URL */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Start Now"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Button Link (URL)</label>
                    <input
                      type="text"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="e.g. #contact"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SECTION IMAGE & ALT TEXT (MODIFY WITHOUT TOUCHING CODE) */}
              <div className="space-y-2.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Section Image &amp; SEO</span>
                </span>

                <div className="flex items-center gap-3">
                  {/* Thumbnail display */}
                  <div className="w-16 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                    {sectionImageUrl ? (
                      <img src={sectionImageUrl} alt={sectionImageAlt || 'Preview'} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    {/* Hidden input to upload from computer */}
                    <input
                      type="file"
                      ref={editorFileInputRef}
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditorImageUpload(file);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editorFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload from Computer</span>
                      </button>

                      {sectionImageUrl && (
                        <button
                          type="button"
                          onClick={() => setSectionImageUrl('')}
                          className="px-2 py-1.5 text-slate-500 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alt Text input */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Image Alt Text (Google SEO)</label>
                  <input
                    type="text"
                    value={sectionImageAlt}
                    onChange={(e) => setSectionImageAlt(e.target.value)}
                    placeholder="Descriptive alt text for Googlebot indexing..."
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. CUSTOM DESIGN STYLING (MODIFY WITHOUT TOUCHING CODE) */}
              <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Custom Design &amp; Typography</span>
                </span>

                {/* Font Family Selector */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs cursor-pointer font-medium"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Background Color & Preset Swatches */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Background Color</label>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">{bgColor}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono outline-none uppercase"
                    />
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shrink-0 shadow-2xs">
                      <input
                        type="color"
                        value={bgColor.startsWith('#') ? bgColor : '#06070a'}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-full h-full" style={{ backgroundColor: bgColor }} />
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLOR_PRESETS.map((cp) => (
                      <button
                        key={cp.hex}
                        type="button"
                        onClick={() => setBgColor(cp.hex)}
                        title={cp.name}
                        className={`w-6 h-6 rounded-md border transition-transform cursor-pointer ${
                          bgColor.toLowerCase() === cp.hex.toLowerCase()
                            ? 'scale-110 ring-2 ring-indigo-500 border-white'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: cp.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Alignment & Vertical Spacing */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Text Alignment</label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setTextAlign('left')}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                          textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('center')}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                          textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('right')}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                          textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Align Right"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Vertical Spacing</label>
                    <select
                      value={spacing}
                      onChange={(e) => setSpacing(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="Compact">Compact (py-8)</option>
                      <option value="Normal">Normal (py-12)</option>
                      <option value="Large">Large (py-16)</option>
                      <option value="XLarge">Extra Large (py-24)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 4. PAGE INSERTION WORKFLOW ("INSERT THIS SECTION INTO ANY PAGE")   */}
          {/* ================================================================= */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Page Placement (Insert into Pages)</span>
              </span>
            </div>

            {/* Currently Active Pages for this section */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 block">Active on Pages:</span>
              <div className="flex flex-wrap gap-1.5">
                {pagesContainingSection.length > 0 ? (
                  pagesContainingSection.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-950 text-[11px] font-medium shadow-2xs"
                    >
                      <span>{p.title} ({p.slug})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSectionFromPage(p.id)}
                        className="text-slate-400 hover:text-red-600 ml-0.5 cursor-pointer font-bold"
                        title="Remove from this page"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Not placed on any page yet.</span>
                )}
              </div>
            </div>

            {/* Selector to insert this section into ANY page */}
            <div className="pt-2 border-t border-indigo-100/80 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">Select Page:</label>
                  <select
                    value={selectedPageToInsert}
                    onChange={(e) => setSelectedPageToInsert(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none cursor-pointer"
                  >
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">Placement Position:</label>
                  <select
                    value={insertPlacement}
                    onChange={(e) => setInsertPlacement(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="after-hero">After Hero Section</option>
                    <option value="top">At the Top (Position #1)</option>
                    <option value="before-footer">Before Footer Section</option>
                    <option value="bottom">At the Bottom</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInsertSectionIntoPage}
                disabled={isInsertingIntoPage}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20 disabled:opacity-60"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isInsertingIntoPage ? 'Inserting...' : 'Insert Section into Page'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons: Delete Section & Save */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {/* Delete Section Button with Inline Confirmation */}
            {selectedSection && (
              <div>
                {deletingSectionId === selectedSection.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-red-600 font-semibold">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(selectedSection.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingSectionId(null)}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingSectionId(selectedSection.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectSection(selectedSection)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20 disabled:opacity-60 flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ADD SECTION POP-UP MODAL (2 TABS: CODE & PREVIEW ONLY)              */}
      {/* Tab 1: Section Name, Section Image, Custom Code Adding Area         */}
      {/* Tab 2: Full Section Preview                                         */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Section</h3>
                  <p className="text-xs text-slate-500">Insert custom code and upload preview image, then preview before saving.</p>
                </div>
              </div>

              {/* 2 Tabs: Code & Preview */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalTab('code')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    modalTab === 'code'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('preview')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    modalTab === 'preview'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: CODE (STRICTLY Section Name, Section Image, and Custom Code) */}
              {modalTab === 'code' && (
                <div className="space-y-5">
                  {/* Field 1: Section Name * */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 block">Section Name *</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Featured Promotion Section"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none shadow-2xs font-medium"
                    />
                  </div>

                  {/* Field 2: Section Image (Upload from Computer) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 block">Section Image</label>
                      <span className="text-[11px] text-slate-400">Preview image thumbnail for this section</span>
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleModalImageUpload(file);
                      }}
                    />

                    {newImageUrl ? (
                      /* Uploaded Image Preview Card */
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={newImageUrl}
                            alt="Section preview"
                            className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {newImageFileName || 'Uploaded section image'}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {newImageSize > 0 ? `${(newImageSize / 1024).toFixed(1)} KB` : 'Image ready'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => modalFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageUrl('');
                              setNewImageFileName('');
                              setNewImageSize(0);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag and Drop / Click Upload Area */
                      <div
                        onClick={() => modalFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleModalImageUpload(file);
                        }}
                        className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          Drop image here to upload, or <span className="text-indigo-600 underline">Select File</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          PNG, JPG, WEBP, or SVG from your computer
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field 3: Custom Code Adding Area */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Custom Code Adding Area (HTML, Tailwind CSS, &amp; Scripts)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Supports <code className="text-indigo-600 font-mono">{'{{headline}}'}</code>,{' '}
                        <code className="text-indigo-600 font-mono">{'{{subtext}}'}</code>,{' '}
                        <code className="text-indigo-600 font-mono">{'{{image}}'}</code>
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="<div class='max-w-7xl mx-auto py-12 px-6'>...</div>"
                      className="w-full bg-[#0d1117] text-emerald-400 font-mono border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs leading-relaxed outline-none shadow-inner"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FULL SECTION PREVIEW */}
              {modalTab === 'preview' && (
                <div className="space-y-4">
                  {/* Viewport & Theme Simulator Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-2.5 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">Simulate Viewport:</span>
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-2xs border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Desktop View (Fluid)"
                        >
                          <Laptop className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('tablet')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            previewDevice === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Tablet View (768px)"
                        >
                          <Tablet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Mobile View (390px)"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={previewDarkTheme}
                          onChange={(e) => setPreviewDarkTheme(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-[11px] text-slate-700 font-medium">Dark Canvas Backdrop</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setModalTab('code')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Edit Code &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Sandboxed Live Render Container (Full Section Preview) */}
                  <div
                    className={`rounded-2xl border border-slate-300/80 overflow-hidden shadow-inner transition-all duration-300 min-h-[380px] flex items-center justify-center p-4 ${
                      previewDarkTheme ? 'bg-[#06070a]' : 'bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-full transition-all duration-300 overflow-x-auto ${
                        previewDevice === 'tablet'
                          ? 'max-w-[768px] mx-auto border border-neutral-700/60 rounded-2xl shadow-xl'
                          : previewDevice === 'mobile'
                          ? 'max-w-[390px] mx-auto border border-neutral-700/60 rounded-3xl shadow-xl'
                          : 'w-full'
                      }`}
                    >
                      {/* Rendered Custom HTML with bound values and image */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderBoundCustomCode(
                            customCode,
                            { headline: newTitle, subtext: 'Custom section content designed for high conversion.', buttonText: 'Explore More', buttonUrl: '#contact' },
                            { backgroundColor: '#06070a', fontFamily: 'Plus Jakarta Sans, sans-serif' },
                            newImageUrl
                          ),
                        }}
                        className="w-full text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {modalTab === 'code' ? (
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Switch to Preview</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalTab('code')}
                    className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Back to Code</span>
                  </button>
                )}
              </div>

              {/* Save & Create Section Button */}
              <button
                type="button"
                onClick={handleSaveNewSection}
                disabled={isSavingNewSection}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/25 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isSavingNewSection ? 'Saving...' : 'Save & Create Section'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
