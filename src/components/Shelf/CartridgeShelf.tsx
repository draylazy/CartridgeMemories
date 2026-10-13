import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Cartridge } from '../../types';
import { CartridgeItem } from './CartridgeItem';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from '../../services/audio';

interface CartridgeShelfProps {
  cartridges: Cartridge[];
  activeCartridge: Cartridge | null;
  onSelectCartridge: (cartridge: Cartridge) => void;
  onNewCartridge: () => void;
  onEditCartridge: (cartridge: Cartridge) => void;
  onDeleteCartridge: (cartridge: Cartridge) => void;
  onShareCartridge?: (cartridge: Cartridge) => void;
  onDragStartCartridge?: (cartridge: Cartridge) => void;
  onDragEndCartridge?: (cartridge: Cartridge, dropSuccess: boolean) => void;
  reducedMotion?: boolean;
}

export const CartridgeShelf: React.FC<CartridgeShelfProps> = ({
  cartridges,
  activeCartridge,
  onSelectCartridge,
  onNewCartridge,
  onEditCartridge,
  onDeleteCartridge,
  onShareCartridge,
  onDragStartCartridge,
  onDragEndCartridge,
  reducedMotion = false,
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (shelfRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      shelfRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Cartridges not currently inside the console
  const visibleCartridges = cartridges.filter(
    (c) => !activeCartridge || c.id !== activeCartridge.id
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 mt-6 mb-16">
      {/* Scroll controls for desktop */}
      <div className="hidden sm:flex items-center justify-between absolute -top-10 inset-x-4 px-2 pointer-events-none">
        <span className="font-retro-mono text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          SHELF ARCHIVE ({cartridges.length} CARTRIDGES)
        </span>
        <div className="flex gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll shelf left"
            className="w-7 h-7 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll shelf right"
            className="w-7 h-7 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cartridge Shelf Tray with wooden / recessed metallic lip */}
      <div className="relative">
        {/* Rear shelf groove shadow */}
        <div className="absolute inset-x-0 bottom-6 h-8 bg-neutral-300/40 dark:bg-black/30 rounded-md -z-10 shadow-inner" />

        <div
          ref={shelfRef}
          className="flex items-end gap-2.5 sm:gap-3 overflow-x-auto pb-7 pt-3 px-3 sm:px-6 scroll-smooth scrollbar-thin"
          style={{
            scrollbarGutter: 'stable',
          }}
        >
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
                  onDelete={
                    cartridge.monthIndex < 0 ? onDeleteCartridge : undefined
                  }
                  onDragStart={onDragStartCartridge}
                  onDragEnd={onDragEndCartridge}
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
              className="w-[56px] sm:w-[64px] h-[155px] sm:h-[175px] rounded-t-lg rounded-b-md border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/30 flex flex-col items-center justify-center gap-2 group transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
            >
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-300 dark:group-hover:bg-neutral-600 group-hover:scale-110 transition-all">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-silkscreen text-[8px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center px-0.5 leading-tight">
                + NEW
                <br />
                ROM
              </span>
            </button>
          </motion.div>
        </div>

        {/* Tactile front shelf ledge */}
        <div className="h-3 w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 rounded-b-md border-t border-white/60 dark:border-neutral-700 shadow-md" />
      </div>
    </div>
  );
};
