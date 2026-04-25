"use client";

import { useEffect, useRef } from "react";

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const SPACING = 24;
    const RADIUS = 1;
    const INTERACTION_RADIUS = 150;

    let mouseX = -1000;
    let mouseY = -1000;
    
    interface Dot { x: number; y: number; baseX: number; baseY: number; }
    const dots: Dot[] = [];
    
    const initDots = () => {
      dots.length = 0;
      for (let x = 0; x < width; x += SPACING) {
        for (let y = 0; y < height; y += SPACING) {
          dots.push({ x, y, baseX: x, baseY: y });
        }
      }
    };
    initDots();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      dots.forEach(dot => {
        const dx = mouseX - dot.baseX;
        const dy = mouseY - dot.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let size = RADIUS;
        let opacity = 0.08; // Base opacity for dots

        if (distance < INTERACTION_RADIUS) {
          const factor = 1 - Math.pow(distance / INTERACTION_RADIUS, 1.5);
          size = RADIUS + factor * 1.5;
          opacity = 0.08 + factor * 0.4;
          
          // Subtle repel effect
          const pull = factor * 6;
          dot.x = dot.baseX - (dx / distance) * pull;
          dot.y = dot.baseY - (dy / distance) * pull;
        } else {
          // Spring back to base position smoothly
          dot.x += (dot.baseX - dot.x) * 0.1;
          dot.y += (dot.baseY - dot.y) * 0.1;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
