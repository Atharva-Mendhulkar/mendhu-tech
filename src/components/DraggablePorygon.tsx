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
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    setIsDragging(true);
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const newX = e.clientX - startPos.current.x;
      const newY = e.clientY - startPos.current.y;
      
      const distance = Math.sqrt(newX * newX + newY * newY);
      const magneticThreshold = 40;
      
      const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
      const isOverResetZone = elementsAtPoint.some(el => el.classList.contains('porygon-reset-zone'));
      
      if (distance < magneticThreshold || isOverResetZone) {
        handleReset();
        return;
      }
      
      setPosition({ x: newX, y: newY });
      if (Math.abs(newX) > 5 || Math.abs(newY) > 5) setHasMoved(true);
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      if (pointerIdRef.current !== null && iconRef.current) {
        try { iconRef.current.releasePointerCapture(pointerIdRef.current); } catch (err) {}
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setHasMoved(false);
    setIsDragging(false);
    if (pointerIdRef.current !== null && iconRef.current) {
      try { iconRef.current.releasePointerCapture(pointerIdRef.current); } catch (e) {}
      pointerIdRef.current = null;
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
