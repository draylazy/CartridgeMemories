import React, { useMemo } from 'react';
import type { Cartridge } from '../../types';
import { Play, PlusCircle, Sparkles, Image, FileText, Layers } from 'lucide-react';
import { sound } from '../../services/audio';
import { sortMemoryItemsByDate, formatRetroTimestamp } from '../../services/exif';

interface CrtScreenContentProps {
  cartridge: Cartridge | null;
  onPlay: () => void;
  onOpenEditor: () => void;
  onLoadDemoData: () => void;
  onEject: () => void;
  onDuplicate?: () => void;
}

export const CrtScreenContent: React.FC<CrtScreenContentProps> = ({
  cartridge,
  onPlay,
  onOpenEditor,
  onLoadDemoData,
  onDuplicate,
}) => {
  if (!cartridge) {
    // 1. IDLE STATE
    return (
      <div className="h-full flex flex-col justify-between p-3 select-none text-[#242D1F]">
        {/* Mac Window box inside CRT */}
        <div className="border border-[#242D1F]/60 bg-[#B9C29A]/40 rounded-sm p-2 flex flex-col items-center justify-center text-center my-auto shadow-inner">
          <div className="font-pixel text-xl sm:text-2xl tracking-wider text-[#1B2317] font-bold mb-1">
            INSERT_CARTRIDGE.SYS
          </div>
          <div className="w-16 h-[2px] bg-[#242D1F]/50 mb-2" />
          <p className="font-retro-mono text-[10px] sm:text-[11px] leading-relaxed text-[#242D1F]/90 max-w-[240px]">
            Ready for input. Drag or tap a memory cartridge from the shelf to play.
          </p>
          <div className="mt-3 flex items-center gap-1.5 font-retro-mono text-[9px] text-[#242D1F]/70">
            <span className="w-2 h-2 rounded-full bg-[#3B4833] animate-pulse" />
            <span>DRIVE STATUS: AWAITING MEDIA</span>
          </div>
        </div>

        {/* Bottom blinking prompt */}
        <div className="flex items-center justify-between text-[10px] font-silkscreen text-[#242D1F]/80 pt-1 border-t border-[#242D1F]/20">
          <span>MEM: 640K OK</span>
          <span className="animate-pulse">_READY</span>
        </div>
      </div>
    );
  }

  // Has cartridge, check if empty
  const isEmpty = cartridge.items.length === 0;

  if (isEmpty) {
    // 2. EMPTY STATE: NO DATA. ADD MEMORIES
    return (
      <div className="h-full flex flex-col justify-between p-2 sm:p-3 select-none text-[#242D1F]">
        <div className="border border-[#242D1F]/60 bg-[#B9C29A]/50 rounded-sm p-2 sm:p-2.5 flex flex-col items-center justify-center text-center my-auto">
          <div className="font-silkscreen text-[10px] sm:text-[11px] text-[#242D1F] font-bold tracking-wider mb-0.5 sm:mb-1 truncate max-w-full">
            {cartridge.title}
          </div>
          <div className="font-pixel text-lg sm:text-2xl text-red-900 tracking-wide font-bold mb-1">
            NO DATA. ADD MEMORIES
          </div>
          <p className="font-retro-mono text-[9px] sm:text-[10px] leading-tight text-[#242D1F]/80 mb-2 sm:mb-3 max-w-[220px]">
            This cartridge is blank. Add photos or journal notes to begin.
          </p>

          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 w-full max-w-[230px]">
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                onOpenEditor();
              }}
              className="flex-1 py-1 sm:py-1.5 px-2 bg-[#242D1F] text-[#B9C29A] hover:bg-[#161D13] font-silkscreen text-[8.5px] sm:text-[9px] rounded-sm flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              ADD MEMORIES
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                onLoadDemoData();
              }}
              className="py-1 sm:py-1.5 px-2 border border-[#242D1F] bg-[#B9C29A] text-[#242D1F] hover:bg-[#A8B289] font-silkscreen text-[8.5px] sm:text-[9px] rounded-sm flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              LOAD DEMO
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-retro-mono text-[#242D1F]/70 pt-1 border-t border-[#242D1F]/20">
          <span className="truncate">FORMAT: {cartridge.type.replace('_', ' + ')}</span>
          <span className="shrink-0">0 BYTES</span>
        </div>
      </div>
    );
  }

  // 3. LOADED STATE WITH MEMORIES
  const getTypeBadge = () => {
    switch (cartridge.type) {
      case 'PICTURES':
        return (
          <span className="flex items-center gap-1 bg-[#242D1F]/15 px-1.5 py-0.5 rounded text-[7.5px] sm:text-[8px] font-silkscreen whitespace-nowrap shrink-0">
            <Image className="w-2.5 h-2.5" /> PICTURES
          </span>
        );
      case 'NOTES':
        return (
          <span className="flex items-center gap-1 bg-[#242D1F]/15 px-1.5 py-0.5 rounded text-[7.5px] sm:text-[8px] font-silkscreen whitespace-nowrap shrink-0">
            <FileText className="w-2.5 h-2.5" /> NOTES
          </span>
        );
      case 'PICTURES_NOTES':
        return (
          <span className="flex items-center gap-1 bg-[#242D1F]/15 px-1 sm:px-1.5 py-0.5 rounded text-[7.5px] sm:text-[8px] font-silkscreen whitespace-nowrap shrink-0">
            <Layers className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">PICTURES + NOTES</span>
            <span className="sm:hidden">PICS+NOTES</span>
          </span>
        );
    }
  };

  const sortedItems = useMemo(() => sortMemoryItemsByDate(cartridge.items), [cartridge.items]);
  const firstItem = sortedItems[0];

  return (
    <div className="h-full flex flex-col justify-between p-2 sm:p-3 select-none text-[#242D1F]">
      {/* Title & Metadata Header - Organized neatly with zero awkward line breaks */}
      <div className="border-b border-[#242D1F]/30 pb-1 sm:pb-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
            <span className="font-silkscreen text-[10.5px] sm:text-[12px] font-bold tracking-wider text-[#1A2215] truncate">
              {cartridge.title}
            </span>
            {cartridge.isReadOnly && (
              <span className="shrink-0 text-[7px] sm:text-[8px] bg-[#242D1F] text-[#B9C29A] px-1 py-0.5 rounded font-silkscreen whitespace-nowrap">
                🔒 LOCKED
              </span>
            )}
          </div>
          {getTypeBadge()}
        </div>
        <div className="font-retro-mono text-[8px] sm:text-[9px] text-[#242D1F]/70 truncate mt-0.5">
          {cartridge.items.length} {cartridge.items.length === 1 ? 'MEMORY' : 'MEMORIES'} STORED
          {cartridge.sharedBy && ` • FROM: ${cartridge.sharedBy.toUpperCase()}`}
        </div>
      </div>

      {/* Center preview card */}
      <div className="my-auto py-1 sm:py-2 flex flex-col items-center text-center">
        {firstItem?.imageUrl ? (
          <div className="w-28 h-16 sm:w-36 sm:h-20 rounded border border-[#242D1F]/50 overflow-hidden relative shadow-inner mb-1.5 sm:mb-2 bg-black/10">
            <img
              src={firstItem.imageUrl}
              alt="First memory preview"
              className="w-full h-full object-cover filter contrast-125 sepia-30"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[#B9C29A] font-pixel text-[11px] sm:text-[12px] py-0.5 px-1 flex justify-between">
              <span>TRK: 01</span>
              <span>{formatRetroTimestamp(firstItem.date)}</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[220px] bg-[#B9C29A]/60 border border-[#242D1F]/40 p-1.5 sm:p-2 rounded text-left font-retro-mono text-[8.5px] sm:text-[9px] line-clamp-3 mb-1.5 sm:mb-2 shadow-inner">
            "{(firstItem?.text || firstItem?.caption || '').slice(0, 90)}..."
          </div>
        )}

        {/* Pixel-Style PLAY Button */}
        <button
          type="button"
          onClick={() => {
            sound.playBeep();
            onPlay();
          }}
          className="group relative px-4 sm:px-6 py-1.5 sm:py-2 bg-[#242D1F] hover:bg-[#151D12] text-[#B9C29A] font-silkscreen text-[11px] sm:text-sm tracking-wider rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
        >
          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          <span>[ PLAY MEMORIES ]</span>
        </button>
      </div>

      {/* Screen Footer with Edit or Read-Only Notice and Duplicate */}
      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-silkscreen text-[#242D1F]/80 pt-1 border-t border-[#242D1F]/20 gap-1 overflow-hidden">
        {cartridge.isReadOnly ? (
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span
              className="text-neutral-800 dark:text-neutral-900 font-bold whitespace-nowrap shrink-0"
              title="Write-protected: recipient cannot edit this cartridge"
            >
              <span className="hidden sm:inline">🔒 WRITE-PROTECTED</span>
              <span className="sm:hidden">🔒 LOCKED</span>
            </span>
            {onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  onDuplicate();
                }}
                className="hover:underline text-[7.5px] sm:text-[8px] cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="hidden sm:inline">[ 📋 COPY TO EDIT ]</span>
                <span className="sm:hidden">[ COPY ]</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              sound.playBeep();
              onOpenEditor();
            }}
            className="hover:underline cursor-pointer whitespace-nowrap"
          >
            [ EDIT CONTENT ]
          </button>
        )}
        <span className="font-pixel text-[11px] sm:text-[13px] tracking-wider text-[#242D1F] shrink-0 whitespace-nowrap">
          <span className="hidden sm:inline">AUTO-SYNC: OK</span>
          <span className="sm:hidden">SYNC: OK</span>
        </span>
      </div>
    </div>
  );
};

