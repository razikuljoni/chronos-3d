import React, { useState, useEffect, useRef } from 'react';
import { WatchConfig, PerformanceMetrics, TimeOfDayPreset } from '../types';
import { Eye, RotateCcw, Activity, Sun, Moon, Sparkles, Play, Pause, Clock } from 'lucide-react';
import { TIME_PRESETS } from '../utils/timeOfDayAtmosphere';

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
  const [showAtmosphereMenu, setShowAtmosphereMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close atmosphere dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAtmosphereMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

        {/* Time of Day Atmospheric Reflection Selector */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowAtmosphereMenu((prev) => !prev)}
            title="Atmospheric Time of Day Lighting & Sapphire Reflection"
            className={`px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md ${
              config.timeOfDay === 'golden' || (metrics?.atmosphere && metrics.atmosphere.goldenHourMix > 0.4)
                ? 'bg-[#2a1d12]/90 hover:bg-[#382618] text-[#ffb049] border-[#ff9c38]/50 shadow-[0_0_15px_rgba(255,156,56,0.25)]'
                : 'bg-[#101828]/90 hover:bg-[#18243c] text-[#00e5ff] border-[#00e5ff]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
            }`}
          >
            {config.timeOfDay === 'golden' || (metrics?.atmosphere && metrics.atmosphere.goldenHourMix > 0.4) ? (
              <Sun className="w-3.5 h-3.5 text-[#ff9c38]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#00e5ff]" />
            )}
            <span className="hidden sm:inline">
              {metrics?.atmosphere?.phaseName ? metrics.atmosphere.phaseName.split(' ')[0] : 'Atmosphere'}
            </span>
            {metrics?.atmosphere && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10">
                {metrics.atmosphere.kelvin}K
              </span>
            )}
          </button>

          {/* Atmospheric Time of Day Dropdown Menu */}
          {showAtmosphereMenu && (
            <div className="absolute right-0 mt-2 w-72 p-3 bg-[#0d0f15]/95 backdrop-blur-2xl border border-[#c8a97e]/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#e6c894] tracking-wider">
                  Solar Environment & Sapphire Dome
                </span>
                <span className="text-[9px] text-[#a89f91]">
                  {metrics?.atmosphere?.kelvin}K
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <button
                  onClick={() => {
                    onChangeConfig({ timeOfDay: 'golden', timeHour: 17.5, timeCycleActive: false });
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    config.timeOfDay === 'golden' && !config.timeCycleActive
                      ? 'bg-[#ff9c38]/20 border-[#ff9c38] text-[#ffb049]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-[#d1c7b7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ffb049]">
                    <Sun className="w-3 h-3" />
                    <span>Golden Hour</span>
                  </div>
                  <div className="text-[9px] text-[#a89f91] mt-0.5">17:30 &bull; 2,800K Warm</div>
                </button>

                <button
                  onClick={() => {
                    onChangeConfig({ timeOfDay: 'evening', timeHour: 22.0, timeCycleActive: false });
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    config.timeOfDay === 'evening' && !config.timeCycleActive
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-[#d1c7b7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00e5ff]">
                    <Moon className="w-3 h-3" />
                    <span>Cool Evening</span>
                  </div>
                  <div className="text-[9px] text-[#a89f91] mt-0.5">22:00 &bull; 8,500K Cobalt</div>
                </button>

                <button
                  onClick={() => {
                    onChangeConfig({ timeOfDay: 'dusk', timeHour: 19.5, timeCycleActive: false });
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    config.timeOfDay === 'dusk' && !config.timeCycleActive
                      ? 'bg-[#ff7895]/20 border-[#ff7895] text-[#ff7895]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-[#d1c7b7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ff7895]">
                    <Sparkles className="w-3 h-3" />
                    <span>Dusk Twilight</span>
                  </div>
                  <div className="text-[9px] text-[#a89f91] mt-0.5">19:30 &bull; Coral Violet</div>
                </button>

                <button
                  onClick={() => {
                    onChangeConfig({ timeOfDay: 'midday', timeHour: 12.5, timeCycleActive: false });
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    config.timeOfDay === 'midday' && !config.timeCycleActive
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-[#d1c7b7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#fbf8f2]">
                    <Sun className="w-3 h-3 text-white" />
                    <span>Zenith Noon</span>
                  </div>
                  <div className="text-[9px] text-[#a89f91] mt-0.5">12:30 &bull; 6,500K White</div>
                </button>
              </div>

              {/* Continuous Solar Day/Night Auto-Cycle Toggle */}
              <button
                onClick={() => {
                  onChangeConfig({ timeCycleActive: !config.timeCycleActive });
                }}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-[11px] transition-all mb-2 ${
                  config.timeCycleActive
                    ? 'bg-[#c8a97e] text-[#0c0d10] font-bold border-[#c8a97e]'
                    : 'bg-white/5 hover:bg-white/10 text-[#f4efe6] border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {config.timeCycleActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Continuous 24h Solar Cycle</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/20">
                  {config.timeCycleActive ? 'Active' : 'Paused'}
                </span>
              </button>

              {/* Real Local Time Sync Button */}
              <button
                onClick={() => {
                  onChangeConfig({ timeOfDay: 'auto', timeCycleActive: false });
                }}
                className="w-full py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-[#a89f91] hover:text-[#f4efe6] transition-colors"
              >
                <Clock className="w-3 h-3" />
                <span>Sync with Zürich Clock ({zurichTime.slice(0, 5)})</span>
              </button>
            </div>
          )}
        </div>

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
