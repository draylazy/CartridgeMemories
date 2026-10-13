import React from 'react';
import type { Cartridge } from '../../types';
import { Image, FileText, Sparkles, Lock } from 'lucide-react';

interface CartridgeVisualProps {
  cartridge: Cartridge;
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CartridgeVisual: React.FC<CartridgeVisualProps> = ({
  cartridge,
  isDragging = false,
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

  return (
    <div
      className={`relative w-[48px] sm:w-[54px] h-[150px] sm:h-[168px] rounded-t-lg rounded-b-md select-none transition-shadow ${className}`}
      style={{
        backgroundColor: cartridge.color,
        boxShadow: isDragging
          ? 'inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.35), 0 24px 38px rgba(0,0,0,0.35), 0 6px 12px rgba(0,0,0,0.2)'
          : 'inset 2px 2px 0px rgba(255,255,255,0.35), inset -2px -2px 0px rgba(0,0,0,0.3), 0 8px 16px -4px rgba(0,0,0,0.22), 0 2px 4px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {/* Top grip bevel lines (3 lines) */}
      <div className="pt-1.5 px-1.5 flex flex-col gap-0.5 items-center">
        <div className="w-full h-[2.5px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
        <div className="w-full h-[2.5px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
        <div className="w-full h-[2.5px] bg-black/25 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.2)]" />
      </div>

      {/* Side notch tabs (tactile cassette/cartridge aesthetic) */}
      <div className="absolute top-7 -left-[1px] w-[2.5px] h-5 bg-black/20 rounded-r-sm" />
      <div className="absolute top-7 -right-[1px] w-[2.5px] h-5 bg-black/20 rounded-l-sm" />

      {/* White rounded label sticker with rotated text */}
      <div className="absolute inset-x-1 sm:inset-x-1.5 top-5.5 bottom-4.5 bg-[#FCFAF6] dark:bg-[#F2EFE8] rounded-[4px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_1px_1px_rgba(255,255,255,0.6)] p-0.5 sm:p-1 flex flex-col items-center justify-between border border-black/10 overflow-hidden">
        {/* Subtle label top header stripe */}
        <div className="w-full flex items-center justify-between px-0.5 border-b border-black/10 pb-0.5">
          <span className="font-silkscreen text-[6px] tracking-tight text-neutral-500 font-semibold flex items-center gap-0.5">
            {cartridge.isReadOnly ? <Lock className="w-2 h-2 text-amber-700" /> : 'ROM'}
          </span>
          {getTypeIcon()}
        </div>

        {/* Rotated uppercase month text */}
        <div className="flex-1 flex items-center justify-center my-0.5 overflow-hidden">
          <span
            className="font-silkscreen font-bold tracking-wider text-[9px] sm:text-[10px] text-[#242321] uppercase select-none transform rotate-180"
            style={{
              writingMode: 'vertical-rl',
            }}
          >
            {cartridge.label}
          </span>
        </div>

        {/* Label footer: item count badge */}
        <div className="w-full pt-0.5 border-t border-black/10 flex items-center justify-center">
          <span className="font-pixel text-[10px] sm:text-[11px] tracking-tight text-neutral-600 font-semibold leading-none">
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
    </div>
  );
};
