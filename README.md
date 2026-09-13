# Chronos Luxe 3D Smartwatch

Luxury 3D interactive smartwatch showcase featuring procedural Three.js rendering, weighted rotational inertia physics, aperture iris entrance curtain, scroll-linked choreography, real-time performance telemetry HUD, and bespoke reservation workflows.

---

## Features

- **Interactive 3D Watch Model**: Custom Three.js canvas rendering sapphire glass dome reflections, procedural bezel textures, dynamic face modes (rings, chronograph, minimalist), and customizable finishes/straps.
- **Physics & Inertia**: Weighted rotational inertia physics driving responsive drag, flick, and scroll interactions.
- **Aperture Iris Entrance**: SVG & CSS aperture iris curtain opening sequence on initial load and manual toggle.
- **Scroll Choreography**: 5-stage scroll-linked product choreography smoothly guiding watch orientation across story sections.
- **Real-Time Telemetry HUD**: Live diagnostics HUD tracking FPS, frame times, draw calls, triangle counts, geometry instances, texture allocations, and renderer specs. Press `T` to toggle.
- **Bespoke Order Modal**: Custom smartwatch configuration & reservation modal.

---

## Tech Stack

- **Framework**: React 19 + React DOM 19
- **Build Tool**: Vite 6
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + Lucide React icons
- **3D Graphics & Physics**: Three.js (`three`) + custom shaders/materials
- **Animations**: Motion (`motion`) + Anime.js (`animejs`)
- **Package Manager**: `pnpm`

---

## Local Development

### Prerequisites

- Node.js >= 18
- `pnpm` >= 8 (`npm i -g pnpm`)

### Setup & Run

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd chronos-3d
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start local development server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in browser.

---

## Available Scripts

| Command | Action |
| --- | --- |
| `pnpm dev` | Starts Vite development server at `http://localhost:3000` |
| `pnpm build` | Compiles TypeScript and builds production distribution into `dist/` |
| `pnpm lint` / `pnpm typecheck` | Runs TypeScript compiler diagnostics (`tsc --noEmit`) |
| `pnpm preview` | Serves production build locally for verification |
| `pnpm clean` | Cleans build output directories |

---

## Shortcuts & Controls

- **`T` / `t`**: Toggle Technical Specifications Telemetry HUD
- **`Escape`**: Close Telemetry HUD & Reservation Modal

---

## Deployment (Vercel)

### Option 1: Automatic GitHub Linkage (Recommended)

1. Push this repository to GitHub.
2. Log in to [Vercel Dashboard](https://vercel.com).
3. Click **Add New** > **Project** and select this GitHub repository.
4. Vercel auto-detects Vite configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
5. Click **Deploy**. Future pushes to main branch automatically trigger deployment updates.

### Option 2: Vercel CLI Deployment

1. Install Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```
2. Run deployment:
   ```bash
   vercel --prod
   ```

---

## Environment Variables

Copy `.env.example` to `.env` if using optional external services:

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="https://your-deployment-url.vercel.app"
```

---

## License

Private repository. All rights reserved.
