import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Cartridge } from '../../types';
import { CartridgeVisual } from './CartridgeVisual';
import { sound } from '../../services/audio';

export interface DragCartridgeState {
  cartridge: Cartridge;
  pointerX: number;
  pointerY: number;
  originRect: DOMRect;
  isNearSlot: boolean;
}

export interface InsertingCartridgeState {
  cartridge: Cartridge;
  fromX: number;
  fromY: number;
  targetSlotRect: DOMRect;
}

export interface ReturningCartridgeState {
  cartridge: Cartridge;
  currentX: number;
  currentY: number;
  targetRect: DOMRect;
}

interface CartridgeAnimationOverlayProps {
  dragState: DragCartridgeState | null;
  insertingState: InsertingCartridgeState | null;
  returningState: ReturningCartridgeState | null;
  onInsertComplete: () => void;
  onReturnComplete: () => void;
}

export const CartridgeAnimationOverlay: React.FC<CartridgeAnimationOverlayProps> = ({
  dragState,
  insertingState,
  returningState,
  onInsertComplete,
  onReturnComplete,
}) => {
  const [phase, setPhase] = useState<'aligning' | 'sinking'>('aligning');

  // Trigger 2-phase physical slot insertion sequence
  useEffect(() => {
    if (!insertingState) {
      setPhase('aligning');
      return;
    }

    setPhase('aligning');

    // Stage 1 -> Stage 2: Cartridge has aligned above the slot and now slides down into the slit
    const t1 = setTimeout(() => {
      sound.playClunk();
      setPhase('sinking');
    }, 320);

    // Stage 2 -> Complete: Cartridge fully seated inside console slot
    const t2 = setTimeout(() => {
      onInsertComplete();
    }, 640);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [insertingState?.cartridge.id, onInsertComplete]);

  const slotCenterX = insertingState
    ? insertingState.targetSlotRect.left + insertingState.targetSlotRect.width / 2
    : 0;
  const slotCenterY = insertingState
    ? insertingState.targetSlotRect.top + insertingState.targetSlotRect.height / 2
    : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      {/* 1. ACTIVE DRAGGING CARTRIDGE (Floats freely, tilts horizontally when approaching slot) */}
      {dragState && (
        <div
          style={{
            position: 'fixed',
            left: `${dragState.pointerX}px`,
            top: `${dragState.pointerY}px`,
            transform: `translate(-50%, -50%) rotate(${
              dragState.isNearSlot ? '0deg' : '4deg'
            }) scale(${dragState.isNearSlot ? 1.0 : 1.08})`,
            transition: 'transform 0.16s ease-out',
            filter: dragState.isNearSlot
              ? 'drop-shadow(0 0 20px rgba(135,151,122,0.95)) drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 25px 35px rgba(0,0,0,0.38))',
          }}
        >
          {dragState.isNearSlot ? (
            <CartridgeVisual cartridge={dragState.cartridge} isLandscape isDragging />
          ) : (
            <CartridgeVisual cartridge={dragState.cartridge} isDragging />
          )}
        </div>
      )}

      {/* 2. PHYSICAL SLOT INSERTION ANIMATION IN HORIZONTAL (LANDSCAPE) */}
      <AnimatePresence>
        {insertingState && (
          <>
            {/* The physical cartridge: slides directly into horizontal slot */}
            <motion.div
              key={`inserting-${insertingState.cartridge.id}`}
              initial={{
                x: insertingState.fromX - (window.innerWidth < 640 ? 80 : 90),
                y: insertingState.fromY - (window.innerWidth < 640 ? 20 : 22),
                scale: 1.04,
                rotate: 0,
                clipPath: 'inset(0px 0px 0px 0px)',
              }}
              animate={
                phase === 'aligning'
                  ? {
                      // Stage 1: Align centered directly above the slot in horizontal orientation
                      x: slotCenterX - (window.innerWidth < 640 ? 80 : 90),
                      y: slotCenterY - (window.innerWidth < 640 ? 20 : 22) - 60,
                      scale: 1,
                      rotate: 0,
                      clipPath: 'inset(0px 0px 0px 0px)',
                      transition: {
                        type: 'spring',
                        stiffness: 380,
                        damping: 24,
                      },
                    }
                  : {
                      // Stage 2: Slide directly into the matching slot aperture
                      x: slotCenterX - (window.innerWidth < 640 ? 80 : 90),
                      y: slotCenterY - (window.innerWidth < 640 ? 20 : 22),
                      scale: 1,
                      rotate: 0,
                      clipPath: 'inset(0px 0px 0px 0px)',
                      transition: {
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }
              }
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.45))',
                zIndex: 99998,
              }}
            >
              <CartridgeVisual cartridge={insertingState.cartridge} isLandscape />
            </motion.div>

            {/* Glowing slot aperture overlay: cartridge seats into this slot with matching length and height */}
            <div
              style={{
                position: 'fixed',
                left: `${insertingState.targetSlotRect.left}px`,
                top: `${insertingState.targetSlotRect.top}px`,
                width: `${insertingState.targetSlotRect.width}px`,
                height: `${insertingState.targetSlotRect.height}px`,
                pointerEvents: 'none',
                zIndex: 99999,
              }}
              className="rounded-md border-2 border-[#87977A] ring-4 ring-[#87977A]/50 bg-[#1E251B]/75 shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] flex items-center justify-between px-3"
            >
              <div className="w-6 h-1 bg-black/60 rounded-full shadow-inner" />
              <span className="font-silkscreen text-[7.5px] sm:text-[8.5px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">
                {phase === 'aligning' ? 'ACCEPTING...' : 'LOCKING ROM'}
              </span>
              <div className="w-6 h-1 bg-black/60 rounded-full shadow-inner" />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 3. RETURNING ANIMATION: Springs back to shelf if dropped elsewhere */}
      <AnimatePresence>
        {returningState && (
          <motion.div
            key="returning-cartridge"
            initial={{
              x: returningState.currentX - 22,
              y: returningState.currentY - 90,
              scale: 1.08,
              rotate: -90,
            }}
            animate={{
              x: returningState.targetRect.left,
              y: returningState.targetRect.top,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 28,
            }}
            onAnimationComplete={onReturnComplete}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
            }}
          >
            <CartridgeVisual cartridge={returningState.cartridge} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

