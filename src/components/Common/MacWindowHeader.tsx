import React from 'react';

interface MacWindowHeaderProps {
  title: string;
  onClose?: () => void;
  showCloseBox?: boolean;
}

export const MacWindowHeader: React.FC<MacWindowHeaderProps> = ({
  title,
  onClose,
  showCloseBox = true,
}) => {
  return (
    <div className="relative select-none border-b-2 border-[#2C2B29]/70 bg-[#E8E6DF] dark:bg-[#343336] px-2 py-1.5 flex items-center justify-between">
      {/* Pinstripes background pattern */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Left Close Box */}
      <div className="relative z-10 w-4 h-4 flex items-center justify-center">
        {showCloseBox && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close window"
            className="w-3.5 h-3.5 bg-[#F6F4ED] dark:bg-[#4A484D] border border-[#2C2B29] dark:border-[#9A989E] shadow-[1px_1px_0px_#fff_inset] hover:bg-[#2C2B29] hover:border-[#2C2B29] active:translate-y-0.5 transition-all flex items-center justify-center group"
          >
            <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-[#F6F4ED] block" />
          </button>
        )}
      </div>

      {/* Title with solid background cutting the stripes */}
      <div className="relative z-10 px-3 bg-[#E8E6DF] dark:bg-[#343336]">
        <span className="font-silkscreen text-[11px] font-bold tracking-wider uppercase text-[#2C2B29] dark:text-[#E2E0D8]">
          {title}
        </span>
      </div>

      {/* Right placeholder to balance close box */}
      <div className="relative z-10 w-4 h-4" />
    </div>
  );
};
