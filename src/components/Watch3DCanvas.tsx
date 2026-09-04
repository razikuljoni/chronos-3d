import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WatchConfig, SectionPose, PerformanceMetrics } from '../types';
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
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
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
  onMetricsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Three.js state & physics engine
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
    // Physical Inertia State
    physics: {
      currentRot: [number, number, number];
      rotVelocity: [number, number, number];
      currentPos: [number, number, number];
      posVelocity: [number, number, number];
      currentScale: number;
      scaleVelocity: number;
      lastScroll: number;
      smoothedScrollVelocity: number;
    };
    // Performance Telemetry tracking
    telemetry: {
      frameTimes: number[];
      lastDispatchTime: number;
    };
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
    physics: {
      currentRot: [0.18, -0.28, 0.08],
      rotVelocity: [0, 0, 0],
      currentPos: [0, 0.05, 0],
      posVelocity: [0, 0, 0],
      currentScale: 1.0,
      scaleVelocity: 0,
      lastScroll: 0,
      smoothedScrollVelocity: 0,
    },
    telemetry: {
      frameTimes: [],
      lastDispatchTime: 0,
    },
  });

  // Keep latest config in ref for the render loop
  const configRef = useRef(config);
  configRef.current = config;

  const scrollRef = useRef(scrollFraction);
  scrollRef.current = scrollFraction;

  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  onMetricsUpdateRef.current = onMetricsUpdate;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6e8, 2.8);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xaad4ff, 1.8);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xedd9b6, 1.2);
    bounceLight.position.set(0, -6, 4);
    scene.add(bounceLight);

    const specularLight = new THREE.DirectionalLight(0xffffff, 2.5);
    specularLight.position.set(-3, 6, 6);
    scene.add(specularLight);

    // Save refs
    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.watchGroup = watchGroup;
    stateRef.current.materials = materials;
    stateRef.current.dynamicFace = dynamicFace;
    stateRef.current.specularLight = specularLight;

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

    // Animation Loop with Physics & Performance Telemetry
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      stateRef.current.animationFrameId = requestAnimationFrame(animate);

      const rawDelta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Clamp delta to prevent physics explosion on background tab wake
      const delta = Math.min(Math.max(rawDelta, 0.001), 0.06);
      const frameDeltaMs = rawDelta * 1000;

      const {
        mouse,
        watchGroup: watch,
        dynamicFace: face,
        specularLight: specLight,
        physics,
        telemetry,
      } = stateRef.current;

      if (!watch || !face || !renderer || !scene || !camera) return;

      // 1. Update live dynamic watch face
      face.update(Date.now());

      // 2. Mouse Parallax Lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 3. PHYSICAL INERTIA & SCROLL MOMENTUM TRACKING
      const sFraction = scrollRef.current;
      const scrollDelta = sFraction - physics.lastScroll;
      physics.lastScroll = sFraction;

      const instantScrollVelocity = scrollDelta / delta;
      // Exponential smoothing for scroll velocity
      physics.smoothedScrollVelocity += (instantScrollVelocity - physics.smoothedScrollVelocity) * 0.22;

      // Calculate Target Pose across Scroll Sections
      const totalPoses = SECTION_POSES.length;
      const clampedFraction = Math.max(0, Math.min(totalPoses - 1, sFraction));
      const baseIdx = Math.floor(clampedFraction);
      const nextIdx = Math.min(totalPoses - 1, baseIdx + 1);
      const blend = clampedFraction - baseIdx;

      // Smooth cubic step easing
      const t = blend * blend * (3 - 2 * blend);

      const p1 = SECTION_POSES[baseIdx];
      const p2 = SECTION_POSES[nextIdx];

      const baseTargetPos = [
        THREE.MathUtils.lerp(p1.position[0], p2.position[0], t),
        THREE.MathUtils.lerp(p1.position[1], p2.position[1], t),
        THREE.MathUtils.lerp(p1.position[2], p2.position[2], t),
      ];
      const baseTargetRot = [
        THREE.MathUtils.lerp(p1.rotation[0], p2.rotation[0], t),
        THREE.MathUtils.lerp(p1.rotation[1], p2.rotation[1], t),
        THREE.MathUtils.lerp(p1.rotation[2], p2.rotation[2], t),
      ];
      const baseTargetScale = THREE.MathUtils.lerp(p1.scale, p2.scale, t);

      // Idle floating oscillation
      const idleTime = currentTime * 0.001;
      const idleFloatingY = Math.sin(idleTime * 1.5) * 0.035;
      const idleTiltZ = Math.cos(idleTime * 1.2) * 0.015;

      const isMobile = window.innerWidth < 768;
      const mobileScaleMult = isMobile ? 0.76 : 1.0;
      const mobileXMult = isMobile ? 0.25 : 1.0;

      const isInspect = configRef.current.inspectMode;
      const currentOrbit = stateRef.current.orbitRot;

      if (isInspect) {
        // Direct interactive 3D inspect mode
        physics.currentRot[0] += (currentOrbit.x - physics.currentRot[0]) * 0.1;
        physics.currentRot[1] += (currentOrbit.y - physics.currentRot[1]) * 0.1;
        physics.currentPos[0] += (0 - physics.currentPos[0]) * 0.08;
        physics.currentPos[1] += (0.1 - physics.currentPos[1]) * 0.08;
        physics.currentPos[2] += (1.4 - physics.currentPos[2]) * 0.08;
        physics.rotVelocity = [0, 0, 0];
        physics.posVelocity = [0, 0, 0];
      } else {
        // SECOND-ORDER SPRING-DAMPER INERTIA ENGINE
        // Injected momentum torque from scroll velocity:
        // As the user flicks or scrolls, the watch tilts into the momentum with physical mass inertia
        const momentumTorqueX = -physics.smoothedScrollVelocity * 0.14;
        const momentumTorqueY = physics.smoothedScrollVelocity * 0.24;
        const momentumDipY = -physics.smoothedScrollVelocity * 0.08;

        const autoRot = configRef.current.autoRotate ? idleTime * 0.25 : 0;

        const desiredRotX = baseTargetRot[0] + momentumTorqueX - mouse.y * 0.26;
        const desiredRotY = baseTargetRot[1] + momentumTorqueY + autoRot + mouse.x * 0.32 + currentOrbit.y * 0.3;
        const desiredRotZ = baseTargetRot[2] + idleTiltZ;

        const desiredPosX = baseTargetPos[0] * mobileXMult + mouse.x * 0.22;
        const desiredPosY = baseTargetPos[1] + momentumDipY + idleFloatingY + mouse.y * 0.18;
        const desiredPosZ = baseTargetPos[2];

        // Physics constants: High stiffness & weighted mechanical damping for luxury horology feel
        const springK = 32.0;
        const dampingC = 9.2;

        // Rotational acceleration (F = k*x - c*v)
        const accelRotX = (desiredRotX - physics.currentRot[0]) * springK - physics.rotVelocity[0] * dampingC;
        const accelRotY = (desiredRotY - physics.currentRot[1]) * springK - physics.rotVelocity[1] * dampingC;
        const accelRotZ = (desiredRotZ - physics.currentRot[2]) * springK - physics.rotVelocity[2] * dampingC;

        physics.rotVelocity[0] += accelRotX * delta;
        physics.rotVelocity[1] += accelRotY * delta;
        physics.rotVelocity[2] += accelRotZ * delta;

        physics.currentRot[0] += physics.rotVelocity[0] * delta;
        physics.currentRot[1] += physics.rotVelocity[1] * delta;
        physics.currentRot[2] += physics.rotVelocity[2] * delta;

        // Positional acceleration
        const posSpringK = 28.0;
        const posDampingC = 8.6;

        const accelPosX = (desiredPosX - physics.currentPos[0]) * posSpringK - physics.posVelocity[0] * posDampingC;
        const accelPosY = (desiredPosY - physics.currentPos[1]) * posSpringK - physics.posVelocity[1] * posDampingC;
        const accelPosZ = (desiredPosZ - physics.currentPos[2]) * posSpringK - physics.posVelocity[2] * posDampingC;

        physics.posVelocity[0] += accelPosX * delta;
        physics.posVelocity[1] += accelPosY * delta;
        physics.posVelocity[2] += accelPosZ * delta;

        physics.currentPos[0] += physics.posVelocity[0] * delta;
        physics.currentPos[1] += physics.posVelocity[1] * delta;
        physics.currentPos[2] += physics.posVelocity[2] * delta;

        // Scale interpolation
        const targetScale = baseTargetScale * mobileScaleMult;
        physics.currentScale += (targetScale - physics.currentScale) * 0.08;
      }

      // Apply simulated physical state to Three.js watch group
      watch.rotation.set(
        physics.currentRot[0],
        physics.currentRot[1],
        physics.currentRot[2]
      );
      watch.position.set(
        physics.currentPos[0],
        physics.currentPos[1],
        physics.currentPos[2]
      );
      watch.scale.set(
        physics.currentScale,
        physics.currentScale,
        physics.currentScale
      );

      // Animate specular gleam light across sapphire dome
      if (specLight) {
        specLight.position.x = -4 + Math.sin(sFraction * Math.PI) * 8;
        specLight.position.y = 5 + Math.cos(sFraction * Math.PI) * 3;
        specLight.intensity = 2.2 + Math.abs(mouse.x) * 1.5;
      }

      // 4. PERFORMANCE TELEMETRY RECORDING
      telemetry.frameTimes.push(frameDeltaMs);
      if (telemetry.frameTimes.length > 60) {
        telemetry.frameTimes.shift();
      }

      // Dispatch telemetry at ~10Hz to avoid React re-render thrashing
      if (
        onMetricsUpdateRef.current &&
        currentTime - telemetry.lastDispatchTime > 90
      ) {
        telemetry.lastDispatchTime = currentTime;
        const avgDelta =
          telemetry.frameTimes.reduce((acc, v) => acc + v, 0) /
            telemetry.frameTimes.length || 16.6;

        const angularMom = Math.sqrt(
          physics.rotVelocity[0] * physics.rotVelocity[0] +
            physics.rotVelocity[1] * physics.rotVelocity[1] +
            physics.rotVelocity[2] * physics.rotVelocity[2]
        );

        onMetricsUpdateRef.current({
          fps: Math.min(120, Math.max(1, 1000 / avgDelta)),
          frameTimeMs: frameDeltaMs,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          scrollVelocity: physics.smoothedScrollVelocity,
          angularMomentum: angularMom,
          history: [...telemetry.frameTimes],
          rendererName: 'WebGL2 // ACES Filmic HDR',
        });
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
        config.inspectMode
          ? 'pointer-events-auto cursor-grab active:cursor-grabbing'
          : 'pointer-events-none'
      }`}
      style={{ touchAction: config.inspectMode ? 'none' : 'auto' }}
    >
      <canvas
        ref={canvasRef}
        id="watch-3d-canvas"
        className="w-full h-full block"
      />

      {/* Floating 3D Inspect Mode Indicator */}
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
