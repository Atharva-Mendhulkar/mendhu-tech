"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'dragging' | 'snapped' | 'returning';

// ── dialogue constants ───────────────────────────────────────────────────

const DIALOGUE_POOLS = {
  first: [
    "Oh. You’re real.",
    "User detected.",
    "Interaction… unexpected.",
    "You activated me.",
    "You found me.",
    "Hello, operator.",
    "I was waiting.",
    "You weren’t supposed to find this…"
  ],
  mood: {
    neutral: ["User detected.", "Input received."],
    curious: ["You again.", "Exploring…", "Still here.", "Interesting."],
    witty: ["I see a pattern.", "Consistent behavior.", "You like this.", "Predictable."]
  },
  zones: {
    name: ["Creator… probably.", "Main character?"],
    logs: ["Brain dump.", "Thinking… loudly.", "Mind in progress."],
    projects: ["Built, not talked.", "Breakable systems.", "It runs. Mostly."],
    garden: ["Touch grass. Mentally.", "Messy on purpose.", "Connections everywhere."]
  },
  rare: [
    "Beep. Interesting.",
    "Scan complete… maybe.",
    "Suspiciously smart.",
    "Data smells good.",
    "Worth inspecting."
  ]
};

export default function DraggablePorygon() {
  const [position, setPosition]                 = useState({ x: 0, y: 0 });
  const [phase, setPhase]                       = useState<Phase>('idle');
  const [hasLeftThreshold, setHasLeftThreshold] = useState(false);
  
  // dialogue state
  const [message, setMessage]                   = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hasInteracted, setHasInteracted]       = useState(false);

  const iconRef      = useRef<HTMLDivElement>(null);
  const draggingRef  = useRef(false);
  const startPos     = useRef({ x: 0, y: 0 });
  const clickOffset  = useRef({ x: 0, y: 0 });
  const posRef       = useRef({ x: 0, y: 0 });
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // dialogue refs (memory & control)
  const lastMessageRef = useRef<string | null>(null);
  const lastZoneRef    = useRef<string | null>(null);
  const cooldownRef    = useRef(false);
  const isRareRef      = useRef(false);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // zone stability refs
  const zoneStabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneLockRef           = useRef(false);
  const pendingZoneRef        = useRef<string | null>(null);

  // ── zone detection ───────────────────────────────────────────────────────

  const getZoneRects = useCallback(() => {
    const zones = ['name', 'logs', 'projects', 'garden'];
    const rects: Record<string, DOMRect> = {};
    zones.forEach(z => {
      const el = document.querySelector(`[data-${z}-target]`);
      if (el) rects[z] = el.getBoundingClientRect();
    });
    return rects;
  }, []);

  const detectZoneByRect = useCallback((clientX: number, clientY: number) => {
    const rects = getZoneRects();
    for (const [zone, rect] of Object.entries(rects)) {
      if (
        clientX >= rect.left && 
        clientX <= rect.right && 
        clientY >= rect.top && 
        clientY <= rect.bottom
      ) {
        return zone;
      }
    }
    return null;
  }, [getZoneRects]);

  // ── dialogue logic ───────────────────────────────────────────────────────

  const triggerDialogue = useCallback((type: 'first' | 'progression' | 'zone' | 'snap', zoneKey?: keyof typeof DIALOGUE_POOLS.zones) => {
    if (cooldownRef.current) return;
    
    // Priority check: Lower priority must not override higher if a message is active
    // 1. first, 2. progression (drag start), 3. zone, 4. snap
    if (message) {
       const priorities = { 'first': 4, 'progression': 3, 'zone': 2, 'snap': 1 };
       // This is a simplified priority — basically if something is showing, don't interrupt
       // unless it's a higher priority event. But since we have a hard cooldown, we just return.
       return;
    }

    let pool: string[] = [];
    let wasRare = false;
    
    // Step 1: Rare override (10% chance, no back-to-back)
    if (Math.random() < 0.10 && !isRareRef.current) {
      pool = DIALOGUE_POOLS.rare;
      wasRare = true;
    } else {
      // Step 2: Normal selection
      if (type === 'first') {
        pool = DIALOGUE_POOLS.first;
      } else if (type === 'progression') {
        if (interactionCount < 3) pool = DIALOGUE_POOLS.mood.neutral;
        else if (interactionCount < 6) pool = DIALOGUE_POOLS.mood.curious;
        else pool = DIALOGUE_POOLS.mood.witty;
      } else if (type === 'zone' && zoneKey) {
        pool = DIALOGUE_POOLS.zones[zoneKey];
      } else if (type === 'snap') {
        pool = ["✦ Connection established"];
      }
    }

    if (pool.length === 0) return;

    // Selection rules
    const filteredPool = pool.filter(msg => msg !== lastMessageRef.current);
    const finalPool = filteredPool.length > 0 ? filteredPool : pool;
    const selected = finalPool[Math.floor(Math.random() * finalPool.length)];

    if (selected === lastMessageRef.current) return;

    // First interaction special handling
    if (type === 'first' && !hasInteracted) {
      setMessage("Scanning...");
      cooldownRef.current = true;
      setTimeout(() => {
        setMessage(selected);
        lastMessageRef.current = selected;
        setHasInteracted(true);
        isRareRef.current = wasRare;
        setTimeout(() => { cooldownRef.current = false; }, 1500);
        if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        messageTimerRef.current = setTimeout(() => setMessage(null), 1500);
      }, 800);
      return;
    }

    setMessage(selected);
    lastMessageRef.current = selected;
    isRareRef.current = wasRare;
    cooldownRef.current = true;

    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setMessage(null);
      setTimeout(() => { cooldownRef.current = false; }, 1000);
    }, 1500);
  }, [hasInteracted, interactionCount, message]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const doReset = useCallback(() => {
    if (snapTimerRef.current) {
      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }
    posRef.current = { x: 0, y: 0 };
    setPosition({ x: 0, y: 0 });
    setPhase('returning');
    setHasLeftThreshold(false);
    draggingRef.current = false;
    document.body.classList.remove('porygon-dragging');
    lastZoneRef.current = null;
    pendingZoneRef.current = null;

    setTimeout(() => setPhase('idle'), 520);
  }, []);

  // ── pointer events ────────────────────────────────────────────────────────

  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      
      const rect = el.getBoundingClientRect();
      clickOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (phase === 'snapped') {
        if (snapTimerRef.current) {
          clearTimeout(snapTimerRef.current);
          snapTimerRef.current = null;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      draggingRef.current = true;
      setPhase('dragging');
      document.body.classList.add('porygon-dragging');
      
      setInteractionCount(prev => {
        const next = prev + 1;
        if (!hasInteracted) triggerDialogue('first');
        else triggerDialogue('progression');
        return next;
      });

      startPos.current = {
        x: e.clientX - posRef.current.x,
        y: e.clientY - posRef.current.y,
      };
    };

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;

      const newX = e.clientX - startPos.current.x;
      const newY = e.clientY - startPos.current.y;
      const dist = Math.sqrt(newX * newX + newY * newY);

      if (dist > 80) setHasLeftThreshold(true);

      if (dist < 50 && hasLeftThreshold) {
        doReset();
        return;
      }

      posRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });

      // Zone detection with stability threshold
      const zone = detectZoneByRect(e.clientX, e.clientY);
      
      if (zone !== pendingZoneRef.current) {
        pendingZoneRef.current = zone;
        if (zoneStabilityTimerRef.current) clearTimeout(zoneStabilityTimerRef.current);
        
        if (zone && zone !== lastZoneRef.current && !zoneLockRef.current) {
          zoneStabilityTimerRef.current = setTimeout(() => {
            if (pendingZoneRef.current === zone) {
              lastZoneRef.current = zone;
              triggerDialogue('zone', zone as keyof typeof DIALOGUE_POOLS.zones);
              
              // Zone Lock
              zoneLockRef.current = true;
              setTimeout(() => { zoneLockRef.current = false; }, 500);
            }
          }, 100);
        } else if (!zone) {
          lastZoneRef.current = null;
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;

      draggingRef.current = false;
      document.body.classList.remove('porygon-dragging');
      pendingZoneRef.current = null;

      const zone = detectZoneByRect(e.clientX, e.clientY);
      if (zone === 'name') {
        setPhase('snapped');
        triggerDialogue('snap');
        snapTimerRef.current = setTimeout(() => {
          doReset();
        }, 2000);
      } else {
        setPhase('idle');
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
    };
  }, [phase, hasLeftThreshold, triggerDialogue, doReset, detectZoneByRect, hasInteracted]);

  // ── derived ───────────────────────────────────────────────────────────────

  const isDragging  = phase === 'dragging';
  const isSnapped   = phase === 'snapped';
  const isReturning = phase === 'returning';
  const hasMoved    = phase !== 'idle' || position.x !== 0 || position.y !== 0;

  const transition = isDragging
    ? 'none'
    : isReturning
    ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    : isSnapped
    ? 'transform 0.2s ease'
    : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex items-center justify-center w-24 h-24">

      {/* Return button */}
      {hasMoved && !isSnapped && (
        <button
          onClick={doReset}
          className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-dashed border-accent text-accent flex items-center justify-center bg-paper hover:bg-accent-light hover:border-solid transition-all z-0 group"
          title="Return Porygon"
        >
          <RefreshCw
            size={14}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
        </button>
      )}

      {/* Porygon */}
      <div
        ref={iconRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition,
          touchAction: 'none',
        }}
        className={[
          'w-24 h-24 relative select-none flex items-center justify-center pointer-events-auto',
          isDragging  ? 'z-[99999] drop-shadow-2xl cursor-grabbing' : '',
          isSnapped   ? 'z-[99999] cursor-grab' : '',
          isReturning ? 'z-[99999] opacity-75' : '',
          phase === 'idle' ? 'z-[1000] hover:scale-105 cursor-grab' : '',
        ].join(' ')}
      >
        <img
          src="/porygon.svg"
          alt="Interactive Porygon mascot"
          className="w-full h-full opacity-90 pointer-events-none"
          draggable={false}
        />

        {/* Dialogue Bubble */}
        {message && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 font-mono text-[9px] text-accent border border-dashed border-accent bg-accent-light px-3 py-1.5 whitespace-nowrap pointer-events-none select-none z-[100000]"
            style={{ 
              borderRadius: 2, 
              animation: 'fadein 0.2s ease forwards',
              boxShadow: '0 4px 12px rgba(0,71,255,0.1)'
            }}
          >
            {message}
          </div>
        )}

        {/* Spinning dashed ring while dragging */}
        {isDragging && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30 animate-spin-slow scale-110 pointer-events-none" />
        )}

        {/* Pulsing ring while snapped */}
        {isSnapped && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent scale-110 animate-ping pointer-events-none opacity-60" />
        )}
      </div>
    </div>
  );
}