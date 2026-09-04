import React, { useState, useEffect, useCallback } from 'react';
import { WatchConfig, PerformanceMetrics } from './types';
import { IrisBackdrop } from './components/IrisBackdrop';
import { Watch3DCanvas } from './components/Watch3DCanvas';
import { ScrollSections } from './components/ScrollSections';
import { Navbar } from './components/Navbar';
import { OrderModal } from './components/OrderModal';
import { TechSpecsOverlay } from './components/TechSpecsOverlay';

export default function App() {
  const [config, setConfig] = useState<WatchConfig>({
    finish: 'titanium',
    strapColor: 'obsidian',
    faceMode: 'rings',
    autoRotate: false,
    inspectMode: false,
    showTechSpecs: false,
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 14,
    triangles: 18432,
    geometries: 16,
    textures: 6,
    scrollVelocity: 0,
    angularMomentum: 0,
    history: [16.6, 16.5, 16.7, 16.6],
    rendererName: 'WebGL2 // ACES Filmic HDR',
  });

  const [irisOpen, setIrisOpen] = useState(false);
  const [scrollFraction, setScrollFraction] = useState(0);
  const [rawScrollProgress, setRawScrollProgress] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Trigger the opening ceremony of the iris aperture on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIrisOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut: Press 'T' to toggle Technical Specifications Telemetry HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        setConfig((prev) => ({ ...prev, showTechSpecs: !prev.showTechSpecs }));
      }
      if (e.key === 'Escape') {
        setConfig((prev) => ({ ...prev, showTechSpecs: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track window scroll position to animate the 3D watch across sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(scrollY / totalScrollable, 0), 1);
      setRawScrollProgress(progress);
      // Scale progress to 5 section transitions (0 to 5)
      setScrollFraction(progress * 5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChangeConfig = useCallback((newConfig: Partial<WatchConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const handleToggleIris = () => {
    setIrisOpen((prev) => !prev);
  };

  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#090a0d] text-[#f4efe6] overflow-x-hidden selection:bg-[#c8a97e] selection:text-[#0c0d10]">
      {/* 1. FIXED BACKGROUND: Dark textured overlay with round hole showing watch on beige & Iris Aperture */}
      <IrisBackdrop irisOpen={irisOpen} scrollProgress={rawScrollProgress} />

      {/* 2. FIXED 3D CANVAS: Three.js watch model with weighted inertia physics & sapphire glass reflections */}
      <Watch3DCanvas
        config={config}
        currentSectionIndex={Math.round(scrollFraction)}
        scrollFraction={scrollFraction}
        onInspectToggle={(inspect) => handleChangeConfig({ inspectMode: inspect })}
        onMetricsUpdate={handleMetricsUpdate}
      />

      {/* 3. TECHNICAL SPECIFICATIONS & DIAGNOSTICS HUD OVERLAY */}
      <TechSpecsOverlay
        isOpen={config.showTechSpecs}
        onClose={() => handleChangeConfig({ showTechSpecs: false })}
        metrics={metrics}
      />

      {/* 4. LUXURY TOP NAVIGATION */}
      <Navbar
        config={config}
        onChangeConfig={handleChangeConfig}
        irisOpen={irisOpen}
        onToggleIris={handleToggleIris}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        metrics={metrics}
      />

      {/* 5. MULTI-SECTION SCROLL CONTENT: Scrolls smoothly over the fixed canvas and background */}
      <main className="relative z-20">
        <ScrollSections
          config={config}
          onChangeConfig={handleChangeConfig}
          onToggleIris={handleToggleIris}
          irisOpen={irisOpen}
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
        />
      </main>

      {/* 6. BESPOKE RESERVATION MODAL */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        config={config}
      />
    </div>
  );
}
