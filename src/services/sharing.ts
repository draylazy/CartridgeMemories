import type { Cartridge } from '../types';

export interface CartridgeExportPayload {
  format: 'CARTRIDGE_MEMORIES_ROM_V1';
  exportedAt: number;
  cartridge: Cartridge;
}

// 1. Export cartridge as physical-like .cartridge file (works with 100% of large photos and notes)
export function exportCartridgeToFile(cartridge: Cartridge, senderName: string = 'A Friend') {
  const exportData: CartridgeExportPayload = {
    format: 'CARTRIDGE_MEMORIES_ROM_V1',
    exportedAt: Date.now(),
    cartridge: {
      ...cartridge,
      isReadOnly: true, // Mark as Write-Protected ROM so recipient cannot accidentally edit the sender's cartridge
      sharedBy: senderName || 'A Friend',
    },
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = (cartridge.label || 'CARTRIDGE')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toUpperCase();

  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanFilename}.cartridge`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 2. Import cartridge from a .cartridge file
export async function importCartridgeFromFile(file: File): Promise<Cartridge> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid cartridge file format: unable to parse JSON.');
  }

  const payload = parsed as CartridgeExportPayload;
  if (!payload || !payload.cartridge || !payload.cartridge.items) {
    throw new Error('Not a recognized Cartridge Memories file.');
  }

  const c = payload.cartridge;
  return {
    ...c,
    id: `shared-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    monthIndex: -1, // Placed as custom cartridge on recipient's shelf
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isReadOnly: true, // Recipient cannot edit the sender's cartridge
    sharedBy: c.sharedBy || 'A Friend',
  };
}

// 3. Generate Share Link (works for text/notes and links)
export function generateShareUrl(cartridge: Cartridge, senderName: string = 'A Friend'): { url?: string; isTooLarge: boolean } {
  const exportPayload: CartridgeExportPayload = {
    format: 'CARTRIDGE_MEMORIES_ROM_V1',
    exportedAt: Date.now(),
    cartridge: {
      ...cartridge,
      isReadOnly: true,
      sharedBy: senderName || 'A Friend',
    },
  };

  const jsonStr = JSON.stringify(exportPayload);
  
  // URL limit check: if payload exceeds ~12KB (common when multiple high-res photos are uploaded), recommend file export
  if (jsonStr.length > 12000) {
    return { isTooLarge: true };
  }

  try {
    const encoded = btoa(encodeURIComponent(jsonStr));
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = `${origin}${pathname}#cartridge=${encoded}`;
    return { url, isTooLarge: false };
  } catch (err) {
    console.error('Error generating share link', err);
    return { isTooLarge: true };
  }
}

// 4. Decode cartridge from URL hash if opened via link
export function decodeCartridgeFromUrl(): Cartridge | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('#cartridge=')) return null;

  try {
    const rawEncoded = hash.replace('#cartridge=', '');
    const jsonStr = decodeURIComponent(atob(rawEncoded));
    const payload = JSON.parse(jsonStr) as CartridgeExportPayload;

    if (payload && payload.cartridge) {
      return {
        ...payload.cartridge,
        id: `link-${Date.now()}`,
        monthIndex: -1,
        isReadOnly: true, // Recipient cannot edit the sender's original cartridge
        sharedBy: payload.cartridge.sharedBy || 'A Friend',
      };
    }
  } catch (err) {
    console.error('Failed to decode cartridge from URL hash', err);
  }
  return null;
}

// 5. Create an unlocked editable clone if recipient wants their own copy
export function duplicateAsEditable(cartridge: Cartridge): Cartridge {
  return {
    ...cartridge,
    id: `cartridge-${Date.now()}`,
    title: `${cartridge.title} (MY COPY)`,
    label: `${cartridge.label}*`.slice(0, 10),
    monthIndex: -1,
    isReadOnly: false,
    sharedBy: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
