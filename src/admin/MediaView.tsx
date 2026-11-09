import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Video,
  Box,
  Sparkles,
  FileText,
  Download,
  ExternalLink,
  X,
  Search,
  AlertCircle,
  Eye,
  CheckCircle2,
  CheckCircle,
  Info,
  Maximize2,
} from 'lucide-react';
import { MediaItemRecord, MediaCategory } from '../types/cms';

interface MediaViewProps {
  media: MediaItemRecord[];
  onUploadMedia: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveMediaItem?: (item: MediaItemRecord) => Promise<void>;
  onDeleteMedia?: (mediaId: string) => Promise<void>;
  onNavigateSubNav: (sub: 'pages' | 'posts' | 'media') => void;
  showNotice: (type: 'success' | 'error', message: string) => void;
}

interface QueuedFile {
  file: File;
  previewUrl: string;
  title: string;
  altText: string;
  caption: string;
  category: MediaCategory;
  dimensions?: { width: number; height: number };
}

export const MediaView: React.FC<MediaViewProps> = ({
  media,
  onUploadMedia,
  onSaveMediaItem,
  onDeleteMedia,
  onNavigateSubNav,
  showNotice,
}) => {
  const [activeType, setActiveType] = useState<MediaCategory>('images');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal State (when user clicks an item)
  const [selectedItem, setSelectedItem] = useState<MediaItemRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ title?: string; altText?: string }>({});
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isUploadingQueue, setIsUploadingQueue] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Format bytes into readable string
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Helper: Detect category from MIME / extension
  const detectCategory = (file: File): MediaCategory => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf';
    if (file.type.startsWith('video/') || file.name.endsWith('.mp4')) return 'videos';
    if (file.name.startsWith('icon-')) return 'icons';
    if (file.name.endsWith('.svg') || file.type === 'image/svg+xml') return 'svg';
    return 'images';
  };

  // When selectedItem changes, initialize form fields
  useEffect(() => {
    if (selectedItem) {
      setEditTitle(selectedItem.title || selectedItem.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      setEditAltText(selectedItem.altText || selectedItem.title || selectedItem.filename);
      setEditCaption(selectedItem.caption || '');
      setEditDescription(selectedItem.description || '');
      setValidationErrors({});
      setConfirmingDelete(false);
    }
  }, [selectedItem]);

  // Handle single item copy link
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotice('success', `Copied link: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle download of any media file
  const handleDownload = (item: MediaItemRecord) => {
    try {
      const link = document.createElement('a');
      link.href = item.storageUrl;
      link.download = item.originalName || item.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotice('success', `Downloading ${item.filename}...`);
    } catch (err) {
      showNotice('error', 'Download could not start automatically. Opening file in new tab.');
      window.open(item.storageUrl, '_blank');
    }
  };

  // Save changes to media item (with Alt Text & Title validation)
  const handleSaveItemDetails = async () => {
    if (!selectedItem) return;

    const errors: { title?: string; altText?: string } = {};
    if (!editTitle.trim()) {
      errors.title = 'Title is mandatory.';
    }
    if (!editAltText.trim()) {
      errors.altText = 'Alt Text is mandatory for Google image indexing & accessibility.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showNotice('error', 'Please fill in both mandatory fields: Alt Text and Title.');
      return;
    }

    setIsSavingDetails(true);
    const updated: MediaItemRecord = {
      ...selectedItem,
      title: editTitle.trim(),
      altText: editAltText.trim(),
      caption: editCaption.trim(),
      description: editDescription.trim(),
    };

    try {
      if (onSaveMediaItem) {
        await onSaveMediaItem(updated);
      }
      setSelectedItem(updated);
      showNotice('success', `Updated SEO metadata for ${updated.filename}. Googlebot can now read this asset.`);
    } catch (err: any) {
      showNotice('error', `Failed to save: ${err.message}`);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Delete media item permanently
  const handleDeletePermanently = async () => {
    if (!selectedItem) return;
    const itemToDelete = selectedItem;
    setIsDeleting(true);

    try {
      setSelectedItem(null);
      setConfirmingDelete(false);

      if (onDeleteMedia) {
        await onDeleteMedia(itemToDelete.id);
      }
      showNotice('success', `Permanently deleted "${itemToDelete.title || itemToDelete.filename}"`);
    } catch (err: any) {
      showNotice('error', `Failed to delete: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  // Process files for staging queue (Multi-file upload)
  const handleQueueFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newQueued: QueuedFile[] = [];
    Array.from(files).forEach((file) => {
      const category = detectCategory(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const previewUrl = URL.createObjectURL(file);

      newQueued.push({
        file,
        previewUrl,
        title: cleanName,
        altText: `${cleanName} - Orbit Digital Media Asset`,
        caption: '',
        category,
      });
    });

    setQueuedFiles((prev) => [...prev, ...newQueued]);
  };

  // Execute upload of all queued files
  const handleUploadAllQueued = async () => {
    if (queuedFiles.length === 0) return;

    setIsUploadingQueue(true);
    setUploadProgress(10);

    try {
      for (let i = 0; i < queuedFiles.length; i++) {
        const item = queuedFiles[i];
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        const newRecord: MediaItemRecord = {
          id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          filename: item.file.name,
          originalName: item.file.name,
          title: item.title || item.file.name.replace(/\.[^/.]+$/, ''),
          altText: item.altText || item.title || item.file.name,
          caption: item.caption || '',
          category: item.category,
          mimeType: item.file.type || 'application/octet-stream',
          sizeBytes: item.file.size,
          storageUrl: dataUrl,
          folder: 'uploads',
          uploadedAt: new Date().toISOString(),
        };

        if (onSaveMediaItem) {
          await onSaveMediaItem(newRecord);
        }

        setUploadProgress(Math.round(((i + 1) / queuedFiles.length) * 100));
      }

      showNotice('success', `Successfully uploaded ${queuedFiles.length} files to Orbit CMS!`);
      setQueuedFiles([]);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      showNotice('error', `Upload error: ${err.message}`);
    } finally {
      setIsUploadingQueue(false);
      setUploadProgress(0);
    }
  };

  // Drag and drop handlers for upload modal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleQueueFiles(e.dataTransfer.files);
    }
  };

  // Filter media by active tab and search query
  const filteredMedia = media.filter((item) => {
    const matchesCategory = (item.category || 'images') === activeType;
    const matchesSearch =
      searchQuery === '' ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate counts for each category
  const categoryCounts = {
    images: media.filter((m) => (m.category || 'images') === 'images').length,
    videos: media.filter((m) => m.category === 'videos').length,
    icons: media.filter((m) => m.category === 'icons').length,
    svg: media.filter((m) => m.category === 'svg').length,
    pdf: media.filter((m) => m.category === 'pdf').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Hidden file input fallback */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,.svg"
        onChange={(e) => {
          handleQueueFiles(e.target.files);
          setIsUploadModalOpen(true);
        }}
        className="hidden"
      />

      {/* Header with matching purple pill Upload button (image_fa05c105.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Media</h1>
          <p className="text-sm text-slate-500 mt-1">
            Images, videos, icons, SVG vectors, and PDF documents.
          </p>
        </div>

        {/* Purple/Indigo Upload Pill matching image_fa05c105.png */}
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 select-none"
        >
          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Upload</span>
        </button>
      </div>

      {/* Subtabs: Pages | Posts | Media */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onNavigateSubNav('pages')}
          className="pb-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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
          className="pb-3 text-indigo-600 border-b-2 border-indigo-600 cursor-pointer"
        >
          Media
        </button>
      </div>

      {/* Media Type Filter Pills & Search (with PDF tab added) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type pills: Images, Videos, Icons, SVG, PDF */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'images', label: 'Images', icon: ImageIcon, count: categoryCounts.images },
            { id: 'videos', label: 'Videos', icon: Video, count: categoryCounts.videos },
            { id: 'icons', label: 'Icons', icon: Box, count: categoryCounts.icons },
            { id: 'svg', label: 'SVG', icon: Sparkles, count: categoryCounts.svg },
            { id: 'pdf', label: 'PDF', icon: FileText, count: categoryCounts.pdf },
          ].map((type) => {
            const isActive = activeType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveType(type.id as MediaCategory)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <type.icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {type.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeType} by title, alt text, or file...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. IMAGES VIEW (cms-05-media-images.png)                            */}
      {/* =================================================================== */}
      {activeType === 'images' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="aspect-4/3 bg-slate-100 overflow-hidden relative">
                <img
                  src={item.storageUrl}
                  alt={item.altText || item.title || item.filename}
                  title={item.title || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.storageUrl, item.id);
                    }}
                    className="p-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 transition-colors shadow-sm cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                    className="p-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 transition-colors shadow-sm cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Alt Text Badge */}
                {item.altText && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>SEO Ready</span>
                  </div>
                )}
              </div>
              <div className="p-3 text-xs">
                <div className="font-semibold text-slate-900 truncate" title={item.title || item.filename}>
                  {item.title || item.filename}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center justify-between">
                  <span>{formatBytes(item.sizeBytes)}</span>
                  <span>{item.usedBySections ? `Used on ${item.usedBySections.length} pages` : 'In Library'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. VIDEOS VIEW (cms-06-media-videos.png)                            */}
      {/* =================================================================== */}
      {activeType === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMedia.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setSelectedItem(vid)}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="aspect-16/10 bg-slate-900 overflow-hidden relative flex items-center justify-center">
                <video
                  src={vid.storageUrl}
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-800 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] text-white font-mono">
                  {vid.duration || '0:15'}
                </div>
              </div>
              <div className="p-3.5 text-xs">
                <div className="font-semibold text-slate-900 truncate" title={vid.title || vid.filename}>
                  {vid.title || vid.filename}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
                  <span>{formatBytes(vid.sizeBytes)}</span>
                  <span className="text-indigo-600 font-medium">VideoObject</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. ICONS VIEW (cms-07-media-icons.png)                              */}
      {/* =================================================================== */}
      {activeType === 'icons' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredMedia.map((icon) => (
            <div
              key={icon.id}
              onClick={() => setSelectedItem(icon)}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50/50 transition-all">
                <Box className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-600 truncate w-full font-medium" title={icon.title || icon.filename}>
                {icon.filename}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{formatBytes(icon.sizeBytes)}</span>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. SVG SHAPES VIEW (cms-08-media-svg.png)                           */}
      {/* =================================================================== */}
      {activeType === 'svg' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredMedia.map((shape) => (
            <div
              key={shape.id}
              onClick={() => setSelectedItem(shape)}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50/60 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-indigo-900 font-semibold truncate w-full" title={shape.title || shape.filename}>
                {shape.filename}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{formatBytes(shape.sizeBytes)}</span>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. PDF DOCUMENTS VIEW (New PDF Tab requested by user)              */}
      {/* =================================================================== */}
      {activeType === 'pdf' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((pdf) => (
            <div
              key={pdf.id}
              onClick={() => setSelectedItem(pdf)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {pdf.title || pdf.filename}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    {pdf.filename} &bull; {formatBytes(pdf.sizeBytes)}
                  </div>
                </div>
              </div>

              {pdf.description && (
                <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                  {pdf.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PDF Document
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(pdf);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500">
            {searchQuery
              ? `No ${activeType} match your search "${searchQuery}".`
              : `Your ${activeType} library is currently empty.`}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload {activeType}</span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. DETAIL POP-UP (Big Image on Left, Input Fields Area on Right)     */}
      {/* =================================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
            
            {/* LEFT SIDE: BIG IMAGE / PREVIEW DISPLAY */}
            <div className="md:w-1/2 bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden min-h-[300px] md:min-h-[560px]">
              {/* Top watermark / type badge */}
              <div className="flex items-center justify-between text-xs z-10">
                <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white font-mono text-[11px] uppercase tracking-wider">
                  {selectedItem.category || 'image'} preview
                </span>
                <span className="text-white/60 font-mono text-[11px]">
                  {selectedItem.dimensions ? `${selectedItem.dimensions.width} × ${selectedItem.dimensions.height} px` : ''}
                </span>
              </div>

              {/* Central Big Preview */}
              <div className="flex-1 flex items-center justify-center my-4 overflow-hidden relative">
                {selectedItem.category === 'videos' || selectedItem.mimeType.startsWith('video/') ? (
                  <video
                    src={selectedItem.storageUrl}
                    controls
                    playsInline
                    className="max-h-[420px] max-w-full rounded-xl shadow-lg border border-white/10"
                  />
                ) : selectedItem.category === 'pdf' || selectedItem.mimeType === 'application/pdf' ? (
                  <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-sm space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-white font-semibold text-sm line-clamp-2">{selectedItem.title || selectedItem.filename}</div>
                    <p className="text-white/60 text-xs font-mono">{formatBytes(selectedItem.sizeBytes)}</p>
                    <button
                      type="button"
                      onClick={() => handleDownload(selectedItem)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ) : selectedItem.category === 'icons' || selectedItem.category === 'svg' ? (
                  <div className="w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner">
                    {selectedItem.category === 'icons' ? (
                      <Box className="w-24 h-24 stroke-[1.2]" />
                    ) : (
                      <Sparkles className="w-24 h-24 stroke-[1.2]" />
                    )}
                  </div>
                ) : (
                  <img
                    src={selectedItem.storageUrl}
                    alt={editAltText || selectedItem.altText || selectedItem.filename}
                    title={editTitle || selectedItem.title || selectedItem.filename}
                    className="max-h-[440px] max-w-full object-contain rounded-xl shadow-2xl"
                  />
                )}
              </div>

              {/* Bottom footer bar on preview */}
              <div className="flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-3 font-mono">
                <span className="truncate max-w-[280px]" title={editTitle || selectedItem.title || selectedItem.filename}>
                  {editTitle || selectedItem.title || selectedItem.filename}
                </span>
                <span>{formatBytes(selectedItem.sizeBytes)}</span>
              </div>
            </div>

            {/* RIGHT SIDE: INPUT FIELDS AREA (Alt Text, Title, Caption, Description, File URL) */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Attachment Details</h3>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File Info Bar above Alt Text (File Size Displaying) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">File Size:</span>
                  <span className="font-semibold text-slate-800 font-mono">{formatBytes(selectedItem.sizeBytes)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">File Type:</span>
                  <span className="font-semibold text-slate-800 uppercase font-mono">{selectedItem.mimeType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Uploaded:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedItem.uploadedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Dimensions:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedItem.dimensions ? `${selectedItem.dimensions.width} × ${selectedItem.dimensions.height} px` : selectedItem.duration || 'Vector / Doc'}
                  </span>
                </div>
              </div>

              {/* Form Input Fields Area */}
              <div className="space-y-4">
                {/* 1. ALT TEXT (MANDATORY *) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>Alt Text</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => {
                      setEditAltText(e.target.value);
                      if (validationErrors.altText) setValidationErrors((prev) => ({ ...prev, altText: undefined }));
                    }}
                    placeholder="Describe this image for screen readers and search engines..."
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      validationErrors.altText
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {validationErrors.altText && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {validationErrors.altText}
                    </p>
                  )}
                </div>

                {/* 2. TITLE (MANDATORY *) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>Title</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      if (validationErrors.title) setValidationErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    placeholder="Display title for asset and tooltip..."
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      validationErrors.title
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* 3. IMAGE CAPTION */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">Image Caption</label>
                  <textarea
                    rows={2}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Editorial caption displayed below the media (<figcaption>)..."
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                  />
                </div>

                {/* 4. DESCRIPTION */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Detailed explanation, context, or transcript for search engine indexing..."
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                  />
                </div>

                {/* 5. FILE URL */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">File URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.storageUrl}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-600 outline-none select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedItem.storageUrl, selectedItem.id)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedId === selectedItem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons: Save changes, Download file, Delete permanently */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-red-600">Delete permanently?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePermanently}
                      disabled={isDeleting}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete permanently</span>
                  </button>
                )}

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedItem)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download file</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveItemDetails}
                    disabled={isSavingDetails}
                    className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/25 disabled:opacity-50"
                  >
                    {isSavingDetails ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. UPLOAD POP-UP MODAL (image_880d1f5c.png with enhanced design)     */}
      {/* =================================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden p-6 md:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Media Files</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select or drag multiple files from your computer to add to Orbit CMS
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setQueuedFiles([]);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden multi-file input */}
            <input
              ref={multiFileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf,.svg"
              onChange={(e) => handleQueueFiles(e.target.files)}
              className="hidden"
            />

            {/* Drop Zone matching image_880d1f5c.png */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
              onClick={() => multiFileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-7 h-7 stroke-[2]" />
              </div>

              {/* Exact text typography from image_880d1f5c.png */}
              <h4 className="text-base font-normal text-slate-800 tracking-tight">Drop files to upload</h4>
              <span className="text-xs text-slate-400 my-2">or</span>

              {/* Blue outline button matching screenshot */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  multiFileInputRef.current?.click();
                }}
                className="px-6 py-2 rounded-xl border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Select Files
              </button>

              <p className="text-[11px] text-slate-400 mt-4">
                Images (JPG, PNG, WEBP), Videos (MP4), SVG Vectors, Icons, and PDF documents up to 50MB
              </p>
            </div>

            {/* Queued Staging Files List (Multi-file support) */}
            {queuedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    Ready to upload ({queuedFiles.length} file{queuedFiles.length > 1 ? 's' : ''})
                  </span>
                  <button
                    type="button"
                    onClick={() => setQueuedFiles([])}
                    className="text-slate-400 hover:text-red-600 text-[11px] font-medium transition-colors"
                  >
                    Clear queue
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {queuedFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.category === 'images' ? (
                            <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                          ) : item.category === 'pdf' ? (
                            <FileText className="w-5 h-5 text-red-500" />
                          ) : item.category === 'videos' ? (
                            <Video className="w-5 h-5 text-indigo-500" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">{item.file.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>{formatBytes(item.file.size)}</span>
                            <span className="uppercase text-indigo-600 font-semibold">{item.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Alt text field for each staged file */}
                      <div className="w-48 hidden sm:block">
                        <input
                          type="text"
                          value={item.altText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQueuedFiles((prev) =>
                              prev.map((f, i) => (i === idx ? { ...f, altText: val } : f))
                            );
                          }}
                          placeholder="Alt text *"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1 text-[11px] text-slate-800 outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setQueuedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Progress Bar */}
                {isUploadingQueue && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>Uploading to CMS...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleUploadAllQueued}
                    disabled={isUploadingQueue}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/25 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload {queuedFiles.length} file{queuedFiles.length > 1 ? 's' : ''} to CMS</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
