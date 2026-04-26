"use client";

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function DraggablePorygon() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [hasLeftThreshold, setHasLeftThreshold] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      draggingRef.current = true;
      setIsDragging(true);
      document.body.classList.add('porygon-dragging');

      startPos.current = {
        x: e.clientX - posRef.current.x,
        y: e.clientY - posRef.current.y
      };
    };

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;

      const newX = e.clientX - startPos.current.x;
      const newY = e.clientY - startPos.current.y;

      // Magnetic snap: if close to origin AND has left threshold once, snap and reset
      const distToOrigin = Math.sqrt(newX * newX + newY * newY);
      
      if (distToOrigin > 80) {
        setHasLeftThreshold(true);
      }

      if (distToOrigin < 50 && hasLeftThreshold) {
        doReset();
        return;
      }

      posRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });

      if (Math.abs(newX) > 5 || Math.abs(newY) > 5) {
        setHasMoved(true);
      }

      // Name-over detection: auto-reset after 2.5s
      const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
      const isOverName = elementsAtPoint.some(el =>
        el.tagName === 'H1' || el.closest('h1')
      );

      if (isOverName) {
        if (!nameTimerRef.current) {
          nameTimerRef.current = setTimeout(() => {
            doReset();
          }, 2500);
        }
      } else {
        if (nameTimerRef.current) {
          clearTimeout(nameTimerRef.current);
          nameTimerRef.current = null;
        }
      }
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      document.body.classList.remove('porygon-dragging');
      if (nameTimerRef.current) {
        clearTimeout(nameTimerRef.current);
        nameTimerRef.current = null;
      }
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('porygon-dragging');
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    };
  }, [hasMoved, hasLeftThreshold]);

  const doReset = () => {
    posRef.current = { x: 0, y: 0 };
    setPosition({ x: 0, y: 0 });
    setHasMoved(false);
    setHasLeftThreshold(false);
    setIsDragging(false);
    draggingRef.current = false;
    document.body.classList.remove('porygon-dragging');
    if (nameTimerRef.current) {
      clearTimeout(nameTimerRef.current);
      nameTimerRef.current = null;
    }
  };

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {hasMoved && (
        <button
          onClick={doReset}
          className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-dashed border-accent text-accent flex items-center justify-center bg-paper hover:bg-accent-light hover:border-solid transition-all animate-fade-in z-0 group"
          title="Return Porygon"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      )}

      <div
        ref={iconRef}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          touchAction: 'none'
        }}
        className={`
          w-24 h-24 relative select-none
          flex items-center justify-center pointer-events-auto
          ${isDragging ? 'z-[99999] scale-110 drop-shadow-2xl' : 'z-[1000] hover:scale-105 cursor-grab'}
        `}
      >
        <img 
          src="/porygon.svg" 
          alt="Porygon" 
          className="w-full h-full opacity-90 pointer-events-none"
          draggable={false}
        />
        
        {isDragging && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30 animate-spin-slow scale-125" />
        )}
      </div>
    </div>
  );
}
