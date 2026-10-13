import React from 'react';
import { motion } from 'framer-motion';
import { MacWindowHeader } from './MacWindowHeader';
import { sound } from '../../services/audio';
import {
  Upload,
  FolderPlus,
  Share2,
  Sparkles,
  Play,
  FileText,
} from 'lucide-react';

interface HowToUseModalProps {
  onClose: () => void;
  onOpenUpload: () => void;
  onLoadDemoData?: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  onClose,
  onOpenUpload,
  onLoadDemoData,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-lg bg-[#F6F4ED] dark:bg-[#2C2C2E] border-2 border-[#2C2B29] dark:border-[#52525A] rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden max-h-[90vh]"
      >
        <MacWindowHeader
          title="SYSTEM 7.1 // HOW TO USE GUIDE"
          onClose={onClose}
        />

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto font-retro-mono text-xs text-[#2C2B29] dark:text-[#E2E0D8]">
          {/* Welcome Banner */}
          <div className="p-3 bg-white dark:bg-[#1E1E20] border-2 border-[#2C2B29]/30 rounded flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#87977A]/20 flex items-center justify-center text-[#87977A] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-silkscreen text-[11px] font-bold text-[#2C2B29] dark:text-[#E2E0D8]">
                WELCOME TO CARTRIDGE MEMORIES
              </h3>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                A tactile retro physical media player where monthly moments live in nostalgic game cartridges.
              </p>
            </div>
          </div>

          {/* Special Callout: Have a cartridge file? */}
          <div className="p-3 bg-[#87977A]/15 border-2 border-[#87977A]/50 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-silkscreen text-[10.5px] font-bold uppercase flex items-center gap-1.5 text-[#5e7052] dark:text-[#A4B598]">
                <Upload className="w-4 h-4" />
                DO YOU HAVE A CARTRIDGE FILE?
              </span>
              <span className="text-[9px] bg-[#87977A] text-white px-2 py-0.5 rounded font-silkscreen">
                QUICK LOAD
              </span>
            </div>
            <p className="text-[10.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
              If a friend sent you a <strong className="font-semibold text-neutral-900 dark:text-white">.cartridge</strong> or <strong className="font-semibold text-neutral-900 dark:text-white">.txt</strong> file, or you saved a backup, you can insert it right away:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClunk();
                  onClose();
                  onOpenUpload();
                }}
                className="flex-1 py-2 bg-[#87977A] hover:bg-[#768769] text-white rounded font-silkscreen text-[10px] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0_#000]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD & INSERT CARTRIDGE</span>
              </button>
            </div>
            <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 italic">
              💡 Tip: You can also drag & drop the file anywhere onto the screen at any time!
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 pt-1">
            <h4 className="font-silkscreen text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              HOW THE CONSOLE WORKS
            </h4>

            {/* Step 1 */}
            <div className="p-2.5 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/30 rounded flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-silkscreen text-[10px] font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-silkscreen text-[10px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <Play className="w-3 h-3 text-[#87977A]" />
                  INSERT & PLAY
                </p>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Drag any cartridge from the shelf into the console slot (or tap it) to slide it in with authentic mechanical sounds. Watch your photos type out on the CRT screen!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/30 rounded flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-silkscreen text-[10px] font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-silkscreen text-[10px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-600" />
                  CREATE YOUR OWN (UP TO 15 PHOTOS)
                </p>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Click <strong>+ NEW ROM</strong> on the shelf to upload up to 15 photos. The app auto-sorts them by calendar date and lets you add typewriter notes.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/30 rounded flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-silkscreen text-[10px] font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-silkscreen text-[10px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <FolderPlus className="w-3 h-3 text-blue-600" />
                  ORGANIZE IN FOLDERS
                </p>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Click <strong>+ NEW FOLDER</strong> to create custom color-coded storage cases (e.g., Trips, Family, 2026). Click <strong>"..."</strong> on any cartridge to move it.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 bg-white dark:bg-[#1E1E20] border border-[#2C2B29]/30 rounded flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-silkscreen text-[10px] font-bold shrink-0 mt-0.5">
                4
              </div>
              <div>
                <p className="font-silkscreen text-[10px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-purple-600" />
                  SHARE SAFELY (WRITE-PROTECTED ROM)
                </p>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Click <strong>"..." → Send / Share</strong> on any cartridge to export a write-protected ROM file. When your friend loads it, they cannot overwrite your original memories.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#E8E6DF] dark:bg-[#232325] border-t-2 border-[#2C2B29]/70 flex items-center justify-between gap-2">
          {onLoadDemoData ? (
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                onLoadDemoData();
                onClose();
              }}
              className="text-[9px] font-silkscreen text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
            >
              LOAD DEMO MEMORIES
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => {
              sound.playBeep();
              onClose();
            }}
            className="px-5 py-1.5 bg-[#2C2B29] dark:bg-[#343336] text-[#F6F4ED] border-2 border-[#2C2B29] dark:border-neutral-500 rounded font-silkscreen text-[9px] hover:bg-neutral-800 cursor-pointer shadow-xs"
          >
            GOT IT
          </button>
        </div>
      </motion.div>
    </div>
  );
};
