export type CaseFinish = 'titanium' | 'spaceblack' | 'rosegold' | 'ceramic';

export type StrapColor = 'obsidian' | 'cognac' | 'navy' | 'emerald';

export type WatchFaceMode = 'rings' | 'chronograph' | 'minimal' | 'stealth';

export type TimeOfDayPreset = 'auto' | 'dawn' | 'midday' | 'golden' | 'dusk' | 'evening' | 'midnight';

export interface WatchConfig {
  finish: CaseFinish;
  strapColor: StrapColor;
  faceMode: WatchFaceMode;
  autoRotate: boolean;
  inspectMode: boolean;
  showTechSpecs: boolean;
  timeOfDay: TimeOfDayPreset;
  timeHour: number; // 0.0 to 24.0
  timeCycleActive: boolean; // Continuous solar cycle simulation
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  scrollVelocity: number;
  angularMomentum: number;
  history: number[]; // recent frame time history for graph
  rendererName: string;
  atmosphere?: {
    phaseName: string;
    kelvin: number;
    goldenHourMix: number;
    timeHour: number;
    arCoating: string;
    solarZenith: string;
  };
}

export interface SectionPose {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

