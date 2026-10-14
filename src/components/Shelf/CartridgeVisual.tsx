import React from 'react';
import type { Cartridge } from '../../types';
import { Image, FileText, Sparkles, Lock } from 'lucide-react';

interface CartridgeVisualProps {
  cartridge: Cartridge;
  isDragging?: boolean;
  isLandscape?: boolean;
  isInSlot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CartridgeVisual: React.FC<CartridgeVisualProps> = ({
  cartridge,
  isDragging = false,
  isLandscape = false,
  isInSlot = false,
  className = '',
  style = {},
}) => {
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

  if (isLandscape || isInSlot) {
    return (
      <div
        className={`relative w-[160px] sm:w-[180px] h-[40px] sm:h-[44px] rounded-l-lg rounded-r-md select-none transition-shadow flex items-center px-2 sm:px-2.5 gap-2 shrink-0 ${className}`}
        style={{
          backgroundColor: cartridge.color,
          boxShadow: isDragging
            ? 'inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.35), 0 24px 38px rgba(0,0,0,0.35)'
            : 'inset 2px 2px 0px rgba(255,255,255,0.35), inset -2px -2px 0px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
          ...style,
        }}
      >
        {/* Left grip bevel lines (representing top grip in horizontal orientation) */}
        <div className="pl-0.5 flex gap-0.5 items-center shrink-0">
          <div className="w-[2px] h-6 sm:h-7 bg-black/25 rounded-full shadow-[1px_0_0_rgba(255,255,255,0.2)]" />
          <div className="w-[2px] h-6 sm:h-7 bg-black/25 rounded-full shadow-[1px_0_0_rgba(255,255,255,0.2)]" />
          <div className="w-[2px] h-6 sm:h-7 bg-black/25 rounded-full shadow-[1px_0_0_rgba(255,255,255,0.2)]" />
        </div>

        {/* Top and bottom notch tabs (matching vertical cartridge side notches) */}
        <div className="absolute -top-[1px] left-7 w-4 h-[2px] bg-black/20 rounded-b-sm" />
        <div className="absolute -bottom-[1px] left-7 w-4 h-[2px] bg-black/20 rounded-t-sm" />

        {/* White rounded label sticker with ONLY the title name */}
        <div className="flex-1 h-[28px] sm:h-[32px] bg-[#FCFAF6] dark:bg-[#F2EFE8] rounded-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_1px_1px_rgba(255,255,255,0.6)] px-2 sm:px-3 flex items-center justify-center border border-black/10 overflow-hidden">
          <span className="font-silkscreen font-bold tracking-wider text-[8.5px] sm:text-[10px] text-[#242321] uppercase whitespace-nowrap select-none">
            {cartridge.label}
          </span>
        </div>

        {/* Right edge: Gold contact pins hint (representing bottom pins in horizontal orientation) */}
        <div className="flex flex-col gap-1 items-end shrink-0 pr-0.5">
          <div className="w-1 h-1.5 bg-[#D4AF37]/90 rounded-l-[1px]" />
          <div className="w-1 h-1.5 bg-[#D4AF37]/90 rounded-l-[1px]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-[40px] sm:w-[44px] h-[160px] sm:h-[180px] rounded-t-lg rounded-b-md select-none transition-shadow ${className}`}
      style={{
        backgroundColor: cartridge.color,
        boxShadow: isDragging
          ? 'inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.35), 0 24px 38px rgba(0,0,0,0.35), 0 6px 12px rgba(0,0,0,0.2)'
          : 'inset 2px 2px 0px rgba(255,255,255,0.35), inset -2px -2px 0px rgba(0,0,0,0.3), 0 8px 16px -4px rgba(0,0,0,0.22), 0 2px 4px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {/* Top grip bevel lines (3 lines) */}
      <div className="pt-1.5 px-1 flex flex-col gap-0.5 items-center">
        <div className="w-full h-[2px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
        <div className="w-full h-[2px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
        <div className="w-full h-[2px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
      </div>

      {/* Side notch tabs (tactile cassette/cartridge aesthetic) */}
      <div className="absolute top-7 -left-[1px] w-[2px] h-4 bg-black/20 rounded-r-sm" />
      <div className="absolute top-7 -right-[1px] w-[2px] h-4 bg-black/20 rounded-l-sm" />

      {/* White rounded label sticker with rotated text */}
      <div className="absolute inset-x-1 top-5 bottom-4 bg-[#FCFAF6] dark:bg-[#F2EFE8] rounded-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_1px_1px_rgba(255,255,255,0.6)] p-0.5 flex flex-col items-center justify-between border border-black/10 overflow-hidden">
        {/* Subtle label top header stripe */}
        <div className="w-full flex items-center justify-between px-0.5 border-b border-black/10 pb-0.5">
          <span className="font-silkscreen text-[5.5px] tracking-tight text-neutral-500 font-semibold flex items-center gap-0.5">
            {cartridge.isReadOnly ? <Lock className="w-2 h-2 text-amber-700" /> : 'ROM'}
          </span>
          {getTypeIcon()}
        </div>

        {/* Rotated uppercase month text */}
        <div className="flex-1 flex items-center justify-center my-0.5 overflow-hidden">
          <span
            className="font-silkscreen font-bold tracking-wider text-[8.5px] sm:text-[9.5px] text-[#242321] uppercase select-none transform rotate-180"
            style={{
              writingMode: 'vertical-rl',
            }}
          >
            {cartridge.label}
          </span>
        </div>

        {/* Label footer: item count badge */}
        <div className="w-full pt-0.5 border-t border-black/10 flex items-center justify-center">
          <span className="font-pixel text-[8.5px] sm:text-[9.5px] tracking-tight text-neutral-600 font-semibold leading-none">
            {cartridge.items.length > 0 ? `${cartridge.items.length} ITEMS` : 'EMPTY'}
          </span>
        </div>
      </div>

      {/* Bottom edge: gold contact pins hint */}
      <div className="absolute bottom-0 inset-x-1.5 h-1.5 flex justify-around items-end pb-[1px]">
        <div className="w-1.5 h-1 bg-[#D4AF37]/80 rounded-t-[1px]" />
        <div className="w-1.5 h-1 bg-[#D4AF37]/80 rounded-t-[1px]" />
      </div>
    </div>
  );
};
