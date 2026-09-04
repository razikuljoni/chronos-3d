export type CaseFinish = 'titanium' | 'spaceblack' | 'rosegold' | 'ceramic';

export type StrapColor = 'obsidian' | 'cognac' | 'navy' | 'emerald';

export type WatchFaceMode = 'rings' | 'chronograph' | 'minimal' | 'stealth';

export interface WatchConfig {
  finish: CaseFinish;
  strapColor: StrapColor;
  faceMode: WatchFaceMode;
  autoRotate: boolean;
  inspectMode: boolean;
  showTechSpecs: boolean;
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
}

export interface SectionPose {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}
