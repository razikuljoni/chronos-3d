export type CaseFinish = 'titanium' | 'spaceblack' | 'rosegold' | 'ceramic';

export type StrapColor = 'obsidian' | 'cognac' | 'navy' | 'emerald';

export type WatchFaceMode = 'rings' | 'chronograph' | 'minimal' | 'stealth';

export interface WatchConfig {
  finish: CaseFinish;
  strapColor: StrapColor;
  faceMode: WatchFaceMode;
  autoRotate: boolean;
  inspectMode: boolean;
}

export interface SectionPose {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}
