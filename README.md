# 💾 Cartridge Memories

> **A tactile, nostalgic retro compact-Mac media player where monthly moments, photographs, and notes live in physical game cartridges.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Cartridge Memories transforms your digital photos and journal entries into collectible, tactile retro ROM cartridges. Inspired by classic Macintosh System 7.1 aesthetics and 1990s physical game media, insert a cartridge into the vintage console slot to watch your memories play out across a glowing, phosphor CRT monitor complete with scanlines, typewriter sounds, and mechanical clunks.

---

## ✨ Features

### 🕹️ Tactile Compact-Mac Console
* **Interactive Cartridge Slot**: Drag and drop any cartridge from your shelf into the console slot or tap to slide it in with authentic mechanical clunk sound effects.
* **Tactile Ejection**: Push the classic eject button or lever to pop the cartridge back onto the shelf with a satisfying mechanical snap.
* **System 7.1 Aesthetics**: Vintage Apple beige chassis, recessed carry handle groove, classic pinstripe window headers, and monochrome pixel accents.

### 📺 Authentic Phosphor CRT Player
* **Retro Display Effects**: Dynamic phosphor bloom, curvature vignette, screen curvature, and configurable scanlines (coarse and fine).
* **Typewriter Audio & Animation**: Notes and picture captions type out letter-by-letter with authentic mechanical typewriter clicks.
* **Playback Controls**: Play, pause, step forward/backward, and adjust playback speed:
  * **FAST** (2.0s per slide)
  * **DEFAULT** (2.6s per slide)
  * **SLOW** (3.8s per slide)
* **Chronological Timeline**: Memory items automatically sort chronologically by date (Day 1 through Day 31) with timestamp watermarks.

### 🗄️ Cartridge Shelf & Storage Folders
* **12 Default Monthly Cartridges**: Pre-configured January–December cartridges with curated nostalgic colorways (*Sage Leaf, Terracotta, Mustard Ochre, Charcoal Noir, Washed Denim, and more*).
* **Create Custom ROMs**: Build your own cartridges (+ NEW ROM) holding up to 15 photos or custom notes:
  * **PICTURES**: Photo gallery cartridge.
  * **NOTES**: Vintage text diary/journal entries.
  * **PICTURES + NOTES**: Photos paired with custom typewriter captions.
* **Smart EXIF Extraction**: Automatically extracts capture dates (`DateTimeOriginal`, `CreateDate`) using `exifr` so your pictures sort themselves in calendar order.
* **Color-Coded Storage Cases**: Group cartridges into custom folders (e.g., *Vacations*, *Family*, *2026 Archive*, *Special Events*).

### 💾 Safe ROM Sharing & Export
* **Export Physical ROM Files**: Export any cartridge to a standalone `.cartridge` (JSON) or `.txt` file for safe-keeping or sending to friends.
* **Write-Protected ROMs**: Imported cartridges are marked read-only with recipient protection and original author attribution (*"From: [Sender]"*). Recipients can enjoy the memories without overwriting them, or create an editable duplicate.
* **Drag-and-Drop Loading**: Drop any `.cartridge` file anywhere on the browser window to load it immediately.
* **Compressed URL Sharing**: Share lightweight cartridges via base64 URL hash links.

### 🔊 Procedural Web Audio Engine
* **Zero External Audio Assets**: 100% synthesized real-time procedural audio powered by the Web Audio API:
  * Solid cartridge insertion clunks
  * Heavy spring-loaded eject thuds
  * Vintage Mac desktop alert beeps
  * Floppy drive seek sounds
  * Typewriter keystroke clicks & return dings
  * Ambient CRT phosphor hum

### 🔒 100% Private & Offline-First
* **Local IndexedDB Storage**: Uses IndexedDB (`idb`) for high-capacity local storage of photos, metadata, and cartridges.
* **Zero Cloud Dependence**: Photos and notes never leave your browser.
* **Client-side Image Optimization**: Uploaded images are compressed and scaled in the browser for instant loading and minimal storage footprint.
* **Dark & Light Themes**: Seamlessly switch between Classic System 7 Mac Beige and Stealth Charcoal Dark Mode.
* **Reduced Motion Support**: Respects system `prefers-reduced-motion` settings.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Modern component-driven UI architecture |
| **[TypeScript](https://www.typescriptlang.org/)** | Strict type safety and clear domain models |
| **[Vite 8](https://vitejs.dev/)** | Fast developer experience and optimized production bundling |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Styling, CSS custom properties, and utility system |
| **[Framer Motion 14](https://www.framer.com/motion/)** | Physics-based animations, drag gestures, and layout transitions |
| **[IndexedDB (idb)](https://github.com/jakearchibald/idb)** | Client-side database for cartridges and image data |
| **[exifr](https://github.com/MikeKovarik/exifr)** | Fast EXIF metadata extraction for automatic photo dating |
| **[Lucide React](https://lucide.dev/)** | Clean, minimalist iconography |
| **Web Audio API** | Real-time procedural sound synthesizer |
| **[Oxlint](https://oxc.rs/)** | Ultra-fast linter |

---

## 📁 Project Structure

```text
CartridgeMemories/
├── public/                 # Static assets and icons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Common/         # Reusable Mac window header, how-to guide modal
│   │   ├── Console/        # Macintosh chassis, cartridge slot, and CRT screen
│   │   ├── Controls/       # Floating toolbar (sound, theme, help, reset)
│   │   ├── CRTPlayer/      # CRT monitor fullscreen playback view
│   │   ├── Editor/         # Cartridge creator & photo/note editor modal
│   │   ├── Folder/         # Storage case management and assignment modals
│   │   ├── Share/          # ROM export and write-protected share modal
│   │   └── Shelf/          # Cartridge shelf rack, visuals, and animations
│   ├── services/
│   │   ├── audio.ts        # Synthesized Web Audio engine
│   │   ├── db.ts           # IndexedDB client & LocalStorage managers
│   │   ├── demoData.ts     # Pre-seeded default month cartridges
│   │   ├── exif.ts         # EXIF date parser and image optimizer
│   │   └── sharing.ts      # ROM file export/import and URL hash encoder
│   ├── types/
│   │   └── index.ts        # Cartridge, MemoryItem, Folder, and Settings types
│   ├── App.tsx             # Root application orchestrator
│   ├── App.css
│   ├── index.css           # Tailwind CSS imports, CRT shaders, and scanlines
│   └── main.tsx            # Application entry point
├── index.html              # HTML shell & retro typography Google Fonts
├── package.json
├── tsconfig.json
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/draylazy/CartridgeMemories.git
   cd CartridgeMemories
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 📜 Available Scripts

* **`npm run dev`**: Launches Vite development server with Hot Module Replacement (HMR).
* **`npm run build`**: Type-checks with `tsc` and creates an optimized production bundle in `dist/`.
* **`npm run preview`**: Serves the production build locally for verification.
* **`npm run lint`**: Runs Oxlint to inspect code quality.

---

## 🎮 How to Use

1. **Insert a Cartridge**:
   * Drag any cartridge from the wooden shelf into the console slot.
   * Or simply tap/click the cartridge to insert it automatically.
2. **Watch CRT Playback**:
   * Once inserted, click **PLAY** on the screen to launch the CRT playback viewer.
   * Sit back and watch your photos advance and notes type out on screen.
3. **Create a Custom Cartridge**:
   * Click **+ NEW ROM** on the shelf rack.
   * Choose a plastic shell color and cartridge format (*Pictures*, *Notes*, or *Pictures + Notes*).
   * Upload up to 15 photos. The app extracts EXIF timestamps to sort them automatically.
4. **Organize into Storage Cases**:
   * Click **+ NEW FOLDER** to create a labeled storage box.
   * Click **"..."** on any cartridge to assign it to a folder.
5. **Share a Memory ROM**:
   * Click **"..." → Send / Share** on any cartridge.
   * Export as a `.cartridge` file or copy a shareable link to send to a friend.
   * When they drag the file onto their screen, it loads as a write-protected ROM!


