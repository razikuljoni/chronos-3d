import * as THREE from 'three';
import { WatchFaceMode } from '../types';

export class DynamicWatchFace {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private mode: WatchFaceMode = 'rings';
  private pulsePhase: number = 0;
  private heartRate: number = 74;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 16;
  }

  public setMode(mode: WatchFaceMode) {
    this.mode = mode;
  }

  public setHeartRate(hr: number) {
    this.heartRate = hr;
  }

  public update(timeMs: number = Date.now()) {
    const ctx = this.ctx;
    const w = 1024;
    const h = 1024;
    const cx = w / 2;
    const cy = h / 2;

    this.pulsePhase += 0.05;

    ctx.clearRect(0, 0, w, h);

    // Watchface Background
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 512);
    if (this.mode === 'stealth') {
      bgGrad.addColorStop(0, '#0a0b0d');
      bgGrad.addColorStop(0.85, '#050607');
      bgGrad.addColorStop(1, '#000000');
    } else if (this.mode === 'chronograph') {
      bgGrad.addColorStop(0, '#161920');
      bgGrad.addColorStop(0.7, '#0f1116');
      bgGrad.addColorStop(1, '#08090c');
    } else {
      bgGrad.addColorStop(0, '#12141a');
      bgGrad.addColorStop(0.75, '#0d0f14');
      bgGrad.addColorStop(1, '#08090c');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 500, 0, Math.PI * 2);
    ctx.fill();

    // Subtle guilloché pattern / concentric dial rings
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let r = 80; r < 480; r += 24) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Outer Dial Chapter Ring & Tick Marks
    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const isFive = i % 5 === 0;
      const isQuarter = i % 15 === 0;

      const innerR = isQuarter ? 425 : isFive ? 440 : 455;
      const outerR = 475;

      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -innerR);
      ctx.lineTo(0, -outerR);

      if (isQuarter) {
        ctx.strokeStyle = '#e6c894';
        ctx.lineWidth = 6;
      } else if (isFive) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
      }
      ctx.lineCap = 'round';
      ctx.stroke();

      // Numbers for 5-minute intervals
      if (isFive && this.mode !== 'minimal') {
        ctx.save();
        ctx.translate(0, -400);
        ctx.rotate(-angle);
        ctx.fillStyle = isQuarter ? '#e6c894' : 'rgba(255, 255, 255, 0.8)';
        ctx.font = '600 24px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const num = i === 0 ? '60' : i < 10 ? `0${i}` : `${i}`;
        ctx.fillText(num, 0, 0);
        ctx.restore();
      }

      ctx.restore();
    }
    ctx.restore();

    // Date calculation
    const now = new Date(timeMs);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();
    const smoothSeconds = seconds + millis / 1000;
    const smoothMinutes = minutes + smoothSeconds / 60;
    const smoothHours = (hours % 12) + smoothMinutes / 60;

    // Draw Fitness Rings (Always drawn, prominent in 'rings' & 'stealth')
    this.drawFitnessRings(ctx, cx, cy, timeMs);

    // Complications based on Mode
    if (this.mode === 'chronograph') {
      this.drawChronographSubdials(ctx, cx, cy, smoothSeconds, smoothMinutes);
    } else if (this.mode === 'rings') {
      this.drawBiometricCenterComplication(ctx, cx, cy);
    } else if (this.mode === 'stealth') {
      this.drawStealthTelemetry(ctx, cx, cy);
    } else {
      this.drawMinimalistTypography(ctx, cx, cy);
    }

    // Brand Inscription at 12 o'clock
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8a97e';
    ctx.font = '700 26px "Cinzel", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('CHRONOS', cx, cy - 250);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '500 13px "Space Mono", monospace';
    ctx.fillText('AEROSPACE // T-48', cx, cy - 228);
    ctx.restore();

    // Date Window at 3 o'clock
    ctx.save();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayStr = days[now.getDay()];
    const dateNum = now.getDate();

    ctx.fillStyle = 'rgba(20, 24, 30, 0.9)';
    ctx.strokeStyle = 'rgba(200, 169, 126, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx + 250, cy - 24, 110, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e6c894';
    ctx.font = '700 18px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${dayStr} ${dateNum < 10 ? '0' + dateNum : dateNum}`, cx + 305, cy);
    ctx.restore();

    // Analog Hands
    this.drawWatchHands(ctx, cx, cy, smoothHours, smoothMinutes, smoothSeconds);

    // Center Cap
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1c22';
    ctx.fill();
    ctx.strokeStyle = '#c8a97e';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#e6c894';
    ctx.fill();
    ctx.restore();

    this.texture.needsUpdate = true;
  }

  private drawFitnessRings(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    timeMs: number
  ) {
    ctx.save();
    // Move: Red/Coral, Exercise: Lime Green, Stand: Cyan Blue
    const rings = [
      {
        label: 'MOVE',
        radius: 175,
        lineWidth: 18,
        color: '#ff2d55',
        glow: 'rgba(255, 45, 85, 0.45)',
        bgColor: 'rgba(255, 45, 85, 0.15)',
        progress: 0.88 + Math.sin(timeMs * 0.0003) * 0.08,
      },
      {
        label: 'EXERCISE',
        radius: 148,
        lineWidth: 18,
        color: '#99ff00',
        glow: 'rgba(153, 255, 0, 0.45)',
        bgColor: 'rgba(153, 255, 0, 0.15)',
        progress: 0.95 + Math.cos(timeMs * 0.0002) * 0.05,
      },
      {
        label: 'STAND',
        radius: 121,
        lineWidth: 18,
        color: '#00e5ff',
        glow: 'rgba(0, 229, 255, 0.45)',
        bgColor: 'rgba(0, 229, 255, 0.15)',
        progress: 0.75 + Math.sin(timeMs * 0.0004) * 0.06,
      },
    ];

    const startAngle = -Math.PI / 2;

    for (const ring of rings) {
      // Background track
      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = ring.bgColor;
      ctx.lineWidth = ring.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Progress arc
      const sweep = ring.progress * Math.PI * 2;
      ctx.save();
      ctx.shadowColor = ring.glow;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, startAngle, startAngle + sweep);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Arrow indicator at head of ring for luxury feel
      const endAngle = startAngle + sweep;
      const hx = cx + Math.cos(endAngle) * ring.radius;
      const hy = cy + Math.sin(endAngle) * ring.radius;

      ctx.beginPath();
      ctx.arc(hx, hy, ring.lineWidth / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBiometricCenterComplication(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number
  ) {
    ctx.save();

    // Heart rate & BPM Pulse at 6 o'clock
    const pulseOffset = Math.sin(this.pulsePhase * 3) * 3;
    ctx.save();
    ctx.fillStyle = '#ff2d55';
    ctx.font = '700 24px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`♥ ${this.heartRate} BPM`, cx, cy + 230);

    // Mini ECG waveform line
    ctx.strokeStyle = '#ff2d55';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const ecgY = cy + 265;
    ctx.moveTo(cx - 70, ecgY);
    ctx.lineTo(cx - 30, ecgY);
    ctx.lineTo(cx - 20, ecgY - 14 - pulseOffset);
    ctx.lineTo(cx - 10, ecgY + 18 + pulseOffset);
    ctx.lineTo(cx, ecgY - 24 - pulseOffset * 1.5);
    ctx.lineTo(cx + 10, ecgY + 8);
    ctx.lineTo(cx + 25, ecgY);
    ctx.lineTo(cx + 70, ecgY);
    ctx.stroke();
    ctx.restore();

    // Metric Badges inside center of rings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 32px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('784', cx, cy - 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '500 13px "Space Mono", monospace';
    ctx.fillText('KCAL TODAY', cx, cy + 16);

    ctx.restore();
  }

  private drawChronographSubdials(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    seconds: number,
    minutes: number
  ) {
    ctx.save();
    // Left subdial: 30-minute chronograph
    this.drawSubdial(ctx, cx - 200, cy, 65, 'MIN', (minutes % 30) / 30);
    // Right subdial: 12-hour chronograph
    this.drawSubdial(ctx, cx + 200, cy, 65, 'HRS', (minutes / 60) / 12);
    // Bottom subdial: 60-seconds continuous
    this.drawSubdial(ctx, cx, cy + 220, 65, 'SEC', (seconds % 60) / 60);
    ctx.restore();
  }

  private drawSubdial(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    label: string,
    progress: number
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(12, 14, 18, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 169, 126, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subdial ticks
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -r + 2);
      ctx.lineTo(0, -r + 8);
      ctx.strokeStyle = i % 3 === 0 ? '#c8a97e' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    }

    // Subdial hand
    const handAngle = -Math.PI / 2 + progress * Math.PI * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(handAngle);
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(r - 12, 0);
    ctx.strokeStyle = '#c8a97e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 11px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + r + 18);
    ctx.restore();
  }

  private drawStealthTelemetry(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number
  ) {
    ctx.save();
    ctx.fillStyle = '#00ff9d';
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET: 1,200 KCAL', cx, cy + 220);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 12px "Space Mono", monospace';
    ctx.fillText('TACTICAL VO2: 54.2 ML/KG', cx, cy + 245);
    ctx.restore();
  }

  private drawMinimalistTypography(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '300 20px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AUTOMATIC HYBRID', cx, cy + 230);
    ctx.restore();
  }

  private drawWatchHands(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    smoothHours: number,
    smoothMinutes: number,
    smoothSeconds: number
  ) {
    // Hour Hand
    const hourAngle = (smoothHours * Math.PI) / 6 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(hourAngle);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.lineTo(0, -14);
    ctx.lineTo(240, -6);
    ctx.lineTo(265, 0);
    ctx.lineTo(240, 6);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fillStyle = '#eae6df';
    ctx.fill();
    ctx.strokeStyle = '#c8a97e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Luminescent insert in hour hand
    ctx.beginPath();
    ctx.roundRect(40, -4, 180, 8, 4);
    ctx.fillStyle = '#99ff00';
    ctx.fill();
    ctx.restore();

    // Minute Hand
    const minuteAngle = (smoothMinutes * Math.PI) / 30 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(minuteAngle);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.lineTo(0, -11);
    ctx.lineTo(350, -4);
    ctx.lineTo(385, 0);
    ctx.lineTo(350, 4);
    ctx.lineTo(0, 11);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#c8a97e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Luminescent insert in minute hand
    ctx.beginPath();
    ctx.roundRect(50, -3, 280, 6, 3);
    ctx.fillStyle = '#99ff00';
    ctx.fill();
    ctx.restore();

    // Second Hand (Crimson and Gold Needle with counter-balance ring)
    const secondAngle = (smoothSeconds * Math.PI) / 30 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(secondAngle);
    ctx.shadowColor = 'rgba(255, 45, 85, 0.4)';
    ctx.shadowBlur = 8;

    // Counterbalance
    ctx.beginPath();
    ctx.arc(-70, 0, 14, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff2d55';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-85, 0);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = '#ff2d55';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Main long needle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(415, 0);
    ctx.strokeStyle = '#ff2d55';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrow tip
    ctx.beginPath();
    ctx.moveTo(415, -6);
    ctx.lineTo(430, 0);
    ctx.lineTo(415, 6);
    ctx.closePath();
    ctx.fillStyle = '#ff2d55';
    ctx.fill();

    ctx.restore();
  }

  public dispose() {
    this.texture.dispose();
  }
}
