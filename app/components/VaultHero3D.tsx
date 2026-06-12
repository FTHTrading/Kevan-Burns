"use client";

import { useEffect, useRef } from "react";

/**
 * VaultHero3D — CSS/Canvas animated vault door.
 * Zero external dependencies. Renders a 3D-perspective vault door
 * that slowly opens, with particle streams flowing out.
 */
export default function VaultHero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    // Resize
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const PARTICLE_COUNT = 120;
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number; color: string;
    }
    const particles: Particle[] = [];

    const spawnParticle = (cx: number, cy: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      const colors = ["#f0c84a", "#22d3ee", "#d4a017", "#ffffff"];
      particles.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 0,
        maxLife: 80 + Math.random() * 80,
        size: 1 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      tick++;

      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      bg.addColorStop(0, "rgba(11,23,51,0.4)");
      bg.addColorStop(1, "rgba(3,6,15,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Vault door ────────────────────────────────────────
      const cx = W / 2;
      const cy = H / 2;
      const doorW = Math.min(W * 0.38, 220);
      const doorH = doorW * 1.15;
      const openAngle = Math.min(tick / 400, 0.42); // slowly opens

      ctx.save();
      ctx.translate(cx, cy);

      // 3D perspective: skew left side as door opens
      const skew = openAngle * 0.6;

      // Door shadow / depth
      ctx.save();
      ctx.transform(1 - openAngle * 0.5, 0, skew * 0.5, 1, openAngle * doorW * 0.4, 0);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.roundRect(-doorW / 2 + 6, -doorH / 2 + 6, doorW, doorH, 12);
      ctx.fill();
      ctx.restore();

      // Inner glow (light from inside vault)
      const glowAlpha = Math.min(openAngle * 2.5, 0.85);
      ctx.save();
      ctx.transform(1 - openAngle * 0.5, 0, skew * 0.3, 1, 0, 0);
      const glowGrad = ctx.createRadialGradient(
        -doorW / 2 + doorW * openAngle * 0.6, 0, 0,
        -doorW / 2 + doorW * openAngle * 0.6, 0, doorH * 0.8
      );
      glowGrad.addColorStop(0, `rgba(34,211,238,${glowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(212,160,23,${glowAlpha * 0.4})`);
      glowGrad.addColorStop(1, "rgba(3,6,15,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(-doorW / 2 + doorW * openAngle * 0.6, 0, doorH * 0.7, doorH * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Door face
      ctx.save();
      ctx.transform(1 - openAngle * 0.5, 0, skew, 1, openAngle * doorW * 0.15, 0);

      // Door body
      const doorGrad = ctx.createLinearGradient(-doorW / 2, -doorH / 2, doorW / 2, doorH / 2);
      doorGrad.addColorStop(0, "#1a2d5e");
      doorGrad.addColorStop(0.4, "#122048");
      doorGrad.addColorStop(1, "#060d1f");
      ctx.fillStyle = doorGrad;
      ctx.beginPath();
      ctx.roundRect(-doorW / 2, -doorH / 2, doorW, doorH, 10);
      ctx.fill();

      // Gold border
      ctx.strokeStyle = "#d4a017";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-doorW / 2, -doorH / 2, doorW, doorH, 10);
      ctx.stroke();

      // Inner panel border
      ctx.strokeStyle = "rgba(240,200,74,0.4)";
      ctx.lineWidth = 1.5;
      const ip = 14;
      ctx.beginPath();
      ctx.roundRect(-doorW / 2 + ip, -doorH / 2 + ip, doorW - ip * 2, doorH - ip * 2, 6);
      ctx.stroke();

      // Bolts
      const boltPositions = [
        [-doorW / 2 + 20, -doorH / 2 + 20],
        [ doorW / 2 - 20, -doorH / 2 + 20],
        [-doorW / 2 + 20,  doorH / 2 - 20],
        [ doorW / 2 - 20,  doorH / 2 - 20],
      ];
      boltPositions.forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        const bGrad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 7);
        bGrad.addColorStop(0, "#f0c84a");
        bGrad.addColorStop(1, "#b88a0f");
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.strokeStyle = "#d4a017";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Center wheel / combination lock
      const wheelR = doorW * 0.18;
      const wheelRotation = tick * 0.3;
      ctx.save();
      ctx.translate(0, 0);
      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
      const wGrad = ctx.createRadialGradient(-wheelR * 0.3, -wheelR * 0.3, 2, 0, 0, wheelR);
      wGrad.addColorStop(0, "#2a3d6e");
      wGrad.addColorStop(1, "#060d1f");
      ctx.fillStyle = wGrad;
      ctx.fill();
      ctx.strokeStyle = "#d4a017";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Wheel spokes
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + (wheelRotation * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * wheelR * 0.85, Math.sin(a) * wheelR * 0.85);
        ctx.strokeStyle = "rgba(212,160,23,0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#f0c84a";
      ctx.fill();

      // Keyhole symbol
      ctx.translate(0, wheelR * 0.05);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath();
      ctx.arc(0, -4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3.5, -1);
      ctx.lineTo(3.5, -1);
      ctx.lineTo(2, 7);
      ctx.lineTo(-2, 7);
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // wheel
      ctx.restore(); // door face

      // Circuit trace lines radiating outward
      const traceCount = 12;
      for (let i = 0; i < traceCount; i++) {
        const a = (i / traceCount) * Math.PI * 2;
        const r1 = doorW * 0.6;
        const r2 = r1 + 40 + Math.sin(tick * 0.02 + i) * 20;
        const alpha = 0.1 + Math.abs(Math.sin(tick * 0.015 + i * 0.7)) * 0.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.strokeStyle = i % 3 === 0
          ? `rgba(34,211,238,${alpha})`
          : `rgba(212,160,23,${alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node dot at end
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r2, Math.sin(a) * r2, 2, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? `rgba(34,211,238,${alpha * 1.5})` : `rgba(240,200,74,${alpha * 1.5})`;
        ctx.fill();
      }

      ctx.restore(); // translate to center

      // ── Particles ────────────────────────────────────────
      if (tick % 3 === 0 && openAngle > 0.05) {
        spawnParticle(
          cx + (Math.random() - 0.5) * doorW * (1 - openAngle * 0.4),
          cy + (Math.random() - 0.5) * doorH * 0.6
        );
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy -= 0.01; // float upward
        p.life++;

        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `,${alpha})`).replace("rgb", "rgba");
        ctx.fill();
      }

      // Keep particle count capped
      while (particles.length > PARTICLE_COUNT) particles.shift();

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
}
