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
