import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Cartridge, AppSettings } from './types';
import { MacConsole } from './components/Console/MacConsole';
import { CartridgeShelf } from './components/Shelf/CartridgeShelf';
import { CRTPlayer } from './components/CRTPlayer/CRTPlayer';
import { CartridgeModal } from './components/Editor/CartridgeModal';
import { ShareCartridgeModal } from './components/Share/ShareCartridgeModal';
import { FloatingControls } from './components/Controls/FloatingControls';
import {
  loadAllCartridges,
  saveCartridge,
  deleteCartridge,
  saveAllCartridges,
  loadSettings,
  saveSettings,
  clearAllCartridges,
} from './services/db';
import { populateDemoContent, createDefaultCartridges } from './services/demoData';
import { sound } from './services/audio';
import {
  decodeCartridgeFromUrl,
  importCartridgeFromFile,
  duplicateAsEditable,
} from './services/sharing';

export const App: React.FC = () => {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loadedCartridgeId, setLoadedCartridgeId] = useState<string | null>(null);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [isSlotHovered, setIsSlotHovered] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Modal states
  const [editingCartridge, setEditingCartridge] = useState<Cartridge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharingCartridge, setSharingCartridge] = useState<Cartridge | null>(null);
  const [isDraggingOverPage, setIsDraggingOverPage] = useState(false);

  // File import ref for menu
  const fileImportInputRef = useRef<HTMLInputElement>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync dark mode class on document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Audio setup
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Initial load from IndexedDB and URL Hash check
  useEffect(() => {
    async function initData() {
      try {
        const loaded = await loadAllCartridges();

        // Check if someone sent a cartridge via shareable link
        const sharedFromUrl = decodeCartridgeFromUrl();
        if (sharedFromUrl) {
          const exists = loaded.find((c) => c.id === sharedFromUrl.id);
          const updated = exists ? loaded : [sharedFromUrl, ...loaded];
          if (!exists) {
            await saveCartridge(sharedFromUrl);
          }
          setCartridges(updated);
          setLoadedCartridgeId(sharedFromUrl.id);
          showToast(`📥 Received cartridge from ${sharedFromUrl.sharedBy || 'a friend'}!`);
          sound.playClunk();
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          setCartridges(loaded);
        }
      } catch (err) {
        console.error('Failed loading cartridges from IndexedDB', err);
      }
    }
    initData();
  }, []);

  const loadedCartridge =
    cartridges.find((c) => c.id === loadedCartridgeId) || null;

  // Insert Cartridge into console
  const handleSelectCartridge = useCallback((cartridge: Cartridge) => {
    sound.playClunk();
    setLoadedCartridgeId(cartridge.id);
    setIsSlotHovered(false);
    showToast(`Loaded ${cartridge.label} into console`);
  }, []);

  // Eject Cartridge from console
  const handleEject = useCallback(() => {
    if (!loadedCartridgeId) return;
    sound.playEject();
    setLoadedCartridgeId(null);
    showToast('Cartridge ejected');
  }, [loadedCartridgeId]);

  // Start Slideshow Play
  const handlePlay = useCallback(() => {
    if (!loadedCartridge || loadedCartridge.items.length === 0) return;
    setIsPlayingSlideshow(true);
  }, [loadedCartridge]);

  // Exit Slideshow Play
  const handleExitSlideshow = useCallback(() => {
    setIsPlayingSlideshow(false);
  }, []);

  // Toggle Sound FX
  const handleToggleSound = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.soundEnabled;
      sound.setEnabled(next);
      if (next) {
        sound.playBeep();
        showToast('Audio FX: Enabled');
      } else {
        showToast('Audio FX: Muted');
      }
      return { ...prev, soundEnabled: next };
    });
  }, []);

  // Toggle Dark Mode
  const handleToggleDarkMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  // Open Editor for new cartridge
  const handleNewCartridge = useCallback(() => {
    setEditingCartridge(null);
    setIsModalOpen(true);
  }, []);

  // Open Editor for existing cartridge
  const handleEditCartridge = useCallback((cartridge: Cartridge) => {
    if (cartridge.isReadOnly) {
      showToast('🔒 This cartridge is write-protected. Duplicate to make your own copy!');
      return;
    }
    setEditingCartridge(cartridge);
    setIsModalOpen(true);
  }, []);

  // Open Share modal
  const handleShareCartridge = useCallback((cartridge: Cartridge) => {
    sound.playBeep();
    setSharingCartridge(cartridge);
  }, []);

  // Duplicate read-only cartridge
  const handleDuplicateCartridge = useCallback(async () => {
    if (!loadedCartridge) return;
    sound.playBeep();
    const cloned = duplicateAsEditable(loadedCartridge);
    await saveCartridge(cloned);
    setCartridges((prev) => [cloned, ...prev]);
    setLoadedCartridgeId(cloned.id);
    showToast(`📋 Created editable copy: "${cloned.title}"!`);
  }, [loadedCartridge]);

  // Import cartridge from .cartridge file
  const handleImportFile = useCallback(async (file: File) => {
    try {
      sound.playWhirr();
      const imported = await importCartridgeFromFile(file);
      await saveCartridge(imported);
      setCartridges((prev) => [imported, ...prev]);
      setLoadedCartridgeId(imported.id);
      sound.playClunk();
      showToast(`📥 Imported "${imported.label}" from file!`);
    } catch (err) {
      console.error('Import failed', err);
      alert('Could not import cartridge. Make sure it is a valid .cartridge file.');
    }
  }, []);

  // Save Cartridge from modal
  const handleSaveCartridge = useCallback(
    async (cartridge: Cartridge) => {
      try {
        await saveCartridge(cartridge);
        setCartridges((prev) => {
          const index = prev.findIndex((c) => c.id === cartridge.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = cartridge;
            return next;
          }
          return [...prev, cartridge];
        });
        setIsModalOpen(false);
        showToast(`Saved cartridge: ${cartridge.title}`);
      } catch (err) {
        console.error('Error saving cartridge', err);
      }
    },
    []
  );

  // Delete Cartridge
  const handleDeleteCartridge = useCallback(
    async (cartridge: Cartridge) => {
      try {
        await deleteCartridge(cartridge.id);
        setCartridges((prev) => prev.filter((c) => c.id !== cartridge.id));
        if (loadedCartridgeId === cartridge.id) {
          setLoadedCartridgeId(null);
        }
        setIsModalOpen(false);
        showToast(`Deleted ${cartridge.label}`);
      } catch (err) {
        console.error('Error deleting cartridge', err);
      }
    },
    [loadedCartridgeId]
  );

  // Populate Demo Content
  const handleLoadDemoData = useCallback(async () => {
    sound.playBeep();
    const demoCartridges = populateDemoContent(
      cartridges.length > 0 ? cartridges : createDefaultCartridges()
    );
    await saveAllCartridges(demoCartridges);
    setCartridges(demoCartridges);

    // Auto-load July into console so user sees it right away
    const demoMonth = demoCartridges.find((c) => c.monthIndex === 6) || demoCartridges[0];
    if (demoMonth) {
      setLoadedCartridgeId(demoMonth.id);
    }
    showToast('Loaded demo memories & inserted JULY!');
  }, [cartridges]);

  // Clear all data
  const handleClearAll = useCallback(async () => {
    if (confirm('Clear all cartridges and restore clean default empty months?')) {
      await clearAllCartridges();
      const fresh = createDefaultCartridges();
      await saveAllCartridges(fresh);
      setCartridges(fresh);
      setLoadedCartridgeId(null);
      showToast('Restored default empty cartridges');
    }
  }, []);

  // Menu bar actions
  const handleMenuAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'about':
          alert(
            'CARTRIDGE MEMORIES\nVersion 1.0\n\nA retro compact-Mac physical media player where monthly memories live in tactile cartridges.\nDeployable on Vercel with write-protected ROM sharing!'
          );
          break;
        case 'demo':
          handleLoadDemoData();
          break;
        case 'new':
          handleNewCartridge();
          break;
        case 'import_file':
          if (fileImportInputRef.current) {
            fileImportInputRef.current.click();
          }
          break;
        case 'eject':
          handleEject();
          break;
        case 'edit_loaded':
          if (loadedCartridge) handleEditCartridge(loadedCartridge);
          break;
        case 'share_loaded':
          if (loadedCartridge) handleShareCartridge(loadedCartridge);
          break;
        case 'toggle_sound':
          handleToggleSound();
          break;
        case 'toggle_dark':
          handleToggleDarkMode();
          break;
        case 'restart':
          window.location.reload();
          break;
        case 'clear_all':
          handleClearAll();
          break;
      }
    },
    [
      handleLoadDemoData,
      handleNewCartridge,
      handleEject,
      loadedCartridge,
      handleEditCartridge,
      handleShareCartridge,
      handleToggleSound,
      handleToggleDarkMode,
      handleClearAll,
    ]
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) {
          setIsDraggingOverPage(true);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDraggingOverPage(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOverPage(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleImportFile(e.dataTransfer.files[0]);
        }
      }}
      className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 relative selection:bg-[#B9C29A]/40 overflow-x-hidden"
    >
      {/* Hidden file input for importing .cartridge / .json / .txt files */}
      <input
        ref={fileImportInputRef}
        type="file"
        accept=".cartridge,.json,.txt"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleImportFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOverPage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-6 pointer-events-none">
          <div className="border-4 border-dashed border-[#B9C29A] bg-[#242D1F]/95 p-8 sm:p-12 rounded-xl text-center shadow-2xl max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-[#B9C29A]/20 mx-auto mb-4 flex items-center justify-center text-3xl animate-bounce">
              📼
            </div>
            <h2 className="font-silkscreen text-xl text-[#B9C29A] tracking-wider mb-2">
              DROP CARTRIDGE FILE
            </h2>
            <p className="font-retro-mono text-xs text-[#B9C29A]/80 leading-relaxed">
              Release anywhere to insert this memory cartridge directly into the console!
            </p>
          </div>
        </div>
      )}

      {/* 1. Header with Handwritten Signature Logo Wordmark */}
      <header className="w-full flex flex-col items-center text-center pt-2 sm:pt-4 select-none">
        <h1 className="font-signature text-4xl sm:text-5xl md:text-6xl text-[#2B2A27] dark:text-[#EAE8E0] tracking-tight leading-none drop-shadow-xs">
          Cartridge Memories
        </h1>
        <p className="font-retro-mono text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
          Tactile Monthly Media Console // System 7.1
        </p>
      </header>

      {/* 2. Main Console Stage */}
      <main className="flex-1 flex flex-col items-center justify-center my-6 sm:my-8 relative">
        <MacConsole
          loadedCartridge={loadedCartridge}
          onEject={handleEject}
          onPlay={handlePlay}
          onOpenEditor={() => {
            if (loadedCartridge) handleEditCartridge(loadedCartridge);
            else handleNewCartridge();
          }}
          onLoadDemoData={handleLoadDemoData}
          onDuplicate={handleDuplicateCartridge}
          onDropFile={handleImportFile}
          isSlotHovered={isSlotHovered}
          onMenuAction={handleMenuAction}
          reducedMotion={settings.reducedMotion}
        />

        {/* Console Subtext Headline */}
        <div className="text-center mt-7 sm:mt-9 select-none">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2B2A27] dark:text-[#EAE8E0]">
            Pick a cartridge. Make something.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1 font-sans">
            Drag a cartridge into the slot, or tap to insert.
          </p>
        </div>
      </main>

      {/* 3. Cartridge Shelf */}
      <footer className="w-full">
        <CartridgeShelf
          cartridges={cartridges}
          activeCartridge={loadedCartridge}
          onSelectCartridge={handleSelectCartridge}
          onNewCartridge={handleNewCartridge}
          onOpenImport={() => fileImportInputRef.current?.click()}
          onEditCartridge={handleEditCartridge}
          onShareCartridge={handleShareCartridge}
          onDeleteCartridge={handleDeleteCartridge}
          onDragStartCartridge={() => setIsSlotHovered(true)}
          onDragEndCartridge={(_, dropSuccess) => {
            setIsSlotHovered(false);
            if (dropSuccess) {
              sound.playClunk();
            }
          }}
          reducedMotion={settings.reducedMotion}
        />
      </footer>

      {/* 4. Full-screen CRT Slideshow Camera Zoom Player */}
      <AnimatePresence>
        {isPlayingSlideshow && loadedCartridge && (
          <CRTPlayer
            cartridge={loadedCartridge}
            onExit={handleExitSlideshow}
            soundEnabled={settings.soundEnabled}
            onToggleSound={handleToggleSound}
            reducedMotion={settings.reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* 5. Create / Edit Cartridge Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CartridgeModal
            initialCartridge={editingCartridge}
            onSave={handleSaveCartridge}
            onClose={() => setIsModalOpen(false)}
            onDelete={
              editingCartridge
                ? () => handleDeleteCartridge(editingCartridge)
                : undefined
            }
          />
        )}
      </AnimatePresence>

      {/* 6. Share / Send Cartridge Modal */}
      <AnimatePresence>
        {sharingCartridge && (
          <ShareCartridgeModal
            cartridge={sharingCartridge}
            onClose={() => setSharingCartridge(null)}
            onToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* 7. Floating Round Controls (Sound, Dark Mode, Demo) */}
      <FloatingControls
        darkMode={settings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* 8. Retro Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
            <div className="bg-[#242D1F] text-[#B9C29A] font-silkscreen text-[10px] px-3 py-2 rounded-sm border border-[#B9C29A]/50 shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
