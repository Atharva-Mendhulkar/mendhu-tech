"use client";

import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringTerminal, setIsHoveringTerminal] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent | PointerEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const updateHoverState = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isClickable = !!target.closest('a, button, input, label, select, canvas, [role="button"], .project-card, .garden-tile, .tree-file, .filter-btn, .cursor-pointer, .cursor-grab, .cursor-grabbing');
      setIsHovering(isClickable);

      const isTerminal = !!target.closest('.terminal-bg, .modal-window');
      setIsHoveringTerminal(isTerminal);
    };

    const handleMouseDown = () => setIsGrabbing(true);
    const handleMouseUp = () => setIsGrabbing(false);

    window.addEventListener("mousemove", updatePosition, { passive: true });
    window.addEventListener("pointermove", updatePosition, { passive: true });
    window.addEventListener("mouseover", updateHoverState, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("pointermove", updatePosition);
      window.removeEventListener("mouseover", updateHoverState);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`cursor-ring ${isHovering ? "on-accent" : ""} ${isHoveringTerminal ? "on-terminal" : ""} ${isGrabbing ? "scale-75 bg-accent/20" : ""}`}
    />
  );
}
