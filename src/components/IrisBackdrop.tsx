import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

interface IrisBackdropProps {
  irisOpen: boolean;
  onToggleIris?: () => void;
  scrollProgress?: number;
}

export const IrisBackdrop: React.FC<IrisBackdropProps> = ({
  irisOpen,
  scrollProgress = 0,
}) => {
  const bladesRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const beigeDiscRef = useRef<HTMLDivElement>(null);

  // Number of mechanical iris blades
  const bladeCount = 10;
  const blades = Array.from({ length: bladeCount }, (_, i) => i);

  useEffect(() => {
    if (!bladesRef.current) return;

    // Animate the iris aperture blades with anime.js
    if (irisOpen) {
      // Opening ceremony: blades rotate and pull back
      animate('.iris-blade', {
        rotate: (el: any, i: number) => [0, -32 + (i % 2) * 2],
        scale: [1, 0.45],
        opacity: [1, 0],
        translateX: (el: any, i: number) => {
          const angle = (i * 2 * Math.PI) / bladeCount;
          return [0, Math.cos(angle) * 140];
        },
        translateY: (el: any, i: number) => {
          const angle = (i * 2 * Math.PI) / bladeCount;
          return [0, Math.sin(angle) * 140];
        },
        duration: 1800,
        ease: 'outExpo',
        delay: stagger(40),
      });

      // Animate the beige background disk expanding softly
      if (beigeDiscRef.current) {
        animate(beigeDiscRef.current, {
          scale: [0.75, 1],
          opacity: [0.4, 1],
          duration: 1600,
          ease: 'outExpo',
        });
      }
    } else {
      // Closing ceremony
      animate('.iris-blade', {
        rotate: 0,
        scale: 1,
        opacity: 1,
        translateX: 0,
        translateY: 0,
        duration: 1200,
        ease: 'inQuad',
        delay: stagger(30),
      });

      if (beigeDiscRef.current) {
        animate(beigeDiscRef.current, {
          scale: 0.8,
          opacity: 0.3,
          duration: 1000,
          ease: 'outQuad',
        });
      }
    }
  }, [irisOpen]);

  // As user scrolls, slightly expand the beige luxury aura so the watch has fluid presence across sections
  const beigeOpacity = Math.max(0.2, 1 - scrollProgress * 0.7);
  const beigeScale = 1 + scrollProgress * 0.4;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Base Dark Luxury Obsidian Atmosphere */}
      <div className="absolute inset-0 bg-[#090a0d]" />

      {/* Subtle radial lighting from center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(25,28,36,0.85)_0%,_rgba(9,10,13,0.98)_70%)]" />

      {/* Precision Micro-Grid & Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. THE LUXURY BEIGE DISPLAY POD (The round hole showing the watch on beige) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={beigeDiscRef}
          style={{
            opacity: beigeOpacity,
            transform: `scale(${beigeScale})`,
            transition: 'opacity 0.4s ease-out',
          }}
          className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[540px] md:h-[540px] rounded-full"
        >
          {/* Outer glow & shadow */}
          <div className="absolute -inset-10 rounded-full bg-[#c8a97e]/15 blur-3xl" />

          {/* Genuine Luxury Beige leather presentation surface */}
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_38%_35%,_#fbf8f2_0%,_#ebdcc4_45%,_#cebca0_85%,_#b09f83_100%)] shadow-[inset_0_4px_30px_rgba(0,0,0,0.35),0_20px_50px_rgba(0,0,0,0.8)] border border-[#c8a97e]/40 overflow-hidden relative">
            {/* Fine Concentric Horological Guilloché Rings in Beige Pod */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30"
              viewBox="0 0 500 500"
            >
              {Array.from({ length: 18 }, (_, idx) => (
                <circle
                  key={idx}
                  cx="250"
                  cy="250"
                  r={30 + idx * 12}
                  fill="none"
                  stroke="#876d49"
                  strokeWidth="0.8"
                  strokeDasharray={idx % 2 === 0 ? '3 3' : undefined}
                />
              ))}
            </svg>

            {/* Subtle soft spotlight highlighting watch position */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,_rgba(255,255,255,0.7)_0%,_transparent_60%)]" />
          </div>

          {/* Golden Precision Bevel Framing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/60 pointer-events-none" />
          <div className="absolute -inset-2 rounded-full border border-[#d4af37]/20 pointer-events-none" />

          {/* Horological Latitude & Coordinate Markers */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#c8a97e]/60">
            N 47° 22' 38" // SWISS CALIBRE 048
          </div>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#c8a97e]/60">
            HORLOGERIE INTELLIGENTE
          </div>
        </div>
      </div>

      {/* 3. THE MECHANICAL IRIS SHUTTER APERTURE OVERLAY */}
      {/* 
        This is an SVG with overlapping geometric aperture blades that rotate 
        and open up radially, revealing the warm beige watch pod beneath!
      */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] md:w-[660px] md:h-[660px] pointer-events-none"
          viewBox="-200 -200 400 400"
        >
          <defs>
            {/* Metallic Dark Blade Gradient */}
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#252932" />
              <stop offset="40%" stopColor="#171920" />
              <stop offset="90%" stopColor="#0d0e12" />
              <stop offset="100%" stopColor="#050608" />
            </linearGradient>

            <linearGradient id="bladeEdgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c8a97e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#876d49" stopOpacity="0.1" />
            </linearGradient>

            {/* Drop shadow for overlapping mechanical depth */}
            <filter id="bladeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Group containing all iris blades */}
          <g ref={bladesRef} id="iris-blades-group">
            {blades.map((i) => {
              const rotation = (i * 360) / bladeCount;
              return (
                <g key={i} transform={`rotate(${rotation})`} className="iris-blade origin-center">
                  <path
                    d="M 0 -190 C 80 -190, 160 -110, 180 0 C 130 30, 40 40, -30 10 C -70 -10, -40 -120, 0 -190 Z"
                    fill="url(#bladeGrad)"
                    stroke="url(#bladeEdgeGrad)"
                    strokeWidth="1.2"
                    filter="url(#bladeShadow)"
                    style={{ transformOrigin: '0px 0px' }}
                  />
                  {/* Blade mechanical guide track pin */}
                  <circle cx="90" cy="-70" r="3" fill="#c8a97e" opacity="0.6" />
                </g>
              );
            })}
          </g>

          {/* Tachymeter Outer Scale Graduations on Dark Rim */}
          <g className="opacity-40">
            {Array.from({ length: 60 }, (_, idx) => {
              const angle = (idx * 6 * Math.PI) / 180;
              const isMajor = idx % 5 === 0;
              const r1 = 186;
              const r2 = isMajor ? 198 : 192;
              const x1 = Math.sin(angle) * r1;
              const y1 = -Math.cos(angle) * r1;
              const x2 = Math.sin(angle) * r2;
              const y2 = -Math.cos(angle) * r2;
              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#c8a97e' : 'rgba(255, 255, 255, 0.4)'}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Dark Vignette Frame around screen edges */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.92)] pointer-events-none" />
    </div>
  );
};
