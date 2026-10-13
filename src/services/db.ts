import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Cartridge, AppSettings, CartridgeFolder } from '../types';
import { createDefaultCartridges } from './demoData';

interface CartridgeDBSchema extends DBSchema {
  cartridges: {
    key: string;
    value: Cartridge;
    indexes: { 'by-createdAt': number };
  };
}

const DB_NAME = 'cartridge-memories-db';
const DB_VERSION = 1;
const SETTINGS_KEY = 'cartridge_memories_settings';
const FOLDERS_KEY = 'cartridge_memories_folders';

let dbPromise: Promise<IDBPDatabase<CartridgeDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<CartridgeDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<CartridgeDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cartridges')) {
          const store = db.createObjectStore('cartridges', { keyPath: 'id' });
          store.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function loadAllCartridges(): Promise<Cartridge[]> {
  const db = await getDB();
  const all = await db.getAll('cartridges');
  
  if (all.length === 0) {
    // Populate with 12 default month cartridges
    const defaultCartridges = createDefaultCartridges();
    const tx = db.transaction('cartridges', 'readwrite');
    for (const c of defaultCartridges) {
      await tx.store.put(c);
    }
    await tx.done;
    return defaultCartridges;
  }

  // Sort: monthIndex 0..11 first, then custom cartridges by creation date
  return all.sort((a, b) => {
    if (a.monthIndex >= 0 && b.monthIndex >= 0) {
      return a.monthIndex - b.monthIndex;
    }
    if (a.monthIndex >= 0) return -1;
    if (b.monthIndex >= 0) return 1;
    return a.createdAt - b.createdAt;
  });
}

export async function saveCartridge(cartridge: Cartridge): Promise<void> {
  const db = await getDB();
  await db.put('cartridges', cartridge);
}

export async function saveAllCartridges(cartridges: Cartridge[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cartridges', 'readwrite');
  for (const c of cartridges) {
    await tx.store.put(c);
  }
  await tx.done;
}

export async function deleteCartridge(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cartridges', id);
}

export async function clearAllCartridges(): Promise<void> {
  const db = await getDB();
  await db.clear('cartridges');
}

// LocalStorage helpers for Folders / Storage Cases
export function loadFolders(): CartridgeFolder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load folders', e);
  }
  return [];
}

export function saveFolders(folders: CartridgeFolder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error('Failed to save folders', e);
  }
}

// LocalStorage helpers for Settings only (as required by prompt)
export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return { soundEnabled: false, darkMode: false, reducedMotion: false };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    soundEnabled: false,
    darkMode: prefersDark,
    reducedMotion: prefersReduced,
  };
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
