import React, { useState } from 'react';
import { Plus, Edit2, Eye, EyeOff, X, Check } from 'lucide-react';
import { MenuTemplateRecord } from '../types/cms';

interface MenusViewProps {
  menus: MenuTemplateRecord[];
  onSaveMenu: (menu: MenuTemplateRecord) => Promise<void>;
  showNotice: (type: 'success' | 'error', message: string) => void;
}

export const MenusView: React.FC<MenusViewProps> = ({ menus, onSaveMenu, showNotice }) => {
  const [editingMenu, setEditingMenu] = useState<MenuTemplateRecord | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuScope, setMenuScope] = useState('');
  const [menuStatus, setMenuStatus] = useState<'Active' | 'Disabled'>('Active');
  const [menuItemsText, setMenuItemsText] = useState('');

  const headers = menus.filter((m) => m.type === 'header');
  const footers = menus.filter((m) => m.type === 'footer');

  const openEditModal = (menu: MenuTemplateRecord) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setMenuScope(menu.scope);
    setMenuStatus(menu.status);
    setMenuItemsText(menu.items.join(', '));
  };

  const closeModal = () => {
    setEditingMenu(null);
  };

  const handleSave = async () => {
    if (!editingMenu) return;
    const items = menuItemsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated: MenuTemplateRecord = {
      ...editingMenu,
      name: menuName,
      scope: menuScope,
      status: menuStatus,
      items,
    };
    await onSaveMenu(updated);
    showNotice('success', `Saved navigation template "${menuName}"`);
    closeModal();
  };

  const handleToggleStatus = async (menu: MenuTemplateRecord) => {
    const updated: MenuTemplateRecord = {
      ...menu,
      status: menu.status === 'Active' ? 'Disabled' : 'Active',
    };
    await onSaveMenu(updated);
    showNotice('success', `${menu.name} is now ${updated.status}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Menus</h1>
          <p className="text-sm text-slate-500 mt-1">Create multiple headers and footers. Switch them on or off whenever you need.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            const newMenu: MenuTemplateRecord = {
              id: `menu-${Date.now()}`,
              name: 'New Custom Header',
              type: 'header',
              scope: 'Used on selected pages',
              status: 'Disabled',
              items: ['Home', 'Features', 'Pricing'],
            };
            openEditModal(newMenu);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add new template</span>
        </button>
      </div>

      {/* 1. Headers Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {headers.map((menu) => {
            const isActive = menu.status === 'Active';
            return (
              <div
                key={menu.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{menu.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{menu.scope}</div>

                  {/* Dark preview pill */}
                  <div
                    className={`mt-4 rounded-xl p-3 flex items-center justify-between transition-colors ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold text-xs">{menu.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(menu)}
                        className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Edit menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(menu)}
                        className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
                        title={isActive ? 'Disable header' : 'Enable header'}
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="mt-3 p-2.5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-600 font-medium">
                    {menu.items.join(' · ')}
                  </div>
                </div>

                {/* Status footer */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {menu.status}
                  </span>
                  <span className="text-slate-500">{menu.items.length} menu items</span>
                </div>
              </div>
            );
          })}

          {/* Add new header dashed card */}
          <div
            onClick={() => {
              const newMenu: MenuTemplateRecord = {
                id: `menu-hdr-${Date.now()}`,
                name: 'Campaign Header',
                type: 'header',
                scope: 'Used on Landing pages',
                status: 'Disabled',
                items: ['Special Offer', 'Pricing', 'Book Call'],
              };
              openEditModal(newMenu);
            }}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer min-h-[220px]"
          >
            <Plus className="w-6 h-6" />
            <span className="font-bold text-xs">Add new header</span>
          </div>
        </div>
      </div>

      {/* 2. Footers Section */}
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {footers.map((menu) => {
            const isActive = menu.status === 'Active';
            return (
              <div
                key={menu.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{menu.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{menu.scope}</div>

                  {/* Dark preview pill */}
                  <div
                    className={`mt-4 rounded-xl p-3 flex items-center justify-between transition-colors ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold text-xs">{menu.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(menu)}
                        className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Edit menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(menu)}
                        className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
                        title={isActive ? 'Disable footer' : 'Enable footer'}
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-600 font-medium">
                    {menu.items.join(' · ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {menu.status}
                  </span>
                  <span className="text-slate-500">
                    {menu.columns || 3} columns &bull; {menu.linksCount || 12} links
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add new footer dashed card */}
          <div
            onClick={() => {
              const newMenu: MenuTemplateRecord = {
                id: `menu-ftr-${Date.now()}`,
                name: 'Legal Footer',
                type: 'footer',
                scope: 'Used on Privacy & Terms',
                status: 'Disabled',
                items: ['Privacy Policy', 'Cookie Notice', 'Compliance'],
                columns: 1,
                linksCount: 3,
              };
              openEditModal(newMenu);
            }}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer min-h-[220px]"
          >
            <Plus className="w-6 h-6" />
            <span className="font-bold text-xs">Add new footer</span>
          </div>
        </div>
      </div>

      {/* Edit Menu Modal */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/20 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Edit navigation template</h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Template Name</label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Scope Assignment</label>
                  <input
                    type="text"
                    value={menuScope}
                    onChange={(e) => setMenuScope(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">State</label>
                  <select
                    value={menuStatus}
                    onChange={(e) => setMenuStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Links (Comma separated)</label>
                <textarea
                  value={menuItemsText}
                  onChange={(e) => setMenuItemsText(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 outline-none shadow-2xs font-sans"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                Save template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
