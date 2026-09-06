import React, { useState } from 'react';
import { PerformanceMetrics } from '../types';
import {
  Activity,
  Cpu,
  Zap,
  Gauge,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  Layers,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface TechSpecsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: PerformanceMetrics;
}

export const TechSpecsOverlay: React.FC<TechSpecsOverlayProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!isOpen) return null;

  // Derive status colors based on performance
  const fpsColor =
    metrics.fps >= 55 ? '#99ff00' : metrics.fps >= 30 ? '#ffcc00' : '#ff3b30';

  // Format angular momentum and velocity
  const absVelocity = Math.abs(metrics.scrollVelocity);
  const inertiaStatus =
    absVelocity > 1.8
      ? 'HIGH MOMENTUM SURGE'
      : absVelocity > 0.3
      ? 'COASTING WITH INERTIA'
      : 'HARMONIC EQUILIBRIUM';

  // Normalize history values for sparkline
  const history = metrics.history.length > 0 ? metrics.history : [16.6];
  const maxTime = Math.max(33.3, ...history);
  const sparkPoints = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1 || 1)) * 260;
      const y = 50 - Math.min(1, val / maxTime) * 44;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <aside
      aria-label="Technical Specifications & Diagnostics HUD"
      className="fixed top-20 right-4 sm:right-8 z-30 pointer-events-auto select-none animate-fadeIn"
    >
      <div className="w-[340px] sm:w-[380px] bg-[#0d0f14]/90 backdrop-blur-2xl border border-[#c8a97e]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden font-mono text-xs text-[#f4efe6]">
        {/* Top Diagnostic Titlebar */}
        <div className="px-4 py-3 bg-[#13161f]/90 border-b border-[#c8a97e]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#99ff00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#99ff00]" />
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#e6c894] uppercase block leading-tight">
                CALIBRE T-48 // TELEMETRY HUD
              </span>
              <span className="text-[9px] text-[#a89f91] uppercase tracking-widest block">
                LAB SPECIFICATIONS &bull; REALTIME
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? 'Expand Metrics' : 'Collapse Metrics'}
              className="p-1 rounded text-[#a89f91] hover:text-[#f4efe6] hover:bg-white/5 transition-colors"
            >
              {collapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close Telemetry HUD"
              className="p-1 rounded text-[#a89f91] hover:text-[#ff3b30] hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* 1. PRIMARY RENDER GAUGES (FPS & Frame Time) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-[#a89f91] uppercase tracking-wider mb-1">
                  <span>Frame Rate</span>
                  <Activity className="w-3 h-3 text-[#c8a97e]" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: fpsColor }}
                  >
                    {metrics.fps.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[#a89f91]">FPS</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-200"
                    style={{
                      width: `${Math.min(100, (metrics.fps / 60) * 100)}%`,
                      backgroundColor: fpsColor,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-[#a89f91] uppercase tracking-wider mb-1">
                  <span>Frame Latency</span>
                  <Zap className="w-3 h-3 text-[#00e5ff]" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-[#00e5ff]">
                    {metrics.frameTimeMs.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[#a89f91]">MS</span>
                </div>
                <div className="text-[9px] text-[#a89f91] mt-1.5 flex justify-between">
                  <span>TARGET: 16.6ms</span>
                  <span className="text-[#99ff00]">VSYNC ACTIVE</span>
                </div>
              </div>
            </div>

            {/* 2. REAL-TIME FRAME-TIME OSCILLOGRAPH / SPARKLINE */}
            <div className="p-3 rounded-xl bg-black/50 border border-white/5">
              <div className="flex items-center justify-between text-[10px] text-[#c8a97e] uppercase tracking-wider mb-2">
                <span>Frame Render Pulse (60 Samples)</span>
                <span className="text-[9px] text-[#a89f91]">MAX: {maxTime.toFixed(1)}ms</span>
              </div>
              <div className="relative h-14 w-full bg-[#080a0f] rounded-lg border border-white/5 overflow-hidden flex items-end px-1 py-1">
                {/* 16.6ms Target Guide Line */}
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-[#99ff00]/40 pointer-events-none"
                  style={{
                    bottom: `${Math.min(100, (16.6 / maxTime) * 100)}%`,
                  }}
                />

                <svg className="w-full h-full overflow-visible" viewBox="0 0 260 50">
                  <polyline
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparkPoints}
                  />
                </svg>
              </div>
            </div>

            {/* 3. PHYSICAL INERTIA & SCROLL MOMENTUM SENSORS */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#c8a97e] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#c8a97e]" />
                  Kinetic Inertia & Physics
                </span>
                <span className="text-[9px] text-[#99ff00]">{inertiaStatus}</span>
              </div>

              {/* Scroll Momentum Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[#a89f91] mb-1">
                  <span>Scroll Angular Momentum</span>
                  <span className="text-[#f4efe6] font-bold">
                    {metrics.angularMomentum.toFixed(2)} rad/s²
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00e5ff] via-[#c8a97e] to-[#ff2d55] transition-all duration-100"
                    style={{
                      width: `${Math.min(100, Math.abs(metrics.scrollVelocity) * 35)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-[#a89f91] block">Inertial Damping:</span>
                  <span className="text-[#e6c894] font-semibold">0.915 (Weighted)</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-[#a89f91] block">Harmonic Mass:</span>
                  <span className="text-[#e6c894] font-semibold">184g Ti-6Al-4V</span>
                </div>
              </div>
            </div>

            {/* 4. DYNAMIC SAPPHIRE DOME SHADER & ATMOSPHERIC LIGHTING */}
            {metrics.atmosphere && (
              <div className="p-3 rounded-xl bg-black/40 border border-[#c8a97e]/30 space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#c8a97e] uppercase tracking-wider font-semibold">
                    {metrics.atmosphere.goldenHourMix > 0.4 ? (
                      <Sun className="w-3.5 h-3.5 text-[#ff9c38]" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-[#00e5ff]" />
                    )}
                    <span>Sapphire Dome Shader</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#c8a97e]/20 text-[#e6c894]">
                    {metrics.atmosphere.phaseName}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Kelvin Color Temp */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#a89f91]">Color Temperature:</span>
                    <span
                      className="font-bold font-mono px-2 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          metrics.atmosphere.goldenHourMix > 0.4
                            ? 'rgba(255, 156, 56, 0.2)'
                            : 'rgba(0, 229, 255, 0.15)',
                        color:
                          metrics.atmosphere.goldenHourMix > 0.4
                            ? '#ffb049'
                            : '#00e5ff',
                      }}
                    >
                      {metrics.atmosphere.kelvin}K ({metrics.atmosphere.goldenHourMix > 0.4 ? 'Warm Amber' : 'Cool Cobalt'})
                    </span>
                  </div>

                  {/* Golden Hour to Evening Spectrum Slider Bar */}
                  <div>
                    <div className="flex justify-between text-[9px] text-[#a89f91] mb-1">
                      <span>Cool Evening (0%)</span>
                      <span className="text-[#f4efe6] font-bold">
                        Golden Mix: {(metrics.atmosphere.goldenHourMix * 100).toFixed(0)}%
                      </span>
                      <span>Golden Hour (100%)</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1877f2] via-[#a83bb2] to-[#ff9c38] transition-all duration-200"
                        style={{
                          width: `${Math.min(100, Math.max(0, metrics.atmosphere.goldenHourMix * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-[#a89f91] block">Anti-Reflective AR:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: metrics.atmosphere.arCoating }}
                        />
                        <span className="text-[#f4efe6] font-mono">{metrics.atmosphere.arCoating}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <span className="text-[#a89f91] block">Solar Zenith:</span>
                      <span className="text-[#e6c894] font-mono block truncate">
                        {metrics.atmosphere.solarZenith}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. WEBGL GRAPHICS PIPELINE & MEMORY STATS */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-[#c8a97e] uppercase tracking-wider font-semibold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>3D Graphics Pipeline</span>
              </div>

              <div className="divide-y divide-white/5">
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#a89f91]">Draw Calls:</span>
                  <span className="text-[#f4efe6] font-bold">{metrics.drawCalls} calls / frame</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#a89f91]">Triangles Rendered:</span>
                  <span className="text-[#f4efe6] font-bold">
                    {metrics.triangles.toLocaleString()} polys
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#a89f91]">Geometries / Textures:</span>
                  <span className="text-[#f4efe6] font-bold">
                    {metrics.geometries} buffers &bull; {metrics.textures} maps
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#a89f91]">Sapphire Refraction:</span>
                  <span className="text-[#e6c894] font-bold">MeshPhysical IOR 1.77</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#a89f91]">Tone Mapping:</span>
                  <span className="text-[#99ff00] font-bold">ACES Filmic HDR</span>
                </div>
              </div>
            </div>

            {/* 5. VIRTUAL HOROLOGICAL CALIBRE TELEMETRY */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5 text-[#c8a97e] uppercase tracking-wider font-semibold mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Micro-Calibre Oscillation</span>
              </div>
              <div className="flex justify-between text-[#a89f91]">
                <span>Escapement Frequency:</span>
                <span className="text-white font-semibold">28,800 VPH (4.0 Hz)</span>
              </div>
              <div className="flex justify-between text-[#a89f91]">
                <span>Precision Rating:</span>
                <span className="text-[#99ff00] font-semibold">±0.001s / Cycle</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar with Hotkey hint */}
        <div className="px-4 py-2 bg-[#0a0c10] border-t border-white/5 text-[9px] text-[#a89f91] flex items-center justify-between">
          <span>PRESS [T] TO TOGGLE HUD</span>
          <span className="text-[#c8a97e]">GRADE 5 TITANIUM PROTOCOL</span>
        </div>
      </div>
    </aside>
  );
};
