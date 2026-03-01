import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FertilizationAnimation } from "./FertilizationAnimation";

interface Organ {
  id: string;
  name: string;
  description: string;
}

const maleOrgansInfo: Record<string, { name: string; description: string }> = {
  testes: { name: "Testes (Testicle)", description: "Produce sperm (spermatogenesis) and secrete testosterone. Located within the scrotum to maintain optimal temperature." },
  epididymis: { name: "Epididymis", description: "Coiled tube on the posterior surface of each testis where sperm matures and is stored." },
  "vas-deferens": { name: "Vas Deferens", description: "Muscular tube that transports mature sperm from the epididymis to the urethra during ejaculation." },
  "seminal-vesicle": { name: "Seminal Vesicle", description: "Secretes fructose-rich fluid that nourishes sperm and aids their mobility. Located behind the bladder." },
  prostate: { name: "Prostate Gland", description: "Produces alkaline fluid that forms part of semen, protecting sperm from the acidic vaginal environment." },
  urethra: { name: "Urethra", description: "Shared passage for urine and semen (at different times). Extends from the bladder through the penis." },
  penis: { name: "Penis", description: "External organ that delivers semen into the female reproductive tract during intercourse." },
  scrotum: { name: "Scrotum", description: "External pouch of skin that holds and protects the testes, keeping them at a temperature slightly below body temperature." },
  bladder: { name: "Bladder", description: "Stores urine. Located above the prostate gland, connected to the urethra." },
};

const femaleOrgansInfo: Record<string, { name: string; description: string }> = {
  ovary: { name: "Ovary", description: "Produces eggs (ova) and secretes estrogen and progesterone. One on each side of the uterus." },
  "fallopian-tube": { name: "Fallopian Tube", description: "Transports egg from ovary to uterus; usual site of fertilization. Lined with cilia." },
  fimbriae: { name: "Fimbriae", description: "Finger-like projections at the end of the fallopian tubes that sweep the released egg into the tube." },
  uterus: { name: "Uterus", description: "Muscular organ where the fertilized egg implants and the fetus develops. Endometrium thickens each cycle." },
  "uterine-fundus": { name: "Uterine Fundus", description: "The broad, curved upper area of the uterus where the fallopian tubes connect." },
  endometrium: { name: "Endometrium", description: "Inner lining of the uterus that thickens during the menstrual cycle to prepare for implantation." },
  myometrium: { name: "Myometrium", description: "Thick muscular wall of the uterus responsible for contractions during labor." },
  cervix: { name: "Cervix", description: "Lower narrow part of the uterus opening into the vagina. Acts as a gateway protecting from infection." },
  vagina: { name: "Vagina", description: "Muscular canal serving as the birth canal and receiving semen during intercourse." },
};

function drawMaleSystem(ctx: CanvasRenderingContext2D, w: number, h: number, selectedOrgan: string | null, time: number, showPathway: boolean, showMicroscopic: boolean) {
  const scale = Math.min(w / 400, h / 450);
  const ox = w / 2 - 200 * scale;
  const oy = h / 2 - 225 * scale;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // Bladder
  const isBladder = selectedOrgan === "bladder";
  ctx.beginPath();
  ctx.ellipse(200, 80, 70, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = isBladder ? "hsl(200, 50%, 60%)" : "hsl(200, 30%, 45%)";
  ctx.globalAlpha = isBladder ? 1 : 0.7;
  if (isBladder) { ctx.shadowColor = "hsl(200, 60%, 60%)"; ctx.shadowBlur = 15; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(200, 40%, 35%)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Seminal Vesicle (behind bladder, right side)
  const isSV = selectedOrgan === "seminal-vesicle";
  ctx.beginPath();
  ctx.moveTo(270, 110);
  ctx.bezierCurveTo(290, 100, 310, 120, 295, 140);
  ctx.bezierCurveTo(280, 160, 270, 145, 265, 130);
  ctx.fillStyle = isSV ? "hsl(30, 70%, 60%)" : "hsl(30, 40%, 45%)";
  ctx.globalAlpha = isSV ? 1 : 0.7;
  if (isSV) { ctx.shadowColor = "hsl(30, 70%, 60%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(30, 50%, 35%)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Prostate Gland
  const isProstate = selectedOrgan === "prostate";
  ctx.beginPath();
  ctx.ellipse(200, 150, 35, 25, 0, 0, Math.PI * 2);
  ctx.fillStyle = isProstate ? "hsl(340, 55%, 55%)" : "hsl(340, 35%, 40%)";
  ctx.globalAlpha = isProstate ? 1 : 0.7;
  if (isProstate) { ctx.shadowColor = "hsl(340, 55%, 55%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(340, 40%, 30%)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Vas Deferens (curved tube from testicle area up to seminal vesicle)
  const isVD = selectedOrgan === "vas-deferens";
  ctx.beginPath();
  ctx.moveTo(230, 340);
  ctx.bezierCurveTo(250, 300, 280, 200, 270, 130);
  ctx.strokeStyle = isVD ? "hsl(45, 70%, 55%)" : "hsl(45, 40%, 40%)";
  ctx.lineWidth = isVD ? 4 : 3;
  if (isVD) { ctx.shadowColor = "hsl(45, 70%, 55%)"; ctx.shadowBlur = 10; }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Urethra (from bladder down through penis)
  const isUrethra = selectedOrgan === "urethra";
  ctx.beginPath();
  ctx.moveTo(200, 130);
  ctx.lineTo(200, 175);
  ctx.bezierCurveTo(200, 200, 160, 240, 140, 280);
  ctx.bezierCurveTo(120, 320, 100, 370, 90, 410);
  ctx.strokeStyle = isUrethra ? "hsl(50, 70%, 60%)" : "hsl(50, 40%, 40%)";
  ctx.lineWidth = isUrethra ? 3.5 : 2.5;
  if (isUrethra) { ctx.shadowColor = "hsl(50, 70%, 60%)"; ctx.shadowBlur = 10; }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Penis (external organ)
  const isPenis = selectedOrgan === "penis";
  ctx.beginPath();
  ctx.moveTo(165, 230);
  ctx.bezierCurveTo(155, 250, 130, 300, 110, 350);
  ctx.bezierCurveTo(100, 375, 85, 400, 80, 420);
  ctx.bezierCurveTo(75, 435, 85, 440, 100, 430);
  ctx.bezierCurveTo(115, 415, 125, 390, 140, 350);
  ctx.bezierCurveTo(160, 300, 175, 255, 180, 235);
  ctx.closePath();
  ctx.fillStyle = isPenis ? "hsl(15, 55%, 60%)" : "hsl(15, 35%, 48%)";
  ctx.globalAlpha = isPenis ? 1 : 0.7;
  if (isPenis) { ctx.shadowColor = "hsl(15, 55%, 60%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(15, 40%, 35%)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Scrotum
  const isScrotum = selectedOrgan === "scrotum";
  ctx.beginPath();
  ctx.ellipse(230, 390, 55, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = isScrotum ? "hsl(20, 45%, 55%)" : "hsl(20, 25%, 42%)";
  ctx.globalAlpha = isScrotum ? 1 : 0.6;
  if (isScrotum) { ctx.shadowColor = "hsl(20, 45%, 55%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(20, 30%, 35%)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // scrotum midline
  ctx.beginPath();
  ctx.moveTo(230, 342);
  ctx.lineTo(230, 440);
  ctx.strokeStyle = "hsl(20, 20%, 38%)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Testes (inside scrotum)
  const isTestes = selectedOrgan === "testes";
  ctx.beginPath();
  ctx.ellipse(210, 385, 28, 35, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = isTestes ? "hsl(200, 55%, 60%)" : "hsl(200, 35%, 45%)";
  ctx.globalAlpha = isTestes ? 1 : 0.8;
  if (isTestes) { ctx.shadowColor = "hsl(200, 55%, 60%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(200, 40%, 35%)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Epididymis (on top/back of testis)
  const isEpid = selectedOrgan === "epididymis";
  ctx.beginPath();
  ctx.moveTo(235, 355);
  ctx.bezierCurveTo(245, 360, 248, 380, 245, 400);
  ctx.bezierCurveTo(242, 415, 235, 420, 232, 410);
  ctx.strokeStyle = isEpid ? "hsl(160, 60%, 50%)" : "hsl(160, 35%, 38%)";
  ctx.lineWidth = isEpid ? 4 : 3;
  if (isEpid) { ctx.shadowColor = "hsl(160, 60%, 50%)"; ctx.shadowBlur = 10; }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Labels with leader lines
  const labels: { text: string; id: string; lx: number; ly: number; tx: number; ty: number }[] = [
    { text: "Bladder", id: "bladder", lx: 200, ly: 80, tx: 45, ty: 55 },
    { text: "Vas deferens", id: "vas-deferens", lx: 270, ly: 240, tx: 310, ty: 220 },
    { text: "Seminal vesicle", id: "seminal-vesicle", lx: 280, ly: 120, tx: 320, ty: 100 },
    { text: "Prostate gland", id: "prostate", lx: 200, ly: 150, tx: 50, ty: 150 },
    { text: "Urethra", id: "urethra", lx: 155, ly: 260, tx: 40, ty: 260 },
    { text: "Penis", id: "penis", lx: 120, ly: 340, tx: 10, ty: 340 },
    { text: "Testicle", id: "testes", lx: 210, ly: 385, tx: 310, ty: 385 },
    { text: "Epididymis", id: "epididymis", lx: 240, ly: 380, tx: 310, ty: 340 },
    { text: "Scrotum", id: "scrotum", lx: 230, ly: 435, tx: 310, ty: 435 },
  ];

  labels.forEach(l => {
    const isSel = selectedOrgan === l.id;
    // leader line
    ctx.beginPath();
    ctx.moveTo(l.lx, l.ly);
    ctx.lineTo(l.tx, l.ty);
    ctx.strokeStyle = isSel ? "hsl(0, 0%, 90%)" : "hsl(0, 0%, 50%)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // dot at organ
    ctx.beginPath();
    ctx.arc(l.lx, l.ly, 2, 0, Math.PI * 2);
    ctx.fillStyle = isSel ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 60%)";
    ctx.fill();
    // text
    ctx.fillStyle = isSel ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 80%)";
    ctx.font = `${isSel ? "bold " : ""}10px system-ui`;
    ctx.textAlign = l.tx < 200 ? "right" : "left";
    ctx.fillText(l.text, l.tx + (l.tx < 200 ? -4 : 4), l.ty + 3);
  });

  // Sperm pathway animation
  if (showPathway) {
    const path = [
      { x: 210, y: 385 }, { x: 240, y: 370 }, { x: 245, y: 390 },
      { x: 240, y: 340 }, { x: 260, y: 280 }, { x: 275, y: 200 },
      { x: 270, y: 140 }, { x: 200, y: 150 }, { x: 200, y: 180 },
      { x: 160, y: 250 }, { x: 120, y: 330 }, { x: 90, y: 415 },
    ];
    ctx.strokeStyle = "hsl(45, 90%, 60%)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated sperm dot
    const prog = (time * 0.12) % 1;
    const idx = Math.floor(prog * (path.length - 1));
    const t = (prog * (path.length - 1)) - idx;
    const p1 = path[idx], p2 = path[Math.min(idx + 1, path.length - 1)];
    const gx = p1.x + (p2.x - p1.x) * t;
    const gy = p1.y + (p2.y - p1.y) * t;
    ctx.beginPath();
    ctx.arc(gx, gy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(200, 100%, 70%)";
    ctx.shadowColor = "hsl(200, 100%, 70%)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // tail
    ctx.strokeStyle = "hsl(200, 100%, 70%)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + 6 * Math.sin(time * 8), gy + 4, gx + 2, gy + 10);
    ctx.stroke();
  }

  // Microscopic view
  if (showMicroscopic) {
    ctx.fillStyle = "hsl(220, 15%, 10% / 0.85)";
    ctx.fillRect(270, 5, 125, 130);
    ctx.strokeStyle = "hsl(200, 60%, 50%)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(270, 5, 125, 130);
    ctx.fillStyle = "hsl(0, 0%, 92%)";
    ctx.font = "bold 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Spermatogenesis", 332, 18);

    const stages = ["Spermatogonia", "1° Spermatocyte", "2° Spermatocyte", "Spermatid", "Mature Sperm"];
    stages.forEach((s, i) => {
      const cx = 295 + (i % 3) * 38;
      const cy = 42 + Math.floor(i / 3) * 45;
      const pulse = 1 + Math.sin(time * 2 + i) * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(200, ${50 + i * 10}%, ${45 + i * 5}%)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(220, 20%, 20%)";
      ctx.fill();
      ctx.fillStyle = "hsl(0, 0%, 70%)";
      ctx.font = "7px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(s, cx, cy + 16);
    });
  }

  ctx.restore();
}

function drawFemaleSystem(ctx: CanvasRenderingContext2D, w: number, h: number, selectedOrgan: string | null, time: number, showPathway: boolean, showMicroscopic: boolean, cycleDay: number) {
  const scale = Math.min(w / 400, h / 450);
  const ox = w / 2 - 200 * scale;
  const oy = h / 2 - 225 * scale;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  const isUterus = selectedOrgan === "uterus";
  const isFundus = selectedOrgan === "uterine-fundus";
  const isMyo = selectedOrgan === "myometrium";
  const isEndo = selectedOrgan === "endometrium";

  // Uterus body (pear shape)
  ctx.beginPath();
  ctx.moveTo(200, 100); // fundus
  ctx.bezierCurveTo(130, 100, 105, 160, 120, 240); // left wall
  ctx.bezierCurveTo(130, 280, 150, 310, 175, 320); // left lower
  ctx.lineTo(225, 320); // bottom
  ctx.bezierCurveTo(250, 310, 270, 280, 280, 240); // right lower
  ctx.bezierCurveTo(295, 160, 270, 100, 200, 100); // right wall
  ctx.closePath();

  // Myometrium (outer wall)
  const myoColor = isMyo ? "hsl(350, 55%, 55%)" : isUterus ? "hsl(350, 50%, 50%)" : "hsl(350, 35%, 42%)";
  ctx.fillStyle = myoColor;
  ctx.globalAlpha = (isUterus || isMyo) ? 1 : 0.85;
  if (isUterus || isMyo) { ctx.shadowColor = "hsl(350, 60%, 55%)"; ctx.shadowBlur = 15; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(350, 40%, 30%)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Endometrium (inner lining)
  const thickness = cycleDay <= 5 ? 0.3 : cycleDay <= 14 ? 0.3 + (cycleDay - 5) * 0.05 : 0.75 - (cycleDay - 14) * 0.015;
  const endoInset = 18 + (1 - thickness) * 8;
  ctx.beginPath();
  ctx.moveTo(200, 100 + endoInset);
  ctx.bezierCurveTo(155, 100 + endoInset, 125 + endoInset, 170, 135 + endoInset * 0.5, 235);
  ctx.bezierCurveTo(145 + endoInset * 0.3, 270, 160, 305, 180, 310);
  ctx.lineTo(220, 310);
  ctx.bezierCurveTo(240, 305, 255 - endoInset * 0.3, 270, 265 - endoInset * 0.5, 235);
  ctx.bezierCurveTo(275 - endoInset, 170, 245, 100 + endoInset, 200, 100 + endoInset);
  ctx.closePath();
  ctx.fillStyle = isEndo ? `hsl(350, 70%, ${55 + thickness * 15}%)` : `hsl(350, 55%, ${45 + thickness * 15}%)`;
  ctx.globalAlpha = isEndo ? 1 : 0.8;
  if (isEndo) { ctx.shadowColor = "hsl(350, 70%, 60%)"; ctx.shadowBlur = 10; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Cervical canal
  const isCervix = selectedOrgan === "cervix";
  ctx.beginPath();
  ctx.moveTo(185, 320);
  ctx.bezierCurveTo(185, 340, 188, 360, 190, 370);
  ctx.lineTo(210, 370);
  ctx.bezierCurveTo(212, 360, 215, 340, 215, 320);
  ctx.closePath();
  ctx.fillStyle = isCervix ? "hsl(0, 50%, 50%)" : "hsl(0, 35%, 38%)";
  ctx.globalAlpha = isCervix ? 1 : 0.8;
  if (isCervix) { ctx.shadowColor = "hsl(0, 50%, 50%)"; ctx.shadowBlur = 10; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(0, 40%, 30%)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Vagina
  const isVagina = selectedOrgan === "vagina";
  ctx.beginPath();
  ctx.moveTo(185, 370);
  ctx.bezierCurveTo(182, 395, 180, 420, 182, 440);
  ctx.lineTo(218, 440);
  ctx.bezierCurveTo(220, 420, 218, 395, 215, 370);
  ctx.closePath();
  ctx.fillStyle = isVagina ? "hsl(10, 50%, 55%)" : "hsl(10, 35%, 42%)";
  ctx.globalAlpha = isVagina ? 1 : 0.7;
  if (isVagina) { ctx.shadowColor = "hsl(10, 50%, 55%)"; ctx.shadowBlur = 10; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(10, 40%, 30%)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fallopian tubes (curved, thicker)
  const isFallopian = selectedOrgan === "fallopian-tube";
  // Left tube
  ctx.beginPath();
  ctx.moveTo(130, 115);
  ctx.bezierCurveTo(100, 95, 60, 80, 40, 100);
  ctx.bezierCurveTo(20, 120, 25, 140, 38, 135);
  ctx.strokeStyle = isFallopian ? "hsl(280, 55%, 60%)" : "hsl(280, 35%, 42%)";
  ctx.lineWidth = isFallopian ? 5 : 3.5;
  if (isFallopian) { ctx.shadowColor = "hsl(280, 55%, 60%)"; ctx.shadowBlur = 8; }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Right tube
  ctx.beginPath();
  ctx.moveTo(270, 115);
  ctx.bezierCurveTo(300, 95, 340, 80, 360, 100);
  ctx.bezierCurveTo(380, 120, 375, 140, 362, 135);
  ctx.strokeStyle = isFallopian ? "hsl(280, 55%, 60%)" : "hsl(280, 35%, 42%)";
  ctx.lineWidth = isFallopian ? 5 : 3.5;
  if (isFallopian) { ctx.shadowColor = "hsl(280, 55%, 60%)"; ctx.shadowBlur = 8; }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Fimbriae (finger-like projections)
  const isFim = selectedOrgan === "fimbriae";
  const drawFimbriae = (bx: number, by: number, flip: number) => {
    for (let i = 0; i < 5; i++) {
      const angle = (-0.6 + i * 0.3) * flip;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(
        bx + Math.cos(angle) * 12 * flip, by + Math.sin(angle) * 12 - 5,
        bx + Math.cos(angle) * 20 * flip, by + Math.sin(angle) * 18 + Math.sin(time * 3 + i) * 3,
        bx + Math.cos(angle) * 25 * flip, by + Math.sin(angle) * 22
      );
      ctx.strokeStyle = isFim ? "hsl(320, 55%, 60%)" : "hsl(320, 35%, 45%)";
      ctx.lineWidth = isFim ? 2.5 : 1.8;
      if (isFim) { ctx.shadowColor = "hsl(320, 55%, 60%)"; ctx.shadowBlur = 6; }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };
  drawFimbriae(38, 135, -1);
  drawFimbriae(362, 135, 1);

  // Ovaries (oval)
  const isOvary = selectedOrgan === "ovary";
  // Left ovary
  ctx.beginPath();
  ctx.ellipse(50, 155, 22, 28, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = isOvary ? "hsl(330, 60%, 60%)" : "hsl(330, 40%, 45%)";
  ctx.globalAlpha = isOvary ? 1 : 0.8;
  if (isOvary) { ctx.shadowColor = "hsl(330, 60%, 60%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(330, 45%, 35%)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // follicles
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(42 + i * 10, 150 + (i % 2) * 12, 4, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(330, 50%, 60%)";
    ctx.fill();
  }

  // Right ovary
  ctx.beginPath();
  ctx.ellipse(350, 155, 22, 28, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = isOvary ? "hsl(330, 60%, 60%)" : "hsl(330, 40%, 45%)";
  ctx.globalAlpha = isOvary ? 1 : 0.8;
  if (isOvary) { ctx.shadowColor = "hsl(330, 60%, 60%)"; ctx.shadowBlur = 12; }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "hsl(330, 45%, 35%)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(342 + i * 10, 150 + (i % 2) * 12, 4, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(330, 50%, 60%)";
    ctx.fill();
  }

  // Ovarian ligaments
  ctx.beginPath();
  ctx.moveTo(72, 155);
  ctx.lineTo(120, 140);
  ctx.moveTo(328, 155);
  ctx.lineTo(280, 140);
  ctx.strokeStyle = "hsl(330, 30%, 40%)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Labels
  const labels: { text: string; id: string; lx: number; ly: number; tx: number; ty: number }[] = [
    { text: "Fallopian tube", id: "fallopian-tube", lx: 80, ly: 90, tx: 5, ty: 70 },
    { text: "Uterine fundus", id: "uterine-fundus", lx: 200, ly: 105, tx: 200, ty: 65 },
    { text: "Uterus", id: "uterus", lx: 200, ly: 200, tx: 5, ty: 200 },
    { text: "Ovary", id: "ovary", lx: 350, ly: 155, tx: 385, ty: 155 },
    { text: "Fimbriae", id: "fimbriae", lx: 38, ly: 140, tx: 5, ty: 30 },
    { text: "Endometrium", id: "endometrium", lx: 260, ly: 220, tx: 330, ty: 220 },
    { text: "Myometrium", id: "myometrium", lx: 280, ly: 180, tx: 330, ty: 180 },
    { text: "Cervix", id: "cervix", lx: 200, ly: 345, tx: 300, ty: 345 },
    { text: "Vagina", id: "vagina", lx: 200, ly: 420, tx: 300, ty: 420 },
  ];

  labels.forEach(l => {
    const isSel = selectedOrgan === l.id;
    ctx.beginPath();
    ctx.moveTo(l.lx, l.ly);
    ctx.lineTo(l.tx, l.ty);
    ctx.strokeStyle = isSel ? "hsl(0, 0%, 90%)" : "hsl(0, 0%, 50%)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(l.lx, l.ly, 2, 0, Math.PI * 2);
    ctx.fillStyle = isSel ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 60%)";
    ctx.fill();
    ctx.fillStyle = isSel ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 80%)";
    ctx.font = `${isSel ? "bold " : ""}10px system-ui`;
    ctx.textAlign = l.tx < 200 ? "right" : (l.tx > 200 ? "left" : "center");
    ctx.fillText(l.text, l.tx + (l.tx < 200 ? -4 : l.tx > 200 ? 4 : 0), l.ty + 3);
  });

  // Egg pathway
  if (showPathway) {
    const path = [
      { x: 350, y: 150 }, { x: 362, y: 135 }, { x: 360, y: 110 },
      { x: 330, y: 95 }, { x: 280, y: 110 }, { x: 230, y: 120 },
      { x: 200, y: 170 }, { x: 200, y: 250 }, { x: 200, y: 320 },
      { x: 200, y: 370 },
    ];
    ctx.strokeStyle = "hsl(330, 80%, 65%)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.setLineDash([]);

    const prog = (time * 0.1) % 1;
    const idx = Math.floor(prog * (path.length - 1));
    const t = (prog * (path.length - 1)) - idx;
    const p1 = path[idx], p2 = path[Math.min(idx + 1, path.length - 1)];
    const gx = p1.x + (p2.x - p1.x) * t;
    const gy = p1.y + (p2.y - p1.y) * t;
    ctx.beginPath();
    ctx.arc(gx, gy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(330, 80%, 65%)";
    ctx.shadowColor = "hsl(330, 80%, 65%)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Microscopic view
  if (showMicroscopic) {
    ctx.fillStyle = "hsl(220, 15%, 10% / 0.85)";
    ctx.fillRect(270, 5, 125, 130);
    ctx.strokeStyle = "hsl(330, 60%, 50%)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(270, 5, 125, 130);
    ctx.fillStyle = "hsl(0, 0%, 92%)";
    ctx.font = "bold 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Oogenesis", 332, 18);

    const stages = ["Oogonia", "1° Oocyte", "2° Oocyte", "Mature Ovum", "Polar Body"];
    stages.forEach((s, i) => {
      const cx = 295 + (i % 3) * 38;
      const cy = 42 + Math.floor(i / 3) * 45;
      const pulse = 1 + Math.sin(time * 2 + i) * 0.1;
      const r = i === 4 ? 4 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(330, ${50 + i * 10}%, ${45 + i * 5}%)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, (r * 0.4) * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(220, 20%, 20%)";
      ctx.fill();
      ctx.fillStyle = "hsl(0, 0%, 70%)";
      ctx.font = "7px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(s, cx, cy + 16);
    });
  }

  ctx.restore();
}

// Hit-test regions for male system
const maleHitRegions: { id: string; x: number; y: number; w: number; h: number }[] = [
  { id: "bladder", x: 130, y: 30, w: 140, h: 100 },
  { id: "seminal-vesicle", x: 265, y: 95, w: 50, h: 60 },
  { id: "prostate", x: 165, y: 125, w: 70, h: 50 },
  { id: "vas-deferens", x: 240, y: 200, w: 50, h: 150 },
  { id: "urethra", x: 125, y: 200, w: 40, h: 120 },
  { id: "penis", x: 75, y: 230, w: 110, h: 210 },
  { id: "scrotum", x: 175, y: 340, w: 110, h: 100 },
  { id: "testes", x: 180, y: 350, w: 60, h: 70 },
  { id: "epididymis", x: 228, y: 350, w: 25, h: 70 },
];

const femaleHitRegions: { id: string; x: number; y: number; w: number; h: number }[] = [
  { id: "fallopian-tube", x: 55, y: 70, w: 80, h: 50 },
  { id: "uterine-fundus", x: 160, y: 90, w: 80, h: 30 },
  { id: "uterus", x: 120, y: 120, w: 160, h: 200 },
  { id: "endometrium", x: 140, y: 160, w: 120, h: 140 },
  { id: "myometrium", x: 115, y: 115, w: 170, h: 80 },
  { id: "ovary", x: 25, y: 125, w: 50, h: 60 },
  { id: "fimbriae", x: 15, y: 115, w: 35, h: 40 },
  { id: "cervix", x: 175, y: 315, w: 50, h: 55 },
  { id: "vagina", x: 175, y: 370, w: 50, h: 70 },
];

export function ReproductiveSystemSimulation({ system }: { system: "male" | "female" }) {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [showPathway, setShowPathway] = useState(false);
  const [showMicroscopic, setShowMicroscopic] = useState(false);
  const [cycleDay, setCycleDay] = useState(14);
  const [showFertilization, setShowFertilization] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  const organsInfo = system === "male" ? maleOrgansInfo : femaleOrgansInfo;
  const selectedInfo = selectedOrgan ? organsInfo[selectedOrgan] : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, w, h);

      // dark background
      ctx.fillStyle = "hsl(220, 15%, 12%)";
      ctx.fillRect(0, 0, w, h);

      if (system === "male") {
        drawMaleSystem(ctx, w, h, selectedOrgan, timeRef.current, showPathway, showMicroscopic);
      } else {
        drawFemaleSystem(ctx, w, h, selectedOrgan, timeRef.current, showPathway, showMicroscopic, cycleDay);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [system, selectedOrgan, showPathway, showMicroscopic, cycleDay]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / 400, rect.height / 450);
    const ox = rect.width / 2 - 200 * scale;
    const oy = rect.height / 2 - 225 * scale;
    const mx = (e.clientX - rect.left - ox) / scale;
    const my = (e.clientY - rect.top - oy) / scale;

    const regions = system === "male" ? maleHitRegions : femaleHitRegions;
    const hit = regions.find(r => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h);
    setSelectedOrgan(hit ? hit.id : null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-[420px] rounded-lg cursor-pointer"
            style={{ display: "block", background: "hsl(220, 15%, 12%)" }}
            onClick={handleCanvasClick}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Controls</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={showPathway} onCheckedChange={setShowPathway} />
              <span className="text-sm">{system === "male" ? "Show Sperm Pathway" : "Show Egg Pathway"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showMicroscopic} onCheckedChange={setShowMicroscopic} />
              <span className="text-sm">Microscopic View</span>
            </div>
            {system === "female" && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Menstrual Cycle Day</span>
                    <span className="font-mono">Day {cycleDay}</span>
                  </div>
                  <input type="range" min={1} max={28} value={cycleDay} onChange={e => setCycleDay(Number(e.target.value))} className="w-full accent-primary" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {cycleDay <= 5 ? "Menstruation phase" : cycleDay <= 13 ? "Follicular phase" : cycleDay === 14 ? "Ovulation" : "Luteal phase"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showFertilization} onCheckedChange={setShowFertilization} />
                  <span className="text-sm">Fertilization Animation</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">
              {selectedInfo ? selectedInfo.name : "Click an organ to learn more"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {selectedInfo ? (
              <div className="space-y-2">
                <Badge variant="secondary">{system === "male" ? "Male" : "Female"} System</Badge>
                <p className="text-sm text-muted-foreground">{selectedInfo.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Click on any organ in the diagram to view its name, function, and key characteristics.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {system === "female" && showFertilization && <FertilizationAnimation />}
    </div>
  );
}
