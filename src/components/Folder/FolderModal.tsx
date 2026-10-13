import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CartridgeFolder } from '../../types';
import { MacWindowHeader } from '../Common/MacWindowHeader';
import { sound } from '../../services/audio';
import { Folder, Check, Trash2 } from 'lucide-react';

interface FolderModalProps {
  initialFolder?: CartridgeFolder | null;
  onSave: (folder: CartridgeFolder) => void;
  onClose: () => void;
  onDelete?: (folderId: string) => void;
}

const FOLDER_COLORS = [
  { name: 'Classic Gold', hex: '#E8C547' },
  { name: 'Sage Green', hex: '#87977A' },
  { name: 'Terracotta', hex: '#BA6D57' },
  { name: 'Dusty Slate', hex: '#687E8D' },
  { name: 'Vintage Mauve', hex: '#9E748F' },
  { name: 'Charcoal', hex: '#44484E' },
];

export const FolderModal: React.FC<FolderModalProps> = ({
  initialFolder,
  onSave,
  onClose,
  onDelete,
}) => {
  const isEditing = !!initialFolder;
  const [name, setName] = useState(initialFolder?.name || '');
  const [color, setColor] = useState(initialFolder?.color || FOLDER_COLORS[0].hex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playClunk();
    onSave({
      id: initialFolder?.id || `folder-${Date.now()}`,
      name: name.trim().toUpperCase(),
      color,
      createdAt: initialFolder?.createdAt || Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-md bg-[#F6F4ED] dark:bg-[#2C2C2E] border-2 border-[#2C2B29] dark:border-[#52525A] rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden"
      >
        <MacWindowHeader
          title={isEditing ? 'EDIT STORAGE FOLDER' : 'NEW STORAGE FOLDER'}
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-[#2C2B29] dark:text-[#E2E0D8] font-retro-mono text-xs">
          {/* Visual Folder Icon Preview */}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/30 rounded">
            <div
              className="w-10 h-10 rounded flex items-center justify-center shadow-inner border border-black/20"
              style={{ backgroundColor: color }}
            >
              <Folder className="w-5 h-5 text-black/70 drop-shadow-sm" />
            </div>
            <div>
              <div className="font-silkscreen text-[11px] font-bold">
                {name.trim() || 'UNTITLED FOLDER'}
              </div>
              <p className="text-[10px] text-neutral-500">
                Storage case to organize your memory cartridges
              </p>
            </div>
          </div>

          {/* Folder Name */}
          <div className="space-y-1">
            <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
              Folder Name
            </label>
            <input
              type="text"
              required
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TRIP 2026, FAMILY, ROADTRIP"
              className="w-full px-3 py-2 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/50 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#87977A] font-silkscreen uppercase tracking-wider"
              autoFocus
            />
          </div>

          {/* Color Presets */}
          <div className="space-y-1.5">
            <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
              Folder Tag Color
            </label>
            <div className="flex items-center gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-7 h-7 rounded-sm border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    color === c.hex
                      ? 'border-black scale-110 shadow-md ring-2 ring-[#87977A]'
                      : 'border-black/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && <Check className="w-3.5 h-3.5 text-black drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#2C2B29]/20 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  if (confirm(`Delete folder "${initialFolder.name}"? Cartridges will safely return to the main shelf.`)) {
                    onDelete(initialFolder.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-red-600 dark:text-red-400 font-silkscreen text-[9px] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> DELETE
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-white dark:bg-[#343336] border-2 border-[#2C2B29] dark:border-neutral-500 rounded font-silkscreen text-[9px] hover:bg-neutral-100 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-1.5 bg-[#2C2B29] disabled:opacity-50 text-[#F6F4ED] rounded font-silkscreen text-[9px] hover:bg-[#43423F] active:translate-y-0.5 transition-all shadow-[2px_2px_0_#000] cursor-pointer"
              >
                {isEditing ? 'UPDATE FOLDER' : 'CREATE FOLDER'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
