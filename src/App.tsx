import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Cartridge, AppSettings, CartridgeFolder } from './types';
import { MacConsole } from './components/Console/MacConsole';
import { CartridgeShelf } from './components/Shelf/CartridgeShelf';
import { CRTPlayer } from './components/CRTPlayer/CRTPlayer';
import { CartridgeModal } from './components/Editor/CartridgeModal';
import { ShareCartridgeModal } from './components/Share/ShareCartridgeModal';
import { FloatingControls } from './components/Controls/FloatingControls';
import { FolderModal } from './components/Folder/FolderModal';
import { AssignFolderModal } from './components/Folder/AssignFolderModal';
import { HowToUseModal } from './components/Common/HowToUseModal';
import { Upload, HelpCircle } from 'lucide-react';
import {
  loadAllCartridges,
  saveCartridge,
  deleteCartridge,
  saveAllCartridges,
  loadSettings,
  saveSettings,
  clearAllCartridges,
  loadFolders,
  saveFolders,
} from './services/db';
import { populateDemoContent, createDefaultCartridges } from './services/demoData';
import { sound } from './services/audio';
import {
  decodeCartridgeFromUrl,
  importCartridgeFromFile,
  duplicateAsEditable,
} from './services/sharing';
import {
  CartridgeAnimationOverlay,
  type DragCartridgeState,
  type InsertingCartridgeState,
  type ReturningCartridgeState,
} from './components/Shelf/CartridgeAnimationOverlay';

export const App: React.FC = () => {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loadedCartridgeId, setLoadedCartridgeId] = useState<string | null>(null);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [isSlotHovered, setIsSlotHovered] = useState(false);

  // Storage Folders
  const [folders, setFolders] = useState<CartridgeFolder[]>(() => loadFolders());
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CartridgeFolder | null>(null);
  const [movingCartridge, setMovingCartridge] = useState<Cartridge | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Modal states
  const [editingCartridge, setEditingCartridge] = useState<Cartridge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharingCartridge, setSharingCartridge] = useState<Cartridge | null>(null);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
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
    async function checkForSharedLink(existingCartridges: Cartridge[]) {
      const sharedFromUrl = await decodeCartridgeFromUrl();
      if (sharedFromUrl) {
        const exists = existingCartridges.find((c) => c.id === sharedFromUrl.id);
        const updated = exists ? existingCartridges : [sharedFromUrl, ...existingCartridges];
        if (!exists) {
          await saveCartridge(sharedFromUrl);
        }
        setCartridges(updated);
        setLoadedCartridgeId(sharedFromUrl.id);
        showToast(`📥 Received cartridge from ${sharedFromUrl.sharedBy || 'a friend'}!`);
        sound.playClunk();
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    async function initData() {
      try {
        const loaded = await loadAllCartridges();
        setCartridges(loaded);
        await checkForSharedLink(loaded);
      } catch (err) {
        console.error('Failed loading cartridges from IndexedDB', err);
      }
    }

    initData();

    const handleHashChange = async () => {
      const current = await loadAllCartridges();
      await checkForSharedLink(current);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Cartridge Drag & Insertion Animation states
  const [dragState, setDragState] = useState<DragCartridgeState | null>(null);
  const [insertingState, setInsertingState] = useState<InsertingCartridgeState | null>(null);
  const [returningState, setReturningState] = useState<ReturningCartridgeState | null>(null);
  const dragSessionRef = useRef<{
    cartridge: Cartridge;
    originRect: DOMRect;
    startPointer: { x: number; y: number };
    currentPointer: { x: number; y: number };
    hasMoved: boolean;
  } | null>(null);

  const loadedCartridge =
    cartridges.find((c) => c.id === loadedCartridgeId) || null;

  const draggingCartridgeId =
    dragState?.cartridge.id || insertingState?.cartridge.id || null;

  // Start the physical animation where the cartridge flies and inserts into the slot
  const startInsertionAnimation = useCallback(
    (cartridge: Cartridge, fromX: number, fromY: number) => {
      sound.playWhirr();
      const slotEl = document.getElementById('cartridge-slot');
      if (!slotEl) {
        sound.playClunk();
        setLoadedCartridgeId(cartridge.id);
        return;
      }
      const targetSlotRect = slotEl.getBoundingClientRect();
      setInsertingState({
        cartridge,
        fromX,
        fromY,
        targetSlotRect,
      });
    },
    []
  );

  const handleInsertComplete = useCallback(() => {
    if (insertingState) {
      setLoadedCartridgeId(insertingState.cartridge.id);
      showToast(`Loaded ${insertingState.cartridge.label} into console`);
      setInsertingState(null);
    }
  }, [insertingState]);

  const handleReturnComplete = useCallback(() => {
    setReturningState(null);
  }, []);

  // Insert Cartridge into console (with slot animation)
  const handleSelectCartridge = useCallback(
    (cartridge: Cartridge, originRect?: DOMRect) => {
      if (insertingState || dragState) return;
      const startX = originRect
        ? originRect.left + originRect.width / 2
        : window.innerWidth / 2;
      const startY = originRect
        ? originRect.top + originRect.height / 2
        : window.innerHeight - 150;
      startInsertionAnimation(cartridge, startX, startY);
    },
    [insertingState, dragState, startInsertionAnimation]
  );

  // Pointer drag coordinator (drag without being cut off by scroll overflow containers)
  const handlePointerDragStartCartridge = useCallback(
    (cartridge: Cartridge, originRect: DOMRect, clientX: number, clientY: number) => {
      if (insertingState) return;

      dragSessionRef.current = {
        cartridge,
        originRect,
        startPointer: { x: clientX, y: clientY },
        currentPointer: { x: clientX, y: clientY },
        hasMoved: false,
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!dragSessionRef.current) return;
        const { startPointer, cartridge, originRect } = dragSessionRef.current;
        const dx = e.clientX - startPointer.x;
        const dy = e.clientY - startPointer.y;

        if (!dragSessionRef.current.hasMoved) {
          if (Math.hypot(dx, dy) > 6) {
            dragSessionRef.current.hasMoved = true;
            sound.playWhirr();
          } else {
            return;
          }
        }

        dragSessionRef.current.currentPointer = { x: e.clientX, y: e.clientY };

        // Check if cursor is hovering over the Mac Console or slot
        const consoleEl = document.getElementById('mac-console');
        const slotEl = document.getElementById('cartridge-slot');
        let isNear = false;
        if (consoleEl) {
          const rect = consoleEl.getBoundingClientRect();
          isNear =
            e.clientX >= rect.left - 40 &&
            e.clientX <= rect.right + 40 &&
            e.clientY >= rect.top - 40 &&
            e.clientY <= rect.bottom + 60;
        } else if (slotEl) {
          const slotRect = slotEl.getBoundingClientRect();
          isNear =
            e.clientY < slotRect.bottom + 100 &&
            e.clientY > slotRect.top - 180 &&
            e.clientX > slotRect.left - 80 &&
            e.clientX < slotRect.right + 80;
        }

        setIsSlotHovered(isNear);
        setDragState({
          cartridge,
          pointerX: e.clientX,
          pointerY: e.clientY,
          originRect,
          isNearSlot: isNear,
        });
      };

      const handlePointerUp = (e: PointerEvent) => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);

        if (!dragSessionRef.current) return;
        const session = dragSessionRef.current;
        dragSessionRef.current = null;
        setDragState(null);
        setIsSlotHovered(false);

        if (!session.hasMoved) {
          // Tap / click! Animate from shelf to slot
          startInsertionAnimation(
            session.cartridge,
            session.originRect.left + session.originRect.width / 2,
            session.originRect.top + session.originRect.height / 2
          );
        } else {
          // Dragged! Check if dropped over the Mac console player or slot
          const consoleEl = document.getElementById('mac-console');
          const slotEl = document.getElementById('cartridge-slot');
          let droppedInPlayer = false;

          if (consoleEl) {
            const rect = consoleEl.getBoundingClientRect();
            droppedInPlayer =
              e.clientX >= rect.left - 50 &&
              e.clientX <= rect.right + 50 &&
              e.clientY >= rect.top - 50 &&
              e.clientY <= rect.bottom + 70;
          } else if (slotEl) {
            const slotRect = slotEl.getBoundingClientRect();
            droppedInPlayer =
              e.clientY < slotRect.bottom + 120 &&
              e.clientY > slotRect.top - 200 &&
              e.clientX > slotRect.left - 80 &&
              e.clientX < slotRect.right + 80;
          }

          if (droppedInPlayer || e.clientY < window.innerHeight * 0.58) {
            // Drop successful! Animate into slot from drop position
            startInsertionAnimation(session.cartridge, e.clientX, e.clientY);
          } else {
            // Drop canceled: smooth return animation to shelf position
            setReturningState({
              cartridge: session.cartridge,
              currentX: e.clientX,
              currentY: e.clientY,
              targetRect: session.originRect,
            });
          }
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [insertingState, startInsertionAnimation]
  );

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

  // Save / Update Folder
  const handleSaveFolder = useCallback((folder: CartridgeFolder) => {
    setFolders((prev) => {
      const existsIndex = prev.findIndex((f) => f.id === folder.id);
      let updated: CartridgeFolder[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = folder;
      } else {
        updated = [...prev, folder];
      }
      saveFolders(updated);
      return updated;
    });
    setSelectedFolderId(folder.id);
    showToast(`Storage Folder "${folder.name}" saved!`);
  }, []);

  // Delete Folder (cartridges return safely to main shelf)
  // Delete Folder (and permanently delete all cartridges inside it)
  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      const folderToDelete = folders.find((f) => f.id === folderId);
      const cartridgesToDelete = cartridges.filter((c) => c.folderId === folderId);

      // Eject if the currently playing cartridge is in this folder
      if (loadedCartridgeId && cartridgesToDelete.some((c) => c.id === loadedCartridgeId)) {
        setLoadedCartridgeId(null);
      }

      // Delete folder from state & storage
      setFolders((prev) => {
        const updated = prev.filter((f) => f.id !== folderId);
        saveFolders(updated);
        return updated;
      });

      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }

      // Delete each cartridge inside the folder from IndexedDB
      for (const c of cartridgesToDelete) {
        await deleteCartridge(c.id);
      }

      // Remove cartridges from memory state
      setCartridges((prev) => prev.filter((c) => c.folderId !== folderId));

      const count = cartridgesToDelete.length;
      showToast(
        count > 0
          ? `Deleted folder "${folderToDelete?.name || ''}" and its ${count} cartridge${count > 1 ? 's' : ''}.`
          : `Deleted folder "${folderToDelete?.name || ''}".`
      );
    },
    [folders, cartridges, loadedCartridgeId, selectedFolderId]
  );

  // Move Cartridge into a Folder or back to Main Shelf
  const handleMoveCartridgeToFolder = useCallback(
    async (cartridgeId: string, folderId: string | undefined) => {
      const targetCartridge = cartridges.find((c) => c.id === cartridgeId);
      if (!targetCartridge) return;

      const updated = { ...targetCartridge, folderId: folderId || undefined };
      await saveCartridge(updated);
      setCartridges((prev) =>
        prev.map((c) => (c.id === cartridgeId ? updated : c))
      );

      const targetFolder = folders.find((f) => f.id === folderId);
      if (targetFolder) {
        showToast(`Moved "${targetCartridge.label}" to "${targetFolder.name}"`);
      } else {
        showToast(`Moved "${targetCartridge.label}" to Main Shelf`);
      }
    },
    [cartridges, folders]
  );

  // Menu bar actions
  const handleMenuAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'about':
          setIsHowToUseOpen(true);
          break;
        case 'demo':
          handleLoadDemoData();
          break;
        case 'new':
          handleNewCartridge();
          break;
        case 'new_folder':
          setEditingFolder(null);
          setIsFolderModalOpen(true);
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
      {/* Hidden file input for importing cartridge files */}
      <input
        ref={fileImportInputRef}
        type="file"
        accept=".cartridge,.json,.txt,*"
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
      <header className="w-full flex flex-col items-center text-center pt-4 sm:pt-6 select-none">
        <h1 className="font-signature text-4xl sm:text-5xl md:text-6xl text-[#2B2A27] dark:text-[#EAE8E0] tracking-tight leading-normal py-1 drop-shadow-xs">
          Cartridge Memories
        </h1>
        <p className="font-retro-mono text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
          Tactile Media Console // System 7.1
        </p>
        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap justify-center">
          <a
            href="https://www.instagram.com/draylazy/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="font-retro-mono text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#87977A] dark:hover:text-[#A6B086] transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>by</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#87977A] dark:group-hover:text-[#A6B086] underline decoration-dotted underline-offset-2 transition-colors">
              @draylazy
            </span>
          </a>

          <span className="text-neutral-300 dark:text-neutral-700 text-xs hidden sm:inline">•</span>

          <button
            type="button"
            onClick={() => {
              sound.playBeep();
              setIsHowToUseOpen(true);
            }}
            className="font-silkscreen text-[9px] sm:text-[10px] text-neutral-600 dark:text-neutral-400 hover:text-[#87977A] dark:hover:text-[#A6B086] bg-neutral-200/60 dark:bg-neutral-800/60 hover:bg-[#87977A]/15 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>HOW TO USE</span>
          </button>
        </div>
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
          isInserting={Boolean(insertingState)}
          onMenuAction={handleMenuAction}
          reducedMotion={settings.reducedMotion}
        />

        {/* Console Subtext Headline & Cartridge Upload Notification Prompt */}
        <div className="text-center mt-7 sm:mt-9 select-none flex flex-col items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2B2A27] dark:text-[#EAE8E0]">
              Pick a cartridge. Make something.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1 font-sans">
              Drag a cartridge into the slot, or tap to insert.
            </p>
          </div>

          {/* Interactive Notification / Upload Prompt: "Do you have a cartridge? Upload it" */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 bg-[#EAE8E0]/90 dark:bg-[#2C2C2E]/90 border-2 border-[#2C2B29]/30 dark:border-[#545459] rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.15)] hover:border-[#87977A] dark:hover:border-[#87977A] transition-all group backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#87977A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#87977A]" />
            </span>
            <span className="font-retro-mono text-[10.5px] sm:text-[11px] text-[#2C2B29] dark:text-[#E2E0D8]">
              Do you have a cartridge?
            </span>
            <button
              type="button"
              onClick={() => {
                sound.playClunk();
                fileImportInputRef.current?.click();
              }}
              title="Upload and insert a .cartridge or .txt file"
              className="px-2.5 py-0.5 bg-[#87977A] hover:bg-[#738361] text-white font-silkscreen text-[9px] rounded-full cursor-pointer transition-colors shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Upload className="w-3 h-3" />
              <span>UPLOAD IT</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-600 text-xs">|</span>
            <button
              type="button"
              onClick={() => {
                sound.playBeep();
                setIsHowToUseOpen(true);
              }}
              title="Learn how to use Cartridge Memories"
              className="font-silkscreen text-[9px] text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer transition-colors"
            >
              GUIDE
            </button>
          </div>
        </div>
      </main>

      {/* 3. Cartridge Shelf */}
      <footer className="w-full">
        <CartridgeShelf
          cartridges={cartridges}
          activeCartridge={loadedCartridge}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onNewFolder={() => {
            setEditingFolder(null);
            setIsFolderModalOpen(true);
          }}
          onEditFolder={(f) => {
            setEditingFolder(f);
            setIsFolderModalOpen(true);
          }}
          onMoveToFolder={(c) => setMovingCartridge(c)}
          onSelectCartridge={handleSelectCartridge}
          onNewCartridge={handleNewCartridge}
          onEditCartridge={handleEditCartridge}
          onShareCartridge={handleShareCartridge}
          onDeleteCartridge={handleDeleteCartridge}
          onPointerDragStartCartridge={handlePointerDragStartCartridge}
          draggingCartridgeId={draggingCartridgeId}
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
            folders={folders}
            defaultFolderId={selectedFolderId || undefined}
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

      {/* 7. Create / Edit Storage Folder Modal */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <FolderModal
            initialFolder={editingFolder}
            onSave={handleSaveFolder}
            onClose={() => {
              setIsFolderModalOpen(false);
              setEditingFolder(null);
            }}
            onDelete={handleDeleteFolder}
          />
        )}
      </AnimatePresence>

      {/* 8. Move Cartridge into Folder Modal */}
      <AnimatePresence>
        {movingCartridge && (
          <AssignFolderModal
            cartridge={movingCartridge}
            folders={folders}
            onSelectFolder={handleMoveCartridgeToFolder}
            onNewFolder={() => {
              setMovingCartridge(null);
              setEditingFolder(null);
              setIsFolderModalOpen(true);
            }}
            onClose={() => setMovingCartridge(null)}
          />
        )}
      </AnimatePresence>

      {/* 9. Floating Round Controls (Sound, Dark Mode, Help) */}
      <FloatingControls
        darkMode={settings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
      />

      {/* 9b. How to Use / Guide Modal */}
      <AnimatePresence>
        {isHowToUseOpen && (
          <HowToUseModal
            onClose={() => setIsHowToUseOpen(false)}
            onOpenUpload={() => fileImportInputRef.current?.click()}
            onLoadDemoData={handleLoadDemoData}
          />
        )}
      </AnimatePresence>

      {/* 10. Retro Toast Notification */}
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

      {/* 11. Cartridge Drag & Insertion Animation Overlay (Uncut & Smooth) */}
      <CartridgeAnimationOverlay
        dragState={dragState}
        insertingState={insertingState}
        returningState={returningState}
        onInsertComplete={handleInsertComplete}
        onReturnComplete={handleReturnComplete}
      />
    </div>
  );
};

export default App;
