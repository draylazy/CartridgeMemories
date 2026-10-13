import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Cartridge } from '../../types';
import { sound } from '../../services/audio';
import { MoreVertical, Edit2, Trash2, Image, FileText, Sparkles, Share2, Lock } from 'lucide-react';

interface CartridgeItemProps {
  cartridge: Cartridge;
  onSelect: (cartridge: Cartridge) => void;
  onEdit: (cartridge: Cartridge) => void;
  onDelete?: (cartridge: Cartridge) => void;
  onShare?: (cartridge: Cartridge) => void;
  isDraggingSlot?: boolean;
  onDragStart?: (cartridge: Cartridge) => void;
  onDragEnd?: (cartridge: Cartridge, dropSuccess: boolean) => void;
  reducedMotion?: boolean;
}

export const CartridgeItem: React.FC<CartridgeItemProps> = ({
  cartridge,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onDragStart,
  onDragEnd,
  reducedMotion = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(true);
  };

  const getTypeIcon = () => {
    switch (cartridge.type) {
      case 'PICTURES':
        return <Image className="w-2.5 h-2.5 opacity-60" />;
      case 'NOTES':
        return <FileText className="w-2.5 h-2.5 opacity-60" />;
      case 'PICTURES_NOTES':
        return <Sparkles className="w-2.5 h-2.5 opacity-60" />;
    }
  };

  return (
    <div className="relative group select-none flex flex-col items-center">
      <motion.div
        layoutId={`cartridge-${cartridge.id}`}
        tabIndex={0}
        role="button"
        aria-label={`Cartridge ${cartridge.label}: ${cartridge.items.length} memories. Press Enter to insert into console.`}
        onClick={() => {
          if (!isPointerDragging) {
            onSelect(cartridge);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sound.playClunk();
            onSelect(cartridge);
          }
        }}
        onContextMenu={handleContextMenu}
        whileHover={reducedMotion ? {} : { y: -16, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
        whileTap={reducedMotion ? {} : { scale: 0.98 }}
        drag
        dragSnapToOrigin
        onDragStart={() => {
          setIsPointerDragging(true);
          sound.playWhirr();
          onDragStart?.(cartridge);
        }}
        onDragEnd={(_, info) => {
          setTimeout(() => setIsPointerDragging(false), 80);
          // Check if dropped near top half (toward console)
          const droppedInSlotArea = info.point.y < window.innerHeight * 0.58;
          onDragEnd?.(cartridge, droppedInSlotArea);
          if (droppedInSlotArea) {
            onSelect(cartridge);
          }
        }}
        whileDrag={{
          scale: 1.06,
          rotate: 4,
          zIndex: 50,
          cursor: 'grabbing',
          boxShadow: '0 25px 40px -10px rgba(0,0,0,0.35)',
        }}
        className={`relative w-[56px] sm:w-[64px] h-[155px] sm:h-[175px] rounded-t-lg rounded-b-md cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-4 focus-visible:ring-[#87977A] transition-shadow ${
          isPointerDragging ? 'z-50' : 'z-10'
        }`}
        style={{
          backgroundColor: cartridge.color,
          boxShadow:
            'inset 2px 2px 0px rgba(255,255,255,0.35), inset -2px -2px 0px rgba(0,0,0,0.3), 0 8px 16px -4px rgba(0,0,0,0.22), 0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Top grip bevel lines (3 lines) */}
        <div className="pt-1.5 px-2 flex flex-col gap-0.5 items-center">
          <div className="w-full h-[2.5px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
          <div className="w-full h-[2.5px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
          <div className="w-full h-[2.5px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
        </div>

        {/* Side notch tabs (tactile cassette/cartridge aesthetic) */}
        <div className="absolute top-7 -left-[1px] w-[2.5px] h-5 bg-black/20 rounded-r-sm" />
        <div className="absolute top-7 -right-[1px] w-[2.5px] h-5 bg-black/20 rounded-l-sm" />

        {/* White rounded label sticker with rotated text */}
        <div className="absolute inset-x-1.5 top-6 bottom-5 bg-[#FCFAF6] dark:bg-[#F2EFE8] rounded-[5px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_1px_1px_rgba(255,255,255,0.6)] p-1 flex flex-col items-center justify-between border border-black/10 overflow-hidden">
          {/* Subtle label top header stripe */}
          <div className="w-full flex items-center justify-between px-0.5 border-b border-black/10 pb-0.5">
            <span className="font-silkscreen text-[6.5px] tracking-tight text-neutral-500 font-semibold flex items-center gap-0.5">
              {cartridge.isReadOnly ? <Lock className="w-2 h-2 text-amber-700" /> : 'ROM'}
            </span>
            {getTypeIcon()}
          </div>

          {/* Rotated uppercase month text */}
          <div className="flex-1 flex items-center justify-center my-0.5 overflow-hidden">
            <span
              className="font-silkscreen font-bold tracking-wider text-[10px] sm:text-[11px] text-[#242321] uppercase select-none transform rotate-180"
              style={{
                writingMode: 'vertical-rl',
              }}
            >
              {cartridge.label}
            </span>
          </div>

          {/* Label footer: item count badge */}
          <div className="w-full pt-0.5 border-t border-black/10 flex items-center justify-center">
            <span className="font-pixel text-[11px] sm:text-[12px] tracking-tight text-neutral-600 font-semibold leading-none">
              {cartridge.items.length > 0 ? `${cartridge.items.length} ITEMS` : 'EMPTY'}
            </span>
          </div>
        </div>

        {/* Bottom edge: gold contact pins hint */}
        <div className="absolute bottom-0 inset-x-2 h-1.5 flex justify-around items-end pb-[1px]">
          <div className="w-1.5 h-1 bg-[#D4AF37]/80 rounded-t-[1px]" />
          <div className="w-1.5 h-1 bg-[#D4AF37]/80 rounded-t-[1px]" />
          <div className="w-1.5 h-1 bg-[#D4AF37]/80 rounded-t-[1px]" />
        </div>
      </motion.div>

      {/* Tiny gear/options button on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        aria-label={`Options for ${cartridge.label}`}
        className="mt-1 p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-60 hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Context Menu / Options Popup */}
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
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono flex items-center gap-2 hover:bg-[#2C2B29] hover:text-[#F6F4ED] dark:hover:bg-[#43434B]"
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
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono flex items-center gap-2 hover:bg-[#2C2B29] hover:text-[#F6F4ED] dark:hover:bg-[#43434B]"
              >
                <Edit2 className="w-3 h-3" /> Edit Cartridge
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
                className="w-full px-3 py-1.5 text-left text-xs font-retro-mono text-red-600 dark:text-red-400 flex items-center gap-2 hover:bg-red-600 hover:text-white"
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
