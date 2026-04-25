"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export default function DraggablePorygon() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const onStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  }, [position]);

  const onMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newX = clientX - startPos.current.x;
    const newY = clientY - startPos.current.y;
    setPosition({ x: newX, y: newY });
    if (Math.abs(newX) > 10 || Math.abs(newY) > 10) {
      setHasMoved(true);
    }
  }, [isDragging]);

  const onEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
      const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);
      const handleMouseUp = () => onEnd();
      const handleTouchEnd = () => onEnd();

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, onMove, onEnd]);

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setHasMoved(false);
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
        onMouseDown={(e) => {
          e.preventDefault();
          onStart(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          onStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        className={`w-24 h-24 relative z-20 select-none cursor-grab active:cursor-grabbing touch-none flex items-center justify-center ${isDragging ? 'z-50' : ''}`}
      >
        <img 
          src="/porygon.svg" 
          alt="Porygon" 
          className="w-24 h-24 opacity-90"
          draggable={false}
        />
        
        {/* Subtle shadow/indicator when dragging */}
        {isDragging && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20 animate-pulse scale-110" />
        )}
      </div>
    </div>
  );
}
