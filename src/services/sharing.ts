import type { Cartridge } from '../types';

export interface CartridgeExportPayload {
  format: 'CARTRIDGE_MEMORIES_ROM_V1';
  exportedAt: number;
  cartridge: Cartridge;
}

// 1. Export cartridge as physical-like .cartridge file (works with 100% of large photos and notes)
export function exportCartridgeToFile(
  cartridge: Cartridge,
  senderName: string = 'A Friend',
  extension: 'cartridge' | 'txt' | 'json' = 'cartridge'
) {
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
  const isTxt = extension === 'txt';
  const mimeType = isTxt ? 'text/plain;charset=utf-8' : 'application/json';
  const blob = new Blob([jsonStr], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const cleanFilename = (cartridge.label || 'CARTRIDGE')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toUpperCase();

  const fullFilename = isTxt ? `${cleanFilename}.txt` : `${cleanFilename}.cartridge.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fullFilename;
  a.setAttribute('download', fullFilename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Delay revoking ObjectURL so Chrome/Edge download manager has time to read the download attribute name
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 3500);
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

export interface ShareUrlResult {
  url: string;
  charCount: number;
  sizeKb: number;
  isLarge: boolean;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 16384;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 3. Generate Share Link (compressed URL hash with zero backend required!)
export async function generateShareUrl(
  cartridge: Cartridge,
  senderName: string = 'A Friend'
): Promise<ShareUrlResult> {
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
  let finalUrl = '';

  try {
    // Native GZIP compression stream reduces URL size by up to 70%
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([jsonStr]).stream().pipeThrough(new CompressionStream('gzip'));
      const response = new Response(stream);
      const buffer = await response.arrayBuffer();
      const compressedB64 = uint8ArrayToBase64(new Uint8Array(buffer));
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      finalUrl = `${origin}${pathname}#cartridge=gz:${compressedB64}`;
    }
  } catch (err) {
    console.warn('Gzip stream compression failed, falling back to base64', err);
  }

  if (!finalUrl) {
    // Fallback: standard URI base64
    const encoded = btoa(encodeURIComponent(jsonStr));
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    finalUrl = `${origin}${pathname}#cartridge=${encoded}`;
  }

  const charCount = finalUrl.length;
  const sizeKb = Math.round((charCount / 1024) * 10) / 10;
  const isLarge = charCount > 500000; // > 500KB

  return {
    url: finalUrl,
    charCount,
    sizeKb,
    isLarge,
  };
}

// 4. Decode cartridge from URL hash if opened via link
export async function decodeCartridgeFromUrl(): Promise<Cartridge | null> {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('#cartridge=')) return null;

  try {
    let rawEncoded = hash.replace('#cartridge=', '');
    // If browser or chat app percent-encoded the hash, decode it
    if (rawEncoded.includes('%')) {
      try {
        rawEncoded = decodeURIComponent(rawEncoded);
      } catch {
        // Keep rawEncoded if URI decoding fails
      }
    }

    let jsonStr = '';

    if (rawEncoded.startsWith('gz:') && typeof DecompressionStream !== 'undefined') {
      const base64Data = rawEncoded.slice(3);
      const bytes = base64ToUint8Array(base64Data);
      const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
      const response = new Response(stream);
      jsonStr = await response.text();
    } else {
      jsonStr = decodeURIComponent(atob(rawEncoded));
    }

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
