import React, { useState, useEffect } from 'react';
import { WatchConfig } from './types';
import { IrisBackdrop } from './components/IrisBackdrop';
import { Watch3DCanvas } from './components/Watch3DCanvas';
import { ScrollSections } from './components/ScrollSections';
import { Navbar } from './components/Navbar';
import { OrderModal } from './components/OrderModal';

export default function App() {
  const [config, setConfig] = useState<WatchConfig>({
    finish: 'titanium',
    strapColor: 'obsidian',
    faceMode: 'rings',
    autoRotate: false,
    inspectMode: false,
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

  const handleChangeConfig = (newConfig: Partial<WatchConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleToggleIris = () => {
    setIrisOpen((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen bg-[#090a0d] text-[#f4efe6] overflow-x-hidden selection:bg-[#c8a97e] selection:text-[#0c0d10]">
      {/* 1. FIXED BACKGROUND: Dark textured overlay with round hole showing watch on beige & Iris Aperture */}
      <IrisBackdrop irisOpen={irisOpen} scrollProgress={rawScrollProgress} />

      {/* 2. FIXED 3D CANVAS: Three.js watch model with sapphire glass reflections & mouse parallax */}
      <Watch3DCanvas
        config={config}
        currentSectionIndex={Math.round(scrollFraction)}
        scrollFraction={scrollFraction}
        onInspectToggle={(inspect) => handleChangeConfig({ inspectMode: inspect })}
      />

      {/* 3. LUXURY TOP NAVIGATION */}
      <Navbar
        config={config}
        onChangeConfig={handleChangeConfig}
        irisOpen={irisOpen}
        onToggleIris={handleToggleIris}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* 4. MULTI-SECTION SCROLL CONTENT: Scrolls smoothly over the fixed canvas and background */}
      <main className="relative z-20">
        <ScrollSections
          config={config}
          onChangeConfig={handleChangeConfig}
          onToggleIris={handleToggleIris}
          irisOpen={irisOpen}
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
        />
      </main>

      {/* 5. BESPOKE RESERVATION MODAL */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        config={config}
      />
    </div>
  );
}
