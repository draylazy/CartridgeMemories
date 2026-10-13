import React from 'react';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../services/audio';

interface FloatingControlsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLoadDemoData?: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <aside aria-label="Floating Controls" className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">

      {/* Sound Toggle Button (default off until user taps) */}
      <button
        type="button"
        onClick={() => {
          sound.playBeep();
          onToggleSound();
        }}
        title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
        aria-label={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 ${
          soundEnabled
            ? 'bg-[#87977A] text-white border-[#2C2B29]'
            : 'bg-[#EAE8E0] dark:bg-[#2C2C2E] text-neutral-400 dark:text-neutral-500 border-[#2C2B29] dark:border-[#545459]'
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>

      {/* Dark Mode Toggle Button */}
      <button
        type="button"
        onClick={() => {
          sound.playBeep();
          onToggleDarkMode();
        }}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="w-10 h-10 rounded-full bg-[#EAE8E0] dark:bg-[#2C2C2E] border-2 border-[#2C2B29] dark:border-[#545459] text-[#2C2B29] dark:text-[#E2E0D8] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </aside>
  );
};
