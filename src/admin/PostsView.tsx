import React, { useState } from 'react';
import { Plus, Edit2, Eye, Trash2, X } from 'lucide-react';
import { PostRecord } from '../types/cms';

interface PostsViewProps {
  posts: PostRecord[];
  onSavePost: (post: PostRecord) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onNavigateSubNav: (sub: 'pages' | 'posts' | 'media') => void;
  showNotice: (type: 'success' | 'error', message: string) => void;
}

export const PostsView: React.FC<PostsViewProps> = ({
  posts,
  onSavePost,
  onDeletePost,
  onNavigateSubNav,
  showNotice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<PostRecord | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Strategy');
  const [author, setAuthor] = useState('Ali');
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>('Published');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const openEditDrawer = (post: PostRecord) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setAuthor(post.author);
    setStatus(post.status);
    setContent(post.content || '');
    setExcerpt(post.excerpt || '');
  };

  const closeDrawer = () => {
    setEditingPost(null);
  };

  const handleSave = async (newStatus?: 'Published' | 'Draft') => {
    if (!editingPost) return;
    const updated: PostRecord = {
      ...editingPost,
      title,
      category,
      author,
      status: newStatus || status,
      content,
      excerpt,
      date: editingPost.date || 'Today',
    };
    await onSavePost(updated);
    showNotice('success', `Saved post "${title}"`);
    closeDrawer();
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' ? true : p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' ? true : p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Write and manage your blog and news articles.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            const newPost: PostRecord = {
              id: `post-${Date.now()}`,
              title: 'Untitled Article',
              slug: 'untitled-article',
              category: 'Strategy',
              author: 'Ali',
              status: 'Draft',
              date: 'Today',
              content: '',
              excerpt: '',
            };
            openEditDrawer(newPost);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New post</span>
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
          className="pb-3 text-indigo-600 border-b-2 border-indigo-600 cursor-pointer"
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

      {/* Filters: Search, Category, Status */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">Category ▾</option>
            <option value="Strategy">Strategy</option>
            <option value="Creative">Creative</option>
            <option value="Media">Media</option>
            <option value="SEO">SEO</option>
            <option value="Growth">Growth</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">Status ▾</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                <th className="py-3.5 px-6 font-medium">Title</th>
                <th className="py-3.5 px-6 font-medium">Category</th>
                <th className="py-3.5 px-6 font-medium">Author</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Date</th>
                <th className="py-3.5 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPosts.map((post) => {
                const s = post.status.toLowerCase();
                return (
                  <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{post.title}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{post.category}</td>
                    <td className="py-4 px-6 text-slate-600">{post.author}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          s === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : s === 'draft'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{post.date}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(post)}
                          className="p-1 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Edit post"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => showNotice('success', `Previewing "${post.title}"`)}
                          className="p-1 hover:text-slate-800 transition-colors cursor-pointer"
                          title="View post"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeletePost(post.id);
                            showNotice('success', 'Post removed');
                          }}
                          className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Post Slide-over Drawer */}
      {editingPost && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/20 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Edit post</h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Post Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                  >
                    <option value="Strategy">Strategy</option>
                    <option value="Creative">Creative</option>
                    <option value="Media">Media</option>
                    <option value="SEO">SEO</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Article Body Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => handleSave('Draft')}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => handleSave('Published')}
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
