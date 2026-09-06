import * as THREE from 'three';

export type TimeOfDayPreset = 'auto' | 'dawn' | 'midday' | 'golden' | 'dusk' | 'evening' | 'midnight';

export interface AtmosphericLighting {
  timeHour: number; // 0.0 to 24.0
  phaseName: string;
  kelvin: number;
  // Sun/Moon vector in sky
  sunPosition: THREE.Vector3;
  // Lights
  keyColor: THREE.Color;
  keyIntensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  rimColor: THREE.Color;
  rimIntensity: number;
  bounceColor: THREE.Color;
  specularColor: THREE.Color;
  specularIntensity: number;
  // Sapphire Glass Shader specific uniforms
  glassWarmColor: THREE.Color;
  glassCoolColor: THREE.Color;
  goldenHourMix: number; // 0.0 (cool evening) to 1.0 (warm golden hour)
  arCoatingColor: THREE.Color; // Anti-reflective multi-coating reflection
  fresnelPower: number;
  chromaticDispersion: number;
  // Backdrop ambient tint
  backdropTint: string;
}

// Preset hour mappings
export const TIME_PRESETS: Record<TimeOfDayPreset, number> = {
  dawn: 6.5,       // 06:30 AM
  midday: 12.5,    // 12:30 PM
  golden: 17.5,    // 05:30 PM - Peak Golden Hour
  dusk: 19.5,      // 07:30 PM - Sunset Twilight
  evening: 22.0,   // 10:00 PM - Cool Moonlit Evening
  midnight: 0.5,   // 12:30 AM - Deep Obsidian Midnight
  auto: 17.5,      // Defaults to current hour if auto
};

// Smooth Hermite interpolation helper
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Calculates physically-informed environmental atmosphere & reflection colors
 * based on the 24-hour solar cycle.
 */
export function calculateAtmosphere(hourInput: number): AtmosphericLighting {
  // Normalize hour into 0.0 .. 24.0
  let h = hourInput % 24;
  if (h < 0) h += 24;

  // Calculate sun angle:
  // Sunrise at 6.0 (east: -X), Solar noon at 12.0 (zenith: +Y), Sunset at 18.0 (west: +X), Midnight at 0.0 (nadir: -Y)
  const sunAngle = ((h - 6) / 24) * Math.PI * 2;
  const sunElevation = Math.sin(sunAngle); // > 0 daytime, < 0 nighttime
  const sunAzimuth = -Math.cos(sunAngle);

  const sunPos = new THREE.Vector3(
    sunAzimuth * 7.5,
    Math.max(-2, sunElevation * 8.5 + 2.0),
    4.5 + Math.cos(sunAngle * 0.5) * 2.5
  );

  let phaseName = 'Midday Zenith';
  let kelvin = 6000;
  let goldenHourMix = 0.0;
  let keyColor = new THREE.Color();
  let keyIntensity = 2.8;
  let ambientColor = new THREE.Color();
  let ambientIntensity = 0.85;
  let rimColor = new THREE.Color();
  let rimIntensity = 1.8;
  let bounceColor = new THREE.Color();
  let specularColor = new THREE.Color();
  let specularIntensity = 2.5;
  let glassWarmColor = new THREE.Color();
  let glassCoolColor = new THREE.Color();
  let arCoatingColor = new THREE.Color('#3800ff'); // Sapphire violet AR
  let backdropTint = '#e8decb';

  // 1. NIGHT & MIDNIGHT (22:30 - 05:00)
  if (h >= 22.5 || h < 5.0) {
    phaseName = 'Cool Midnight & Obsidian';
    kelvin = 9200;
    goldenHourMix = 0.0;
    // Cool moonlight silver-blue
    keyColor.setRGB(0.55, 0.72, 0.98);
    keyIntensity = 1.6;
    ambientColor.setRGB(0.12, 0.16, 0.28);
    ambientIntensity = 0.6;
    rimColor.setRGB(0.35, 0.65, 1.0);
    rimIntensity = 2.2;
    bounceColor.setRGB(0.18, 0.22, 0.38);
    specularColor.setRGB(0.7, 0.88, 1.0);
    specularIntensity = 2.2;
    glassWarmColor.setRGB(0.35, 0.45, 0.65);
    glassCoolColor.setRGB(0.12, 0.38, 0.88);
    arCoatingColor.setRGB(0.2, 0.7, 1.0); // Cyan moonlight AR flare
    backdropTint = '#242a38';
  }
  // 2. DAWN / FIRST LIGHT (05:00 - 07:30)
  else if (h >= 5.0 && h < 7.5) {
    const t = (h - 5.0) / 2.5;
    phaseName = 'Dawn & Rose Mist';
    kelvin = Math.round(THREE.MathUtils.lerp(4200, 5400, t));
    goldenHourMix = (1.0 - Math.abs(t - 0.5) * 2) * 0.55;
    keyColor.lerpColors(new THREE.Color('#f6a89e'), new THREE.Color('#ffe8cc'), t);
    keyIntensity = 2.2;
    ambientColor.lerpColors(new THREE.Color('#2a233b'), new THREE.Color('#58627a'), t);
    ambientIntensity = 0.75;
    rimColor.lerpColors(new THREE.Color('#ff8fa3'), new THREE.Color('#a0c4ff'), t);
    rimIntensity = 1.9;
    bounceColor.setRGB(0.55, 0.48, 0.58);
    specularColor.setRGB(1.0, 0.92, 0.88);
    specularIntensity = 2.4;
    glassWarmColor.setRGB(1.0, 0.68, 0.58);
    glassCoolColor.setRGB(0.48, 0.62, 0.95);
    arCoatingColor.setRGB(0.75, 0.35, 0.95); // Magenta-violet dawn flare
    backdropTint = '#ded3c5';
  }
  // 3. MORNING TO MIDDAY (07:30 - 15:30)
  else if (h >= 7.5 && h < 15.5) {
    phaseName = 'Zenith Daylight';
    kelvin = 6500;
    goldenHourMix = 0.05;
    keyColor.setRGB(1.0, 0.98, 0.95); // Pure crystalline white
    keyIntensity = 2.8;
    ambientColor.setRGB(0.72, 0.82, 0.96);
    ambientIntensity = 0.88;
    rimColor.setRGB(0.82, 0.92, 1.0);
    rimIntensity = 1.7;
    bounceColor.setRGB(0.9, 0.88, 0.82);
    specularColor.setRGB(1.0, 1.0, 1.0);
    specularIntensity = 2.6;
    glassWarmColor.setRGB(0.95, 0.92, 0.88);
    glassCoolColor.setRGB(0.68, 0.82, 1.0);
    arCoatingColor.setRGB(0.35, 0.15, 0.85); // Standard deep violet luxury sapphire AR
    backdropTint = '#e8decb';
  }
  // 4. GOLDEN HOUR (15:30 - 18:45) - PEAK WARMTH
  else if (h >= 15.5 && h < 18.75) {
    const t = smoothstep(15.5, 17.5, h);
    const falloff = smoothstep(18.75, 17.5, h);
    const goldenFactor = Math.min(t, falloff);

    phaseName = 'Warm Golden Hour';
    kelvin = Math.round(THREE.MathUtils.lerp(5200, 2600, goldenFactor));
    goldenHourMix = THREE.MathUtils.lerp(0.3, 1.0, goldenFactor);

    // Deep honey gold and warm amber hues
    keyColor.lerpColors(new THREE.Color('#fff2db'), new THREE.Color('#ff9c38'), goldenFactor);
    keyIntensity = 3.2;
    ambientColor.lerpColors(new THREE.Color('#657088'), new THREE.Color('#784524'), goldenFactor);
    ambientIntensity = 0.95;
    rimColor.lerpColors(new THREE.Color('#b5caff'), new THREE.Color('#ffb049'), goldenFactor);
    rimIntensity = 2.4;
    bounceColor.setRGB(0.85, 0.58, 0.32);
    specularColor.lerpColors(new THREE.Color('#ffffff'), new THREE.Color('#ffc87a'), goldenFactor);
    specularIntensity = 3.0;
    glassWarmColor.setRGB(1.0, 0.72, 0.28); // Vibrant molten gold
    glassCoolColor.setRGB(0.35, 0.25, 0.55); // Sunset purple undertone
    arCoatingColor.setRGB(1.0, 0.42, 0.15); // Fiery golden-amber AR reflection
    backdropTint = '#e0b888';
  }
  // 5. DUSK & SUNSET TWILIGHT (18:75 - 20:5)
  else if (h >= 18.75 && h < 20.5) {
    const t = (h - 18.75) / 1.75;
    phaseName = 'Dusk Twilight & Coral';
    kelvin = Math.round(THREE.MathUtils.lerp(3200, 4800, t));
    goldenHourMix = THREE.MathUtils.lerp(0.85, 0.2, t);

    keyColor.lerpColors(new THREE.Color('#ff5d38'), new THREE.Color('#a83bb2'), t);
    keyIntensity = 2.4;
    ambientColor.lerpColors(new THREE.Color('#58253a'), new THREE.Color('#1f1e38'), t);
    ambientIntensity = 0.78;
    rimColor.lerpColors(new THREE.Color('#ff7895'), new THREE.Color('#6a45d4'), t);
    rimIntensity = 2.2;
    bounceColor.setRGB(0.65, 0.32, 0.42);
    specularColor.setRGB(1.0, 0.65, 0.75);
    specularIntensity = 2.5;
    glassWarmColor.setRGB(0.95, 0.42, 0.38);
    glassCoolColor.setRGB(0.42, 0.22, 0.78);
    arCoatingColor.setRGB(0.85, 0.2, 0.65);
    backdropTint = '#c9a29a';
  }
  // 6. COOL EVENING (20:5 - 22:5) - BLUE HOUR
  else {
    const t = (h - 20.5) / 2.0;
    phaseName = 'Cool Evening & Cobalt';
    kelvin = Math.round(THREE.MathUtils.lerp(5500, 8500, t));
    goldenHourMix = THREE.MathUtils.lerp(0.2, 0.0, t);

    // Transitioning from twilight into cool evening cobalt
    keyColor.lerpColors(new THREE.Color('#6860aa'), new THREE.Color('#6495ed'), t);
    keyIntensity = 1.9;
    ambientColor.lerpColors(new THREE.Color('#1a1c30'), new THREE.Color('#101525'), t);
    ambientIntensity = 0.68;
    rimColor.lerpColors(new THREE.Color('#5560c0'), new THREE.Color('#38b6ff'), t);
    rimIntensity = 2.1;
    bounceColor.setRGB(0.25, 0.32, 0.48);
    specularColor.setRGB(0.75, 0.88, 1.0);
    specularIntensity = 2.4;
    glassWarmColor.setRGB(0.55, 0.6, 0.75);
    glassCoolColor.setRGB(0.18, 0.45, 0.95);
    arCoatingColor.setRGB(0.15, 0.55, 1.0); // Electric blue / cyan AR
    backdropTint = '#2a3142';
  }

  return {
    timeHour: h,
    phaseName,
    kelvin,
    sunPosition: sunPos,
    keyColor,
    keyIntensity,
    ambientColor,
    ambientIntensity,
    rimColor,
    rimIntensity,
    bounceColor,
    specularColor,
    specularIntensity,
    glassWarmColor,
    glassCoolColor,
    goldenHourMix,
    arCoatingColor,
    fresnelPower: 3.2,
    chromaticDispersion: 0.022,
    backdropTint,
  };
}
