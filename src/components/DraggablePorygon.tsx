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
  const posRef       = useRef({ x: 0, y: 0 });
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // dialogue refs (memory)
  const lastMessageRef = useRef<string | null>(null);
  const lastZoneRef    = useRef<string | null>(null);
  const cooldownRef    = useRef(false);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── dialogue logic ───────────────────────────────────────────────────────

  const triggerDialogue = useCallback((type: 'progression' | 'zone' | 'snap', zoneKey?: keyof typeof DIALOGUE_POOLS.zones) => {
    if (cooldownRef.current) return;

    let pool: string[] = [];
    
    // Step 1: Rare override (7% chance)
    if (Math.random() < 0.07) {
      pool = DIALOGUE_POOLS.rare;
    } else {
      // Step 2: Normal selection
      if (!hasInteracted) {
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

    // Validation & Commit
    if (selected === lastMessageRef.current) return;

    // First interaction special handling
    if (!hasInteracted) {
      setMessage("Scanning...");
      cooldownRef.current = true;
      setTimeout(() => {
        setMessage(selected);
        lastMessageRef.current = selected;
        setHasInteracted(true);
        // Start cooldown after the real message appears
        setTimeout(() => {
          cooldownRef.current = false;
        }, 1000);
        // Disappear after 1.5s
        if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        messageTimerRef.current = setTimeout(() => setMessage(null), 1500);
      }, 800);
      return;
    }

    setMessage(selected);
    lastMessageRef.current = selected;
    cooldownRef.current = true;

    // Cooldown & Cleanup
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setMessage(null);
      // Wait a bit more before allowing new messages to prevent jitter
      setTimeout(() => {
        cooldownRef.current = false;
      }, 500);
    }, 1500);
  }, [hasInteracted, interactionCount]);

  const detectZone = (clientX: number, clientY: number) => {
    const els = document.elementsFromPoint(clientX, clientY);
    for (const el of els) {
      if (el.hasAttribute('data-name-target')) return 'name';
      if (el.closest('[data-logs-target]')) return 'logs';
      if (el.closest('[data-projects-target]')) return 'projects';
      if (el.closest('[data-garden-target]')) return 'garden';
    }
    return null;
  };

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

    setTimeout(() => setPhase('idle'), 520);
  }, []);

  // ── pointer events ────────────────────────────────────────────────────────

  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (phase === 'snapped') {
        if (snapTimerRef.current) {
          clearTimeout(snapTimerRef.current);
          snapTimerRef.current = null;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      if (snapTimerRef.current) {
        clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }

      draggingRef.current = true;
      setPhase('dragging');
      document.body.classList.add('porygon-dragging');
      
      setInteractionCount(prev => prev + 1);
      triggerDialogue('progression');

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

      // Zone detection
      const zone = detectZone(e.clientX, e.clientY);
      if (zone && zone !== lastZoneRef.current) {
        lastZoneRef.current = zone;
        triggerDialogue('zone', zone as keyof typeof DIALOGUE_POOLS.zones);
      } else if (!zone) {
        lastZoneRef.current = null;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;

      draggingRef.current = false;
      document.body.classList.remove('porygon-dragging');

      const zone = detectZone(e.clientX, e.clientY);
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
  }, [phase, hasLeftThreshold, triggerDialogue, doReset]);

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
          isDragging  ? 'z-[99999] scale-110 drop-shadow-2xl cursor-grabbing' : '',
          isSnapped   ? 'z-[99999] scale-125 cursor-grab' : '',
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
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30 animate-spin-slow scale-125 pointer-events-none" />
        )}

        {/* Pulsing ring while snapped */}
        {isSnapped && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent scale-150 animate-ping pointer-events-none opacity-60" />
        )}
      </div>
    </div>
  );
}