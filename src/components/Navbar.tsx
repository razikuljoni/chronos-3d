import React, { useState, useEffect } from 'react';
import { WatchConfig, PerformanceMetrics } from '../types';
import { Eye, RotateCcw, Cpu, Activity } from 'lucide-react';

interface NavbarProps {
  config: WatchConfig;
  onChangeConfig: (newConfig: Partial<WatchConfig>) => void;
  irisOpen: boolean;
  onToggleIris: () => void;
  onOpenOrderModal: () => void;
  metrics?: PerformanceMetrics;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  onChangeConfig,
  irisOpen,
  onToggleIris,
  onOpenOrderModal,
  metrics,
}) => {
  const [zurichTime, setZurichTime] = useState<string>('');

  // Live Swiss time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Zurich CET/CEST
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Zurich',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setZurichTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-none">
      {/* Brand Mark */}
      <a
        href="#section-hero"
        className="pointer-events-auto flex items-center gap-3 group focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full border border-[#c8a97e]/60 bg-[#12141a]/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:border-[#c8a97e] transition-colors">
          <span className="font-cinzel text-base font-bold text-[#c8a97e]">C</span>
        </div>
        <div>
          <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#fbf8f2] block leading-none">
            CHRONOS
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#c8a97e]/70 block mt-0.5">
            GENÈVE
          </span>
        </div>
      </a>

      {/* Center Nav Anchors */}
      <nav className="hidden lg:flex items-center gap-8 px-6 py-2 rounded-full bg-[#12141a]/70 backdrop-blur-xl border border-white/10 pointer-events-auto text-xs font-mono uppercase tracking-wider text-[#d1c7b7]">
        <a href="#section-hero" className="hover:text-[#c8a97e] transition-colors">
          Overview
        </a>
        <a href="#section-dome" className="hover:text-[#c8a97e] transition-colors">
          Sapphire Dome
        </a>
        <a href="#section-telemetry" className="hover:text-[#c8a97e] transition-colors">
          Bio-Rings
        </a>
        <a href="#section-metallurgy" className="hover:text-[#c8a97e] transition-colors">
          Titanium
        </a>
        <a href="#section-configurator" className="hover:text-[#c8a97e] transition-colors">
          Atelier
        </a>
        <a href="#section-specs" className="hover:text-[#c8a97e] transition-colors">
          Specs
        </a>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Live Zurich Time */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12141a]/60 backdrop-blur-md border border-white/5 font-mono text-[11px] text-[#c8a97e]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#99ff00] animate-pulse" />
          <span>ZÜRICH {zurichTime}</span>
        </div>

        {/* Iris Toggle */}
        <button
          onClick={onToggleIris}
          title={irisOpen ? 'Close Aperture Iris' : 'Open Aperture Iris'}
          className="p-2.5 rounded-full bg-[#12141a]/80 hover:bg-[#1f232d] text-[#e6c894] border border-[#c8a97e]/40 backdrop-blur-md transition-all shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Technical Telemetry HUD Toggle */}
        <button
          onClick={() => onChangeConfig({ showTechSpecs: !config.showTechSpecs })}
          title="Toggle Technical Telemetry HUD [Press T]"
          className={`px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md ${
            config.showTechSpecs
              ? 'bg-[#c8a97e] text-[#0c0d10] font-bold border-[#c8a97e] shadow-[0_0_20px_rgba(200,169,126,0.5)]'
              : 'bg-[#12141a]/80 hover:bg-[#1f232d] text-[#f4efe6] border-white/10'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="hidden sm:inline">Telemetry</span>
          {metrics && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                config.showTechSpecs ? 'bg-black/20 text-black' : 'bg-white/10 text-[#99ff00]'
              }`}
            >
              {metrics.fps.toFixed(0)} FPS
            </span>
          )}
        </button>

        {/* 3D Orbit Toggle */}
        <button
          onClick={() => onChangeConfig({ inspectMode: !config.inspectMode })}
          title="Toggle Free 3D Orbit"
          className={`px-3.5 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md ${
            config.inspectMode
              ? 'bg-[#c8a97e] text-[#0c0d10] font-bold border-[#c8a97e] shadow-[0_0_20px_rgba(200,169,126,0.5)]'
              : 'bg-[#12141a]/80 hover:bg-[#1f232d] text-[#f4efe6] border-white/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{config.inspectMode ? 'Exit 3D' : '3D Orbit'}</span>
        </button>

        {/* Reserve CTA */}
        <button
          onClick={onOpenOrderModal}
          className="px-5 py-2 rounded-full bg-[#c8a97e] hover:bg-[#dfbe91] text-[#0c0d10] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(200,169,126,0.35)]"
        >
          Reserve
        </button>
      </div>
    </header>
  );
};
