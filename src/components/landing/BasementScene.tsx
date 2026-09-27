"use client";

import { useEffect, useRef, useState } from "react";
import basement from "./assets/basement.jpg";

/**
 * Procedurally outpaint and extend basement.jpg across all 4 borders
 * (top ceiling/planning board, bottom concrete floor, left/right depth)
 * to avoid any void or grey cutoff areas on any aspect ratio.
 */
function createExtendedBasementImage(src: string, callback: (url: string) => void) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  img.onload = () => {
    const padX = Math.round(img.width * 0.20);
    const padY = Math.round(img.height * 0.22);
    const outW = img.width + padX * 2;
    const outH = img.height + padY * 2;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Foundation
    ctx.fillStyle = "#0a0908";
    ctx.fillRect(0, 0, outW, outH);

    // 2. Mirrored & synthesized outpainting borders
    // Top border (Ceiling & Planning wall upward extension)
    ctx.save();
    ctx.translate(padX, padY);
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, 0, img.width, padY, 0, 0, img.width, padY);
    ctx.restore();

    // Bottom border (Floor downward extension)
    ctx.save();
    ctx.translate(padX, padY + img.height);
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, img.height - padY, img.width, padY, 0, -padY, img.width, padY);
    ctx.restore();

    // Left border (Stairwell room depth extension)
    ctx.save();
    ctx.translate(padX, padY);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, padX, img.height, 0, 0, padX, img.height);
    ctx.restore();

    // Right border (Basement wall extension)
    ctx.save();
    ctx.translate(padX + img.width, padY);
    ctx.scale(-1, 1);
    ctx.drawImage(img, img.width - padX, 0, padX, img.height, -padX, 0, padX, img.height);
    ctx.restore();

    // 3. Central original photo plate (100% full original image preserved)
    ctx.drawImage(img, padX, padY);

    // 4. Subtle atmospheric border blend (outer edges only)
    const edgeGrad = ctx.createRadialGradient(outW / 2, outH / 2, outW * 0.38, outW / 2, outH / 2, outW * 0.68);
    edgeGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    edgeGrad.addColorStop(1, "rgba(4, 3, 3, 0.6)");
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, outW, outH);

    callback(canvas.toDataURL("image/jpeg", 0.94));
  };
}

/**
 * Background of the single continuous scene: the authentic basement photograph
 * with the heist planning board at the top and room ambiance at the bottom.
 */
export function BasementScene({ reducedMotion }: { reducedMotion?: boolean }) {
  const dustRef = useRef<HTMLCanvasElement>(null);
  const [extendedBg, setExtendedBg] = useState<string>(basement);

  useEffect(() => {
    createExtendedBasementImage(basement, (extendedUrl) => {
      setExtendedBg(extendedUrl);
    });
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = dustRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const COUNT = window.innerWidth < 768 ? 40 : 80;
    const motes = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -Math.random() * 0.00009 - 0.00002,
      a: Math.random() * 0.35 + 0.08,
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -0.02) {
          m.y = 1.02;
          m.x = Math.random();
        }
        if (m.x < -0.02) m.x = 1.02;
        if (m.x > 1.02) m.x = -0.02;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 202, 176, ${m.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      {/* Full-bleed extended basement plate with planning board prominently visible and bottom fully intact */}
      <div
        data-room
        className="pointer-events-none absolute inset-[-8%] bg-cover will-change-transform"
        style={{
          backgroundImage: `url(${extendedBg})`,
          backgroundPosition: "center 28%",
        }}
      />
      {/* Subtle red stairwell wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 40%, oklch(0.4 0.16 22 / 0.16), transparent 70%)," +
            "radial-gradient(50% 45% at 50% 18%, oklch(0.6 0.08 70 / 0.08), transparent 75%)",
        }}
      />
      <canvas
        ref={dustRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      />
    </div>
  );
}
