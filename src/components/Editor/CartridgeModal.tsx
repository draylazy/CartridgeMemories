import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PRESET_CARTRIDGE_COLORS } from '../../types';
import type { Cartridge, CartridgeType, MemoryItem, CartridgeFolder } from '../../types';
import { MacWindowHeader } from '../Common/MacWindowHeader';
import { extractDateFromFile, readFileAsDataURL, sortMemoryItemsByDate, formatDateToYMD } from '../../services/exif';
import { sound } from '../../services/audio';
import { Upload, Plus, Trash2, ArrowUp, ArrowDown, Image, FileText, Layers, Check, Folder } from 'lucide-react';

interface CartridgeModalProps {
  initialCartridge?: Cartridge | null;
  folders?: CartridgeFolder[];
  defaultFolderId?: string;
  onSave: (cartridge: Cartridge) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const CartridgeModal: React.FC<CartridgeModalProps> = ({
  initialCartridge,
  folders = [],
  defaultFolderId,
  onSave,
  onClose,
  onDelete,
}) => {
  const isEditing = !!initialCartridge;
  const currentYear = new Date().getFullYear();

  const [title, setTitle] = useState(
    initialCartridge?.title || `MEMORIES ${currentYear}`
  );
  const [label, setLabel] = useState(
    initialCartridge?.label || 'CUSTOM'
  );
  const [type, setType] = useState<CartridgeType>(
    initialCartridge?.type || 'PICTURES'
  );
  const [color, setColor] = useState(
    initialCartridge?.color || PRESET_CARTRIDGE_COLORS[0].hex
  );
  const [folderId, setFolderId] = useState<string | undefined>(
    initialCartridge?.folderId ?? defaultFolderId
  );
  const [items, setItems] = useState<MemoryItem[]>(
    initialCartridge?.items ? sortMemoryItemsByDate(initialCartridge.items) : []
  );

  // New Note fields for NOTES mode
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteDate, setNewNoteDate] = useState(
    formatDateToYMD(new Date())
  );
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_PICTURES = 15;
  const currentPictureCount = items.filter((it) => !!it.imageUrl).length;

  // Handle multi-image upload with 15-picture limit
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    const currentPics = items.filter((it) => !!it.imageUrl).length;
    const availableSlots = MAX_PICTURES - currentPics;

    if (availableSlots <= 0) {
      sound.playBeep();
      setUploadWarning(`Maximum limit of ${MAX_PICTURES} pictures reached.`);
      setTimeout(() => setUploadWarning(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let filesToProcess = Array.from(rawFiles);
    if (filesToProcess.length > availableSlots) {
      sound.playBeep();
      setUploadWarning(
        `Added first ${availableSlots} picture${availableSlots === 1 ? '' : 's'}. Maximum limit is ${MAX_PICTURES} pictures per cartridge.`
      );
      setTimeout(() => setUploadWarning(null), 5000);
      filesToProcess = filesToProcess.slice(0, availableSlots);
    } else {
      setUploadWarning(null);
    }

    sound.playWhirr();

    const newItems: MemoryItem[] = [];
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      try {
        const [dateStr, dataUrl] = await Promise.all([
          extractDateFromFile(file),
          readFileAsDataURL(file),
        ]);

        newItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: type === 'PICTURES_NOTES' ? 'picture_note' : 'picture',
          imageUrl: dataUrl,
          date: dateStr,
          caption: '',
        });
      } catch (err) {
        console.error('Failed reading file', file.name, err);
      }
    }

    // Auto-sort chronologically based on extracted photo dates (1 first to 30 last)
    setItems((prev) => sortByDate([...prev, ...newItems]));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to auto-sort items chronologically by date (1 first to 30 last)
  const sortByDate = (list: MemoryItem[]): MemoryItem[] => {
    return sortMemoryItemsByDate(list);
  };

  // Add a text note item
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    sound.playTypewriter();

    const newItem: MemoryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'note',
      text: newNoteText.trim(),
      date: newNoteDate,
    };

    setItems((prev) => sortByDate([...prev, newItem]));
    setNewNoteText('');
  };

  // Item reordering
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    sound.playBeep();
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const removeItem = (id: string) => {
    sound.playBeep();
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItemDate = (id: string, date: string) => {
    setItems((prev) =>
      sortByDate(prev.map((it) => (it.id === id ? { ...it, date } : it)))
    );
  };

  const updateItemCaption = (id: string, caption: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, caption } : it))
    );
  };

  // Save Cartridge
  const handleSave = () => {
    sound.playClunk();
    const cartridge: Cartridge = {
      id: initialCartridge?.id || `cartridge-${Date.now()}`,
      monthIndex: initialCartridge?.monthIndex ?? -1,
      title: title.trim() || 'UNTITLED',
      label: label.trim().toUpperCase() || 'CUSTOM',
      type,
      color,
      items: sortByDate(items),
      createdAt: initialCartridge?.createdAt || Date.now(),
      updatedAt: Date.now(),
      folderId: folderId || undefined,
    };

    onSave(cartridge);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-2xl bg-[#F6F4ED] dark:bg-[#2C2C2E] border-2 border-[#2C2B29] dark:border-[#52525A] rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.35)] flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Retro Mac Titlebar */}
        <MacWindowHeader
          title={isEditing ? `EDIT CARTRIDGE: ${title}` : 'NEW CARTRIDGE'}
          onClose={onClose}
        />

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-[#2C2B29] dark:text-[#E2E0D8] font-retro-mono text-xs">
          {/* Top row: Title and Label text */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
                Cartridge Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="OCTOBER 2026"
                className="w-full px-3 py-2 bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/70 dark:border-neutral-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#87977A]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
                Spine Label (Max 10)
              </label>
              <input
                type="text"
                maxLength={10}
                value={label}
                onChange={(e) => setLabel(e.target.value.toUpperCase())}
                placeholder="OCTOBER"
                className="w-full px-3 py-2 bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/70 dark:border-neutral-600 rounded text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#87977A]"
              />
            </div>
          </div>

          {/* Storage Folder Selection */}
          {folders.length > 0 && (
            <div className="space-y-1">
              <label className="font-silkscreen text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#87977A]" />
                <span>Storage Folder / Case</span>
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || undefined)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/70 dark:border-neutral-600 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#87977A] font-silkscreen text-[10px]"
              >
                <option value="">📂 MAIN SHELF (NO FOLDER)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type Selector: Pictures / Notes / Pictures + Notes */}
          <div className="space-y-1.5">
            <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
              Cartridge Format Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  setType('PICTURES');
                }}
                className={`py-2 px-2 rounded border-2 font-silkscreen text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  type === 'PICTURES'
                    ? 'bg-[#2C2B29] text-[#F6F4ED] border-[#2C2B29] shadow-[2px_2px_0_#000]'
                    : 'bg-white dark:bg-[#1E1E20] border-[#2C2B29]/40 hover:border-[#2C2B29]'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                PICTURES
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  setType('NOTES');
                }}
                className={`py-2 px-2 rounded border-2 font-silkscreen text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  type === 'NOTES'
                    ? 'bg-[#2C2B29] text-[#F6F4ED] border-[#2C2B29] shadow-[2px_2px_0_#000]'
                    : 'bg-white dark:bg-[#1E1E20] border-[#2C2B29]/40 hover:border-[#2C2B29]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                NOTES
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  setType('PICTURES_NOTES');
                }}
                className={`py-2 px-2 rounded border-2 font-silkscreen text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  type === 'PICTURES_NOTES'
                    ? 'bg-[#2C2B29] text-[#F6F4ED] border-[#2C2B29] shadow-[2px_2px_0_#000]'
                    : 'bg-white dark:bg-[#1E1E20] border-[#2C2B29]/40 hover:border-[#2C2B29]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                BOTH
              </button>
            </div>
          </div>

          {/* Color Picker: 12 Muted Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
                Cartridge Shell Color
              </label>
              <span className="text-[10px] text-neutral-500 font-retro-mono">
                {PRESET_CARTRIDGE_COLORS.find((c) => c.hex === color)?.name || 'Custom'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_CARTRIDGE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    sound.playBeep();
                    setColor(c.hex);
                  }}
                  title={c.name}
                  aria-label={c.name}
                  className={`w-7 h-7 rounded-sm border-2 transition-all flex items-center justify-center ${
                    color === c.hex
                      ? 'border-[#2C2B29] dark:border-white scale-110 shadow-[2px_2px_0_#000]'
                      : 'border-black/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Manager: upload images or add notes */}
          <div className="border-t-2 border-[#2C2B29]/20 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-silkscreen text-[10px] uppercase tracking-wider">
                  Memory Items ({items.length})
                </span>
                {(type === 'PICTURES' || type === 'PICTURES_NOTES') && (
                  <span
                    className={`text-[9px] font-silkscreen px-1.5 py-0.5 rounded ${
                      currentPictureCount >= MAX_PICTURES
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold'
                        : 'bg-black/5 dark:bg-white/10 text-neutral-500'
                    }`}
                  >
                    {currentPictureCount}/{MAX_PICTURES} PHOTOS
                  </span>
                )}
                {items.length > 1 && (
                  <span className="text-[9px] font-silkscreen px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    AUTO-SORTED BY DATE
                  </span>
                )}
              </div>
              {(type === 'PICTURES' || type === 'PICTURES_NOTES') && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={currentPictureCount >= MAX_PICTURES}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload-input"
                  />
                  <label
                    htmlFor={currentPictureCount >= MAX_PICTURES ? undefined : 'photo-upload-input'}
                    onClick={() => {
                      if (currentPictureCount >= MAX_PICTURES) {
                        sound.playBeep();
                        setUploadWarning(`Cartridge full: maximum limit of ${MAX_PICTURES} pictures reached.`);
                        setTimeout(() => setUploadWarning(null), 4000);
                      }
                    }}
                    className={`px-3 py-1.5 rounded font-silkscreen text-[9px] inline-flex items-center gap-1.5 shadow-[2px_2px_0_#000] transition-all select-none ${
                      currentPictureCount >= MAX_PICTURES
                        ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-75'
                        : 'bg-[#2C2B29] text-[#F6F4ED] hover:bg-[#43423F] cursor-pointer active:translate-y-0.5'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    {currentPictureCount >= MAX_PICTURES
                      ? `MAX PHOTOS (${MAX_PICTURES}/${MAX_PICTURES})`
                      : `UPLOAD PHOTOS (MAX ${MAX_PICTURES})`}
                  </label>
                </div>
              )}
            </div>

            {/* Warning if limit reached */}
            {uploadWarning && (
              <div className="p-2.5 bg-amber-500/15 border border-amber-500/40 rounded text-amber-700 dark:text-amber-300 text-[10px] font-silkscreen flex items-center gap-2">
                <span>⚠️</span>
                <span>{uploadWarning}</span>
              </div>
            )}

            {/* Note input for NOTES mode */}
            {type === 'NOTES' && (
              <div className="bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/50 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-silkscreen text-[9px] uppercase">
                    New Journal Entry
                  </span>
                  <input
                    type="date"
                    value={newNoteDate}
                    onChange={(e) => setNewNoteDate(e.target.value)}
                    className="border border-[#2C2B29]/40 rounded px-1.5 py-0.5 text-[10px] bg-transparent"
                  />
                </div>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Type a nostalgic memory or thoughts for this month..."
                  className="w-full p-2 border border-[#2C2B29]/30 rounded bg-transparent font-retro-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-3 py-1 bg-[#2C2B29] text-[#F6F4ED] rounded font-silkscreen text-[9px] hover:bg-[#43423F] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> ADD ENTRY
                </button>
              </div>
            )}

            {/* Items list */}
            {items.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-[#2C2B29]/30 rounded text-neutral-400">
                <p className="font-silkscreen text-[10px]">NO ITEMS YET</p>
                <p className="text-[11px] mt-1">
                  Upload photos or add notes to bring this cartridge to life.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/40 rounded flex items-center justify-between gap-3"
                  >
                    {/* Index & Thumbnail */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-silkscreen text-[10px] w-5 text-neutral-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="thumb"
                          className="w-12 h-12 object-cover rounded border border-black/20"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    {/* Content / Caption / Date */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItemDate(item.id, e.target.value)}
                          className="border border-black/20 rounded px-1 text-[10px] bg-transparent"
                        />
                      </div>
                      {type === 'PICTURES_NOTES' ? (
                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => updateItemCaption(item.id, e.target.value)}
                          placeholder="Optional caption..."
                          className="w-full text-[10px] border-b border-black/20 bg-transparent px-1 py-0.5 focus:outline-none"
                        />
                      ) : (
                        <p className="text-[11px] truncate text-neutral-600 dark:text-neutral-300">
                          {item.text || 'Photo memory'}
                        </p>
                      )}
                    </div>

                    {/* Reorder and Delete controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        aria-label="Move item up"
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === items.length - 1}
                        aria-label="Move item down"
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Delete item"
                        className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#E8E6DF] dark:bg-[#232325] border-t-2 border-[#2C2B29]/70 flex items-center justify-between">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  if (confirm(`Delete cartridge "${title}"?`)) {
                    onDelete(initialCartridge.id);
                  }
                }}
                className="px-3 py-1.5 text-red-600 hover:underline font-silkscreen text-[9px] cursor-pointer"
              >
                DELETE CARTRIDGE
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white dark:bg-[#343336] border-2 border-[#2C2B29] dark:border-neutral-500 rounded font-silkscreen text-[9px] hover:bg-neutral-100 cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 bg-[#2C2B29] text-[#F6F4ED] rounded font-silkscreen text-[9px] hover:bg-[#454441] shadow-[2px_2px_0_#000] active:translate-y-0.5 cursor-pointer"
            >
              SAVE CARTRIDGE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
