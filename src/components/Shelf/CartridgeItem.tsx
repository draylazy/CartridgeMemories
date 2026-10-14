import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Cartridge } from '../../types';
import { sound } from '../../services/audio';
import { MoreVertical, Edit2, Trash2, Share2, Folder } from 'lucide-react';
import { CartridgeVisual } from './CartridgeVisual';

interface CartridgeItemProps {
  cartridge: Cartridge;
  onSelect: (cartridge: Cartridge, originRect?: DOMRect) => void;
  onEdit: (cartridge: Cartridge) => void;
  onDelete?: (cartridge: Cartridge) => void;
  onShare?: (cartridge: Cartridge) => void;
  onMoveToFolder?: (cartridge: Cartridge) => void;
  onPointerDragStart?: (
    cartridge: Cartridge,
    originRect: DOMRect,
    clientX: number,
    clientY: number
  ) => void;
  isBeingDragged?: boolean;
  reducedMotion?: boolean;
}

export const CartridgeItem: React.FC<CartridgeItemProps> = ({
  cartridge,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onMoveToFolder,
  onPointerDragStart,
  isBeingDragged = false,
  reducedMotion = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to primary button (left mouse) or touch
    if (e.button !== 0) return;
    if (menuOpen) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      onPointerDragStart?.(cartridge, rect, e.clientX, e.clientY);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(true);
  };

  return (
    <div data-cartridge-item="true" className="relative group select-none flex flex-col items-center">
      <motion.div
        ref={containerRef}
        tabIndex={0}
        role="button"
        aria-label={`Cartridge ${cartridge.label}: ${cartridge.items.length} memories. Press Enter to insert into console.`}
        onPointerDown={handlePointerDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sound.playClunk();
            const rect = containerRef.current?.getBoundingClientRect();
            onSelect(cartridge, rect);
          }
        }}
        onContextMenu={handleContextMenu}
        whileHover={
          reducedMotion || isBeingDragged
            ? {}
            : { y: -16, transition: { type: 'spring', stiffness: 400, damping: 25 } }
        }
        whileTap={reducedMotion || isBeingDragged ? {} : { scale: 0.98 }}
        className={`cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-4 focus-visible:ring-[#87977A] transition-opacity ${
          isBeingDragged ? 'opacity-25' : 'opacity-100'
        }`}
      >
        <CartridgeVisual cartridge={cartridge} />
      </motion.div>

      {/* Options menu trigger button */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        aria-label={`Options for ${cartridge.label}`}
        className="mt-1 p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Context Menu / Options Dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />
          <div className="absolute bottom-7 z-50 w-38 bg-[#F6F4ED] dark:bg-[#2A2A2D] border-2 border-[#2C2B29] dark:border-[#52525A] shadow-[3px_3px_0px_rgba(0,0,0,0.25)] rounded-sm py-1">
            {onShare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onShare(cartridge);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono flex items-center gap-2 hover:bg-[#2C2B29] hover:text-[#F6F4ED] dark:hover:bg-[#43434B] cursor-pointer"
              >
                <Share2 className="w-3 h-3 text-[#87977A]" /> Send / Share
              </button>
            )}
            {!cartridge.isReadOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(cartridge);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono flex items-center gap-2 hover:bg-[#2C2B29] hover:text-[#F6F4ED] dark:hover:bg-[#43434B] cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Edit Cartridge
              </button>
            )}
            {onMoveToFolder && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onMoveToFolder(cartridge);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono flex items-center gap-2 hover:bg-[#2C2B29] hover:text-[#F6F4ED] dark:hover:bg-[#43434B] cursor-pointer"
              >
                <Folder className="w-3 h-3 text-[#E8C547]" /> Move to Folder...
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(cartridge);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono text-red-600 dark:text-red-400 flex items-center gap-2 hover:bg-red-600 hover:text-white cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
