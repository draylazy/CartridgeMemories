import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Cartridge, CartridgeFolder } from '../../types';
import { CartridgeItem } from './CartridgeItem';
import { Plus, ChevronLeft, ChevronRight, FolderOpen, Folder, FolderPlus, Archive, Settings } from 'lucide-react';
import { sound } from '../../services/audio';

interface CartridgeShelfProps {
  cartridges: Cartridge[];
  activeCartridge: Cartridge | null;
  folders: CartridgeFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onNewFolder: () => void;
  onEditFolder?: (folder: CartridgeFolder) => void;
  onSelectCartridge: (cartridge: Cartridge, originRect?: DOMRect) => void;
  onNewCartridge: () => void;
  onOpenImport?: () => void;
  onEditCartridge: (cartridge: Cartridge) => void;
  onDeleteCartridge: (cartridge: Cartridge) => void;
  onShareCartridge?: (cartridge: Cartridge) => void;
  onMoveToFolder?: (cartridge: Cartridge) => void;
  onPointerDragStartCartridge?: (
    cartridge: Cartridge,
    originRect: DOMRect,
    clientX: number,
    clientY: number
  ) => void;
  draggingCartridgeId?: string | null;
  reducedMotion?: boolean;
}

export const CartridgeShelf: React.FC<CartridgeShelfProps> = ({
  cartridges,
  activeCartridge,
  folders,
  selectedFolderId,
  onSelectFolder,
  onNewFolder,
  onEditFolder,
  onSelectCartridge,
  onNewCartridge,
  onOpenImport,
  onEditCartridge,
  onDeleteCartridge,
  onShareCartridge,
  onMoveToFolder,
  onPointerDragStartCartridge,
  draggingCartridgeId,
  reducedMotion = false,
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  // Monitor scroll position of the shelf
  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;

    const checkScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 4) {
        setCanScroll(false);
        setScrollProgress(0);
      } else {
        setCanScroll(true);
        setScrollProgress(Math.min(1, Math.max(0, el.scrollLeft / maxScroll)));
      }
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [cartridges.length, selectedFolderId]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shelfRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = shelfRef.current.scrollWidth - shelfRef.current.clientWidth;
    shelfRef.current.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
  };

  const handleThumbPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!shelfRef.current || !trackRef.current) return;

    const startX = e.clientX;
    const initialScroll = shelfRef.current.scrollLeft;
    const trackRect = trackRef.current.getBoundingClientRect();
    const maxScroll = shelfRef.current.scrollWidth - shelfRef.current.clientWidth;

    const onPointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - startX;
      const scrollDelta = (deltaX / trackRect.width) * maxScroll;
      shelfRef.current?.scrollTo({ left: initialScroll + scrollDelta });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (shelfRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      shelfRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter cartridges by selected folder if one is chosen
  const filteredCartridges = selectedFolderId
    ? cartridges.filter((c) => c.folderId === selectedFolderId)
    : cartridges;

  // Cartridges not currently inside the console slot
  const visibleCartridges = filteredCartridges.filter(
    (c) => !activeCartridge || c.id !== activeCartridge.id
  );

  const activeFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 mt-6 mb-16">
      {/* 1. Storage Folders / Cases Navigation Bar */}
      <div className="flex items-center justify-between mb-2 px-1 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {/* Main Shelf / All Cartridges Tab */}
          <button
            type="button"
            onClick={() => {
              sound.playBeep();
              onSelectFolder(null);
            }}
            className={`px-3 py-1.5 rounded-t-md font-silkscreen text-[9px] sm:text-[10px] flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
              selectedFolderId === null
                ? 'bg-[#EAE8E0] dark:bg-[#2C2C2E] border-[#2C2B29] dark:border-[#545459] text-[#2C2B29] dark:text-[#E2E0D8] shadow-sm font-bold -mb-[2px] z-10'
                : 'bg-neutral-200/60 dark:bg-neutral-800/60 border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>ALL CARTRIDGES ({cartridges.length})</span>
          </button>

          {/* User Folders */}
          {folders.map((folder) => {
            const count = cartridges.filter((c) => c.folderId === folder.id).length;
            const isSelected = selectedFolderId === folder.id;
            return (
              <div key={folder.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBeep();
                    onSelectFolder(folder.id);
                  }}
                  className={`px-3 py-1.5 rounded-t-md font-silkscreen text-[9px] sm:text-[10px] flex items-center gap-1.5 transition-all cursor-pointer border-t-2 border-x-2 ${
                    isSelected
                      ? 'bg-[#EAE8E0] dark:bg-[#2C2C2E] border-[#2C2B29] dark:border-[#545459] text-[#2C2B29] dark:text-[#E2E0D8] shadow-sm font-bold -mb-[2px] z-10'
                      : 'bg-neutral-200/60 dark:bg-neutral-800/60 border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-xs border border-black/30"
                    style={{ backgroundColor: folder.color || '#E8C547' }}
                  />
                  <span>{folder.name}</span>
                  <span className="text-[8px] opacity-75">({count})</span>
                </button>
                {isSelected && onEditFolder && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playBeep();
                      onEditFolder(folder);
                    }}
                    title="Edit or Delete Folder"
                    className="p-1 -ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* "+ New Folder" Tab Button */}
          <button
            type="button"
            onClick={() => {
              sound.playBeep();
              onNewFolder();
            }}
            title="Create a new storage folder / case"
            className="px-2.5 py-1.5 rounded-t-md font-silkscreen text-[9px] flex items-center gap-1 text-[#87977A] hover:text-[#6f7e63] bg-[#87977A]/10 hover:bg-[#87977A]/20 transition-all cursor-pointer border-t-2 border-x-2 border-dashed border-[#87977A]/40"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ NEW FOLDER</span>
          </button>
        </div>

        {/* Scroll controls for desktop */}
        <div className="hidden sm:flex gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll shelf left"
            className="w-7 h-7 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll shelf right"
            className="w-7 h-7 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Cartridge Shelf Tray with wooden / recessed metallic lip */}
      <div className="relative">
        {/* Rear shelf groove shadow */}
        <div className="absolute inset-x-0 bottom-6 h-8 bg-neutral-300/40 dark:bg-black/30 rounded-md -z-10 shadow-inner" />

        <div
          ref={shelfRef}
          className="flex items-end gap-2 sm:gap-2.5 overflow-x-auto pb-4 pt-4 px-3 sm:px-6 scroll-smooth no-scrollbar min-h-[195px]"
        >
          {visibleCartridges.length === 0 && selectedFolderId && (
            <div className="w-full py-10 flex flex-col items-center justify-center text-neutral-400 font-retro-mono text-xs gap-1 select-none">
              <Folder className="w-8 h-8 opacity-40 mb-1" />
              <p className="font-silkscreen text-[10px]">THIS FOLDER IS EMPTY</p>
              <p className="text-[10px] text-neutral-500">
                Click "..." on any cartridge on the main shelf to move it into "{activeFolder?.name}".
              </p>
            </div>
          )}

          <AnimatePresence>
            {visibleCartridges.map((cartridge) => (
              <motion.div
                key={cartridge.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -30 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="shrink-0"
              >
                <CartridgeItem
                  cartridge={cartridge}
                  onSelect={onSelectCartridge}
                  onEdit={onEditCartridge}
                  onShare={onShareCartridge}
                  onMoveToFolder={onMoveToFolder}
                  onDelete={
                    cartridge.monthIndex < 0 ? onDeleteCartridge : undefined
                  }
                  onPointerDragStart={onPointerDragStartCartridge}
                  isBeingDragged={draggingCartridgeId === cartridge.id}
                  reducedMotion={reducedMotion}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* "+ New Cartridge" Slot at the end */}
          <motion.div
            layout
            whileHover={reducedMotion ? {} : { y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 pb-6"
          >
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                onNewCartridge();
              }}
              aria-label="Create new cartridge"
              className="w-[48px] sm:w-[54px] h-[150px] sm:h-[168px] rounded-t-lg rounded-b-md border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/30 flex flex-col items-center justify-center gap-1.5 group transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-300 dark:group-hover:bg-neutral-600 group-hover:scale-110 transition-all">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="font-silkscreen text-[7.5px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center px-0.5 leading-tight">
                + NEW
                <br />
                ROM
              </span>
            </button>
          </motion.div>

          {/* "Import ROM" Slot */}
          <motion.div
            layout
            whileHover={reducedMotion ? {} : { y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 pb-6"
          >
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                onOpenImport?.();
              }}
              aria-label="Import cartridge file"
              className="w-[48px] sm:w-[54px] h-[150px] sm:h-[168px] rounded-t-lg rounded-b-md border-2 border-dashed border-[#87977A]/50 dark:border-[#87977A]/40 hover:border-[#87977A] bg-[#87977A]/5 dark:bg-[#87977A]/10 flex flex-col items-center justify-center gap-1.5 group transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#87977A]"
            >
              <div className="w-6 h-6 rounded-full bg-[#87977A]/20 dark:bg-[#87977A]/30 flex items-center justify-center text-[#87977A] group-hover:bg-[#87977A]/40 group-hover:scale-110 transition-all">
                <FolderOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-silkscreen text-[7.5px] text-[#87977A] uppercase tracking-wider text-center px-0.5 leading-tight">
                IMPORT
                <br />
                ROM
              </span>
            </button>
          </motion.div>
        </div>

        {/* Tactile front shelf ledge */}
        <div className="h-3 w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 rounded-b-md border-t border-white/60 dark:border-neutral-700 shadow-md" />

        {/* 3. Custom Retro Media Scrubber / Scrollbar Rail */}
        {canScroll && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 px-2 select-none">
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                scroll('left');
              }}
              aria-label="Scroll shelf left"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Recessed Audio Rail Track */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              className="relative w-full max-w-xs sm:max-w-md h-3.5 bg-neutral-200/90 dark:bg-black/55 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] border border-black/10 dark:border-white/10 cursor-pointer overflow-hidden p-0.5 flex items-center"
            >
              {/* Subtle background ruler ticks */}
              <div className="absolute inset-0 flex justify-between px-4 items-center opacity-25 pointer-events-none">
                <span className="w-[1.5px] h-2 bg-black dark:bg-white rounded-full" />
                <span className="w-[1px] h-1.5 bg-black dark:bg-white" />
                <span className="w-[1.5px] h-2 bg-black dark:bg-white rounded-full" />
                <span className="w-[1px] h-1.5 bg-black dark:bg-white" />
                <span className="w-[1.5px] h-2 bg-black dark:bg-white rounded-full" />
              </div>

              {/* Draggable Tactile Thumb Slider */}
              <div
                onPointerDown={handleThumbPointerDown}
                style={{
                  left: `calc(${scrollProgress * 100}% - ${scrollProgress * 54}px)`,
                  width: '54px',
                }}
                className="absolute h-2.5 rounded-full bg-gradient-to-b from-[#A4B290] to-[#738361] dark:from-[#5C5C66] dark:to-[#42424A] border border-white/60 dark:border-white/15 shadow-[0_1px_3px_rgba(0,0,0,0.4)] cursor-grab active:cursor-grabbing hover:brightness-105 transition-all flex items-center justify-center gap-1"
              >
                <div className="w-[1px] h-1.5 bg-black/40 rounded-full" />
                <div className="w-[1px] h-1.5 bg-black/40 rounded-full" />
                <div className="w-[1px] h-1.5 bg-black/40 rounded-full" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                scroll('right');
              }}
              aria-label="Scroll shelf right"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
