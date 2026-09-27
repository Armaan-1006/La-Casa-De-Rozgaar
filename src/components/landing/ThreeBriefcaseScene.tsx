"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import leatherTextureImg from "./assets/leather.jpg";
import paperTextureImg from "./assets/paper.jpg";

interface ThreeSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  connectedState: null | "si" | "no";
  onCaseClick?: () => void;
}

/**
 * Ultra-realistic procedural dark aged Spanish walnut / reclaimed oak texture
 * specifically color-matched to the rustic carpentry in the basement photo plate.
 */
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // 1. Rich dark walnut / chestnut gradient base
  const baseGrad = ctx.createLinearGradient(0, 0, 2048, 1024);
  baseGrad.addColorStop(0, "#140b07");
  baseGrad.addColorStop(0.2, "#1c1109");
  baseGrad.addColorStop(0.45, "#160d08");
  baseGrad.addColorStop(0.7, "#24160d");
  baseGrad.addColorStop(0.9, "#180e08");
  baseGrad.addColorStop(1, "#100804");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Longitudinal rustic plank layout (5 wide planks with deep shadow seams)
  const plankCount = 5;
  const plankHeight = 1024 / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const py = i * plankHeight;
    const toneShift = (Math.sin(i * 3.7) * 0.5 + 0.5) * 0.15;
    ctx.fillStyle = `rgba(${30 + i * 4}, ${18 + i * 2}, ${12 + i * 2}, ${toneShift})`;
    ctx.fillRect(0, py, 2048, plankHeight);

    if (i > 0) {
      // Deep dark gap crevasse
      ctx.fillStyle = "rgba(4, 2, 1, 0.96)";
      ctx.fillRect(0, py - 3, 2048, 6);

      // Micro bevel top highlight
      ctx.fillStyle = "rgba(220, 180, 140, 0.08)";
      ctx.fillRect(0, py + 3, 2048, 2);

      // Bevel bottom shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, py - 6, 2048, 3);
    }
  }

  // 3. Knot locations with realistic concentric grain distortion
  const knots = [
    { x: 380, y: 190, r: 18 },
    { x: 920, y: 720, r: 24 },
    { x: 1460, y: 340, r: 16 },
    { x: 1780, y: 860, r: 22 },
    { x: 620, y: 512, r: 14 },
  ];

  // 4. Organic continuous wood grain lines (2200 fibers with wave deflection)
  for (let i = 0; i < 2200; i++) {
    const baseY = Math.random() * 1024;
    const alpha = Math.random() * 0.22 + 0.04;
    const isDark = Math.random() > 0.35;
    ctx.strokeStyle = isDark
      ? `rgba(10, 6, 4, ${alpha * 1.3})`
      : `rgba(48, 30, 18, ${alpha * 0.85})`;
    ctx.lineWidth = Math.random() * 2.2 + 0.6;

    ctx.beginPath();
    let prevX = 0;
    let prevY = baseY;
    ctx.moveTo(prevX, prevY);

    for (let x = 0; x <= 2048; x += 48) {
      let y = baseY + Math.sin(x * 0.006 + baseY * 0.05) * 12 + Math.cos(x * 0.015) * 5;

      for (const k of knots) {
        const dx = x - k.x;
        const dy = y - k.y;
        const dist = Math.hypot(dx, dy);
        if (dist < k.r * 6.5) {
          const force = (1 - dist / (k.r * 6.5)) * k.r * 1.8;
          y += dy > 0 ? force : -force;
        }
      }

      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 5. Draw realistic knot cores with concentric growth rings
  knots.forEach((k) => {
    const knotGrad = ctx.createRadialGradient(k.x, k.y, 2, k.x, k.y, k.r);
    knotGrad.addColorStop(0, "rgba(5, 3, 2, 0.98)");
    knotGrad.addColorStop(0.6, "rgba(18, 10, 6, 0.9)");
    knotGrad.addColorStop(1, "rgba(35, 20, 12, 0.4)");
    ctx.fillStyle = knotGrad;
    ctx.beginPath();
    ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2);
    ctx.fill();

    for (let r = 4; r < k.r * 3.5; r += 3.5) {
      ctx.strokeStyle = `rgba(10, 6, 3, ${Math.random() * 0.4 + 0.2})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(k.x, k.y, r * 1.4, r * 0.85, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // 6. Surface age & distress marks: Coffee cup rings & drafting scratches
  ctx.strokeStyle = "rgba(18, 10, 5, 0.38)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(1220, 420, 54, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(200, 160, 120, 0.14)";
  ctx.lineWidth = 1;
  for (let s = 0; s < 25; s++) {
    const sx = Math.random() * 1900 + 70;
    const sy = Math.random() * 900 + 60;
    const len = Math.random() * 80 + 20;
    const ang = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    ctx.stroke();
  }

  // 7. Perimeter dark vignette & contact shading
  const vignette = ctx.createRadialGradient(1024, 512, 600, 1024, 512, 1150);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(4, 2, 1, 0.65)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 2048, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural roughness map for wood to create realistic satin specular reflections.
 */
function createWoodRoughnessTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#959595";
  ctx.fillRect(0, 0, 1024, 512);

  const plankHeight = 512 / 5;
  for (let i = 1; i < 5; i++) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, i * plankHeight - 2, 1024, 4);
  }

  for (let i = 0; i < 600; i++) {
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(220,220,220,0.25)" : "rgba(80,80,80,0.25)";
    ctx.fillRect(0, y, 1024, Math.random() * 3 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural quilted diamond-tufted crimson velvet interior for the suitcase.
 */
function createQuiltedVelvetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createRadialGradient(512, 512, 80, 512, 512, 680);
  bgGrad.addColorStop(0, "#520c14");
  bgGrad.addColorStop(0.5, "#35070c");
  bgGrad.addColorStop(1, "#180205");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  const step = 128;
  ctx.strokeStyle = "rgba(220, 60, 75, 0.45)";
  ctx.lineWidth = 3;

  for (let i = -1024; i < 2048; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 1024, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 1024);
    ctx.lineTo(i + 1024, 0);
    ctx.stroke();
  }

  for (let y = 0; y < 1024; y += step) {
    for (let x = 0; x < 1024; x += step) {
      const cx = x + step / 2;
      const cy = y + step / 2;

      const tuftGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, step / 1.4);
      tuftGrad.addColorStop(0, "rgba(245, 80, 95, 0.35)");
      tuftGrad.addColorStop(0.45, "rgba(160, 25, 38, 0.18)");
      tuftGrad.addColorStop(1, "rgba(0, 0, 0, 0.65)");
      ctx.fillStyle = tuftGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, step / 1.5, 0, Math.PI * 2);
      ctx.fill();

      const buttonGrad = ctx.createRadialGradient(x, y, 2, x, y, 10);
      buttonGrad.addColorStop(0, "rgba(10, 1, 3, 0.98)");
      buttonGrad.addColorStop(0.5, "rgba(50, 6, 10, 0.85)");
      buttonGrad.addColorStop(1, "rgba(180, 40, 50, 0.2)");
      ctx.fillStyle = buttonGrad;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Ultra-high-resolution Manila Briefing Folder reading "LA CASA DE ROZGAAR"
 */
function createPamphletTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createLinearGradient(0, 0, 1536, 2048);
  bgGrad.addColorStop(0, "#b89e78");
  bgGrad.addColorStop(0.5, "#a68c66");
  bgGrad.addColorStop(1, "#947b56");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1536, 2048);

  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * 1536;
    const y = Math.random() * 2048;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,240,210,0.06)" : "rgba(40,25,10,0.06)";
    ctx.fillRect(x, y, Math.random() * 4 + 1, 1);
  }

  ctx.strokeStyle = "rgba(50, 30, 20, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 1416, 1928);

  ctx.fillStyle = "#c9182b";
  ctx.fillRect(60, 60, 1416, 180);

  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.arc(140, 150, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1408";
  ctx.beginPath();
  ctx.arc(140, 150, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px monospace";
  ctx.textAlign = "center";
  ctx.fillText("● EXPEDIENTE DE OPERACIÓN · LCDR-1949 ●", 768, 165);

  ctx.fillStyle = "#140f0c";
  ctx.font = "900 110px 'Oswald', sans-serif";
  ctx.fillText("LA CASA DE", 768, 380);

  ctx.fillStyle = "#c9182b";
  ctx.font = "900 130px 'Oswald', sans-serif";
  ctx.fillText("ROZGAAR", 768, 510);

  ctx.fillStyle = "#382516";
  ctx.font = "bold 46px monospace";
  ctx.fillText("THE HOUSE OF EMPLOYMENT", 768, 600);

  ctx.strokeStyle = "#c9182b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(180, 660);
  ctx.lineTo(1356, 660);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#1e140d";
  ctx.font = "bold 38px monospace";
  ctx.fillText("OPERATIONAL BLUEPRINT // RECLUTAMIENTO", 140, 760);

  const specs = [
    "SECTOR: GLOBAL TALENT & WORKFORCE INTELLIGENCE",
    "CLEARANCE: NIVEL 5 (CONFIDENTIAL // AUTHORIZED)",
    "MISSION: CAREER ORCHESTRATION & SKILL ARBITRAGE",
    "AUTHORIZATION: EL PROFESOR · COMMAND CODE: 9482",
  ];

  ctx.font = "32px monospace";
  specs.forEach((s, idx) => {
    ctx.fillText(s, 140, 840 + idx * 75);
  });

  ctx.fillStyle = "rgba(10, 6, 4, 0.95)";
  ctx.fillRect(140, 1170, 720, 36);
  ctx.fillRect(140, 1220, 560, 36);

  ctx.fillStyle = "rgba(20, 14, 10, 0.08)";
  ctx.fillRect(140, 1290, 1256, 380);
  ctx.strokeStyle = "rgba(201, 24, 43, 0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(140, 1290, 1256, 380);

  ctx.fillStyle = "#c9182b";
  ctx.font = "bold 32px monospace";
  ctx.fillText("● 8 CORE PLATFORM CAPABILITIES:", 170, 1345);

  const miniPillars = [
    "01. Market-Aware Skill Intelligence",
    "02. Intelligent Role Matching",
    "03. Automated Skill-Gap Analysis",
    "04. Secure Skill Assessment",
    "05. Personalized Learning Pathways",
    "06. Career Simulation Sandbox",
    "07. Talent Intelligence Command",
    "08. Strategic Workforce Planning",
  ];

  ctx.font = "26px monospace";
  ctx.fillStyle = "#1a120c";
  miniPillars.forEach((p, idx) => {
    const col = idx < 4 ? 170 : 780;
    const row = 1400 + (idx % 4) * 58;
    ctx.fillText(p, col, row);
  });

  ctx.save();
  ctx.translate(768, 1810);
  ctx.rotate(-0.12);
  ctx.strokeStyle = "rgba(201, 24, 43, 0.88)";
  ctx.lineWidth = 8;
  ctx.strokeRect(-380, -75, 760, 150);
  ctx.fillStyle = "rgba(201, 24, 43, 0.92)";
  ctx.font = "900 52px monospace";
  ctx.textAlign = "center";
  ctx.fillText("TOP SECRET // RECLUTAMIENTO", 0, 15);
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Ultra-high-resolution Classified Offer Document inside the briefcase.
 */
function createClassifiedLetterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createLinearGradient(0, 0, 1536, 2048);
  bgGrad.addColorStop(0, "#ece4d6");
  bgGrad.addColorStop(0.5, "#ded4c2");
  bgGrad.addColorStop(1, "#d0c3ae");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1536, 2048);

  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * 1536;
    const y = Math.random() * 2048;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(30,20,10,0.05)";
    ctx.fillRect(x, y, Math.random() * 3 + 1, 1);
  }

  ctx.strokeStyle = "rgba(40, 20, 15, 0.5)";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 1416, 1928);
  ctx.strokeStyle = "rgba(201, 24, 43, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(72, 72, 1392, 1904);

  ctx.fillStyle = "#c9182b";
  ctx.fillRect(60, 60, 1416, 140);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px monospace";
  ctx.textAlign = "left";
  ctx.fillText("● CLASSIFIED DOSSIER // LCDR-1949", 100, 145);

  ctx.font = "bold 34px monospace";
  ctx.textAlign = "right";
  ctx.fillText("LEVEL 5 CLEARANCE ●", 1436, 145);

  ctx.textAlign = "left";
  ctx.fillStyle = "#120c09";
  ctx.font = "900 68px 'Oswald', sans-serif";
  ctx.fillText("YOU HAVE BEEN SELECTED", 100, 290);
  ctx.fillStyle = "#c9182b";
  ctx.fillText("FOR THE OPERATION.", 100, 365);

  ctx.fillStyle = "#2c1a12";
  ctx.font = "bold 30px monospace";
  ctx.fillText("CENTRAL COMMAND · LA CASA DE ROZGAAR", 100, 445);

  ctx.strokeStyle = "#c9182b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(100, 470);
  ctx.lineTo(1436, 470);
  ctx.stroke();

  ctx.fillStyle = "#1c120c";
  ctx.font = "32px 'Barlow', sans-serif";
  ctx.fillText("Welcome to La Casa De Rozgaar (The House of Employment).", 100, 545);
  ctx.fillText("You are invited into an intelligent talent and workforce ecosystem", 100, 595);
  ctx.fillText("orchestrating careers, verified skills, and mission-critical matching.", 100, 645);

  ctx.font = "bold 32px monospace";
  ctx.fillStyle = "#c9182b";
  ctx.fillText("WHAT YOU RECEIVE BY JOINING THE ECOSYSTEM:", 100, 740);

  const pillars = [
    "01. Market-Aware Skill Intelligence — Real-time tracking of global hiring demand.",
    "02. Intelligent Role Matching — Algorithmic alignment with strategic missions.",
    "03. Automated Skill-Gap Analysis — Tactical diagnostics for accelerated mastery.",
    "04. Secure Skill Assessment — Anti-cheat cryptographically verified evaluations.",
    "05. Personalized Learning Pathways — Dynamic curriculum tailored to gaps.",
    "06. Career Simulation Sandbox — Interactive job simulations testing execution.",
    "07. Talent Intelligence Command — Macro analytics for recruiter pipelines.",
    "08. Strategic Workforce Planning — Enterprise modeling for transition readiness.",
  ];

  ctx.font = "27px monospace";
  ctx.fillStyle = "#180f0a";
  pillars.forEach((p, idx) => {
    ctx.fillText(p, 100, 815 + idx * 64);
  });

  ctx.save();
  ctx.translate(1180, 1620);
  ctx.rotate(-0.14);
  ctx.strokeStyle = "rgba(201, 24, 43, 0.88)";
  ctx.lineWidth = 6;
  ctx.strokeRect(-180, -70, 360, 140);
  ctx.fillStyle = "rgba(201, 24, 43, 0.92)";
  ctx.font = "bold 34px monospace";
  ctx.textAlign = "center";
  ctx.fillText("AUTORIZADO", 0, -10);
  ctx.font = "bold 26px monospace";
  ctx.fillText("EL PROFESOR", 0, 38);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.font = "italic 62px 'Brush Script MT', cursive, serif";
  ctx.fillStyle = "#140c08";
  ctx.fillText("El Profesor", 120, 1680);

  ctx.font = "bold 22px monospace";
  ctx.fillStyle = "#8a1d27";
  ctx.fillText("OPERATIONAL COMMAND · SIGNED & VERIFIED // CODE: LCDR-9482", 120, 1735);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Ultra-high-resolution Platform intelligence dossier inside right side of briefcase.
 */
function createPlatformDocTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#c8b89e";
  ctx.fillRect(0, 0, 1536, 2048);

  ctx.strokeStyle = "rgba(70, 30, 25, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 1436, 1948);

  ctx.fillStyle = "#c9182b";
  ctx.font = "bold 40px monospace";
  ctx.textAlign = "left";
  ctx.fillText("EXP. LCDR-PLATFORM // ARCHITECTURE", 100, 130);

  ctx.fillStyle = "#120c08";
  ctx.font = "900 86px 'Oswald', sans-serif";
  ctx.fillText("LA CASA DE ROZGAAR", 100, 235);

  ctx.fillStyle = "#a8202b";
  ctx.font = "bold 38px monospace";
  ctx.fillText("THE HOUSE OF EMPLOYMENT · TACTICAL MATRIX", 100, 300);

  ctx.strokeStyle = "#120c08";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(100, 335);
  ctx.lineTo(1436, 335);
  ctx.stroke();

  ctx.fillStyle = "#22160e";
  ctx.font = "32px 'Barlow', sans-serif";
  ctx.fillText("An intelligent talent ecosystem connecting real-time market intelligence,", 100, 420);
  ctx.fillText("cryptographically verified skills, tactical role simulations,", 100, 470);
  ctx.fillText("and strategic enterprise workforce orchestration.", 100, 520);

  const cx = 768;
  const cy = 920;
  const radius = 260;
  const axes = [
    "Market Intel",
    "Role Match",
    "Skill Gap",
    "Assessment",
    "Simulations",
    "Workforce Plan",
  ];

  ctx.strokeStyle = "rgba(40, 25, 15, 0.3)";
  ctx.lineWidth = 2;
  for (let r = 0.25; r <= 1.0; r += 0.25) {
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const ang = (a * Math.PI) / 3 - Math.PI / 2;
      const x = cx + Math.cos(ang) * radius * r;
      const y = cy + Math.sin(ang) * radius * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(201, 24, 43, 0.25)";
  ctx.strokeStyle = "#c9182b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  const values = [0.95, 0.9, 0.88, 0.98, 0.92, 0.85];
  for (let a = 0; a < 6; a++) {
    const ang = (a * Math.PI) / 3 - Math.PI / 2;
    const x = cx + Math.cos(ang) * radius * values[a];
    const y = cy + Math.sin(ang) * radius * values[a];
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#120c08";
  ctx.font = "bold 26px monospace";
  ctx.textAlign = "center";
  axes.forEach((axis, a) => {
    const ang = (a * Math.PI) / 3 - Math.PI / 2;
    const x = cx + Math.cos(ang) * (radius + 55);
    const y = cy + Math.sin(ang) * (radius + 55) + 8;
    ctx.fillText(axis, x, y);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "#c9182b";
  ctx.font = "bold 32px monospace";
  ctx.fillText("● VERIFIED SYSTEM PROTOCOLS:", 100, 1340);

  const capabilities = [
    "» High-integrity anti-cheat technical evaluations",
    "» Dynamic talent pipeline forecasting algorithms",
    "» Accelerated competence acquisition modules",
    "» Cryptographic skill verification blockchain ledger",
  ];

  ctx.font = "28px monospace";
  ctx.fillStyle = "#180e08";
  capabilities.forEach((c, idx) => {
    ctx.fillText(c, 100, 1420 + idx * 65);
  });

  ctx.font = "italic 48px serif";
  ctx.fillStyle = "#140c08";
  ctx.fillText("El Profesor", 1100, 1820);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Procedural CRT Monitor Phosphor Screen texture.
 */
function createCRTTexture(connected: null | "si" | "no", time = 0): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createRadialGradient(512, 384, 80, 512, 384, 560);
  bgGrad.addColorStop(0, "#0a2814");
  bgGrad.addColorStop(0.8, "#041408");
  bgGrad.addColorStop(1, "#010803");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 768);

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  for (let y = 0; y < 768; y += 4) {
    ctx.fillRect(0, y, 1024, 2);
  }

  ctx.strokeStyle = "rgba(40, 255, 100, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 960, 704);

  ctx.fillStyle = "#33ff66";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "left";
  ctx.fillText("LCDR TERMINAL 01 // OPERATIONAL COMMAND", 56, 90);

  ctx.strokeStyle = "rgba(51, 255, 102, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 110);
  ctx.lineTo(968, 110);
  ctx.stroke();

  if (connected === "si") {
    ctx.fillStyle = "#55ff77";
    ctx.font = "bold 32px monospace";
    ctx.fillText(">> DIRECT LINK ESTABLISHED", 56, 200);
    ctx.fillText(">> PROFESSOR AUDIO PROTOCOL: ACTIVE", 56, 260);
    ctx.fillText(">> CARRIER: 148.50 MHz (SECURE ENCRYPTION)", 56, 320);

    ctx.fillStyle = "#d4af37";
    ctx.font = "28px monospace";
    ctx.fillText(">> DECRYPTING OPERATION DOSSIER...", 56, 420);
    ctx.fillText(">> BRIEFCASE MECHANISM UNLOCKED", 56, 480);

    if (Math.sin(time * 6) > 0) {
      ctx.fillStyle = "#55ff77";
      ctx.fillRect(56, 540, 24, 36);
    }
  } else if (connected === "no") {
    ctx.fillStyle = "#ffaa44";
    ctx.font = "bold 32px monospace";
    ctx.fillText(">> RADIO SILENCE MAINTAINED", 56, 200);
    ctx.fillText(">> STANDALONE DOSSIER MODE", 56, 260);
    ctx.fillText(">> PROCEEDING WITH INSPECTION", 56, 320);
  } else {
    ctx.fillStyle = "#33ff66";
    ctx.font = "26px monospace";
    ctx.fillText("STATUS: ENCRYPTED CARRIER DETECTED", 56, 180);
    ctx.fillText("NODE: PROFESSOR DIRECT LINK [148.50 MHz]", 56, 235);
    ctx.fillText("CLEARANCE: LEVEL 5 REQUIRED", 56, 290);

    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 30px monospace";
    ctx.fillText(">> AWAITING RESPONSE: CONNECT TO PROFESSOR?", 56, 390);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px monospace";
    ctx.fillText("SELECT [ SI ] ON SECURE TERMINAL", 56, 460);

    if (Math.sin(time * 5) > 0) {
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(56, 530, 22, 34);
    }
  }

  ctx.fillStyle = "rgba(51, 255, 102, 0.55)";
  ctx.font = "20px monospace";
  ctx.fillText("SYS: SECURE-OS v4.2 // LA CASA DE ROZGAAR", 56, 690);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Ultra-detailed Bank of Spain vault architectural CAD blueprint.
 */
function createBlueprintTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1536;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createLinearGradient(0, 0, 2048, 1536);
  bgGrad.addColorStop(0, "#081d30");
  bgGrad.addColorStop(0.5, "#0b2640");
  bgGrad.addColorStop(1, "#071726");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1536);

  ctx.strokeStyle = "rgba(80, 180, 240, 0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 2048; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1536);
    ctx.stroke();
  }
  for (let y = 0; y < 1536; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(100, 200, 255, 0.16)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1536);
    ctx.stroke();
  }
  for (let y = 0; y < 1536; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(180, 235, 255, 0.9)";
  ctx.lineWidth = 5;

  ctx.strokeRect(180, 160, 1688, 1216);
  ctx.strokeRect(240, 220, 1568, 1096);

  ctx.strokeStyle = "rgba(120, 210, 255, 0.35)";
  ctx.lineWidth = 2;
  for (let x = 180; x < 1868; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 160);
    ctx.lineTo(x + 50, 220);
    ctx.stroke();
  }

  const cx = 1024;
  const cy = 768;

  ctx.strokeStyle = "rgba(200, 240, 255, 0.95)";
  ctx.lineWidth = 6;
  ctx.strokeRect(cx - 380, cy - 340, 760, 680);

  ctx.beginPath();
  ctx.arc(cx, cy, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const ang = (i * Math.PI) / 6;
    const px1 = cx + Math.cos(ang) * 140;
    const py1 = cy + Math.sin(ang) * 140;
    const px2 = cx + Math.cos(ang) * 235;
    const py2 = cy + Math.sin(ang) * 235;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(140, 220, 255, 0.85)";
  ctx.lineWidth = 4;
  ctx.strokeRect(280, 300, 280, 400);
  ctx.strokeRect(1488, 300, 280, 400);

  ctx.beginPath();
  ctx.moveTo(cx, 160);
  ctx.lineTo(cx, cy - 340);
  ctx.moveTo(cx, cy + 340);
  ctx.lineTo(cx, 1376);
  ctx.moveTo(180, cy);
  ctx.lineTo(cx - 380, cy);
  ctx.moveTo(cx + 380, cy);
  ctx.lineTo(1868, cy);
  ctx.stroke();

  ctx.strokeStyle = "rgba(220, 245, 255, 0.75)";
  ctx.lineWidth = 2.5;
  ctx.fillStyle = "rgba(220, 245, 255, 0.9)";
  ctx.font = "bold 26px monospace";

  ctx.fillText("◄─── 24.80 m ───►", cx - 120, 200);
  ctx.fillText("◄── Ø 4.40 m ──►", cx - 100, cy + 8);
  ctx.fillText("NIVEL -3 · CÁMARA ACORAZADA", cx - 210, cy - 250);
  ctx.fillText("SISTEMA DE INUNDACIÓN · 12.4 BAR", 300, 520);
  ctx.fillText("ACCESO VENTILACIÓN // INFILTRACIÓN", 1040, 520);

  ctx.save();
  ctx.translate(620, 1140);
  ctx.rotate(-0.06);
  ctx.fillStyle = "rgba(235, 45, 65, 0.92)";
  ctx.font = "bold 32px 'Barlow', sans-serif";
  ctx.fillText("● PUNTO CRÍTICO DE PERFORACIÓN (60 min)", 0, 0);
  ctx.fillText("● PRESIÓN DE AGUA NEUTRALIZADA", 0, 44);
  ctx.restore();

  ctx.fillStyle = "rgba(5, 18, 30, 0.9)";
  ctx.fillRect(1300, 1100, 568, 276);
  ctx.strokeStyle = "rgba(180, 235, 255, 0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1300, 1100, 568, 276);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px monospace";
  ctx.fillText("LA CASA DE ROZGAAR", 1330, 1150);

  ctx.fillStyle = "#70c0ff";
  ctx.font = "22px monospace";
  ctx.fillText("PLANO DE OPERACIONES // BANCO DE ESPAÑA", 1330, 1195);
  ctx.fillText("DWG NO: LCDR-DWG-1949-REV.04", 1330, 1240);
  ctx.fillText("ESCALA: 1:50 · APROBADO: EL PROFESOR", 1330, 1285);
  ctx.fillText("CLEARANCE: NIVEL 5 // CLASIFICADO", 1330, 1330);

  ctx.strokeStyle = "rgba(18, 8, 4, 0.4)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(580, 480, 95, 0, Math.PI * 2);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Soft radial blur texture for realistic ambient contact shadows beneath the table and props.
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
  grad.addColorStop(0, "rgba(0,0,0,0.88)");
  grad.addColorStop(0.35, "rgba(0,0,0,0.55)");
  grad.addColorStop(0.7, "rgba(0,0,0,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 3D WebGL Scene containing the realistic Planning Table, CRT Computer Terminal,
 * and high-fidelity Leather Briefcase with plush quilted velvet interior.
 */
export function ThreeBriefcaseScene({
  scrollProgressRef,
  connectedState,
  onCaseClick,
}: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const crtTextureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    // SCENE SETUP (Transparent WebGL overlaid precisely onto room plate)
    const scene = new THREE.Scene();

    // Table coordinates - realistically scaled to match room depth
    const tableThickness = 0.08;
    const tableY = -1.55;
    const tableTopY = tableY + tableThickness / 2; // -1.51
    const tableZ = -5.8; // Positioned naturally in room depth
    const tableW = 3.9; // Scaled down to realistic rustic planning desk proportions
    const tableD = 2.05;
    const legHeight = 1.30;
    const floorY = tableY - legHeight; // -2.85

    // CAMERA: Starts at natural chest/eye-level (Y = 0.80, Z = 7.5) with shallow downward pitch looking at table center
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.80, 7.5);
    camera.lookAt(0, -1.35, tableZ);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();
    const leatherTexture = textureLoader.load(leatherTextureImg);
    leatherTexture.wrapS = THREE.RepeatWrapping;
    leatherTexture.wrapT = THREE.RepeatWrapping;
    leatherTexture.repeat.set(2, 2);

    const paperTexture = textureLoader.load(paperTextureImg);
    const woodTexture = createWoodTexture();
    const woodRoughnessTexture = createWoodRoughnessTexture();
    const quiltedVelvetTexture = createQuiltedVelvetTexture();
    const pamphletTexture = createPamphletTexture();
    const platformDocTexture = createPlatformDocTexture();
    const classifiedLetterTexture = createClassifiedLetterTexture();
    const blueprintTexture = createBlueprintTexture();
    const contactShadowTexture = createContactShadowTexture();

    // LIGHTS (Matched to atmospheric warm basement room)
    // 1. Ambient warm fill matching room bounce
    const ambientLight = new THREE.AmbientLight(0x281f18, 1.9);
    scene.add(ambientLight);

    // 2. Warm tungsten overhead spotlight matching the room's pendant lamp
    const tableSpot = new THREE.SpotLight(0xfce6c4, 5.6, 20, Math.PI / 3.2, 0.65, 1.2);
    tableSpot.position.set(-0.15, 4.2, tableZ + 1.0);
    tableSpot.castShadow = true;
    tableSpot.shadow.mapSize.width = 1024;
    tableSpot.shadow.mapSize.height = 1024;
    tableSpot.shadow.bias = -0.001;
    scene.add(tableSpot);
    tableSpot.target.position.set(-0.15, tableTopY, tableZ + 0.15);
    scene.add(tableSpot.target);

    // 3. Soft warm room fill
    const roomFlood = new THREE.DirectionalLight(0xf0dfca, 1.3);
    roomFlood.position.set(0.5, 4.5, 3.0);
    scene.add(roomFlood);

    // 4. Crimson stairwell atmospheric wash matching the left doorway
    const redLight = new THREE.PointLight(0xb81828, 2.6, 12);
    redLight.position.set(-5.5, 1.5, -3.5);
    scene.add(redLight);

    // 5. CRT terminal green phosphor glow
    const crtGlow = new THREE.PointLight(0x33ff66, 1.4, 4.5);
    crtGlow.position.set(1.25, tableTopY + 0.45, tableZ + 0.05);
    scene.add(crtGlow);

    // 6. Case interior realistic soft warm glow (subtle reflection on velvet and paper)
    const caseLight = new THREE.PointLight(0xff9933, 0, 3.0);
    caseLight.position.set(-0.15, tableTopY + 0.25, tableZ + 0.15);
    scene.add(caseLight);

    // MATERIALS
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughnessMap: woodRoughnessTexture,
      roughness: 0.68,
      metalness: 0.12,
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      map: leatherTexture,
      color: 0x2e1a14,
      roughness: 0.5,
      metalness: 0.18,
    });

    const velvetMat = new THREE.MeshStandardMaterial({
      map: quiltedVelvetTexture,
      roughness: 0.88,
      metalness: 0.08,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xe6c250,
      metalness: 0.92,
      roughness: 0.22,
    });

    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x2b2d30,
      metalness: 0.75,
      roughness: 0.4,
    });

    // MASTER ROOT SCENE GROUP
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // -------------------------------------------------------------
    // 1. THE PLANNING TABLE (Stationary, grounded in room depth)
    // -------------------------------------------------------------
    const tableGroup = new THREE.Group();
    sceneGroup.add(tableGroup);

    // Tabletop
    const tabletop = new THREE.Mesh(
      new THREE.BoxGeometry(tableW, tableThickness, tableD),
      darkWoodMat,
    );
    tabletop.position.set(0, tableY, tableZ);
    tabletop.receiveShadow = true;
    tabletop.castShadow = true;
    tableGroup.add(tabletop);

    // Under-table Apron Frame (rustic carpentry)
    const apronMat = darkWoodMat;
    const apronFront = new THREE.Mesh(
      new THREE.BoxGeometry(tableW - 0.3, 0.12, 0.05),
      apronMat,
    );
    apronFront.position.set(0, tableY - 0.08, tableZ + tableD / 2 - 0.14);
    apronFront.castShadow = true;
    tableGroup.add(apronFront);

    const apronBack = new THREE.Mesh(
      new THREE.BoxGeometry(tableW - 0.3, 0.12, 0.05),
      apronMat,
    );
    apronBack.position.set(0, tableY - 0.08, tableZ - tableD / 2 + 0.14);
    apronBack.castShadow = true;
    tableGroup.add(apronBack);

    const apronSideLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.12, tableD - 0.3),
      apronMat,
    );
    apronSideLeft.position.set(-tableW / 2 + 0.14, tableY - 0.08, tableZ);
    apronSideLeft.castShadow = true;
    tableGroup.add(apronSideLeft);

    const apronSideRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.12, tableD - 0.3),
      apronMat,
    );
    apronSideRight.position.set(tableW / 2 - 0.14, tableY - 0.08, tableZ);
    apronSideRight.castShadow = true;
    tableGroup.add(apronSideRight);

    // Table legs
    const legGeo = new THREE.BoxGeometry(0.12, legHeight, 0.12);
    const legMat = darkWoodMat;
    const legX = tableW / 2 - 0.16;
    const legZ = tableD / 2 - 0.16;
    const legPositions = [
      [-legX, tableY - legHeight / 2, tableZ - legZ],
      [legX, tableY - legHeight / 2, tableZ - legZ],
      [-legX, tableY - legHeight / 2, tableZ + legZ],
      [legX, tableY - legHeight / 2, tableZ + legZ],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    // Lower Stretchers (Heavy rustic table crossbeams)
    const stretcherLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, tableD - 0.32),
      legMat,
    );
    stretcherLeft.position.set(-legX, floorY + 0.22, tableZ);
    tableGroup.add(stretcherLeft);

    const stretcherRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, tableD - 0.32),
      legMat,
    );
    stretcherRight.position.set(legX, floorY + 0.22, tableZ);
    tableGroup.add(stretcherRight);

    const stretcherCenter = new THREE.Mesh(
      new THREE.BoxGeometry(tableW - 0.32, 0.08, 0.08),
      legMat,
    );
    stretcherCenter.position.set(0, floorY + 0.22, tableZ);
    tableGroup.add(stretcherCenter);

    // Ambient Floor Contact Shadow Plane (grounds the table into the room floor)
    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(tableW * 1.35, tableD * 1.45),
      new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        opacity: 0.76,
        depthWrite: false,
      }),
    );
    floorShadow.position.set(0, floorY + 0.01, tableZ);
    floorShadow.rotation.x = -Math.PI / 2;
    scene.add(floorShadow);

    // -------------------------------------------------------------
    // 2. VINTAGE CRT COMPUTER TERMINAL (On table desk)
    // -------------------------------------------------------------
    const computerGroup = new THREE.Group();
    sceneGroup.add(computerGroup);
    computerGroup.position.set(1.25, tableTopY, tableZ + 0.05);
    computerGroup.rotation.y = -0.30;

    // Contact shadow beneath CRT monitor & keyboard
    const crtShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
      }),
    );
    crtShadow.position.set(1.25, tableTopY + 0.001, tableZ + 0.1);
    crtShadow.rotation.x = -Math.PI / 2;
    sceneGroup.add(crtShadow);

    // CRT Housing
    const crtCaseMat = new THREE.MeshStandardMaterial({
      color: 0xd6cebe,
      roughness: 0.65,
      metalness: 0.1,
    });

    const crtMainBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.64, 0.68),
      crtCaseMat,
    );
    crtMainBody.position.set(0, 0.39, 0);
    crtMainBody.castShadow = true;
    crtMainBody.receiveShadow = true;
    computerGroup.add(crtMainBody);

    // CRT Bezel
    const crtBezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.52, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x343638, roughness: 0.7 }),
    );
    crtBezel.position.set(0, 0.39, 0.35);
    computerGroup.add(crtBezel);

    // Screen Glass
    const crtTexture = createCRTTexture(connectedState, 0);
    crtTextureRef.current = crtTexture;
    const crtScreenMat = new THREE.MeshBasicMaterial({
      map: crtTexture,
    });
    const crtScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.60, 0.44),
      crtScreenMat,
    );
    crtScreen.position.set(0, 0.39, 0.385);
    computerGroup.add(crtScreen);

    // CRT Power LED
    const crtLedMat = new THREE.MeshBasicMaterial({
      color: connectedState === "si" ? 0x22ff55 : 0xff3322,
    });
    const crtLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 12, 12),
      crtLedMat,
    );
    crtLed.position.set(0.26, 0.17, 0.37);
    computerGroup.add(crtLed);

    // Mechanical Keyboard
    const kbBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.045, 0.26),
      crtCaseMat,
    );
    kbBody.position.set(0, 0.025, 0.58);
    kbBody.rotation.x = 0.08;
    kbBody.castShadow = true;
    computerGroup.add(kbBody);

    // Keyboard Keybed
    const kbBed = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.015, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x222426, roughness: 0.8 }),
    );
    kbBed.position.set(0, 0.05, 0.58);
    kbBed.rotation.x = 0.08;
    computerGroup.add(kbBed);

    // -------------------------------------------------------------
    // 3. TABLE PROPS: BLUEPRINTS, PAMPHLET, DRAFTING TOOLS
    // -------------------------------------------------------------
    // Bank of Spain Blueprints (Left)
    const blueprint = new THREE.Mesh(
      new THREE.PlaneGeometry(0.98, 0.74),
      new THREE.MeshStandardMaterial({
        map: blueprintTexture,
        roughness: 0.85,
      }),
    );
    blueprint.position.set(-1.15, tableTopY + 0.003, tableZ - 0.05);
    blueprint.rotation.x = -Math.PI / 2;
    blueprint.rotation.z = 0.08;
    blueprint.receiveShadow = true;
    tableGroup.add(blueprint);

    // Manila Pamphlet: "LA CASA DE ROZGAAR"
    const pamphlet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.78),
      new THREE.MeshStandardMaterial({
        map: pamphletTexture,
        roughness: 0.85,
      }),
    );
    pamphlet.position.set(-1.05, tableTopY + 0.006, tableZ + 0.28);
    pamphlet.rotation.x = -Math.PI / 2;
    pamphlet.rotation.z = -0.12;
    pamphlet.receiveShadow = true;
    tableGroup.add(pamphlet);

    // Brass drafting calipers / compass resting on blueprint
    const caliperMat = brassMat;
    const caliperArm1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.008, 0.22),
      caliperMat,
    );
    caliperArm1.position.set(-1.35, tableTopY + 0.01, tableZ - 0.15);
    caliperArm1.rotation.y = 0.35;
    tableGroup.add(caliperArm1);

    const caliperArm2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.008, 0.22),
      caliperMat,
    );
    caliperArm2.position.set(-1.30, tableTopY + 0.01, tableZ - 0.15);
    caliperArm2.rotation.y = -0.35;
    tableGroup.add(caliperArm2);

    // Red tactical pencil
    const pencilMat = new THREE.MeshStandardMaterial({ color: 0xd02030, roughness: 0.5 });
    const pencil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.24, 8),
      pencilMat,
    );
    pencil.position.set(-0.75, tableTopY + 0.008, tableZ + 0.45);
    pencil.rotation.z = Math.PI / 2;
    pencil.rotation.y = 0.22;
    tableGroup.add(pencil);

    // -------------------------------------------------------------
    // 4. THE HERO LEATHER BRIEFCASE (Resting on table, fully illuminated)
    // -------------------------------------------------------------
    const briefcaseGroup = new THREE.Group();
    sceneGroup.add(briefcaseGroup);
    briefcaseGroup.position.set(-0.15, tableTopY, tableZ + 0.15);

    const caseW = 1.62;
    const caseD = 1.08;
    const caseH = 0.18;
    const trayHeight = 0.09;

    // Contact shadow plane directly beneath the suitcase onto the table
    const caseShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(caseW * 1.25, caseD * 1.3),
      new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    caseShadow.position.set(-0.15, tableTopY + 0.002, tableZ + 0.15);
    caseShadow.rotation.x = -Math.PI / 2;
    sceneGroup.add(caseShadow);

    // --- BOTTOM TRAY ---
    const trayGroup = new THREE.Group();
    briefcaseGroup.add(trayGroup);

    // Exterior leather bottom shell
    const trayBase = new THREE.Mesh(
      new THREE.BoxGeometry(caseW, trayHeight, caseD),
      leatherMat,
    );
    trayBase.position.set(0, trayHeight / 2, 0);
    trayBase.castShadow = true;
    trayBase.receiveShadow = true;
    trayGroup.add(trayBase);

    // Quilted velvet lining floor
    const velvetFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(caseW - 0.06, caseD - 0.06),
      velvetMat,
    );
    velvetFloor.position.set(0, trayHeight - 0.002, 0);
    velvetFloor.rotation.x = -Math.PI / 2;
    velvetFloor.receiveShadow = true;
    trayGroup.add(velvetFloor);

    // Gunmetal inner rim trim
    const innerRim = new THREE.Mesh(
      new THREE.BoxGeometry(caseW - 0.03, 0.015, caseD - 0.03),
      gunmetalMat,
    );
    innerRim.position.set(0, trayHeight + 0.004, 0);
    trayGroup.add(innerRim);

    // Brass corner braces
    const cornerGeo = new THREE.BoxGeometry(0.06, trayHeight + 0.015, 0.06);
    const cornerOffsets = [
      [caseW / 2 - 0.03, trayHeight / 2, caseD / 2 - 0.03],
      [-caseW / 2 + 0.03, trayHeight / 2, caseD / 2 - 0.03],
      [caseW / 2 - 0.03, trayHeight / 2, -caseD / 2 + 0.03],
      [-caseW / 2 + 0.03, trayHeight / 2, -caseD / 2 + 0.03],
    ];
    cornerOffsets.forEach(([cx, cy, cz]) => {
      const corner = new THREE.Mesh(cornerGeo, brassMat);
      corner.position.set(cx, cy, cz);
      trayGroup.add(corner);
    });

    // Leather Handle
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.028, 12, 24, Math.PI),
      leatherMat,
    );
    handle.position.set(0, trayHeight / 2, caseD / 2 + 0.05);
    handle.rotation.x = Math.PI / 2;
    trayGroup.add(handle);

    // --- CONTENTS INSIDE THE SUITCASE ---
    const contentsGroup = new THREE.Group();
    trayGroup.add(contentsGroup);

    // LEFT: Classified Offer Document Stack
    const docStack = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.025, 0.86),
      new THREE.MeshStandardMaterial({
        map: paperTexture,
        roughness: 0.88,
      }),
    );
    docStack.position.set(-0.36, trayHeight + 0.01, 0.015);
    docStack.castShadow = true;
    docStack.receiveShadow = true;
    contentsGroup.add(docStack);

    // Top Offer Document sheet (Filled with top-secret classified text)
    const offerDocMat = new THREE.MeshStandardMaterial({
      map: classifiedLetterTexture,
      roughness: 0.85,
    });
    const offerDoc = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.84),
      offerDocMat,
    );
    offerDoc.position.set(-0.36, trayHeight + 0.024, 0.015);
    offerDoc.rotation.x = -Math.PI / 2;
    offerDoc.receiveShadow = true;
    contentsGroup.add(offerDoc);

    // RIGHT: Platform Intelligence Dossier (Filled with platform capabilities & schematics)
    const platformDoc = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.84),
      new THREE.MeshStandardMaterial({
        map: platformDocTexture,
        roughness: 0.85,
      }),
    );
    platformDoc.position.set(0.36, trayHeight + 0.024, 0.015);
    platformDoc.rotation.x = -Math.PI / 2;
    platformDoc.receiveShadow = true;
    contentsGroup.add(platformDoc);

    // Leather Retaining Straps with Brass Buckles
    const strapMat = new THREE.MeshStandardMaterial({
      color: 0x1f1410,
      roughness: 0.7,
    });
    const strapLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.012, 0.94),
      strapMat,
    );
    strapLeft.position.set(-0.36, trayHeight + 0.028, 0.015);
    contentsGroup.add(strapLeft);

    const strapRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.012, 0.94),
      strapMat,
    );
    strapRight.position.set(0.36, trayHeight + 0.028, 0.015);
    contentsGroup.add(strapRight);

    // --- TOP LID WITH ARTICULATING PIVOT & BRASS SCISSOR STAYS ---
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, trayHeight, -caseD / 2);
    briefcaseGroup.add(lidPivot);

    const lidGroup = new THREE.Group();
    lidPivot.add(lidGroup);

    // Exterior leather lid top
    const lidTop = new THREE.Mesh(
      new THREE.BoxGeometry(caseW, trayHeight, caseD),
      leatherMat,
    );
    lidTop.position.set(0, trayHeight / 2, caseD / 2);
    lidTop.castShadow = true;
    lidTop.receiveShadow = true;
    lidGroup.add(lidTop);

    // Interior quilted velvet lid lining
    const lidVelvet = new THREE.Mesh(
      new THREE.PlaneGeometry(caseW - 0.06, caseD - 0.06),
      velvetMat,
    );
    lidVelvet.position.set(0, 0.002, caseD / 2);
    lidVelvet.rotation.x = Math.PI / 2;
    lidGroup.add(lidVelvet);

    // Gold Foil Stamped Classification Badge on Lid Interior
    const lidSeal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.50, 0.50),
      new THREE.MeshBasicMaterial({
        map: pamphletTexture,
        transparent: true,
        opacity: 0.85,
      }),
    );
    lidSeal.position.set(0, 0.004, caseD / 2);
    lidSeal.rotation.x = Math.PI / 2;
    lidGroup.add(lidSeal);

    // Brass Front Latches (pop open on unlock)
    const latchGeo = new THREE.BoxGeometry(0.09, 0.04, 0.035);
    const leftLatch = new THREE.Mesh(latchGeo, brassMat);
    leftLatch.position.set(-0.50, trayHeight / 2, caseD / 2 + 0.018);
    trayGroup.add(leftLatch);

    const rightLatch = new THREE.Mesh(latchGeo, brassMat);
    rightLatch.position.set(0.50, trayHeight / 2, caseD / 2 + 0.018);
    trayGroup.add(rightLatch);

    // Articulated Brass Scissor Stay Hinges (left & right)
    const stayGeo = new THREE.BoxGeometry(0.012, 0.38, 0.016);
    const stayLeft = new THREE.Mesh(stayGeo, brassMat);
    stayLeft.position.set(-caseW / 2 + 0.03, trayHeight + 0.06, 0);
    briefcaseGroup.add(stayLeft);

    const stayRight = new THREE.Mesh(stayGeo, brassMat);
    stayRight.position.set(caseW / 2 - 0.03, trayHeight + 0.06, 0);
    briefcaseGroup.add(stayRight);

    // -------------------------------------------------------------
    // ANIMATION & SCROLL CHOREOGRAPHY LOOP (Continuous Smoothstep)
    // -------------------------------------------------------------
    function smoothStep(edge0: number, edge1: number, x: number) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }

    let animId = 0;
    let prevTime = performance.now();

    const cwX = -0.15;
    const cwY = tableTopY;
    const cwZ = tableZ + 0.15;

    const renderLoop = (timeNow: number) => {
      animId = requestAnimationFrame(renderLoop);
      const dt = (timeNow - prevTime) / 1000;
      prevTime = timeNow;

      const p = Math.max(0, Math.min(1, scrollProgressRef.current));

      // Re-render CRT dynamic scanline animation
      if (crtTextureRef.current) {
        const newTex = createCRTTexture(connectedState, timeNow * 0.001);
        crtScreenMat.map = newTex;
        newTex.needsUpdate = true;
      }

      // --- CAMERA CHOREOGRAPHY: PERFECTLY CONTINUOUS CINEMATIC DOLLY ---
      // 0.00 -> 0.38 : Glide smoothly forward toward the planning table
      // 0.38 -> 0.58 : Briefcase opens, camera arcs smoothly to centered overhead
      // 0.58 -> 0.70 : Centered TOP-DOWN view directly looking down at the open briefcase
      // 0.70 -> 1.00 : Locked in top-down view while document pops out to full screen!
      let camX: number;
      let camY: number;
      let camZ: number;
      let lookX: number;
      let lookY: number;
      let lookZ: number;

      if (p <= 0.38) {
        const t = smoothStep(0.0, 0.38, p);
        camX = THREE.MathUtils.lerp(0.0, cwX + 0.02, t);
        camY = THREE.MathUtils.lerp(0.80, cwY + 1.05, t);
        camZ = THREE.MathUtils.lerp(7.5, cwZ + 1.85, t);
        lookX = THREE.MathUtils.lerp(0.0, cwX, t);
        lookY = THREE.MathUtils.lerp(-1.35, cwY + 0.12, t);
        lookZ = THREE.MathUtils.lerp(tableZ, cwZ, t);
      } else if (p <= 0.58) {
        const t = smoothStep(0.38, 0.58, p);
        // Arcs smoothly to centered overhead top-down view directly above the briefcase
        camX = THREE.MathUtils.lerp(cwX + 0.02, cwX, t);
        camY = THREE.MathUtils.lerp(cwY + 1.05, cwY + 1.75, t);
        camZ = THREE.MathUtils.lerp(cwZ + 1.85, cwZ + 0.001, t);
        lookX = cwX;
        lookY = THREE.MathUtils.lerp(cwY + 0.12, cwY, t);
        lookZ = cwZ;
      } else {
        // p > 0.58: Perfectly locked top-down centered view! ZERO pullback!
        camX = cwX;
        camY = cwY + 1.75;
        camZ = cwZ + 0.001;
        lookX = cwX;
        lookY = cwY;
        lookZ = cwZ;
      }

      camera.position.set(camX, camY, camZ);
      camera.lookAt(lookX, lookY, lookZ);

      // --- BRIEFCASE LID OPENING ---
      if (p > 0.38) {
        const openP = smoothStep(0.38, 0.58, p);
        // Smooth mechanical rotation ~106 degrees backwards
        const easedAngle = -1.85 * openP;
        lidPivot.rotation.x = easedAngle;

        // Brass latches pop outward
        const latchOffset = Math.min(0.035, openP * 0.07);
        leftLatch.position.z = caseD / 2 + 0.018 + latchOffset;
        rightLatch.position.z = caseD / 2 + 0.018 + latchOffset;

        // Brass stay hinges rotate and extend
        stayLeft.rotation.x = easedAngle * 0.45;
        stayRight.rotation.x = easedAngle * 0.45;

        // Interior case illumination (realistic subtle warm glow)
        caseLight.intensity = openP * 1.15;
      } else {
        lidPivot.rotation.x = 0;
        leftLatch.position.z = caseD / 2 + 0.018;
        rightLatch.position.z = caseD / 2 + 0.018;
        stayLeft.rotation.x = 0;
        stayRight.rotation.x = 0;
        caseLight.intensity = 0;
      }

      // CRT Glow pulse
      if (connectedState === "si") {
        crtGlow.intensity = 1.8 + Math.sin(timeNow * 0.004) * 0.3;
        crtLedMat.color.setHex(0x22ff55);
      } else {
        crtGlow.intensity = 1.1 + Math.sin(timeNow * 0.003) * 0.2;
        crtLedMat.color.setHex(0xff3322);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderLoop);

    // RESIZE HANDLER
    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef, connectedState, onCaseClick]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ touchAction: "none" }}
    />
  );
}
