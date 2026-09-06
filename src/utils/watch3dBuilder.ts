import * as THREE from 'three';
import { CaseFinish, StrapColor } from '../types';

export interface WatchMaterials {
  caseMaterial: THREE.MeshStandardMaterial;
  bezelMaterial: THREE.MeshStandardMaterial;
  accentMaterial: THREE.MeshStandardMaterial;
  strapMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  dialMarkersMaterial: THREE.MeshStandardMaterial;
  backSensorMaterial: THREE.MeshStandardMaterial;
}

// Generate an ultra-clean procedural studio HDRI environment map for reflections
export function createStudioEnvMap(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const scene = new THREE.Scene();
  const camera = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(512, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  }));

  // Create studio softboxes & gradient panels in the reflection cube
  const geo = new THREE.PlaneGeometry(12, 12);

  // Overhead softbox light
  const overheadMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const overhead = new THREE.Mesh(geo, overheadMat);
  overhead.position.set(0, 10, 0);
  overhead.rotation.x = Math.PI / 2;
  scene.add(overhead);

  // Warm key softbox (left side)
  const warmMat = new THREE.MeshBasicMaterial({ color: 0xffeedd, side: THREE.DoubleSide });
  const warmBox = new THREE.Mesh(geo, warmMat);
  warmBox.position.set(-9, 4, 3);
  warmBox.rotation.y = Math.PI / 3;
  scene.add(warmBox);

  // Cool rim softbox (right side)
  const coolMat = new THREE.MeshBasicMaterial({ color: 0xccddff, side: THREE.DoubleSide });
  const coolBox = new THREE.Mesh(geo, coolMat);
  coolBox.position.set(9, 3, -4);
  coolBox.rotation.y = -Math.PI / 3;
  scene.add(coolBox);

  // Golden accent strip
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
  const goldStrip = new THREE.Mesh(new THREE.PlaneGeometry(2, 14), goldMat);
  goldStrip.position.set(0, -2, -8);
  scene.add(goldStrip);

  camera.update(renderer, scene);
  return camera.renderTarget;
}

export function createWatchMaterials(envMap: THREE.Texture): WatchMaterials {
  // Case Material: Brushed Titanium (Default)
  const caseMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8cbd0,
    metalness: 0.88,
    roughness: 0.22,
    envMap: envMap,
    envMapIntensity: 1.5,
  });

  // Bezel Material: Diamond-Like Carbon / Ceramic
  const bezelMaterial = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    metalness: 0.95,
    roughness: 0.15,
    envMap: envMap,
    envMapIntensity: 1.8,
  });

  // Accent Material: Champagne Rose Gold / Gold
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8a858,
    metalness: 0.95,
    roughness: 0.2,
    envMap: envMap,
    envMapIntensity: 2.0,
  });

  // Strap Material: Premium fluoroelastomer matte rubber or textured leather
  const strapMaterial = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    metalness: 0.05,
    roughness: 0.82,
    envMap: envMap,
    envMapIntensity: 0.4,
  });

  // Glass Material: Double-Domed Curved Sapphire Crystal
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.02,
    transmission: 0.94,
    ior: 1.77, // Authentic sapphire crystal index
    thickness: 1.6,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMap: envMap,
    envMapIntensity: 2.2,
    transparent: true,
    opacity: 0.96,
  });

  // Dynamic Time-of-Day Environmental Shader Uniforms
  const sapphireUniforms = {
    uTimeOfDay: { value: 17.5 },
    uWarmColor: { value: new THREE.Color(1.0, 0.72, 0.28) },
    uCoolColor: { value: new THREE.Color(0.18, 0.45, 0.95) },
    uGoldenHourMix: { value: 0.8 },
    uArCoatingColor: { value: new THREE.Color(1.0, 0.42, 0.15) },
    uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.5).normalize() },
    uTime: { value: 0 },
    uDispersion: { value: 0.022 },
  };
  glassMaterial.userData.sapphireUniforms = sapphireUniforms;

  // Custom shader hook injecting time-of-day environmental reflections,
  // multi-layer anti-reflective (AR) iridescence, and curved-edge chromatic dispersion
  glassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTimeOfDay = sapphireUniforms.uTimeOfDay;
    shader.uniforms.uWarmColor = sapphireUniforms.uWarmColor;
    shader.uniforms.uCoolColor = sapphireUniforms.uCoolColor;
    shader.uniforms.uGoldenHourMix = sapphireUniforms.uGoldenHourMix;
    shader.uniforms.uArCoatingColor = sapphireUniforms.uArCoatingColor;
    shader.uniforms.uSunDir = sapphireUniforms.uSunDir;
    shader.uniforms.uTime = sapphireUniforms.uTime;
    shader.uniforms.uDispersion = sapphireUniforms.uDispersion;

    // Inject varying declarations in vertex shader
    shader.vertexShader = `
      varying vec3 vSapphireWorldPos;
      varying vec3 vSapphireWorldNorm;
      varying vec3 vSapphireViewDir;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vSapphireWorldPos = worldPosition.xyz;
      vSapphireWorldNorm = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vSapphireViewDir = normalize(cameraPosition - worldPosition.xyz);
      `
    );

    // Inject custom lighting and reflection equations into fragment shader
    shader.fragmentShader = `
      varying vec3 vSapphireWorldPos;
      varying vec3 vSapphireWorldNorm;
      varying vec3 vSapphireViewDir;

      uniform float uTimeOfDay;
      uniform vec3 uWarmColor;
      uniform vec3 uCoolColor;
      uniform float uGoldenHourMix;
      uniform vec3 uArCoatingColor;
      uniform vec3 uSunDir;
      uniform float uTime;
      uniform float uDispersion;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      // Dynamic Environmental Light Reflections across Curved Sapphire Dome
      vec3 sN = normalize(vSapphireWorldNorm);
      vec3 sV = normalize(vSapphireViewDir);
      float NdotV = clamp(dot(sN, sV), 0.0, 1.0);
      float sapphireFresnel = pow(1.0 - NdotV, 3.2);

      vec3 sR = reflect(-sV, sN);
      vec3 normSun = normalize(uSunDir);
      float sunAlign = max(dot(sR, normSun), 0.0);
      float sunGlint = pow(sunAlign, 38.0);
      float broadGlow = pow(sunAlign, 5.0);

      // Sky hemisphere reflection gradient
      float skyUp = sR.y * 0.5 + 0.5;
      vec3 envTone = mix(
        uCoolColor * (0.85 + 0.5 * skyUp),
        uWarmColor * (1.15 + 0.65 * broadGlow),
        uGoldenHourMix
      );

      // Multi-layer Anti-Reflective (AR) optical coating iridescence
      vec3 arCoating = uArCoatingColor * pow(1.0 - NdotV, 2.2) * 0.52;

      // Chromatic dispersion along curved crystal dome rim
      vec3 dispSun1 = normalize(normSun + vec3(uDispersion, 0.0, 0.0));
      vec3 dispSun2 = normalize(normSun - vec3(uDispersion, 0.0, 0.0));
      vec3 chromaticGlint = vec3(
        pow(max(dot(sR, dispSun1), 0.0), 30.0),
        pow(sunAlign, 30.0),
        pow(max(dot(sR, dispSun2), 0.0), 30.0)
      );
      vec3 dispersionColor = mix(chromaticGlint * uCoolColor, chromaticGlint * uWarmColor, uGoldenHourMix);

      // Blend environmental reflections onto sapphire glass dome
      vec3 sapphireReflection = (
        envTone * (0.35 + 0.8 * sapphireFresnel) +
        arCoating +
        dispersionColor * 0.75 +
        sunGlint * (uWarmColor * 1.8 + vec3(0.45))
      ) * 0.9;

      gl_FragColor.rgb += sapphireReflection;

      #include <dithering_fragment>
      `
    );
  };

  // Dial Markers Material (3D metallic batons)
  const dialMarkersMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8caa0,
    metalness: 0.92,
    roughness: 0.18,
    envMap: envMap,
    envMapIntensity: 1.8,
  });

  // Back Sensor Pod Ceramic
  const backSensorMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f1115,
    metalness: 0.4,
    roughness: 0.2,
    envMap: envMap,
    envMapIntensity: 1.2,
  });

  return {
    caseMaterial,
    bezelMaterial,
    accentMaterial,
    strapMaterial,
    glassMaterial,
    dialMarkersMaterial,
    backSensorMaterial,
  };
}

export function updateFinishMaterials(
  materials: WatchMaterials,
  finish: CaseFinish
) {
  if (finish === 'titanium') {
    materials.caseMaterial.color.setHex(0xc8cbd0);
    materials.caseMaterial.metalness = 0.88;
    materials.caseMaterial.roughness = 0.22;
    materials.bezelMaterial.color.setHex(0x1a1d24);
    materials.accentMaterial.color.setHex(0xe8a858);
  } else if (finish === 'spaceblack') {
    materials.caseMaterial.color.setHex(0x181a1f);
    materials.caseMaterial.metalness = 0.95;
    materials.caseMaterial.roughness = 0.18;
    materials.bezelMaterial.color.setHex(0x0e1014);
    materials.accentMaterial.color.setHex(0xff3b30);
  } else if (finish === 'rosegold') {
    materials.caseMaterial.color.setHex(0xdfa07d);
    materials.caseMaterial.metalness = 0.94;
    materials.caseMaterial.roughness = 0.2;
    materials.bezelMaterial.color.setHex(0x3d2820);
    materials.accentMaterial.color.setHex(0xf3c9a8);
  } else if (finish === 'ceramic') {
    materials.caseMaterial.color.setHex(0xf0ece1);
    materials.caseMaterial.metalness = 0.15;
    materials.caseMaterial.roughness = 0.12;
    materials.bezelMaterial.color.setHex(0xdfd8c8);
    materials.accentMaterial.color.setHex(0xc8a97e);
  }
}

export function updateStrapColor(
  materials: WatchMaterials,
  color: StrapColor
) {
  if (color === 'obsidian') {
    materials.strapMaterial.color.setHex(0x14161a);
  } else if (color === 'cognac') {
    materials.strapMaterial.color.setHex(0x6e3c1b);
  } else if (color === 'navy') {
    materials.strapMaterial.color.setHex(0x132338);
  } else if (color === 'emerald') {
    materials.strapMaterial.color.setHex(0x123024);
  }
}

export function build3DWatchModel(
  materials: WatchMaterials,
  dialTexture: THREE.CanvasTexture
): THREE.Group {
  const watchGroup = new THREE.Group();

  // Watch Dimensions (in Three units, radius ~ 2.4 units, height ~ 0.8 units)
  const caseRadius = 2.4;
  const caseHeight = 0.65;

  // 1. MAIN CASE (Cushion-shaped cylindrical watch case with bevel)
  const caseGeo = new THREE.CylinderGeometry(caseRadius, caseRadius * 0.96, caseHeight, 64, 1);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseMaterial);
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  watchGroup.add(caseMesh);

  // Polished bevel chamfer ring around main case
  const chamferGeo = new THREE.TorusGeometry(caseRadius, 0.08, 16, 64);
  const chamferMesh = new THREE.Mesh(chamferGeo, materials.caseMaterial);
  chamferMesh.rotation.x = Math.PI / 2;
  chamferMesh.position.y = caseHeight / 2 - 0.02;
  watchGroup.add(chamferMesh);

  // 2. BEZEL RING (Outer ceramic/titanium bezel with chamfer)
  const bezelGeo = new THREE.CylinderGeometry(caseRadius * 0.97, caseRadius * 0.98, 0.18, 64);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.bezelMaterial);
  bezelMesh.position.y = caseHeight / 2 + 0.08;
  bezelMesh.castShadow = true;
  watchGroup.add(bezelMesh);

  // Inner Bezel Inset Ring with Tachymeter Step
  const innerBezelGeo = new THREE.RingGeometry(caseRadius * 0.82, caseRadius * 0.94, 64);
  const innerBezelMesh = new THREE.Mesh(innerBezelGeo, materials.bezelMaterial);
  innerBezelMesh.rotation.x = -Math.PI / 2;
  innerBezelMesh.position.y = caseHeight / 2 + 0.17;
  watchGroup.add(innerBezelMesh);

  // 3. DIAL (Dynamic Screen)
  const dialRadius = caseRadius * 0.82;
  const dialGeo = new THREE.CircleGeometry(dialRadius, 64);
  const dialMat = new THREE.MeshBasicMaterial({
    map: dialTexture,
    toneMapped: false,
  });
  const dialMesh = new THREE.Mesh(dialGeo, dialMat);
  dialMesh.rotation.x = -Math.PI / 2;
  dialMesh.position.y = caseHeight / 2 + 0.16;
  watchGroup.add(dialMesh);

  // 4. FLOATING 3D HOUR MARKERS & CHAPTER RING (Raised metallic batons for authentic luxury depth)
  const markersGroup = new THREE.Group();
  markersGroup.position.y = caseHeight / 2 + 0.17;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const isQuarter = i % 3 === 0;
    const markerLength = isQuarter ? 0.32 : 0.22;
    const markerWidth = isQuarter ? 0.07 : 0.045;
    const markerHeight = 0.035;

    const markerGeo = new THREE.BoxGeometry(markerWidth, markerHeight, markerLength);
    const markerMesh = new THREE.Mesh(markerGeo, materials.dialMarkersMaterial);

    const r = dialRadius * 0.88;
    markerMesh.position.set(Math.sin(angle) * r, markerHeight / 2, Math.cos(angle) * r);
    markerMesh.rotation.y = angle;
    markerMesh.castShadow = true;
    markersGroup.add(markerMesh);
  }
  watchGroup.add(markersGroup);

  // 5. DOUBLE-DOMED CURVED SAPPHIRE GLASS DOME (With authentic physical refraction and reflections)
  // We use a spherical cap geometry for perfect double-domed optics
  const domeRadius = 4.2;
  const domeAngle = Math.asin((dialRadius * 1.05) / domeRadius);
  const domeGeo = new THREE.SphereGeometry(
    domeRadius,
    64,
    32,
    0,
    Math.PI * 2,
    0,
    domeAngle
  );
  const domeMesh = new THREE.Mesh(domeGeo, materials.glassMaterial);
  // Invert sphere cap to sit over the dial
  domeMesh.rotation.x = Math.PI;
  // Position so the edge sits right on top of the bezel
  domeMesh.position.y = caseHeight / 2 + 0.18 + (domeRadius - Math.cos(domeAngle) * domeRadius);
  domeMesh.castShadow = true;
  watchGroup.add(domeMesh);

  // 6. KNURLED DIGITAL CROWN (At 3 o'clock)
  const crownGroup = new THREE.Group();
  const crownRadius = 0.52;
  const crownLength = 0.45;

  // Crown base stem
  const stemGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 32);
  const stemMesh = new THREE.Mesh(stemGeo, materials.caseMaterial);
  stemMesh.rotation.z = Math.PI / 2;
  stemMesh.position.x = caseRadius + 0.08;
  crownGroup.add(stemMesh);

  // Fluted main crown body with ridges
  const crownBodyGeo = new THREE.CylinderGeometry(crownRadius, crownRadius, crownLength, 48);
  const crownBodyMesh = new THREE.Mesh(crownBodyGeo, materials.caseMaterial);
  crownBodyMesh.rotation.z = Math.PI / 2;
  crownBodyMesh.position.x = caseRadius + 0.32;
  crownBodyMesh.castShadow = true;
  crownGroup.add(crownBodyMesh);

  // High-contrast accent ring around crown
  const crownRingGeo = new THREE.TorusGeometry(crownRadius * 0.98, 0.04, 16, 32);
  const crownRingMesh = new THREE.Mesh(crownRingGeo, materials.accentMaterial);
  crownRingMesh.rotation.y = Math.PI / 2;
  crownRingMesh.position.x = caseRadius + 0.38;
  crownGroup.add(crownRingMesh);

  // Polished ceramic end-cap with inset dot
  const capGeo = new THREE.CylinderGeometry(crownRadius * 0.88, crownRadius * 0.88, 0.06, 32);
  const capMesh = new THREE.Mesh(capGeo, materials.bezelMaterial);
  capMesh.rotation.z = Math.PI / 2;
  capMesh.position.x = caseRadius + 0.54;
  crownGroup.add(capMesh);

  const dotGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const dotMesh = new THREE.Mesh(dotGeo, materials.accentMaterial);
  dotMesh.position.x = caseRadius + 0.58;
  crownGroup.add(dotMesh);

  watchGroup.add(crownGroup);

  // 7. SECONDARY TACTILE PUSHER BUTTON (At 4 o'clock / lower right flank)
  const pusherGroup = new THREE.Group();
  const pusherGeo = new THREE.BoxGeometry(0.2, 0.22, 0.7);
  const pusherMesh = new THREE.Mesh(pusherGeo, materials.caseMaterial);
  pusherMesh.position.set(caseRadius * 0.88, -0.05, caseRadius * 0.45);
  pusherMesh.rotation.y = -0.45;
  pusherMesh.castShadow = true;
  watchGroup.add(pusherMesh);

  // Speaker micro-grille slits on left flank (9 o'clock)
  const slitGroup = new THREE.Group();
  for (let s = -2; s <= 2; s++) {
    const slitGeo = new THREE.BoxGeometry(0.08, 0.06, 0.16);
    const slitMesh = new THREE.Mesh(slitGeo, materials.bezelMaterial);
    slitMesh.position.set(-caseRadius + 0.02, 0, s * 0.24);
    slitGroup.add(slitMesh);
  }
  watchGroup.add(slitGroup);

  // 8. ERGONOMIC INTEGRATED LUGS (Top & Bottom pairs)
  const lugWidth = 0.32;
  const lugLength = 0.95;
  const lugHeight = 0.38;
  const lugSpread = 1.25;

  const lugPositions = [
    { x: -lugSpread, z: -caseRadius * 0.82, rotY: 0.15 },
    { x: lugSpread, z: -caseRadius * 0.82, rotY: -0.15 },
    { x: -lugSpread, z: caseRadius * 0.82, rotY: -0.15 },
    { x: lugSpread, z: caseRadius * 0.82, rotY: 0.15 },
  ];

  lugPositions.forEach((pos) => {
    const lugGeo = new THREE.BoxGeometry(lugWidth, lugHeight, lugLength);
    const lugMesh = new THREE.Mesh(lugGeo, materials.caseMaterial);
    lugMesh.position.set(pos.x, -0.05, pos.z);
    lugMesh.rotation.y = pos.rotY;
    lugMesh.rotation.x = pos.z < 0 ? -0.2 : 0.2; // Angle downward to hug wrist
    lugMesh.castShadow = true;
    watchGroup.add(lugMesh);

    // Torx/Hex screw accent on outer lug
    const screwGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 6);
    const screwMesh = new THREE.Mesh(screwGeo, materials.accentMaterial);
    screwMesh.rotation.z = Math.PI / 2;
    screwMesh.position.set(pos.x > 0 ? pos.x + lugWidth / 2 + 0.02 : pos.x - lugWidth / 2 - 0.02, -0.05, pos.z);
    watchGroup.add(screwMesh);
  });

  // 9. BACK SENSOR CLUSTER (Optical Heart Rate & Bio-sensors beneath)
  const backSensorGroup = new THREE.Group();
  const backPlateGeo = new THREE.CylinderGeometry(caseRadius * 0.84, caseRadius * 0.84, 0.12, 48);
  const backPlateMesh = new THREE.Mesh(backPlateGeo, materials.backSensorMaterial);
  backPlateMesh.position.y = -caseHeight / 2 - 0.05;
  backSensorGroup.add(backPlateMesh);

  // Sapphire sensor window ring
  const sensorDomeGeo = new THREE.CylinderGeometry(caseRadius * 0.52, caseRadius * 0.52, 0.04, 32);
  const sensorDomeMat = new THREE.MeshStandardMaterial({
    color: 0x050608,
    metalness: 0.9,
    roughness: 0.1,
  });
  const sensorDomeMesh = new THREE.Mesh(sensorDomeGeo, sensorDomeMat);
  sensorDomeMesh.position.y = -caseHeight / 2 - 0.12;
  backSensorGroup.add(sensorDomeMesh);

  // 4 Green/Red Optical Sensor Lenses
  for (let l = 0; l < 4; l++) {
    const lAngle = (l * Math.PI) / 2;
    const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: l % 2 === 0 ? 0x00ff88 : 0xff2244 });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(Math.cos(lAngle) * 0.6, -caseHeight / 2 - 0.13, Math.sin(lAngle) * 0.6);
    backSensorGroup.add(lensMesh);
  }
  watchGroup.add(backSensorGroup);

  // 10. SCULPTED WATCH STRAP (Upper & Lower curving around wrist)
  const strapWidth = 2.1;
  const strapThickness = 0.22;

  // Upper Strap (Curving up and backwards)
  const upperCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, -0.1, -caseRadius + 0.15),
    new THREE.Vector3(0, -0.6, -caseRadius - 2.8),
    new THREE.Vector3(0, -3.4, -caseRadius - 2.2)
  );
  const upperTubeGeo = createExtrudedStrapGeometry(upperCurve, strapWidth, strapThickness);
  const upperStrapMesh = new THREE.Mesh(upperTubeGeo, materials.strapMaterial);
  upperStrapMesh.castShadow = true;
  watchGroup.add(upperStrapMesh);

  // Lower Strap (Curving down and backwards)
  const lowerCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, -0.1, caseRadius - 0.15),
    new THREE.Vector3(0, -0.6, caseRadius + 2.8),
    new THREE.Vector3(0, -3.4, caseRadius + 2.2)
  );
  const lowerTubeGeo = createExtrudedStrapGeometry(lowerCurve, strapWidth, strapThickness);
  const lowerStrapMesh = new THREE.Mesh(lowerTubeGeo, materials.strapMaterial);
  lowerStrapMesh.castShadow = true;
  watchGroup.add(lowerStrapMesh);

  // Titanium Buckle & Keeper loops on lower strap
  const buckleGeo = new THREE.BoxGeometry(strapWidth * 1.08, 0.32, 0.35);
  const buckleMesh = new THREE.Mesh(buckleGeo, materials.caseMaterial);
  buckleMesh.position.set(0, -2.2, caseRadius + 2.6);
  buckleMesh.rotation.x = -0.55;
  buckleMesh.castShadow = true;
  watchGroup.add(buckleMesh);

  // Scale watch appropriately for screen view
  watchGroup.scale.set(1.0, 1.0, 1.0);

  return watchGroup;
}

// Helper to generate a ribbed, contoured strap along a 3D spline
function createExtrudedStrapGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  width: number,
  height: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  const halfH = height / 2;
  const r = 0.08;

  // Rounded rectangle cross-section
  shape.moveTo(-halfW + r, -halfH);
  shape.lineTo(halfW - r, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
  shape.lineTo(halfW, halfH - r);
  shape.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
  shape.lineTo(-halfW + r, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
  shape.lineTo(-halfW, -halfH + r);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);

  return new THREE.ExtrudeGeometry(shape, {
    steps: 64,
    bevelEnabled: false,
    extrudePath: curve,
  });
}
