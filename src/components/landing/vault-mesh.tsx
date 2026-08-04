"use client";

import { useEffect, useRef } from "react";

// ── 3D Math Helpers ──────────────────────────────────────────────
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: v.x, y: v.y * cos - v.z * sin, z: v.y * sin + v.z * cos };
}

function rotateY(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: v.x * cos + v.z * sin, y: v.y, z: -v.x * sin + v.z * cos };
}

// ── Icosahedron Geometry (unit sphere) ───────────────────────────
function createIcosahedron(): { vertices: Vec3[]; edges: [number, number][] } {
  const t = (1 + Math.sqrt(5)) / 2;

  const raw: Vec3[] = [
    { x: -1, y: t, z: 0 }, { x: 1, y: t, z: 0 },
    { x: -1, y: -t, z: 0 }, { x: 1, y: -t, z: 0 },
    { x: 0, y: -1, z: t }, { x: 0, y: 1, z: t },
    { x: 0, y: -1, z: -t }, { x: 0, y: 1, z: -t },
    { x: t, y: 0, z: -1 }, { x: t, y: 0, z: 1 },
    { x: -t, y: 0, z: -1 }, { x: -t, y: 0, z: 1 },
  ];

  const vertices = raw.map((v) => {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  });

  const faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  for (const [a, b, c] of faces) {
    for (const [p, q] of [[a, b], [b, c], [a, c]] as [number, number][]) {
      const key = `${Math.min(p, q)}-${Math.max(p, q)}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([p, q]);
      }
    }
  }

  return { vertices, edges };
}

// ── Floating Particle ────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

function createParticles(count: number, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.25,
    });
  }
  return particles;
}

// ── Shooting Star ────────────────────────────────────────────────
interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

function spawnShootingStar(w: number, h: number): ShootingStar {
  const goRight = Math.random() > 0.5;
  const speed = 4 + Math.random() * 6;
  return {
    x: goRight ? -20 : w + 20,
    y: Math.random() * h * 0.7,
    vx: goRight ? speed : -speed,
    vy: 0.5 + Math.random() * 1.5,
    life: 0,
    maxLife: 60 + Math.random() * 40,
    length: 40 + Math.random() * 60,
  };
}

// ── Component ────────────────────────────────────────────────────
export function VaultMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const CONNECTION_DIST = 120; // px distance to draw lines between particles

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * window.devicePixelRatio;
      canvas!.height = height * window.devicePixelRatio;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      // Recreate particles on resize to fill new dimensions
      const density = Math.floor((width * height) / 12000);
      const count = Math.min(Math.max(density, 40), 120);
      particles = createParticles(count, width, height);
    }
    resize();
    window.addEventListener("resize", resize);

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / width - 0.5) * 2;
      mouseRef.current.y = (e.clientY / height - 0.5) * 2;
    }
    window.addEventListener("mousemove", handleMouseMove);

    const { vertices, edges } = createIcosahedron();
    let autoAngle = 0;

    // Shooting stars
    let shootingStars: ShootingStar[] = [];
    let frameCount = 0;

    let isVisible = true;
    function handleVisibility() { isVisible = !document.hidden; }
    document.addEventListener("visibilitychange", handleVisibility);

    // ── Animation Loop ─────────────────────────────────────────
    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      if (!isVisible) return;

      ctx!.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const viewScale = Math.min(width, height) * 0.32;

      autoAngle += 0.003;
      const tiltX = mouseRef.current.y * 0.3;
      const tiltY = mouseRef.current.x * 0.3 + autoAngle;

      // ── 1. Floating Particles ────────────────────────────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Draw particle dots
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 255, 136, ${p.alpha})`;
        ctx!.fill();
      }

      // ── 2. Icosahedron ───────────────────────────────────────
      const projected = vertices.map((v) => {
        let rv = rotateY(v, tiltY);
        rv = rotateX(rv, tiltX);
        const depthFactor = 1 + rv.z * 0.15;
        return {
          x: rv.x * viewScale * depthFactor + cx,
          y: rv.y * viewScale * depthFactor + cy,
          depth: rv.z,
        };
      });

      // Draw icosahedron edges
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const avgDepth = (pa.depth + pb.depth) / 2;
        const alpha = 0.08 + (avgDepth + 1) * 0.1;

        ctx!.beginPath();
        ctx!.moveTo(pa.x, pa.y);
        ctx!.lineTo(pb.x, pb.y);
        ctx!.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx!.lineWidth = 0.8 + (avgDepth + 1) * 0.5;
        ctx!.stroke();
      }

      // Draw icosahedron vertices (glowing nodes)
      for (const p of projected) {
        const alpha = 0.2 + (p.depth + 1) * 0.3;
        const radius = 2 + (p.depth + 1) * 2;

        // Outer glow
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius * 4, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 255, 136, ${alpha * 0.1})`;
        ctx!.fill();

        // Inner dot
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx!.fill();
      }

      // ── 3. Connect nearby particles to icosahedron vertices ──
      for (const p of particles) {
        for (const iv of projected) {
          const dx = p.x - iv.x;
          const dy = p.y - iv.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST * 1.5) {
            const alpha = (1 - dist / (CONNECTION_DIST * 1.5)) * 0.06;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(iv.x, iv.y);
            ctx!.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx!.lineWidth = 0.4;
            ctx!.stroke();
          }
        }
      }

      // ── 4. Shooting Stars ────────────────────────────────────
      frameCount++;
      // Spawn a new one randomly every ~120–300 frames
      if (frameCount % (120 + Math.floor(Math.random() * 180)) === 0) {
        shootingStars.push(spawnShootingStar(width, height));
      }

      shootingStars = shootingStars.filter((s) => s.life < s.maxLife);

      for (const s of shootingStars) {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        // Fade in fast, fade out slow
        const alpha = progress < 0.1
          ? progress / 0.1 * 0.6
          : 0.6 * (1 - (progress - 0.1) / 0.9);

        // Tail end position
        const tailX = s.x - (s.vx / Math.abs(s.vx)) * s.length;
        const tailY = s.y - (s.vy / Math.abs(s.vx)) * s.length;

        // Draw the streak with a gradient
        const grad = ctx!.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(0, 255, 136, 0)`);
        grad.addColorStop(1, `rgba(0, 255, 136, ${alpha})`);

        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        // Bright head dot
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx!.fill();
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.45 }}
      aria-hidden="true"
    />
  );
}
