import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Cartridge } from '../../types';
import { MacWindowHeader } from '../Common/MacWindowHeader';
import { exportCartridgeToFile, generateShareUrl } from '../../services/sharing';
import { sound } from '../../services/audio';
import { Download, Link as LinkIcon, Lock, Check, Send } from 'lucide-react';

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
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  const shareResult = generateShareUrl(cartridge, senderName);

  const handleDownloadFile = () => {
    sound.playClunk();
    exportCartridgeToFile(cartridge, senderName);
    onToast(`Exported "${cartridge.label}.cartridge" file!`);
  };

  const handleCopyLink = () => {
    if (!shareResult.url) return;
    sound.playBeep();
    navigator.clipboard.writeText(shareResult.url);
    setHasCopiedLink(true);
    onToast('Copied cartridge share link to clipboard!');
    setTimeout(() => setHasCopiedLink(false), 2500);
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
              <strong>Write-Protected ROM:</strong> When the recipient slides this cartridge into their console, it plays your memories safely. They <strong>cannot edit or overwrite</strong> your original cartridge!
            </p>
          </div>

          {/* Two Sharing Options */}
          <div className="space-y-2.5 pt-1">
            {/* Option 1: Physical-like .cartridge File (Universal, works with all photos) */}
            <div className="p-3 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/40 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-silkscreen text-[10px] font-bold uppercase flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Option A: Export .cartridge File (Recommended)
                </span>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-silkscreen">
                  ALL PHOTOS
                </span>
              </div>
              <p className="text-[10px] text-neutral-500">
                Downloads a tactile <code>.cartridge</code> file. Send it over AirDrop, iMessage, Discord, or Email. Your friend just drags it onto their console!
              </p>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="w-full py-2 bg-[#2C2B29] text-[#F6F4ED] rounded font-silkscreen text-[10px] hover:bg-[#43423F] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0_#000]"
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD "{cartridge.label}.CARTRIDGE"
              </button>
            </div>

            {/* Option 2: Shareable Link */}
            <div className="p-3 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/40 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-silkscreen text-[10px] font-bold uppercase flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Option B: Shareable URL Link
                </span>
              </div>
              {shareResult.isTooLarge ? (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠️ This cartridge contains high-resolution photo data that exceeds web URL limits. Please use <strong>Option A (Export File)</strong> to send all photos without compression!
                </p>
              ) : (
                <>
                  <p className="text-[10px] text-neutral-500">
                    A direct link that opens your cartridge inside their console instantly when clicked.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-2 bg-neutral-200 dark:bg-neutral-700 text-[#2C2B29] dark:text-[#E2E0D8] border border-[#2C2B29]/40 rounded font-silkscreen text-[10px] hover:bg-neutral-300 dark:hover:bg-neutral-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {hasCopiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>LINK COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>COPY DIRECT LINK</span>
                      </>
                    )}
                  </button>
                </>
              )}
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
