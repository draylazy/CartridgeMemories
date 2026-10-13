export type CartridgeType = 'PICTURES' | 'NOTES' | 'PICTURES_NOTES';

export interface MemoryItem {
  id: string;
  type: 'picture' | 'note' | 'picture_note';
  imageUrl?: string; // Data URL or object URL
  text?: string;
  date: string; // ISO date or formatted date string like "2026-10-14"
  caption?: string;
}

export interface CartridgeFolder {
  id: string;
  name: string;
  color?: string; // Hex color for the folder label / tab
  createdAt: number;
}

export interface Cartridge {
  id: string;
  monthIndex: number; // 0-11 for Jan-Dec, or -1 for custom
  title: string;
  label: string;
  type: CartridgeType;
  color: string; // Hex color for the cartridge plastic
  accentColor?: string; // Grip line or accent color
  items: MemoryItem[];
  createdAt: number;
  updatedAt: number;
  isReadOnly?: boolean; // When shared from another user (write-protected ROM)
  sharedBy?: string; // Name or tag of person who sent the cartridge
  folderId?: string; // ID of the storage folder/case this cartridge is placed in
}

export interface AppSettings {
  soundEnabled: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  hasLoadedDemoData?: boolean;
}

export const PRESET_CARTRIDGE_COLORS = [
  { name: 'Sage Leaf', hex: '#87977A', labelBg: '#F4F5EF', textDark: true },
  { name: 'Terracotta', hex: '#BA6D57', labelBg: '#FBF2EE', textDark: true },
  { name: 'Mustard Ochre', hex: '#CBA052', labelBg: '#FAF6EB', textDark: true },
  { name: 'Dusty Slate', hex: '#687E8D', labelBg: '#EFF4F7', textDark: true },
  { name: 'Vintage Mauve', hex: '#9E748F', labelBg: '#F8EEF5', textDark: true },
  { name: 'Muted Olive', hex: '#77825A', labelBg: '#F3F6EC', textDark: true },
  { name: 'Deep Rust', hex: '#9A5243', labelBg: '#FAECE9', textDark: true },
  { name: 'Washed Denim', hex: '#587391', labelBg: '#EDF3F8', textDark: true },
  { name: 'Warm Putty', hex: '#A89F91', labelBg: '#F7F5F2', textDark: true },
  { name: 'Charcoal Noir', hex: '#44484E', labelBg: '#EBECEE', textDark: true },
  { name: 'Forest Moss', hex: '#4E6852', labelBg: '#EEF4EF', textDark: true },
  { name: 'Sunburnt Coral', hex: '#C27367', labelBg: '#FCF1EF', textDark: true },
];

export const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];
