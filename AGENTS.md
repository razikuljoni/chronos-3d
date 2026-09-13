# AGENTS.md

Instruction guide for AI agents working in this repository.

## Commands

- **Install Dependencies**: `pnpm install`
- **Typecheck / Lint**: `pnpm run lint` or `pnpm run typecheck` (runs `tsc --noEmit`)
- **Build**: `pnpm run build` (runs `vite build`)
- **Dev Server**: `pnpm run dev` (Vite on `http://localhost:3000`)
- **Preview Build**: `pnpm run preview`
- **Clean Output**: `pnpm run clean` (`rm -rf dist server.js`)
- **Verification Sequence**: `pnpm run lint && pnpm run build`

## Architecture & Entrypoints

- `src/main.tsx` — Root React 19 mount point.
- `src/App.tsx` — Main application state (`WatchConfig`, `PerformanceMetrics`, scroll progress, HUD toggle).
- `src/components/Watch3DCanvas.tsx` — Three.js canvas, materials, lighting, rotational inertia physics & metrics calculation.
- `src/components/IrisBackdrop.tsx` — Aperture iris entrance curtain & background overlay.
- `src/components/ScrollSections.tsx` — 5-stage scroll-linked choreography & narrative sections.
- `src/components/TechSpecsOverlay.tsx` — Real-time performance telemetry HUD (toggled via `T` key).
- `src/types.ts` — Type definitions for watch configs, finishes, strap colors, and metrics.

## Toolchain & Repo Quirks

- **Path Alias**: `@/` maps to root `./` in `vite.config.ts` and `tsconfig.json`.
- **HMR / Watch Control**: Set `DISABLE_HMR=true` env var to disable Vite file watching during automated/batch agent edits.
- **Environment Variables**: `GEMINI_API_KEY` (Gemini API) and `APP_URL` (cloud deployment URL). Defined in `.env.example`.
- **Package Manager**: Use `pnpm` (`pnpm-lock.yaml`).
- **Keyboard Shortcuts**: `T` toggles Telemetry HUD; `Escape` closes overlays/modals.
