"use client";

import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringTerminal, setIsHoveringTerminal] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isClickable = !!target.closest('a, button, .project-card, .tree-file, .filter-btn');
      setIsHovering(isClickable);

      const isTerminal = !!target.closest('.terminal-bg, .modal-window');
      setIsHoveringTerminal(isTerminal);
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", updateHoverState);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateHoverState);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`cursor-ring ${isHovering ? "on-accent" : ""} ${isHoveringTerminal ? "on-terminal" : ""}`}
    />
  );
}
