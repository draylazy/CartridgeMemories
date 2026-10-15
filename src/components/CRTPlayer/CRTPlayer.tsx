import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Cartridge, MemoryItem } from '../../types';
import { sound } from '../../services/audio';
import { formatRetroTimestamp, sortMemoryItemsByDate } from '../../services/exif';
import { Play, Pause, ChevronLeft, ChevronRight, X, Volume2, VolumeX, Gauge } from 'lucide-react';

interface CRTPlayerProps {
  cartridge: Cartridge;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  reducedMotion?: boolean;
}

const SPEED_OPTIONS = [
  { label: 'FAST (2.0s)', duration: 2000 },
  { label: 'DEFAULT (2.6s)', duration: 2600 },
  { label: 'SLOW (3.8s)', duration: 3800 },
];

export const CRTPlayer: React.FC<CRTPlayerProps> = ({
  cartridge,
  onExit,
  soundEnabled,
  onToggleSound,
  reducedMotion = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isBooting, setIsBooting] = useState(true);

  // Speed configuration (default 2.6s for faster, snappier playback)
  const [speedIndex, setSpeedIndex] = useState(1);
  const baseSlideDuration = SPEED_OPTIONS[speedIndex].duration;

  // Slide elapsed time in milliseconds (0 to slideDuration)
  const [slideElapsed, setSlideElapsed] = useState(0);

  // Auto-sort items chronologically by date (Day 1 first to Day 30 last)
  const items = useMemo(() => {
    const sorted = sortMemoryItemsByDate(cartridge.items);
    if (cartridge.type === 'PICTURES') {
      const pics = sorted.filter((it) => !!it.imageUrl);
      return pics.length > 0 ? pics : sorted;
    }
    if (cartridge.type === 'NOTES') {
      const notes = sorted.filter((it) => !it.imageUrl || !!it.text || !!it.caption);
      return notes.length > 0 ? notes : sorted;
    }
    return sorted;
  }, [cartridge.items, cartridge.type]);

  const currentItem: MemoryItem | undefined = items[currentIndex];

  const currentItemText = useMemo(() => {
    if (!currentItem) return '';
    const raw = (currentItem.caption || currentItem.text || '').trim();
    if (currentItem.imageUrl) {
      return raw.slice(0, 60);
    }
    return raw.slice(0, 250);
  }, [currentItem]);

  // Dynamic slide duration: uses base speed setting, but gives ample reading headroom if note is long
  const slideDuration = useMemo(() => {
    if (!currentItem || !currentItemText) return baseSlideDuration;

    // Minimum needed: 240ms start delay + typing time (fastest 15ms/char) + 700ms end pause
    const minNeeded = 240 + currentItemText.length * 15 + 700;
    return Math.max(baseSlideDuration, minNeeded);
  }, [baseSlideDuration, currentItem, currentItemText]);

  // Boot sequence: play CRT power on hum, then open display
  useEffect(() => {
    sound.playCrtHum();
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, reducedMotion ? 50 : 650);

    return () => clearTimeout(bootTimer);
  }, [reducedMotion]);

  // Handle slide transitions with static sound and visual glitch
  const triggerTransition = useCallback(() => {
    sound.playStatic();
    setIsGlitching(true);
    setTimeout(() => {
      setIsGlitching(false);
    }, 180);
  }, []);

  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    triggerTransition();
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setSlideElapsed(0);
  }, [items.length, triggerTransition]);

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return;
    triggerTransition();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setSlideElapsed(0);
  }, [items.length, triggerTransition]);

  // High-precision countdown and auto-advance timer
  useEffect(() => {
    if (!isPlaying || isBooting || items.length <= 1) return;

    let elapsed = 0;
    setSlideElapsed(0);
    const tickMs = 40;

    const timer = setInterval(() => {
      elapsed += tickMs;
      if (elapsed >= slideDuration) {
        clearInterval(timer);
        goToNext();
      } else {
        setSlideElapsed(elapsed);
      }
    }, tickMs);

    return () => clearInterval(timer);
  }, [isPlaying, isBooting, items.length, slideDuration, currentIndex, goToNext]);

  // Toggle speed
  const cycleSpeed = () => {
    sound.playBeep();
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length);
    setSlideElapsed(0);
  };

  // Dynamic typewriter effect:
  // 1. Starts after image is visible (240ms initial delay)
  // 2. Adjusts speed dynamically: slower for short text (clearly visible cadence), faster for long text
  // 3. Leaves a slight pause before the next slide transitions
  useEffect(() => {
    if (!currentItem || !currentItemText) {
      setTypedText('');
      return;
    }

    if (reducedMotion) {
      setTypedText(currentItemText);
      return;
    }

    // Reset typed text when slide changes
    setTypedText('');

    // Lead-in delay: 240ms so the image and slide finish entering before typing starts
    const START_DELAY_MS = 240;

    // Pause at the end before going to the next slide (gives user time to read completed sentence)
    const PAUSE_BEFORE_NEXT_MS = Math.max(650, Math.min(950, Math.round(slideDuration * 0.28)));

    // Available duration for typing to complete
    const availableTypingDuration = Math.max(600, slideDuration - START_DELAY_MS - PAUSE_BEFORE_NEXT_MS);

    // Calculate ideal per-character speed:
    const idealInterval = availableTypingDuration / currentItemText.length;
    const charInterval = Math.max(14, Math.min(75, Math.round(idealInterval)));

    // Audio click cadence
    const audioFrequency = charInterval >= 45 ? 2 : 3;

    let charIndex = 0;
    let typingTimer: NodeJS.Timeout | null = null;

    const startTimer = setTimeout(() => {
      typingTimer = setInterval(() => {
        charIndex++;
        setTypedText(currentItemText.slice(0, charIndex));

        if (charIndex % audioFrequency === 0) {
          sound.playTypewriter();
        }

        if (charIndex >= currentItemText.length) {
          if (typingTimer) clearInterval(typingTimer);
        }
      }, charInterval);
    }, START_DELAY_MS);

    return () => {
      clearTimeout(startTimer);
      if (typingTimer) clearInterval(typingTimer);
    };
  }, [currentIndex, currentItem, currentItemText, reducedMotion, slideDuration]);

  // Keyboard navigation: Space = pause/play, Arrows = prev/next, Esc = exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sound.playBeep();
        onExit();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        sound.playBeep();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onExit]);

  if (!currentItem) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <p className="font-silkscreen mb-4">NO MEMORIES TO DISPLAY</p>
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 border border-white font-silkscreen text-xs hover:bg-white hover:text-black"
        >
          EXIT
        </button>
      </div>
    );
  }

  const retroDate = formatRetroTimestamp(currentItem.date);
  const remainingSeconds = Math.max(0, (slideDuration - slideElapsed) / 1000).toFixed(1);
  const progressPercent = Math.min(100, (slideElapsed / slideDuration) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0A0D08] flex items-center justify-center overflow-hidden p-2 sm:p-6"
    >
      {/* Outer CRT Curvature Bezel Frame */}
      <div
        className="relative w-full max-w-6xl h-full max-h-[92vh] rounded-[24px] sm:rounded-[36px] bg-[#141A12] border-[8px] sm:border-[16px] border-[#22281E] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden"
      >
        {/* CRT Scanline & Grain Overlays */}
        <div className="absolute inset-0 scanlines opacity-50 z-30 pointer-events-none" />
        <div className="absolute inset-0 crt-vignette z-30 pointer-events-none" />
        <div className="absolute inset-0 crt-grain opacity-25 z-30 pointer-events-none" />

        {/* CRT Turn-on horizontal line expansion animation */}
        {isBooting && !reducedMotion && (
          <div className="absolute inset-0 z-40 bg-white flex items-center justify-center animate-crt-turn-on">
            <div className="w-full h-1 bg-white shadow-[0_0_20px_#fff]" />
          </div>
        )}

        {/* Slide static glitch flash */}
        {isGlitching && !reducedMotion && (
          <div className="absolute inset-0 z-30 bg-white/10 backdrop-invert-10 mix-blend-overlay pointer-events-none" />
        )}

        {/* TOP STATUS BAR: Retro Camcorder OSD Overlay with countdown indicator */}
        <div className="relative z-40 flex items-center justify-between p-4 sm:p-6 text-[#FFB300] font-retro-mono text-xs sm:text-sm tracking-widest select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {/* Top Left: REC dot, Camcorder Mode, and Countdown Timer Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPlaying ? 'bg-red-500 animate-pulse' : 'bg-neutral-500'
                }`}
              />
              <span className="font-bold">{isPlaying ? 'REC ●' : 'PAUSE ❚❚'}</span>
            </div>

            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/80 font-silkscreen text-[10px]">
              {cartridge.title}
            </span>

            <span className="text-white/40">|</span>

            {/* Next picture countdown indicator pill */}
            <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded border border-[#FF9800]/40 text-[#FFB300] crt-bloom font-retro-mono text-xs">
              <span className="text-[10px] text-white/70">NEXT IN:</span>
              <span className="font-bold font-pixel text-sm sm:text-base text-[#FF9800] w-10 text-center">
                {isPlaying ? `${remainingSeconds}s` : 'HOLD'}
              </span>
              {/* Mini circular progress indicator */}
              <div className="w-3.5 h-3.5 rounded-full border border-[#FFB300]/40 flex items-center justify-center p-[1px] relative overflow-hidden bg-black/40">
                <div
                  className="absolute inset-0 bg-[#FFB300]/40 transition-[height]"
                  style={{ height: `${progressPercent}%`, bottom: 0 }}
                />
              </div>
            </div>
          </div>

          {/* Top Right: Digital Amber Camcorder Date Timestamp */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <span className="text-[#FF9800] font-bold text-sm sm:text-base tracking-wider crt-bloom">
                {retroDate}
              </span>
            </div>
            {/* Quick Exit Button */}
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                onExit();
              }}
              aria-label="Exit slideshow and return to console"
              className="p-1.5 rounded-full bg-black/50 border border-white/20 text-white/80 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTER MAIN SCREEN: Photos or Terminal Notes */}
        <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-12 py-2 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* 1. PICTURES ONLY */}
            {cartridge.type === 'PICTURES' && (
              currentItem.imageUrl ? (
                <motion.div
                  key={`pic-${currentIndex}`}
                  initial={{ opacity: 0.2, filter: 'brightness(1.5)' }}
                  animate={{ opacity: 1, filter: 'brightness(1)' }}
                  exit={{ opacity: 0.1 }}
                  transition={{ duration: 0.25 }}
                  className="relative max-h-full max-w-full flex items-center justify-center"
                >
                  <img
                    src={currentItem.imageUrl}
                    alt={`Memory ${currentIndex + 1}`}
                    className="max-h-[60vh] sm:max-h-[66vh] max-w-full object-contain rounded-md shadow-2xl filter contrast-110 saturate-95"
                  />
                  {/* On-screen timestamp on bottom-right of image */}
                  <div className="absolute bottom-3 right-3 bg-black/60 px-2.5 py-1 rounded text-[#FFB300] font-retro-mono text-xs font-bold tracking-wider crt-bloom border border-[#FFB300]/30 flex items-center gap-2">
                    <span>{retroDate}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`note-fallback-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-3xl bg-[#0F140D]/85 border-2 border-[#B9C29A]/40 rounded-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#B9C29A]/20 font-silkscreen text-[11px] text-[#B9C29A]/80">
                    <span>TERMINAL LOG // TRK {currentIndex + 1} OF {items.length}</span>
                    <span className="text-[#FFB300]">{retroDate}</span>
                  </div>
                  <div className="font-retro-mono text-base sm:text-xl text-[#B9C29A] whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden leading-relaxed min-h-[160px] crt-bloom">
                    {typedText || currentItemText}
                    <span className="inline-block w-2.5 h-5 bg-[#B9C29A] ml-1 animate-pulse align-middle" />
                  </div>
                </motion.div>
              )
            )}

            {/* 2. TEXT-ONLY NOTES (Retro Terminal style) */}
            {cartridge.type === 'NOTES' && (
              !currentItem.imageUrl || currentItemText ? (
                <motion.div
                  key={`note-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-3xl bg-[#0F140D]/85 border-2 border-[#B9C29A]/40 rounded-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#B9C29A]/20 font-silkscreen text-[11px] text-[#B9C29A]/80">
                    <span>TERMINAL LOG // TRK {currentIndex + 1} OF {items.length}</span>
                    <span className="text-[#FFB300]">{retroDate}</span>
                  </div>
                  
                  <div className="font-retro-mono text-base sm:text-xl text-[#B9C29A] whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden leading-relaxed min-h-[160px] crt-bloom">
                    {typedText || currentItemText}
                    <span className="inline-block w-2.5 h-5 bg-[#B9C29A] ml-1 animate-pulse align-middle" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`pic-fallback-${currentIndex}`}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.1 }}
                  className="relative max-h-full max-w-full flex items-center justify-center"
                >
                  <img
                    src={currentItem.imageUrl}
                    alt={`Memory ${currentIndex + 1}`}
                    className="max-h-[60vh] sm:max-h-[66vh] max-w-full object-contain rounded-md shadow-2xl filter contrast-110 saturate-95"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/60 px-2.5 py-1 rounded text-[#FFB300] font-retro-mono text-xs font-bold tracking-wider crt-bloom border border-[#FFB300]/30 flex items-center gap-2">
                    <span>{retroDate}</span>
                  </div>
                </motion.div>
              )
            )}

            {/* 3. PICTURES + NOTES (BOTH) */}
            {cartridge.type === 'PICTURES_NOTES' && (
              currentItem.imageUrl ? (
                currentItemText ? (
                  /* Picture with typewriter caption/note bar */
                  <motion.div
                    key={`pic-note-${currentIndex}`}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.1 }}
                    transition={{ duration: 0.25 }}
                    className="relative max-h-full max-w-4xl flex flex-col items-center justify-center"
                  >
                    <div className="relative max-h-[48vh] sm:max-h-[54vh] flex items-center justify-center">
                      <img
                        src={currentItem.imageUrl}
                        alt={`Memory ${currentIndex + 1}`}
                        className="max-h-[48vh] sm:max-h-[54vh] max-w-full object-contain rounded-t-md shadow-2xl filter contrast-110 saturate-95"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[#FFB300] font-retro-mono text-xs font-bold tracking-wider crt-bloom border border-[#FFB300]/30">
                        {retroDate}
                      </div>
                    </div>

                    <div className="w-full bg-[#0F140D]/90 border border-[#B9C29A]/40 rounded-b-md p-3 sm:p-4 text-center overflow-hidden">
                      <p className="font-retro-mono text-sm sm:text-base text-[#B9C29A] crt-bloom min-h-[28px] break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full">
                        {typedText || currentItemText}
                        <span className="inline-block w-2 h-4 bg-[#B9C29A] ml-1 animate-pulse align-middle" />
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* Picture ONLY: No note/caption -> Full picture size, NO blank space underneath! */
                  <motion.div
                    key={`pic-only-${currentIndex}`}
                    initial={{ opacity: 0.2, filter: 'brightness(1.5)' }}
                    animate={{ opacity: 1, filter: 'brightness(1)' }}
                    exit={{ opacity: 0.1 }}
                    transition={{ duration: 0.25 }}
                    className="relative max-h-full max-w-full flex items-center justify-center"
                  >
                    <img
                      src={currentItem.imageUrl}
                      alt={`Memory ${currentIndex + 1}`}
                      className="max-h-[60vh] sm:max-h-[66vh] max-w-full object-contain rounded-md shadow-2xl filter contrast-110 saturate-95"
                    />
                    <div className="absolute bottom-3 right-3 bg-black/60 px-2.5 py-1 rounded text-[#FFB300] font-retro-mono text-xs font-bold tracking-wider crt-bloom border border-[#FFB300]/30 flex items-center gap-2">
                      <span>{retroDate}</span>
                    </div>
                  </motion.div>
                )
              ) : (
                /* Note ONLY: Retro terminal note view */
                <motion.div
                  key={`note-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-3xl bg-[#0F140D]/85 border-2 border-[#B9C29A]/40 rounded-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#B9C29A]/20 font-silkscreen text-[11px] text-[#B9C29A]/80">
                    <span>TERMINAL LOG // TRK {currentIndex + 1} OF {items.length}</span>
                    <span className="text-[#FFB300]">{retroDate}</span>
                  </div>
                  
                  <div className="font-retro-mono text-base sm:text-xl text-[#B9C29A] whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden leading-relaxed min-h-[160px] crt-bloom">
                    {typedText || currentItemText}
                    <span className="inline-block w-2.5 h-5 bg-[#B9C29A] ml-1 animate-pulse align-middle" />
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM CONTROLS & DYNAMIC PROGRESS TIMELINE */}
        <div className="relative z-40 p-4 sm:p-6 bg-gradient-to-t from-black/85 to-transparent flex flex-col gap-2.5">
          {/* Segmented Timeline with Live Filling Bar on Current Slide */}
          <div className="flex items-center gap-1.5 w-full max-w-xl mx-auto">
            {items.map((_, idx) => {
              const isCurrent = idx === currentIndex;
              const isPast = idx < currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSlideElapsed(0);
                    triggerTransition();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className="h-2 flex-1 rounded-full bg-neutral-800/90 overflow-hidden relative border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                >
                  {isPast && (
                    <div className="w-full h-full bg-[#FFB300]/80" />
                  )}
                  {isCurrent && (
                    <div
                      className="h-full bg-gradient-to-r from-[#FF9800] to-[#FFE082] shadow-[0_0_10px_#FFB300] transition-[width] duration-75 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time & Track Information Row */}
          <div className="flex items-center justify-between max-w-xl mx-auto w-full text-[10px] font-retro-mono text-[#FFB300]/90 px-1">
            <span className="tracking-wider">
              TRACK {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>

            {/* Smooth Countdown Timer */}
            <div className="flex items-center gap-2">
              <span className="text-white/60">NEXT SLIDE:</span>
              <span className="font-pixel text-sm text-[#FFB300] crt-bloom w-9 text-right font-bold">
                {isPlaying ? `${remainingSeconds}s` : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Minimal Pixel Controls Bar */}
          <div className="flex items-center justify-between max-w-xl mx-auto w-full text-white/90 font-silkscreen text-xs mt-1">
            {/* Left: Audio & Mute */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleSound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/50 border border-white/20 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline text-[10px]">SOUND ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden sm:inline text-[10px]">MUTED</span>
                  </>
                )}
              </button>

              {/* Speed Switcher Button */}
              <button
                type="button"
                onClick={cycleSpeed}
                title="Change slideshow pace"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-black/50 border border-white/20 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-[9px] text-[#FFB300]"
              >
                <Gauge className="w-3 h-3" />
                <span>{SPEED_OPTIONS[speedIndex].duration / 1000}s</span>
              </button>
            </div>

            {/* Center Controls: Prev, Pause/Play, Next */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous memory (Arrow Left)"
                className="p-2 rounded bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playBeep();
                  setIsPlaying(!isPlaying);
                }}
                aria-label={isPlaying ? 'Pause slideshow (Space)' : 'Play slideshow (Space)'}
                className="px-4 py-2 rounded bg-[#B9C29A] text-[#141A12] font-bold hover:bg-[#CAD4A9] active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(185,194,154,0.4)]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Next memory (Arrow Right)"
                className="p-2 rounded bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Spacer to keep center playback controls balanced */}
            <div className="hidden sm:block w-[140px]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
