import exifr from 'exifr';

export async function extractDateFromFile(file: File): Promise<string> {
  try {
    // Try reading DateTimeOriginal or CreateDate from EXIF
    const parsed = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    if (parsed) {
      const dateObj = parsed.DateTimeOriginal || parsed.CreateDate || parsed.ModifyDate;
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
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
        return d.toISOString().split('T')[0];
      }
    } catch {
      // Fallback
    }
  }

  // Fallback 2: Today's date
  return new Date().toISOString().split('T')[0];
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert date string "2026-10-14" to retro camcorder timestamp "OCT 14 2026"
export function formatRetroTimestamp(dateStr: string): string {
  if (!dateStr) return 'OCT 14 2026';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[monthIdx] || 'OCT';
      return `${month} ${day} ${year}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`;
    }
  } catch {
    // Fallback
  }
  return dateStr.toUpperCase();
}
