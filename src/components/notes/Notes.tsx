'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3,
  Calendar,
  X 
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { Note } from '../../types';
import { format } from 'date-fns';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, settings } = usePlanner();

  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<'yellow' | 'green' | 'pink' | 'purple' | 'blue'>('yellow');
  const [search, setSearch] = useState('');

  const noteColors = {
    yellow: { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100', border: 'border-amber-300 dark:border-amber-700/50' },
    green: { bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100', border: 'border-emerald-300 dark:border-emerald-700/50' },
    pink: { bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100', border: 'border-rose-300 dark:border-rose-700/50' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100', border: 'border-purple-300 dark:border-purple-700/50' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100', border: 'border-blue-300 dark:border-blue-700/50' },
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('yellow');
    setIsOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (editingNote) {
      await updateNote({
        ...editingNote,
        title: title || 'Untitled Note',
        content,
        color
      });
    } else {
      await addNote({
        title: title || 'Untitled Note',
        content,
        color,
        pinned: false
      });
    }

    setIsOpen(false);
  };

  const handlePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote({
      ...note,
      pinned: !note.pinned
    });
  };

  const filteredNotes = notes.filter(n => {
    const term = search.toLowerCase();
    return n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term);
  });

  const getPrimaryColorClass = () => {
    switch (settings.primaryColor) {
      case 'blue': return 'bg-blue-600 dark:bg-blue-500';
      case 'purple': return 'bg-purple-600 dark:bg-purple-500';
      case 'rose': return 'bg-rose-600 dark:bg-rose-500';
      case 'emerald': return 'bg-emerald-600 dark:bg-emerald-500';
      case 'violet':
      default:
        return 'bg-violet-600 dark:bg-violet-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Notes */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={settings.language === 'vi' ? 'Tìm kiếm ghi chú...' : 'Search notes...'}
            className="w-full glass-input pl-11"
          />
        </div>

        {/* Add note button */}
        <button
          onClick={handleOpenAdd}
          className={`flex items-center space-x-2 text-white font-medium py-2.5 px-5 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shadow-lg ${getPrimaryColorClass()}`}
        >
          <Plus size={18} />
          <span>{settings.language === 'vi' ? 'Thêm ghi chú' : 'Add Note'}</span>
        </button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
          {settings.language === 'vi' ? 'Chưa có ghi chú nào. Hãy bắt đầu ghi chép!' : 'No notes available. Start writing!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const colorTheme = noteColors[note.color] || noteColors.yellow;
            const updatedDate = format(new Date(note.updatedAt), 'dd/MM/yyyy HH:mm');

            return (
              <div
                key={note.id}
                onClick={() => handleOpenEdit(note)}
                className={`p-5 rounded-3xl border border-solid flex flex-col justify-between min-h-[180px] shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer relative ${colorTheme.bg} ${colorTheme.border}`}
              >
                {/* Note Header: Title & Pin status */}
                <div>
                  <div className="flex justify-between items-start mb-2.5 pr-6">
                    <h3 className="font-extrabold text-base tracking-tight line-clamp-1">
                      {note.title}
                    </h3>
                  </div>

                  {/* Pin icon overlay absolute */}
                  <button
                    onClick={(e) => handlePin(note, e)}
                    className={`absolute right-4.5 top-4.5 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                      note.pinned ? 'opacity-100 scale-110 text-red-500' : 'opacity-30 hover:opacity-75'
                    }`}
                    title={note.pinned ? (settings.language === 'vi' ? 'Bỏ ghim' : 'Unpin') : (settings.language === 'vi' ? 'Ghim ghi chú' : 'Pin note')}
                  >
                    <Pin size={15} className={note.pinned ? 'fill-red-500' : ''} />
                  </button>

                  {/* Note Body */}
                  <p className="text-xs md:text-sm line-clamp-4 whitespace-pre-wrap leading-relaxed opacity-85">
                    {note.content}
                  </p>
                </div>

                {/* Footer: Date and Actions */}
                <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 mt-4 text-[10px] md:text-xs">
                  <span className="flex items-center space-x-1 opacity-60">
                    <Calendar size={12} />
                    <span>{updatedDate}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 rounded-lg opacity-40 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                    title={settings.language === 'vi' ? 'Xóa ghi chú' : 'Delete note'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Sticky Note Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">
                {editingNote 
                  ? (settings.language === 'vi' ? 'Chỉnh sửa ghi chú' : 'Edit Note') 
                  : (settings.language === 'vi' ? 'Thêm ghi chú mới' : 'Add Note')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Tiêu đề' : 'Title'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Nhập tiêu đề (tùy chọn)...' : 'Enter title (optional)...'}
                  className="w-full glass-input"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Nội dung ghi chú' : 'Note Content'}
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={settings.language === 'vi' ? 'Viết gì đó vào đây...' : 'Write note body here...'}
                  rows={5}
                  className="w-full glass-input resize-none"
                />
              </div>

              {/* Pastel Colors picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase opacity-60">
                  {settings.language === 'vi' ? 'Màu ghi chú' : 'Note Color'}
                </label>
                <div className="flex items-center space-x-3.5">
                  {(['yellow', 'green', 'pink', 'purple', 'blue'] as const).map((c) => {
                    let hexBg = '#fef3c7'; // amber-100
                    if (c === 'green') hexBg = '#d1fae5'; // emerald-100
                    if (c === 'pink') hexBg = '#ffe4e6'; // rose-100
                    if (c === 'purple') hexBg = '#f3e8ff'; // purple-100
                    if (c === 'blue') hexBg = '#dbeafe'; // blue-100

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-8 h-8 rounded-full border border-solid border-white/20 cursor-pointer flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                        style={{
                          backgroundColor: hexBg
                        }}
                      >
                        {color === c && <span className="text-slate-800 text-xs font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 font-semibold py-3.5 rounded-2xl cursor-pointer transition-colors text-center text-sm"
                >
                  {settings.language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-semibold py-3.5 rounded-2xl cursor-pointer transition-transform hover:scale-[1.02] shadow-lg text-sm ${getPrimaryColorClass()}`}
                >
                  {editingNote ? (settings.language === 'vi' ? 'Lưu thay đổi' : 'Save') : (settings.language === 'vi' ? 'Tạo ghi chú' : 'Add Note')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
