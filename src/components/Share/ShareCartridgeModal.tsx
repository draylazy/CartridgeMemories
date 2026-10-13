import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Cartridge } from '../../types';
import { MacWindowHeader } from '../Common/MacWindowHeader';
import { exportCartridgeToFile } from '../../services/sharing';
import { sound } from '../../services/audio';
import { Download, Link as LinkIcon, Lock, Clock, Sparkles } from 'lucide-react';

interface ShareCartridgeModalProps {
  cartridge: Cartridge;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShareCartridgeModal: React.FC<ShareCartridgeModalProps> = ({
  cartridge,
  onClose,
  onToast,
}) => {
  const [senderName, setSenderName] = useState('A Friend');

  const handleDownloadFile = (ext: 'cartridge' | 'txt' = 'cartridge') => {
    sound.playClunk();
    exportCartridgeToFile(cartridge, senderName, ext);
    onToast(`Exported "${cartridge.label}.${ext}" file!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-lg bg-[#F6F4ED] dark:bg-[#2C2C2E] border-2 border-[#2C2B29] dark:border-[#52525A] rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden"
      >
        <MacWindowHeader
          title={`SEND CARTRIDGE: ${cartridge.label}`}
          onClose={onClose}
        />

        <div className="p-4 sm:p-6 space-y-4 text-[#2C2B29] dark:text-[#E2E0D8] font-retro-mono text-xs">
          {/* Header Preview Banner */}
          <div className="p-3 bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/30 rounded flex items-center gap-3">
            <div
              className="w-8 h-12 rounded-t-sm rounded-b-[2px] border border-black/30 shadow-sm shrink-0 flex items-center justify-center"
              style={{ backgroundColor: cartridge.color }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
            </div>
            <div>
              <div className="font-silkscreen text-[11px] font-bold">
                {cartridge.title}
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {cartridge.items.length} Memories // Format: {cartridge.type}
              </p>
            </div>
          </div>

          {/* Sender Signature Input */}
          <div className="space-y-1">
            <label className="font-silkscreen text-[10px] uppercase block tracking-wider">
              From (Your Name / Signature)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/50 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#87977A]"
            />
          </div>

          {/* Write-Protection Notice */}
          <div className="flex items-start gap-2 p-2.5 bg-[#87977A]/15 border border-[#87977A]/40 rounded text-[11px] leading-relaxed">
            <Lock className="w-4 h-4 text-[#87977A] shrink-0 mt-0.5" />
            <p>
              <strong>Write-Protected ROM:</strong> When the recipient opens this cartridge file, they enjoy your memories safely. They <strong>cannot edit or overwrite</strong> your original!
            </p>
          </div>

          {/* Two Sharing Options */}
          <div className="space-y-3 pt-1">
            {/* Option A: Physical-like .cartridge File (Recommended) */}
            <div className="p-3 bg-white dark:bg-[#1E1E20] border-2 border-[#87977A]/60 dark:border-[#87977A]/40 rounded space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-silkscreen text-[10px] font-bold uppercase flex items-center gap-1.5 text-[#5e7052] dark:text-[#A4B598]">
                  <Download className="w-3.5 h-3.5" />
                  Option A: Export File (Recommended)
                </span>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-silkscreen flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  100% QUALITY // NO LIMIT
                </span>
              </div>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-tight">
                Download a physical-like cartridge file to send via AirDrop, Email, WhatsApp, or Discord. The recipient just clicks <strong>"IMPORT ROM"</strong> to load your memories!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDownloadFile('cartridge')}
                  className="flex-1 py-2 bg-[#87977A] hover:bg-[#768769] text-white rounded font-silkscreen text-[9.5px] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0_#000]"
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD .CARTRIDGE
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('txt')}
                  title="Gmail never blocks .txt files"
                  className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-700 text-[#2C2B29] dark:text-[#E2E0D8] rounded font-silkscreen text-[9.5px] hover:bg-neutral-300 dark:hover:bg-neutral-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#2C2B29]/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD .TXT (GMAIL)
                </button>
              </div>
            </div>

            {/* Option B: Web Share Link (Unavailable for now) */}
            <div className="p-3 bg-neutral-100/70 dark:bg-[#1A1A1C]/60 border border-dashed border-neutral-300 dark:border-neutral-700 rounded space-y-2 opacity-85">
              <div className="flex items-center justify-between">
                <span className="font-silkscreen text-[10px] font-bold uppercase flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Option B: Web Share Link
                </span>
                <span className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-silkscreen flex items-center gap-1 border border-amber-500/30">
                  <Clock className="w-2.5 h-2.5" />
                  UNAVAILABLE FOR NOW
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                Web short links are currently undergoing cloud storage upgrades and are unavailable for now. Please use <strong>Option A (Export File)</strong> above to share your cartridge!
              </p>

              <div className="py-2 px-3 bg-neutral-200/50 dark:bg-black/30 border border-neutral-300/60 dark:border-neutral-800 rounded flex items-center justify-center gap-2 text-[10px] text-neutral-400 dark:text-neutral-500 font-silkscreen">
                <span>[ SHORT LINK SERVICE UNAVAILABLE FOR NOW ]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#E8E6DF] dark:bg-[#232325] border-t-2 border-[#2C2B29]/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-white dark:bg-[#343336] border-2 border-[#2C2B29] dark:border-neutral-500 rounded font-silkscreen text-[9px] hover:bg-neutral-100 cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
