import type { Cartridge } from '../types';
import { MONTH_NAMES, PRESET_CARTRIDGE_COLORS } from '../types';

// Curated nostalgic vintage-tinted photography URLs (high reliability, aesthetic 35mm film vibes)
export const DEMO_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-14',
    caption: 'Sun-drenched coastal afternoon. The tide kept creeping toward our vintage towels.',
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-18',
    caption: 'Morning mist settling over the pines before coffee.',
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-22',
    caption: 'Alpine switchbacks at dusk. The cassette deck was playing on repeat.',
  },
  {
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-28',
    caption: 'Neon diner reflections after the midnight summer thunderstorm.',
  },
  {
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-04',
    caption: 'Golden hour stroll with the old rangefinder camera.',
  },
  {
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-14',
    caption: 'Amber leaves carpeting the brick sidewalk in the afternoon chill.',
  },
  {
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-24',
    caption: 'Sunbeam filtering through dust motes in the attic studio.',
  },
];

// Curated nostalgic retro notes (philosophical, warm, personal logs)
export const DEMO_NOTES = [
  {
    text: "OCT 02, 2026 // 21:40\nFound the old shoebox full of floppy disks and analog negatives in the closet.\nIt is strange how tactile memories used to be—you had to physically push a latch or wind a film spool to remember.",
    date: '2026-10-02',
  },
  {
    text: "OCT 12, 2026 // 08:15\nRain beating steady against the glass window.\nBrewed dark roast coffee in the tin pot. The radiator lets out its soft metallic ticking sound.\nSome days are meant to be kept quietly on a shelf.",
    date: '2026-10-12',
  },
  {
    text: "OCT 20, 2026 // 17:30\nThe street lamps flicker on right at dusk, a dusty halogen amber.\nWalked home through the damp leaves without looking at any notifications.\nA rare and restorative silence.",
    date: '2026-10-20',
  },
  {
    text: "OCT 29, 2026 // 23:05\nLate night listening to ambient synth loops through thick foam headphones.\nThe cathode ray tube screen casts a warm sage glow across the desk.\nMemory is not a database; it is a physical artifact.",
    date: '2026-10-29',
  },
];

export function createDefaultCartridges(): Cartridge[] {
  const currentYear = new Date().getFullYear();
  return MONTH_NAMES.map((month, idx) => {
    const colorObj = PRESET_CARTRIDGE_COLORS[idx % PRESET_CARTRIDGE_COLORS.length];
    return {
      id: `cartridge-month-${idx}`,
      monthIndex: idx,
      title: `${month} ${currentYear}`,
      label: month,
      type: idx === 6 ? 'PICTURES_NOTES' : idx === 9 ? 'NOTES' : 'PICTURES',
      color: colorObj.hex,
      items: [],
      createdAt: Date.now() - (12 - idx) * 86400000 * 30,
      updatedAt: Date.now(),
    };
  });
}

export function populateDemoContent(cartridges: Cartridge[]): Cartridge[] {
  const currentYear = new Date().getFullYear();
  return cartridges.map((c) => {
    // July (idx 6): Pictures + Notes
    if (c.monthIndex === 6) {
      return {
        ...c,
        title: `JULY ${currentYear}`,
        type: 'PICTURES_NOTES',
        items: [
          {
            id: 'demo-jul-1',
            type: 'picture_note',
            imageUrl: DEMO_PHOTOS[0].url,
            date: `${currentYear}-07-14`,
            caption: DEMO_PHOTOS[0].caption,
          },
          {
            id: 'demo-jul-2',
            type: 'picture_note',
            imageUrl: DEMO_PHOTOS[1].url,
            date: `${currentYear}-07-18`,
            caption: DEMO_PHOTOS[1].caption,
          },
          {
            id: 'demo-jul-3',
            type: 'picture_note',
            imageUrl: DEMO_PHOTOS[2].url,
            date: `${currentYear}-07-22`,
            caption: DEMO_PHOTOS[2].caption,
          },
          {
            id: 'demo-jul-4',
            type: 'picture_note',
            imageUrl: DEMO_PHOTOS[3].url,
            date: `${currentYear}-07-28`,
            caption: DEMO_PHOTOS[3].caption,
          },
        ],
        updatedAt: Date.now(),
      };
    }

    // October (idx 9): Notes (text terminal entries)
    if (c.monthIndex === 9) {
      return {
        ...c,
        title: `OCTOBER ${currentYear}`,
        type: 'NOTES',
        items: DEMO_NOTES.map((n, i) => ({
          id: `demo-oct-${i}`,
          type: 'note',
          text: n.text,
          date: n.date,
        })),
        updatedAt: Date.now(),
      };
    }

    // August (idx 7): Pictures only
    if (c.monthIndex === 7) {
      return {
        ...c,
        title: `AUGUST ${currentYear}`,
        type: 'PICTURES',
        items: [
          {
            id: 'demo-aug-1',
            type: 'picture',
            imageUrl: DEMO_PHOTOS[4].url,
            date: `${currentYear}-08-04`,
          },
          {
            id: 'demo-aug-2',
            type: 'picture',
            imageUrl: DEMO_PHOTOS[5].url,
            date: `${currentYear}-08-14`,
          },
          {
            id: 'demo-aug-3',
            type: 'picture',
            imageUrl: DEMO_PHOTOS[6].url,
            date: `${currentYear}-08-24`,
          },
        ],
        updatedAt: Date.now(),
      };
    }

    return c;
  });
}
