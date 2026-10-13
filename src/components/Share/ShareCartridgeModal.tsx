import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Cartridge } from '../../types';
import { MacWindowHeader } from '../Common/MacWindowHeader';
import { exportCartridgeToFile, generateShareUrl, type ShareUrlResult } from '../../services/sharing';
import { sound } from '../../services/audio';
import { Download, Link as LinkIcon, Lock, Check, Send, Copy, Loader2, AlertTriangle } from 'lucide-react';

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
  const [shareResult, setShareResult] = useState<ShareUrlResult | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsGeneratingLink(true);
    generateShareUrl(cartridge, senderName).then((res) => {
      if (isMounted) {
        setShareResult(res);
        setIsGeneratingLink(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [cartridge, senderName]);

  const handleDownloadFile = (ext: 'cartridge' | 'txt' = 'cartridge') => {
    sound.playClunk();
    exportCartridgeToFile(cartridge, senderName, ext);
    onToast(`Exported "${cartridge.label}.${ext}" file!`);
  };

  const handleCopyLink = () => {
    if (!shareResult?.url) return;
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
              <strong>Write-Protected ROM:</strong> When the recipient opens this link or slides the cartridge in, they enjoy your memories safely. They <strong>cannot edit or overwrite</strong> your original!
            </p>
          </div>

          {/* Two Sharing Options */}
          <div className="space-y-3 pt-1">
            {/* Option 1: Shareable Direct Link */}
            <div className="p-3 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/40 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-silkscreen text-[10px] font-bold uppercase flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Option A: Send Direct Link (Instant)
                </span>
                {shareResult && (
                  <span className="text-[9px] bg-blue-500/15 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-silkscreen">
                    {shareResult.sizeKb} KB
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-500 leading-tight">
                Send this link via chat, Discord, or text. When they open it, this cartridge pops right into their console!
              </p>

              {isGeneratingLink ? (
                <div className="py-2.5 px-3 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center gap-2 text-[10px] text-neutral-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Compressing & generating link...</span>
                </div>
              ) : shareResult ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareResult.url}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-[10px] font-mono select-all text-neutral-700 dark:text-neutral-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-[#87977A] hover:bg-[#768769] text-white font-silkscreen text-[10px] rounded flex items-center gap-1 cursor-pointer shadow-[1px_1px_0_#000]"
                      title="Copy Link to Clipboard"
                    >
                      {hasCopiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{hasCopiedLink ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`w-full py-2.5 rounded font-silkscreen text-[10px] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0_#000] ${
                      hasCopiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#2C2B29] dark:bg-[#1E1E20] hover:bg-[#43423F] text-[#F6F4ED] border border-[#2C2B29]'
                    }`}
                  >
                    {hasCopiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>✓ LINK COPIED TO CLIPBOARD!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>COPY SHARE LINK (SEND VIA CHAT)</span>
                      </>
                    )}
                  </button>

                  {shareResult.isLarge && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Large cartridge ({shareResult.sizeKb} KB). If a chat app truncates long links, use Option B (File) below!</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Option 2: Physical-like .cartridge File */}
            <div className="p-3 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/40 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-silkscreen text-[10px] font-bold uppercase flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Option B: Export File
                </span>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-silkscreen">
                  WORKS ANYWHERE
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-tight">
                Download a file to send via AirDrop, Email, or upload to drive.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDownloadFile('cartridge')}
                  className="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-[#2C2B29] dark:text-[#E2E0D8] rounded font-silkscreen text-[9px] hover:bg-neutral-300 dark:hover:bg-neutral-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#2C2B29]/30"
                >
                  <Download className="w-3 h-3" />
                  DOWNLOAD .CARTRIDGE
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('txt')}
                  title="Gmail never blocks .txt files"
                  className="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-[#2C2B29] dark:text-[#E2E0D8] rounded font-silkscreen text-[9px] hover:bg-neutral-300 dark:hover:bg-neutral-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#2C2B29]/30"
                >
                  <Download className="w-3 h-3" />
                  DOWNLOAD .TXT (GMAIL)
                </button>
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
