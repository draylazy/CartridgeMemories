import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Cartridge } from '../../types';
import { CrtScreenContent } from './CrtScreenContent';
import { CartridgeVisual } from '../Shelf/CartridgeVisual';
import { sound } from '../../services/audio';

interface MacConsoleProps {
  loadedCartridge: Cartridge | null;
  onEject: () => void;
  onPlay: () => void;
  onOpenEditor: () => void;
  onLoadDemoData: () => void;
  onDuplicate?: () => void;
  onDropFile?: (file: File) => void;
  isSlotHovered?: boolean;
  isInserting?: boolean;
  onDropInSlot?: (e: React.DragEvent) => void;
  onMenuAction?: (action: string) => void;
  reducedMotion?: boolean;
}

export const MacConsole: React.FC<MacConsoleProps> = ({
  loadedCartridge,
  onEject,
  onPlay,
  onOpenEditor,
  onLoadDemoData,
  onDuplicate,
  onDropFile,
  isSlotHovered = false,
  isInserting = false,
  onMenuAction,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (menu: string) => {
    sound.playBeep();
    if (activeMenu === menu) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menu);
    }
  };

  const handleAction = (action: string) => {
    setActiveMenu(null);
    onMenuAction?.(action);
  };

  return (
    <div id="mac-console" className="relative flex flex-col items-center select-none">
      {/* Console Main Body: Classic Compact-Mac beige/cream chassis */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[460px] md:max-w-[490px] rounded-[24px] sm:rounded-[36px] p-4 sm:p-7 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--console-beige)',
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 10px 20px -5px rgba(0, 0, 0, 0.15), inset 0 2px 2px rgba(255,255,255,0.7), inset 0 -3px 4px rgba(0,0,0,0.2)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Top recessed carry handle groove hint */}
        <div className="w-24 sm:w-32 h-1.5 sm:h-2 mx-auto mb-3 bg-black/15 dark:bg-black/35 rounded-full shadow-inner" />

        {/* Outer CRT Bezel */}
        <div
          className="relative rounded-[22px] sm:rounded-[26px] p-3 sm:p-4 bg-[#C8C2B3] dark:bg-[#1E1E22] transition-colors shadow-[inset_0_3px_6px_rgba(0,0,0,0.35),0_1px_2px_rgba(255,255,255,0.4)]"
          style={{
            border: '2px solid rgba(0,0,0,0.12)',
          }}
        >
          {/* Inner Dark Bezel */}
          <div className="relative rounded-[16px] sm:rounded-[20px] p-2 sm:p-2.5 bg-[#20251B] dark:bg-[#0D100B] shadow-[inset_0_4px_8px_rgba(0,0,0,0.7)]">
            
            {/* Classic Mac System Menu Bar at top of Screen */}
            <div className="relative z-30 bg-[#A6B086] border-b border-[#242D1F]/60 px-2 py-0.5 rounded-t-[12px] flex items-center justify-between text-[#242D1F] font-silkscreen text-[9px] sm:text-[10px] select-none">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleMenuClick('apple')}
                  className="hover:bg-[#242D1F] hover:text-[#A6B086] px-1 py-0.5 rounded cursor-pointer font-bold"
                  aria-label="System menu"
                >
                  
                </button>
                <button
                  type="button"
                  onClick={() => handleMenuClick('file')}
                  className="hover:bg-[#242D1F] hover:text-[#A6B086] px-1 py-0.5 rounded cursor-pointer"
                >
                  File
                </button>
                <button
                  type="button"
                  onClick={() => handleMenuClick('edit')}
                  className="hover:bg-[#242D1F] hover:text-[#A6B086] px-1 py-0.5 rounded cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleMenuClick('tools')}
                  className="hover:bg-[#242D1F] hover:text-[#A6B086] px-1 py-0.5 rounded cursor-pointer"
                >
                  Tools
                </button>
                <button
                  type="button"
                  onClick={() => handleMenuClick('special')}
                  className="hover:bg-[#242D1F] hover:text-[#A6B086] px-1 py-0.5 rounded cursor-pointer"
                >
                  Special
                </button>
              </div>

              <div className="flex items-center gap-1.5 opacity-75 font-retro-mono text-[8px] sm:text-[9px]">
                <span>MEM-OS 7.1</span>
              </div>

              {/* Dropdown menus */}
              {activeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setActiveMenu(null)}
                  />
                  <div className="absolute top-5 left-1 z-50 bg-[#E8E6DF] dark:bg-[#2C2C2E] border-2 border-[#242D1F] shadow-[3px_3px_0px_rgba(0,0,0,0.4)] py-1 min-w-[140px] text-[#242D1F] dark:text-[#EAE8E0] font-retro-mono text-xs">
                    {activeMenu === 'apple' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction('about')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          About Memories...
                        </button>
                        <div className="border-t border-[#242D1F]/30 my-1" />
                        <button
                          type="button"
                          onClick={() => handleAction('demo')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          Load Demo Memories
                        </button>
                      </>
                    )}
                    {activeMenu === 'file' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction('new')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          New Cartridge...
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction('new_folder')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          New Storage Folder (📁)...
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction('import_file')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          Import Cartridge (📂)...
                        </button>
                        {loadedCartridge && (
                          <button
                            type="button"
                            onClick={() => handleAction('eject')}
                            className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                          >
                            Eject Cartridge ⏏
                          </button>
                        )}
                      </>
                    )}
                    {activeMenu === 'edit' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction('edit_loaded')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          Edit Content...
                        </button>
                      </>
                    )}
                    {activeMenu === 'tools' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction('toggle_sound')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          Toggle Audio FX
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction('toggle_dark')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          Invert Screen Tone
                        </button>
                      </>
                    )}
                    {activeMenu === 'special' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction('restart')}
                          className="w-full text-left px-3 py-1 hover:bg-[#242D1F] hover:text-[#E8E6DF]"
                        >
                          Restart System
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction('clear_all')}
                          className="w-full text-left px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          Clear All Data...
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* CRT Sage-Green Screen Display */}
            <div
              id="crt-screen-monitor"
              className="relative w-full h-[220px] sm:h-[260px] rounded-b-[12px] bg-[#B9C29A] dark:bg-[#9CA87F] overflow-hidden crt-vignette shadow-inner transition-all duration-300"
            >
              {/* Scanlines Effect */}
              <div className="absolute inset-0 scanlines opacity-65 z-10 pointer-events-none" />
              
              {/* Screen Content */}
              <div className="relative z-20 h-full w-full">
                <CrtScreenContent
                  cartridge={loadedCartridge}
                  onPlay={onPlay}
                  onOpenEditor={onOpenEditor}
                  onLoadDemoData={onLoadDemoData}
                  onEject={onEject}
                  onDuplicate={onDuplicate}
                />
              </div>

              {/* Slight screen curve reflection shine */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl pointer-events-none z-20" />
            </div>
          </div>
        </div>

        {/* Lower Console Deck: Slot, Status Light, Rainbow Badge, Eject Button */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center gap-3 w-full">
          {/* Cartridge Slot: length and height matching the horizontal cartridge exactly */}
          <div
            id="cartridge-slot"
            tabIndex={0}
            role="region"
            aria-label="Cartridge Slot. Drop or insert a cartridge here."
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onDropFile?.(e.dataTransfer.files[0]);
              }
            }}
            className={`relative w-[172px] sm:w-[192px] h-[48px] sm:h-[54px] bg-[#242320] dark:bg-[#141416] rounded-md border-2 ${
              isSlotHovered || isInserting
                ? 'border-[#87977A] ring-4 ring-[#87977A]/40 scale-[1.01] bg-[#1E251B]'
                : 'border-black/40 dark:border-black/60'
            } shadow-[inset_0_3px_6px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center p-0 transition-all mx-auto overflow-hidden`}
          >
            {/* Loaded cartridge visible inside the slot in landscape */}
            {loadedCartridge ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="w-full h-full flex items-center justify-center p-0"
              >
                <CartridgeVisual cartridge={loadedCartridge} isLandscape />
              </motion.div>
            ) : (
              <div className="flex items-center justify-between w-full h-full opacity-70 px-2 sm:px-3">
                {/* Slot shutter flap detail */}
                <motion.div
                  animate={{
                    x: isSlotHovered || isInserting ? -4 : 0,
                    opacity: isSlotHovered || isInserting ? 0.3 : 1,
                  }}
                  className="w-5 sm:w-7 h-1 bg-neutral-600 rounded-full"
                />
                <span
                  className={`font-silkscreen text-[7.5px] sm:text-[8.5px] tracking-widest uppercase transition-colors px-1 text-center ${
                    isInserting
                      ? 'text-emerald-400 font-bold animate-pulse'
                      : isSlotHovered
                      ? 'text-[#B9C29A] font-bold'
                      : 'text-neutral-400'
                  }`}
                >
                  {isInserting
                    ? 'INSERTING...'
                    : isSlotHovered
                    ? 'DROP HERE'
                    : 'ROM SLOT'}
                </span>
                <motion.div
                  animate={{
                    x: isSlotHovered || isInserting ? 4 : 0,
                    opacity: isSlotHovered || isInserting ? 0.3 : 1,
                  }}
                  className="w-5 sm:w-7 h-1 bg-neutral-600 rounded-full"
                />
              </div>
            )}
          </div>

          {/* Bottom Bar: Rainbow Logo Badge, Status LED, and EJECT Button */}
          <div className="flex items-center justify-between w-full px-1 sm:px-2">
            {/* Left: Classic 6-Color Rainbow Apple-Style Indicator Badge */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-5 rounded-[2px] overflow-hidden flex flex-col border border-black/30 transition-all ${
                  loadedCartridge
                    ? 'ring-2 ring-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.5)] brightness-110'
                    : 'opacity-70 grayscale-30'
                }`}
                title="Status Indicator"
              >
                <div className="flex-1 bg-[#61BA46]" />
                <div className="flex-1 bg-[#F9A825]" />
                <div className="flex-1 bg-[#E65100]" />
                <div className="flex-1 bg-[#E53935]" />
                <div className="flex-1 bg-[#8E24AA]" />
                <div className="flex-1 bg-[#1E88E5]" />
              </div>

              {/* Status LED dot */}
              <div className="flex items-center gap-1.5 font-retro-mono text-[9px] text-neutral-500 dark:text-neutral-400">
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    loadedCartridge
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-neutral-400 dark:bg-neutral-600'
                  }`}
                />
                <span className="hidden sm:inline">
                  {loadedCartridge ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>
            </div>

            {/* Right: Rounded Grey Mechanical EJECT Button */}
            <button
              type="button"
              disabled={!loadedCartridge}
              onClick={() => {
                sound.playEject();
                onEject();
              }}
              aria-label="Eject Cartridge"
              className={`px-3 sm:px-4 py-1.5 rounded-md font-silkscreen text-[9px] sm:text-[10px] tracking-wider uppercase border-2 transition-all flex items-center gap-1.5 ${
                loadedCartridge
                  ? 'bg-[#DDD8CB] dark:bg-[#3E3E42] text-[#2C2B29] dark:text-[#E2E0D8] border-[#A8A294] dark:border-[#58585D] shadow-[0_2px_0_#A8A294,0_3px_5px_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none hover:bg-[#EDE8DE] cursor-pointer'
                  : 'bg-neutral-300/40 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-600 border-neutral-300 dark:border-neutral-800 cursor-not-allowed shadow-none'
              }`}
            >
              <span>EJECT</span>
              <span className="text-[8px]">⏏</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slim Base Plate Underneath the Console Chassis */}
      <div
        className="w-[290px] sm:w-[410px] md:w-[440px] h-3 sm:h-3.5 rounded-b-xl -mt-1 bg-[#BFB9AA] dark:bg-[#1A1A1C] shadow-[0_8px_16px_rgba(0,0,0,0.2)] border-t border-black/15 z-[-1]"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 10px 18px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
};
