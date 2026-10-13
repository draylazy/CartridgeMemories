import exifr from 'exifr';
import type { MemoryItem } from '../types';

export function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function extractDateFromFile(file: File): Promise<string> {
  try {
    // Try reading DateTimeOriginal or CreateDate from EXIF
    const parsed = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    if (parsed) {
      const dateObj = parsed.DateTimeOriginal || parsed.CreateDate || parsed.ModifyDate;
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        return formatDateToYMD(dateObj);
      }
    }
  } catch {
    // Silently proceed to fallback
  }

  // Fallback 1: File lastModified
  if (file.lastModified) {
    try {
      const d = new Date(file.lastModified);
      if (!isNaN(d.getTime())) {
        return formatDateToYMD(d);
      }
    } catch {
      // Fallback
    }
  }

  // Fallback 2: Today's date
  return formatDateToYMD(new Date());
}

// Automatically optimize and resize photos for fast performance, low memory, and easy email sharing
export function optimizeAndReadFile(file: File, maxDimension = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    // If not an image or SVG/GIF, fallback to direct data URL
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as optimized JPEG (dramatically reduces 8MB phone photos to ~150KB)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

// Backward-compatible alias
export const readFileAsDataURL = optimizeAndReadFile;

// Months dictionary for parsing and formatting
const MONTH_NAMES_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * Parses any date string format into a comparable numeric value (year * 10000 + month * 100 + day).
 * Guarantees strict chronological ordering (e.g. Day 1 first, Day 30 last).
 */
export function parseDateToNumber(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const trimmed = dateStr.trim();
  if (!trimmed) return 0;

  // 1. Match YYYY-MM-DD or YYYY-M-D
  const ymd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10);
    const d = parseInt(ymd[3], 10);
    return y * 10000 + m * 100 + d;
  }

  // 2. Match DD-MM-YYYY or D-M-YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10);
    const y = parseInt(dmy[3], 10);
    return y * 10000 + m * 100 + d;
  }

  // 3. Match format like "01 OCT 2026" or "1 OCT 2026"
  const dayMonthYear = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]{3,})\s+(\d{4})/);
  if (dayMonthYear) {
    const d = parseInt(dayMonthYear[1], 10);
    const mStr = dayMonthYear[2].toLowerCase().substring(0, 3);
    const m = MONTH_MAP[mStr] || 1;
    const y = parseInt(dayMonthYear[3], 10);
    return y * 10000 + m * 100 + d;
  }

  // 4. Match format like "OCT 01 2026" or "OCT 1, 2026"
  const monthDayYear = trimmed.match(/^([a-zA-Z]{3,})\s+(\d{1,2}),?\s+(\d{4})/);
  if (monthDayYear) {
    const mStr = monthDayYear[1].toLowerCase().substring(0, 3);
    const m = MONTH_MAP[mStr] || 1;
    const d = parseInt(monthDayYear[2], 10);
    const y = parseInt(monthDayYear[3], 10);
    return y * 10000 + m * 100 + d;
  }

  // 5. General Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.getFullYear() * 10000 + (parsed.getMonth() + 1) * 100 + parsed.getDate();
  }

  // 6. Fallback: single number representing the day (e.g. "1" to "30")
  const numMatch = trimmed.match(/\b(\d{1,2})\b/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return 0;
}

/**
 * Sorts MemoryItem array chronologically from 1 first to 30 last.
 */
export function sortMemoryItemsByDate(items: MemoryItem[]): MemoryItem[] {
  return [...items].sort((a, b) => {
    const valA = parseDateToNumber(a.date);
    const valB = parseDateToNumber(b.date);

    if (valA === 0 && valB === 0) return 0;
    if (valA === 0) return 1; // Items without dates go to the end
    if (valB === 0) return -1;

    return valA - valB; // Ascending: Day 1 first, Day 30 last
  });
}

// Convert date string "2026-10-01" to retro camcorder timestamp "01 OCT 2026" (Day First)
export function formatRetroTimestamp(dateStr: string): string {
  if (!dateStr) return '01 OCT 2026';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      const month = MONTH_NAMES_SHORT[monthIdx] || 'OCT';
      // Format with Day first: "01 OCT 2026" to "30 OCT 2026"
      return `${day} ${month} ${year}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = MONTH_NAMES_SHORT[d.getMonth()] || 'OCT';
      return `${day} ${month} ${d.getFullYear()}`;
    }
  } catch {
    // Fallback
  }
  return dateStr.toUpperCase();
}
