import React from 'react';
import { motion } from 'framer-motion';
import type { Cartridge, CartridgeFolder } from '../../types';
import { MacWindowHeader } from '../Common/MacWindowHeader';
import { sound } from '../../services/audio';
import { Folder, Check, Plus, Archive } from 'lucide-react';

interface AssignFolderModalProps {
  cartridge: Cartridge;
  folders: CartridgeFolder[];
  onSelectFolder: (cartridgeId: string, folderId: string | undefined) => void;
  onNewFolder: () => void;
  onClose: () => void;
}

export const AssignFolderModal: React.FC<AssignFolderModalProps> = ({
  cartridge,
  folders,
  onSelectFolder,
  onNewFolder,
  onClose,
}) => {
  const handleAssign = (folderId: string | undefined) => {
    sound.playClunk();
    onSelectFolder(cartridge.id, folderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-sm bg-[#F6F4ED] dark:bg-[#2C2C2E] border-2 border-[#2C2B29] dark:border-[#52525A] rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden"
      >
        <MacWindowHeader
          title={`MOVE TO FOLDER: ${cartridge.label}`}
          onClose={onClose}
        />

        <div className="p-4 sm:p-5 space-y-3 text-[#2C2B29] dark:text-[#E2E0D8] font-retro-mono text-xs">
          <p className="text-[11px] text-neutral-500">
            Choose where to store <strong>{cartridge.label}</strong>:
          </p>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {/* General Shelf (No folder) */}
            <button
              type="button"
              onClick={() => handleAssign(undefined)}
              className={`w-full p-2.5 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                !cartridge.folderId
                  ? 'bg-[#87977A]/20 border-[#87977A] font-bold'
                  : 'bg-white dark:bg-[#1E1E20] border-[#2C2B29]/30 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-neutral-500" />
                <span className="font-silkscreen text-[10px]">MAIN SHELF (NO FOLDER)</span>
              </div>
              {!cartridge.folderId && <Check className="w-4 h-4 text-[#87977A]" />}
            </button>

            {/* Custom Folders */}
            {folders.map((folder) => {
              const isSelected = cartridge.folderId === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleAssign(folder.id)}
                  className={`w-full p-2.5 rounded border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#87977A]/20 border-[#87977A] font-bold'
                      : 'bg-white dark:bg-[#1E1E20] border-[#2C2B29]/30 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-xs border border-black/30 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: folder.color || '#E8C547' }}
                    >
                      <Folder className="w-3 h-3 text-black/70" />
                    </div>
                    <span className="font-silkscreen text-[10px] truncate">{folder.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#87977A]" />}
                </button>
              );
            })}
          </div>

          {/* Create New Folder Button */}
          <div className="pt-2 border-t border-[#2C2B29]/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewFolder();
              }}
              className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded font-silkscreen text-[9px] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW FOLDER</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white dark:bg-[#343336] border border-[#2C2B29]/40 rounded font-silkscreen text-[9px] cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
