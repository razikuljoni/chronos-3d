import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { WatchConfig, CaseFinish, StrapColor, WatchFaceMode } from '../types';
import {
  Sparkles,
  Shield,
  Activity,
  Compass,
  Sliders,
  ChevronDown,
  RotateCcw,
  Check,
  Eye,
  ArrowUpRight,
  Droplets,
  BatteryCharging,
  Cpu,
  Heart,
} from 'lucide-react';

interface ScrollSectionsProps {
  config: WatchConfig;
  onChangeConfig: (newConfig: Partial<WatchConfig>) => void;
  onToggleIris: () => void;
  irisOpen: boolean;
  onOpenOrderModal: () => void;
}

export const ScrollSections: React.FC<ScrollSectionsProps> = ({
  config,
  onChangeConfig,
  onToggleIris,
  irisOpen,
  onOpenOrderModal,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bigNumbersRef = useRef<HTMLDivElement>(null);

  // Animate hero headers and big numbers sliding in on page load via anime.js
  useEffect(() => {
    // 1. Header and Tagline Slide-in with stagger
    animate('.hero-slide-item', {
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 1400,
      ease: 'outExpo',
      delay: stagger(120, { start: 400 }),
    });

    // 2. Big Numbers Slide-in from below with scale effect
    animate('.hero-big-number-card', {
      translateY: [60, 0],
      scale: [0.92, 1],
      opacity: [0, 1],
      duration: 1600,
      ease: 'outExpo',
      delay: stagger(140, { start: 800 }),
    });
  }, []);

  return (
    <div className="relative z-20 pointer-events-none">
      {/* ========================================================================= */}
      {/* SECTION 0: HERO // THE MASTERPIECE                                       */}
      {/* ========================================================================= */}
      <section
        id="section-hero"
        ref={heroRef}
        className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-32 pb-16 relative"
      >
        {/* Top Hero Brand & Subtitle */}
        <div className="max-w-3xl pointer-events-auto">
          <div className="hero-slide-item flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#c8a97e]" />
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#c8a97e]">
              Swiss Cybernetics // Calibre T-48
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#c8a97e]/15 text-[#e6c894] border border-[#c8a97e]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#99ff00] animate-pulse" />
              Edition N° 048/500
            </span>
          </div>

          <h1 className="hero-slide-item font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#fbf8f2] leading-[1.08] mb-6">
            CHRONOS <br />
            <span className="italic font-normal text-[#c8a97e]">V AETERNUS</span>
          </h1>

          <p className="hero-slide-item text-base sm:text-lg text-[#d1c7b7] max-w-xl font-sans font-light leading-relaxed mb-8">
            An immaculate fusion of traditional Swiss haute horlogerie and quantum-grade biometric computation. Encased in sculptured aerospace Grade 5 titanium beneath a double-domed sapphire crystal.
          </p>

          {/* Action Row */}
          <div className="hero-slide-item flex flex-wrap items-center gap-4">
            <button
              onClick={() => onChangeConfig({ inspectMode: !config.inspectMode })}
              className="px-6 py-3 rounded-full bg-[#c8a97e] hover:bg-[#dfbe91] text-[#0c0d10] font-semibold text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(200,169,126,0.3)] flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>{config.inspectMode ? 'Exit Orbit' : 'Inspect in 3D'}</span>
            </button>

            <button
              onClick={onToggleIris}
              className="px-5 py-3 rounded-full bg-[#171920]/80 hover:bg-[#222530] text-[#f4efe6] border border-[#c8a97e]/40 font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 backdrop-blur-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#c8a97e]" />
              <span>{irisOpen ? 'Close Iris' : 'Open Iris Shutter'}</span>
            </button>

            <button
              onClick={() => onChangeConfig({ showTechSpecs: !config.showTechSpecs })}
              className={`px-5 py-3 rounded-full border font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 backdrop-blur-md ${
                config.showTechSpecs
                  ? 'bg-[#c8a97e] text-[#0c0d10] font-bold border-[#c8a97e] shadow-[0_0_25px_rgba(200,169,126,0.5)]'
                  : 'bg-[#171920]/80 hover:bg-[#222530] text-[#f4efe6] border-white/15 hover:border-[#c8a97e]/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>{config.showTechSpecs ? 'Close Telemetry' : 'Telemetry HUD [T]'}</span>
            </button>
          </div>
        </div>

        {/* Hero Big Numbers (Slide in when page loads) */}
        <div
          ref={bigNumbersRef}
          className="mt-16 pt-8 border-t border-[#c8a97e]/20 pointer-events-auto"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-10">
            {/* Big Number 01 */}
            <div className="hero-big-number-card p-5 rounded-2xl bg-[#12141a]/60 backdrop-blur-md border border-white/5 hover:border-[#c8a97e]/30 transition-all duration-300">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fbf8f2] tracking-tighter mb-1">
                01<span className="text-[#c8a97e] text-2xl font-light">/500</span>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#c8a97e] font-semibold mb-1">
                LIMITED SERIES
              </div>
              <p className="text-xs text-[#a89f91] font-light">Individually numbered bespoke case</p>
            </div>

            {/* Big Number 84h */}
            <div className="hero-big-number-card p-5 rounded-2xl bg-[#12141a]/60 backdrop-blur-md border border-white/5 hover:border-[#c8a97e]/30 transition-all duration-300">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fbf8f2] tracking-tighter mb-1">
                84<span className="text-[#c8a97e] text-3xl font-light">h</span>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#c8a97e] font-semibold mb-1">
                POWER RESERVE
              </div>
              <p className="text-xs text-[#a89f91] font-light">Dual-cell solid-state silicon anode</p>
            </div>

            {/* Big Number 100m */}
            <div className="hero-big-number-card p-5 rounded-2xl bg-[#12141a]/60 backdrop-blur-md border border-white/5 hover:border-[#c8a97e]/30 transition-all duration-300">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fbf8f2] tracking-tighter mb-1">
                100<span className="text-[#c8a97e] text-3xl font-light">m</span>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#c8a97e] font-semibold mb-1">
                HYDRO-RESISTANCE
              </div>
              <p className="text-xs text-[#a89f91] font-light">ISO 6425 deep nautical certification</p>
            </div>

            {/* Big Number 48mm */}
            <div className="hero-big-number-card p-5 rounded-2xl bg-[#12141a]/60 backdrop-blur-md border border-white/5 hover:border-[#c8a97e]/30 transition-all duration-300">
              <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fbf8f2] tracking-tighter mb-1">
                48<span className="text-[#c8a97e] text-3xl font-light">mm</span>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#c8a97e] font-semibold mb-1">
                TITANIUM GRADE 5
              </div>
              <p className="text-xs text-[#a89f91] font-light">Ergonomic chamfered architecture</p>
            </div>
          </div>

          {/* Scroll Prompt */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs font-mono uppercase tracking-[0.25em] text-[#c8a97e]/70">
            <span>Scroll To Explore Movement</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#c8a97e]" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: SAPPHIRE DOME & OPTICAL ENGINEERING                           */}
      {/* ========================================================================= */}
      <section
        id="section-dome"
        className="min-h-screen flex items-center justify-end px-6 sm:px-12 lg:px-20 py-24"
      >
        <div className="max-w-xl pointer-events-auto bg-[#101217]/85 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-[#c8a97e]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-4 h-4 text-[#c8a97e]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c8a97e]">
              Curved Optics // Chapter 02
            </span>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#fbf8f2] leading-tight mb-6">
            DOUBLE-DOMED <br />
            <span className="italic font-normal text-[#c8a97e]">SAPPHIRE CRYSTAL</span>
          </h2>

          <p className="text-base text-[#cfc5b5] font-light leading-relaxed mb-8">
            Crafted from a single synthetic corundum crystal grown at 2,050°C, then machined with precision diamond grinding wheels. The curved dome profile prevents optical distortion at acute angles while creating luminous light refraction along the polished bevel.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="font-mono text-2xl font-bold text-[#fbf8f2]">9 MOHS</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#c8a97e]">Diamond Hardness</div>
              <p className="text-xs text-[#9a9184] mt-1">Immune to everyday abrasions</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="font-mono text-2xl font-bold text-[#fbf8f2]">1.77 IOR</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#c8a97e]">Refraction Index</div>
              <p className="text-xs text-[#9a9184] mt-1">Authentic gemological clarity</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="font-mono text-2xl font-bold text-[#fbf8f2]">10-LAYER</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#c8a97e]">Anti-Reflective ARC</div>
              <p className="text-xs text-[#9a9184] mt-1">99.4% zenith glare absorption</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="font-mono text-2xl font-bold text-[#fbf8f2]">3,000 NITS</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#c8a97e]">Peak Micro-OLED</div>
              <p className="text-xs text-[#9a9184] mt-1">Crystal clarity under full sun</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#c8a97e]/10 border border-[#c8a97e]/30 flex items-center gap-3 text-xs text-[#e6c894]">
            <Droplets className="w-5 h-5 text-[#c8a97e] shrink-0" />
            <span>Hydrophobic and oleophobic vacuum-deposited coatings ensure effortless fluid runoff and fingerprint resistance.</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: BIO-TELEMETRY & DYNAMIC FITNESS RINGS                         */}
      {/* ========================================================================= */}
      <section
        id="section-telemetry"
        className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 py-24"
      >
        <div className="max-w-xl pointer-events-auto bg-[#101217]/85 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-[#c8a97e]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-4 h-4 text-[#ff2d55]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c8a97e]">
              Biometric Engine // Chapter 03
            </span>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#fbf8f2] leading-tight mb-6">
            TRI-RING <br />
            <span className="italic font-normal text-[#c8a97e]">BIO-TELEMETRY</span>
          </h2>

          <p className="text-base text-[#cfc5b5] font-light leading-relaxed mb-6">
            Drawn in real-time onto the watchface canvas, three glowing concentric rings summarize your kinetic output, exertion volume, and circulation intervals. Accompanied by continuous ECG arrhythmia surveillance.
          </p>

          {/* Real-time Rings Visual Progress breakdown */}
          <div className="space-y-3 mb-8">
            {/* Move */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#ff2d55] shadow-[0_0_10px_#ff2d55]" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#ff2d55] font-bold">MOVE RING</div>
                  <div className="text-sm font-semibold text-[#fbf8f2]">820 / 600 KCAL</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#ff2d55] font-bold bg-[#ff2d55]/10 px-2 py-1 rounded">136%</span>
            </div>

            {/* Exercise */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#99ff00] shadow-[0_0_10px_#99ff00]" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#99ff00] font-bold">EXERCISE RING</div>
                  <div className="text-sm font-semibold text-[#fbf8f2]">45 / 30 MIN</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#99ff00] font-bold bg-[#99ff00]/10 px-2 py-1 rounded">150%</span>
            </div>

            {/* Stand */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#00e5ff] font-bold">STAND RING</div>
                  <div className="text-sm font-semibold text-[#fbf8f2]">11 / 12 HRS</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#00e5ff] font-bold bg-[#00e5ff]/10 px-2 py-1 rounded">91%</span>
            </div>
          </div>

          {/* Interactive Watchface Dial Mode Switcher */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#c8a97e] font-semibold mb-3">
              Switch Watch Face Dial Display:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rings' as WatchFaceMode, label: 'Bio-Rings Dial' },
                { id: 'chronograph' as WatchFaceMode, label: 'Swiss Chrono' },
                { id: 'minimal' as WatchFaceMode, label: 'Bauhaus Minimal' },
                { id: 'stealth' as WatchFaceMode, label: 'Tactical Stealth' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onChangeConfig({ faceMode: mode.id })}
                  className={`px-3 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-between ${
                    config.faceMode === mode.id
                      ? 'bg-[#c8a97e] text-[#0c0d10] font-bold shadow-md'
                      : 'bg-black/30 hover:bg-black/60 text-[#d1c7b7] border border-white/5'
                  }`}
                >
                  <span>{mode.label}</span>
                  {config.faceMode === mode.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: METALLURGY & TACTILE HAPTICS                                  */}
      {/* ========================================================================= */}
      <section
        id="section-metallurgy"
        className="min-h-screen flex items-center justify-end px-6 sm:px-12 lg:px-20 py-24"
      >
        <div className="max-w-xl pointer-events-auto bg-[#101217]/85 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-[#c8a97e]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-4 h-4 text-[#c8a97e]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c8a97e]">
              Aeronautical Metallurgy // Chapter 04
            </span>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#fbf8f2] leading-tight mb-6">
            GRADE 5 <br />
            <span className="italic font-normal text-[#c8a97e]">AEROSPACE TITANIUM</span>
          </h2>

          <p className="text-base text-[#cfc5b5] font-light leading-relaxed mb-6">
            Ti-6Al-4V alloy, machined with sub-micron 5-axis CNC ball mills and finished by master polishers in La Chaux-de-Fonds. The micro-knurled digital crown features 1,200 indexing teeth with ceramic bearing rotation and orange accent ring.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#c8a97e] uppercase">Tensile Strength</span>
                <span className="font-mono text-xs text-white font-bold">950 MPa</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#c8a97e] h-full w-[92%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#c8a97e] uppercase">Weight Reduction vs Steel</span>
                <span className="font-mono text-xs text-white font-bold">42% Lighter</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#99ff00] h-full w-[78%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#c8a97e] uppercase">Haptic Engine Latency</span>
                <span className="font-mono text-xs text-white font-bold">0.02 Seconds</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00e5ff] h-full w-[96%]" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#cfc5b5] font-light flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#c8a97e] shrink-0" />
            <span>Dual resonance linear actuators produce micro-haptic clicks matching the exact tactile feel of traditional mechanical escapements.</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: THE BESPOKE STUDIO & REAL-TIME CONFIGURATOR                   */}
      {/* ========================================================================= */}
      <section
        id="section-configurator"
        className="min-h-screen flex flex-col justify-end px-6 sm:px-12 lg:px-20 py-24"
      >
        <div className="w-full max-w-4xl mx-auto pointer-events-auto bg-[#101217]/90 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-[#c8a97e]/40 shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-4 h-4 text-[#c8a97e]" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c8a97e]">
                  Custom Atelier // Chapter 05
                </span>
              </div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#fbf8f2]">
                BESPOKE MATERIAL CONFIGURATOR
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onChangeConfig({ autoRotate: !config.autoRotate })}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-colors border ${
                  config.autoRotate
                    ? 'bg-[#c8a97e]/20 border-[#c8a97e] text-[#e6c894]'
                    : 'bg-black/30 border-white/10 text-[#a89f91]'
                }`}
              >
                Auto-Rotate: {config.autoRotate ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => onChangeConfig({ inspectMode: !config.inspectMode })}
                className="px-4 py-2 rounded-xl bg-[#c8a97e] hover:bg-[#dfbe91] text-[#0c0d10] font-semibold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D Free Orbit</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Case Material Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c8a97e] font-semibold mb-3">
                1. Case Metallurgy & Finish
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'titanium' as CaseFinish,
                    name: 'Natural Titanium',
                    desc: 'Brushed Grade 5 aerospace',
                    color: '#c8cbd0',
                  },
                  {
                    id: 'spaceblack' as CaseFinish,
                    name: 'Space Black DLC',
                    desc: 'Diamond-like carbon coat',
                    color: '#181a1f',
                  },
                  {
                    id: 'rosegold' as CaseFinish,
                    name: 'Champagne Gold',
                    desc: '18k rose alloy electroplate',
                    color: '#dfa07d',
                  },
                  {
                    id: 'ceramic' as CaseFinish,
                    name: 'Polar Ceramic',
                    desc: 'Sintered zirconium oxide',
                    color: '#f0ece1',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeConfig({ finish: item.id })}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      config.finish === item.id
                        ? 'border-[#c8a97e] bg-[#c8a97e]/15 shadow-[0_0_15px_rgba(200,169,126,0.25)]'
                        : 'border-white/5 bg-black/30 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-semibold text-[#fbf8f2]">{item.name}</span>
                    </div>
                    <p className="text-[11px] text-[#9a9184] font-light leading-tight">{item.desc}</p>
                    {config.finish === item.id && (
                      <Check className="w-3.5 h-3.5 text-[#c8a97e] absolute top-2.5 right-2.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Strap Color & Material */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#c8a97e] font-semibold mb-3">
                2. Artisan Fluoroelastomer Strap
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'obsidian' as StrapColor,
                    name: 'Obsidian Black',
                    desc: 'Matte high-density fluoro',
                    color: '#14161a',
                  },
                  {
                    id: 'cognac' as StrapColor,
                    name: 'Cognac Saffiano',
                    desc: 'Tuscan calfskin textured',
                    color: '#6e3c1b',
                  },
                  {
                    id: 'navy' as StrapColor,
                    name: 'Monaco Navy',
                    desc: 'Deep marine nautical grain',
                    color: '#132338',
                  },
                  {
                    id: 'emerald' as StrapColor,
                    name: 'Alpine Emerald',
                    desc: 'Subtle evergreen finish',
                    color: '#123024',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeConfig({ strapColor: item.id })}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      config.strapColor === item.id
                        ? 'border-[#c8a97e] bg-[#c8a97e]/15 shadow-[0_0_15px_rgba(200,169,126,0.25)]'
                        : 'border-white/5 bg-black/30 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-semibold text-[#fbf8f2]">{item.name}</span>
                    </div>
                    <p className="text-[11px] text-[#9a9184] font-light leading-tight">{item.desc}</p>
                    {config.strapColor === item.id && (
                      <Check className="w-3.5 h-3.5 text-[#c8a97e] absolute top-2.5 right-2.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: TECHNICAL SPECIFICATIONS & RESERVE EDITION                    */}
      {/* ========================================================================= */}
      <section
        id="section-specs"
        className="min-h-screen flex items-center justify-start px-6 sm:px-12 lg:px-20 py-28"
      >
        <div className="max-w-2xl pointer-events-auto bg-[#101217]/90 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-[#c8a97e]/40 shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-4 h-4 text-[#c8a97e]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#c8a97e]">
              Horological Registry // Chapter 06
            </span>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#fbf8f2] leading-tight mb-2">
            TECHNICAL SPECIFICATIONS
          </h2>
          <p className="text-xs font-mono text-[#c8a97e] uppercase tracking-widest mb-6">
            CHRONOS CALIBRE T-48 // EDITION RESERVE
          </p>

          <div className="divide-y divide-white/10 text-xs font-mono mb-8">
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">CASE DIMENSIONS</span>
              <span className="text-[#fbf8f2] font-semibold">48.2mm Diameter &bull; 13.4mm Thickness</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">CRYSTAL GLASS</span>
              <span className="text-[#fbf8f2] font-semibold">Double-Domed Corundum Sapphire &bull; 9 Mohs</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">WATERPROOF RATING</span>
              <span className="text-[#fbf8f2] font-semibold">10 ATM / 100M ISO 6425 Diving</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">DISPLAY ENGINE</span>
              <span className="text-[#fbf8f2] font-semibold">1.92" Micro-OLED 3000 Nits &bull; 480x480px</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">BIOMETRIC SENSORS</span>
              <span className="text-[#fbf8f2] font-semibold">8-Channel PPG &bull; ECG &bull; SpO2 &bull; Skin Temp</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">POWER DURATION</span>
              <span className="text-[#fbf8f2] font-semibold">84 Hours Standard &bull; 160 Hours Expedition</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#a89f91]">TELEMETRY BUS</span>
              <span className="text-[#fbf8f2] font-semibold">Bluetooth 5.4 &bull; UWB &bull; Dual-Freq L1/L5 GPS</span>
            </div>
          </div>

          {/* Live Telemetry & Frame Rate Diagnostic Card */}
          <div className="mb-8 p-5 rounded-2xl bg-black/40 border border-[#c8a97e]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#c8a97e]/15 border border-[#c8a97e]/30 text-[#00e5ff]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#fbf8f2] uppercase tracking-wider flex items-center gap-2">
                  <span>REAL-TIME TELEMETRY & FRAME BENCH</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#99ff00]/20 text-[#99ff00] font-mono font-bold">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-[#a89f91] mt-0.5 font-light">
                  Inspect frame rates, inertia physics, draw calls, and WebGL2 GPU pipeline.
                </p>
              </div>
            </div>
            <button
              onClick={() => onChangeConfig({ showTechSpecs: !config.showTechSpecs })}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
                config.showTechSpecs
                  ? 'bg-[#c8a97e] text-[#0c0d10] font-bold border-[#c8a97e]'
                  : 'bg-[#1a1d26] hover:bg-[#232734] text-[#c8a97e] border-[#c8a97e]/40'
              }`}
            >
              {config.showTechSpecs ? 'Hide Telemetry' : 'Launch Telemetry HUD [T]'}
            </button>
          </div>

          {/* Pricing & Order Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b1e28] to-[#12141a] border border-[#c8a97e]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#c8a97e]">
                Bespoke Collector's Edition
              </div>
              <div className="font-mono text-3xl font-bold text-[#fbf8f2] mt-1">
                $1,850 <span className="text-sm font-normal text-[#a89f91]">USD</span>
              </div>
              <p className="text-[11px] text-[#9a9184] mt-1">
                Includes bespoke presentation case, wireless dock, & 5-year warranty
              </p>
            </div>

            <button
              onClick={onOpenOrderModal}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#c8a97e] hover:bg-[#dfbe91] text-[#0c0d10] font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_10px_35px_rgba(200,169,126,0.35)] flex items-center justify-center gap-2"
            >
              <span>Reserve Edition</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 sm:px-12 lg:px-20 py-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#8c8273] font-mono pointer-events-auto bg-[#08090b]/80 backdrop-blur-md">
        <div>&copy; {new Date().getFullYear()} CHRONOS HORLOGERIE INTELLIGENTE SA. SWITZERLAND.</div>
        <div className="flex items-center gap-6">
          <a href="#section-hero" className="hover:text-[#c8a97e] transition-colors">BACK TO TOP</a>
          <span className="text-[#c8a97e]/40">&bull;</span>
          <span>CALIBRE REF. CH-48-2026</span>
          <span className="text-[#c8a97e]/40">&bull;</span>
          <span>HAUTE CYBERNETICS</span>
        </div>
      </footer>
    </div>
  );
};
