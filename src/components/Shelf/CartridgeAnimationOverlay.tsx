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
  const [insertStep, setInsertStep] = useState<'hover' | 'sinking'>('hover');

  // Trigger stage 2 of insertion (sliding into the slot opening)
  useEffect(() => {
    if (insertingState) {
      setInsertStep('hover');
      const t1 = setTimeout(() => {
        sound.playClunk();
        setInsertStep('sinking');
      }, 300);

      const t2 = setTimeout(() => {
        onInsertComplete();
      }, 580);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [insertingState, onInsertComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      {/* 1. ACTIVE DRAGGING CARTRIDGE (Floats freely above whole screen without being cut off) */}
      {dragState && (
        <div
          style={{
            position: 'fixed',
            left: `${dragState.pointerX}px`,
            top: `${dragState.pointerY}px`,
            transform: `translate(-50%, -50%) rotate(${dragState.isNearSlot ? '0deg' : '4deg'}) scale(${
              dragState.isNearSlot ? 1.04 : 1.08
            })`,
            transition: 'transform 0.12s ease-out',
            filter: dragState.isNearSlot
              ? 'drop-shadow(0 0 16px rgba(135,151,122,0.9)) drop-shadow(0 20px 30px rgba(0,0,0,0.45))'
              : 'drop-shadow(0 25px 35px rgba(0,0,0,0.38))',
          }}
        >
          <CartridgeVisual cartridge={dragState.cartridge} isDragging />
        </div>
      )}

      {/* 2. INSERTION ANIMATION: Goes into the cartridge slot smoothly */}
      <AnimatePresence>
        {insertingState && (
          <motion.div
            key="inserting-cartridge"
            initial={{
              x: insertingState.fromX - 27,
              y: insertingState.fromY - 84,
              scale: 1.05,
              rotate: 3,
            }}
            animate={
              insertStep === 'hover'
                ? {
                    // Stage 1: Fly right in front of the slot opening
                    x:
                      insertingState.targetSlotRect.left +
                      insertingState.targetSlotRect.width / 2 -
                      27,
                    y: insertingState.targetSlotRect.top - 88,
                    scale: 1,
                    rotate: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 380,
                      damping: 26,
                    },
                  }
                : {
                    // Stage 2: Slide directly downward into the console slot
                    x:
                      insertingState.targetSlotRect.left +
                      insertingState.targetSlotRect.width / 2 -
                      27,
                    y: insertingState.targetSlotRect.top - 20,
                    scale: 0.94,
                    opacity: 0,
                    transition: {
                      duration: 0.28,
                      ease: [0.32, 0, 0.67, 0],
                    },
                  }
            }
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))',
            }}
          >
            <CartridgeVisual cartridge={insertingState.cartridge} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. RETURNING ANIMATION: Springs back to shelf if dropped elsewhere */}
      <AnimatePresence>
        {returningState && (
          <motion.div
            key="returning-cartridge"
            initial={{
              x: returningState.currentX - 27,
              y: returningState.currentY - 84,
              scale: 1.08,
              rotate: 4,
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
