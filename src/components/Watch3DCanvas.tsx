import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WatchConfig, SectionPose } from '../types';
import { DynamicWatchFace } from '../utils/watchFaceTexture';
import {
  createStudioEnvMap,
  createWatchMaterials,
  updateFinishMaterials,
  updateStrapColor,
  build3DWatchModel,
  WatchMaterials,
} from '../utils/watch3dBuilder';

interface Watch3DCanvasProps {
  config: WatchConfig;
  currentSectionIndex: number;
  scrollFraction: number; // 0.0 to totalSections - 1
  onInspectToggle?: (inspect: boolean) => void;
}

// Key poses for each scroll section
const SECTION_POSES: SectionPose[] = [
  // 0: Hero Intro (Front angled heroic overview)
  {
    position: [0, 0.05, 0],
    rotation: [0.18, -0.28, 0.08],
    scale: 1.0,
  },
  // 1: Sapphire Dome & Optical Engineering (Tilted up to catch dome reflections, watch on left)
  {
    position: [-1.45, -0.15, 0.8],
    rotation: [0.82, -0.58, 0.38],
    scale: 1.1,
  },
  // 2: Bio-Telemetry & Fitness Rings (Zoomed in front-facing on right side)
  {
    position: [1.35, 0.1, 1.3],
    rotation: [0.06, 0.16, -0.04],
    scale: 1.25,
  },
  // 3: Metallurgy & Crown (Side profile showcasing knurled crown and lugs on left side)
  {
    position: [-1.35, 0, 0.6],
    rotation: [0.12, 1.48, 0.1],
    scale: 1.18,
  },
  // 4: Bespoke Configurator (Centered interactive stage)
  {
    position: [0, 0.2, 0.8],
    rotation: [0.22, -0.12, 0],
    scale: 1.12,
  },
  // 5: Technical Specs & Reserve (Right side elegant portrait)
  {
    position: [1.25, -0.15, 0.5],
    rotation: [-0.18, -0.36, 0.1],
    scale: 1.02,
  },
];

export const Watch3DCanvas: React.FC<Watch3DCanvasProps> = ({
  config,
  scrollFraction,
  onInspectToggle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Three.js state
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    watchGroup: THREE.Group | null;
    materials: WatchMaterials | null;
    dynamicFace: DynamicWatchFace | null;
    specularLight: THREE.DirectionalLight | null;
    mouse: { x: number; y: number; targetX: number; targetY: number };
    isDragging: boolean;
    dragStart: { x: number; y: number };
    orbitRot: { x: number; y: number };
    animationFrameId: number | null;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    watchGroup: null,
    materials: null,
    dynamicFace: null,
    specularLight: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    orbitRot: { x: 0, y: 0 },
    animationFrameId: null,
  });

  // Keep latest config in ref for the render loop
  const configRef = useRef(config);
  configRef.current = config;

  const scrollRef = useRef(scrollFraction);
  scrollRef.current = scrollFraction;

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Renderer with high-precision antialiasing & physical tone mapping
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Scene
    const scene = new THREE.Scene();

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    // 4. Studio Environment Reflections
    const envRenderTarget = createStudioEnvMap(renderer);
    scene.environment = envRenderTarget.texture;

    // 5. Dynamic Watchface Canvas
    const dynamicFace = new DynamicWatchFace();
    dynamicFace.setMode(configRef.current.faceMode);
    dynamicFace.update();

    // 6. Watch Materials
    const materials = createWatchMaterials(envRenderTarget.texture);
    updateFinishMaterials(materials, configRef.current.finish);
    updateStrapColor(materials, configRef.current.strapColor);

    // 7. Watch 3D Model
    const watchGroup = build3DWatchModel(materials, dynamicFace.texture);
    scene.add(watchGroup);

    // 8. Lights
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Directional Light (Warm luxury sunlight)
    const keyLight = new THREE.DirectionalLight(0xfff6e8, 2.8);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool Rim Light (Left flank)
    const rimLight = new THREE.DirectionalLight(0xaad4ff, 1.8);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Under-glow Fill Light (Bounces off the luxury beige pod)
    const bounceLight = new THREE.DirectionalLight(0xedd9b6, 1.2);
    bounceLight.position.set(0, -6, 4);
    scene.add(bounceLight);

    // Specular Gleam Light for the Sapphire Dome
    const specularLight = new THREE.DirectionalLight(0xffffff, 2.5);
    specularLight.position.set(-3, 6, 6);
    scene.add(specularLight);

    // Save refs
    stateRef.current = {
      renderer,
      scene,
      camera,
      watchGroup,
      materials,
      dynamicFace,
      specularLight,
      mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      orbitRot: { x: 0, y: 0 },
      animationFrameId: null,
    };

    // Resize Handler
    const handleResize = () => {
      if (!renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Move for Parallax
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      stateRef.current.mouse.targetX = normX;
      stateRef.current.mouse.targetY = normY;

      if (stateRef.current.isDragging) {
        const deltaX = (e.clientX - stateRef.current.dragStart.x) * 0.008;
        const deltaY = (e.clientY - stateRef.current.dragStart.y) * 0.008;
        stateRef.current.orbitRot.y += deltaX;
        stateRef.current.orbitRot.x += deltaY;
        stateRef.current.dragStart = { x: e.clientX, y: e.clientY };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Touch support for mobile parallax
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const normX = (t.clientX / window.innerWidth) * 2 - 1;
        const normY = -(t.clientY / window.innerHeight) * 2 + 1;
        stateRef.current.mouse.targetX = normX;
        stateRef.current.mouse.targetY = normY;

        if (stateRef.current.isDragging) {
          const deltaX = (t.clientX - stateRef.current.dragStart.x) * 0.008;
          const deltaY = (t.clientY - stateRef.current.dragStart.y) * 0.008;
          stateRef.current.orbitRot.y += deltaX;
          stateRef.current.orbitRot.x += deltaY;
          stateRef.current.dragStart = { x: t.clientX, y: t.clientY };
        }
      }
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Animation Loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      stateRef.current.animationFrameId = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const { mouse, watchGroup: watch, dynamicFace: face, specularLight: specLight } = stateRef.current;
      if (!watch || !face || !renderer || !scene || !camera) return;

      // 1. Update live dynamic watch face
      face.update(Date.now());

      // 2. Mouse Parallax Lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 3. Interpolate Watch Position & Rotation across Scroll Sections
      const sFraction = scrollRef.current;
      const totalPoses = SECTION_POSES.length;
      const clampedFraction = Math.max(0, Math.min(totalPoses - 1, sFraction));
      const baseIdx = Math.floor(clampedFraction);
      const nextIdx = Math.min(totalPoses - 1, baseIdx + 1);
      const blend = clampedFraction - baseIdx;

      // Smooth step easing for luxurious feel
      const t = blend * blend * (3 - 2 * blend);

      const p1 = SECTION_POSES[baseIdx];
      const p2 = SECTION_POSES[nextIdx];

      // Interpolate base target pose
      const targetPos = [
        THREE.MathUtils.lerp(p1.position[0], p2.position[0], t),
        THREE.MathUtils.lerp(p1.position[1], p2.position[1], t),
        THREE.MathUtils.lerp(p1.position[2], p2.position[2], t),
      ];
      const targetRot = [
        THREE.MathUtils.lerp(p1.rotation[0], p2.rotation[0], t),
        THREE.MathUtils.lerp(p1.rotation[1], p2.rotation[1], t),
        THREE.MathUtils.lerp(p1.rotation[2], p2.rotation[2], t),
      ];
      const targetScale = THREE.MathUtils.lerp(p1.scale, p2.scale, t);

      // Add gentle luxury idle floating oscillation
      const idleTime = currentTime * 0.001;
      const idleFloatingY = Math.sin(idleTime * 1.5) * 0.04;
      const idleTiltZ = Math.cos(idleTime * 1.2) * 0.015;

      // Responsive adjustments for smaller screens (mobile viewports)
      const isMobile = window.innerWidth < 768;
      const mobileScaleMult = isMobile ? 0.76 : 1.0;
      const mobileXMult = isMobile ? 0.25 : 1.0;

      // Apply Parallax + Drag Orbit
      const currentOrbit = stateRef.current.orbitRot;
      const isInspect = configRef.current.inspectMode;

      if (isInspect) {
        // Full interactive 3D rotation mode
        watch.rotation.x += (currentOrbit.x - watch.rotation.x) * 0.1;
        watch.rotation.y += (currentOrbit.y - watch.rotation.y) * 0.1;
        watch.position.x += (0 - watch.position.x) * 0.08;
        watch.position.y += (0.1 - watch.position.y) * 0.08;
        watch.position.z += (1.4 - watch.position.z) * 0.08;
      } else {
        // Auto-rotation or mouse parallax
        const autoRot = configRef.current.autoRotate ? idleTime * 0.25 : 0;

        watch.position.x += (targetPos[0] * mobileXMult + mouse.x * 0.22 - watch.position.x) * 0.08;
        watch.position.y += (targetPos[1] + idleFloatingY + mouse.y * 0.18 - watch.position.y) * 0.08;
        watch.position.z += (targetPos[2] - watch.position.z) * 0.08;

        watch.rotation.x += (targetRot[0] - mouse.y * 0.28 - watch.rotation.x) * 0.08;
        watch.rotation.y += (targetRot[1] + autoRot + mouse.x * 0.35 + currentOrbit.y * 0.5 - watch.rotation.y) * 0.08;
        watch.rotation.z += (targetRot[2] + idleTiltZ - watch.rotation.z) * 0.08;

        const currentScale = watch.scale.x;
        const nextScale = currentScale + (targetScale * mobileScaleMult - currentScale) * 0.08;
        watch.scale.set(nextScale, nextScale, nextScale);
      }

      // 4. Animate specular gleam light across the sapphire dome as user scrolls
      if (specLight) {
        specLight.position.x = -4 + Math.sin(sFraction * Math.PI) * 8;
        specLight.position.y = 5 + Math.cos(sFraction * Math.PI) * 3;
        specLight.intensity = 2.2 + Math.abs(mouse.x) * 1.5;
      }

      renderer.render(scene, camera);
    };

    stateRef.current.animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (stateRef.current.animationFrameId) {
        cancelAnimationFrame(stateRef.current.animationFrameId);
      }
      dynamicFace.dispose();
      renderer.dispose();
    };
  }, []);

  // Sync materials whenever finish or strap color changes
  useEffect(() => {
    if (stateRef.current.materials) {
      updateFinishMaterials(stateRef.current.materials, config.finish);
      updateStrapColor(stateRef.current.materials, config.strapColor);
    }
  }, [config.finish, config.strapColor]);

  // Sync watchface mode
  useEffect(() => {
    if (stateRef.current.dynamicFace) {
      stateRef.current.dynamicFace.setMode(config.faceMode);
    }
  }, [config.faceMode]);

  // Handle Dragging in Inspect Mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!config.inspectMode) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStart = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`fixed inset-0 z-10 ${
        config.inspectMode ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
      style={{ touchAction: config.inspectMode ? 'none' : 'auto' }}
    >
      <canvas
        ref={canvasRef}
        id="watch-3d-canvas"
        className="w-full h-full block"
      />

      {/* Floating 3D Inspect Mode Indicator & Reset if Active */}
      {config.inspectMode && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#12141a]/90 backdrop-blur-md border border-[#c8a97e]/40 px-5 py-2.5 rounded-full flex items-center gap-3 text-xs font-mono text-[#f4efe6] shadow-2xl pointer-events-auto animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#99ff00] animate-pulse" />
          <span>3D ORBIT MODE ACTIVE &bull; DRAG TO ROTATE 360°</span>
          <button
            onClick={() => onInspectToggle?.(false)}
            className="ml-2 px-2.5 py-1 rounded bg-[#c8a97e]/20 hover:bg-[#c8a97e]/40 text-[#c8a97e] text-[11px] font-semibold uppercase tracking-wider transition-colors"
          >
            Exit Orbit
          </button>
        </div>
      )}
    </div>
  );
};
