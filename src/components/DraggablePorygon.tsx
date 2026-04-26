"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export default function DraggablePorygon() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Only left click
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    setIsDragging(true);
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    
    // Magnetic snapping to origin (0, 0)
    const distance = Math.sqrt(newX * newX + newY * newY);
    const magneticThreshold = 40;
    
    // Reset if over the name (with 1s delay) or within magnetic threshold (instant)
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
    const isOverResetZone = elementsAtPoint.some(el => el.classList.contains('porygon-reset-zone'));
    
    if (isOverResetZone) {
      if (!resetTimerRef.current) {
        resetTimerRef.current = setTimeout(() => {
          handleReset();
        }, 1000);
      }
    } else {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    }

    if (distance < magneticThreshold) {
      handleReset();
      return;
    }
    
    setPosition({ x: newX, y: newY });
    
    if (Math.abs(newX) > 5 || Math.abs(newY) > 5) {
      setHasMoved(true);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setHasMoved(false);
    setIsDragging(false);
    if (pointerIdRef.current !== null && iconRef.current) {
      try {
        iconRef.current.releasePointerCapture(pointerIdRef.current);
      } catch (e) {}
      pointerIdRef.current = null;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* The Reset Button at the original position */}
      {hasMoved && (
        <button
          onClick={handleReset}
          className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-dashed border-accent text-accent flex items-center justify-center bg-paper hover:bg-accent-light hover:border-solid transition-all animate-fade-in z-0 group"
          title="Return Porygon"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      )}

      {/* The Draggable Icon */}
      <div
        ref={iconRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          touchAction: 'none'
        }}
        className={`
          w-24 h-24 relative select-none cursor-grab active:cursor-grabbing 
          flex items-center justify-center transition-shadow pointer-events-auto
          ${isDragging ? 'z-[99999] scale-110 drop-shadow-2xl' : 'z-[1000] hover:scale-105'}
        `}
      >
        <img 
          src="/porygon.svg" 
          alt="Porygon" 
          className="w-full h-full opacity-90 pointer-events-none"
          draggable={false}
        />
        
        {/* Visual feedback during drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30 animate-spin-slow scale-125" />
        )}
      </div>
    </div>
  );
}
