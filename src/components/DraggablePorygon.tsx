"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'dragging' | 'snapped' | 'returning';

// ── dialogue ─────────────────────────────────────────────────────────────────
// Kept intentionally sparse — silence > noise.

const DIALOGUE = {
  first: [
    "Oh. You're real.",
    "User detected.",
    "Hello, operator.",
    "You found me.",
    "I was waiting.",
  ],
  progression: [
    ["Input received.", "Processing…"],       // interactions 1–3
    ["You again.", "Still here.", "Hmm."],    // 4–7
    ["Predictable.", "I see a pattern."],     // 8+
  ],
  zones: {
    name:     ["Creator… probably.", "Main character?"],
    logs:     ["Brain dump.", "Thinking… loudly."],
    projects: ["Built, not talked.", "It runs. Mostly."],
    garden:   ["Touch grass. Mentally.", "Messy on purpose."],
  },
  rare:   ["Beep. Interesting.", "Data smells good.", "Worth inspecting.", "Suspiciously smart."],
  snap:   ["Connection established", "Linked."],
  recall: ["LEAVE ME ALONE!", "Ahhhhhhhhhh.....", "Back to base.", "Fine. Coming back."],
};

// ─────────────────────────────────────────────────────────────────────────────

export default function DraggablePorygon() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [phase, setPhase]       = useState<Phase>('idle');
  const [message, setMessage]   = useState<string | null>(null);

  // ── element refs ──────────────────────────────────────────────────────────
  const iconRef = useRef<HTMLDivElement>(null);

  // ── drag refs ─────────────────────────────────────────────────────────────
  const draggingRef   = useRef(false);
  const posRef        = useRef({ x: 0, y: 0 });
  // naturalPos = viewport position of the element with no transform applied.
  // Computed once on pointerdown so moves are pure offset math.
  const naturalPosRef = useRef({ x: 0, y: 0 });
  // dragAnchor = cursor offset within the element at grab time.
  const dragAnchorRef = useRef({ x: 0, y: 0 });
  // hasLeftThreshold kept as ref so the single-mount effect never goes stale.
  const hasLeftThresholdRef = useRef(false);

  // ── timer refs ────────────────────────────────────────────────────────────
  const snapTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── dialogue refs (all mutation via ref → no effect re-run needed) ────────
  const cooldownRef      = useRef(false);
  const lastMessageRef   = useRef<string | null>(null);
  const lastRareRef      = useRef(false);
  const interactionRef   = useRef(0);
  const hasInteractedRef = useRef(false);

  // ── zone refs ─────────────────────────────────────────────────────────────
  const lastZoneRef    = useRef<string | null>(null);
  const pendingZoneRef = useRef<string | null>(null);
  const zoneTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneLockRef    = useRef(false);

  // ── zone detection (pure rect check — no DOM stacking / z-index noise) ───

  const detectZone = (clientX: number, clientY: number): string | null => {
    for (const zone of ['name', 'logs', 'projects', 'garden']) {
      const el = document.querySelector(`[data-${zone}-target]`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return zone;
      }
    }
    return null;
  };

  // ── dialogue ──────────────────────────────────────────────────────────────

  /** Display a message and start auto-dismiss + post-dismiss cooldown. */
  const showMessage = (text: string, duration = 1700) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(text);
    lastMessageRef.current = text;
    messageTimerRef.current = setTimeout(() => {
      setMessage(null);
      setTimeout(() => { cooldownRef.current = false; }, 600);
    }, duration);
  };

  /**
   * Fire a dialogue line if cooldown allows.
   * Cooldown acts as the priority gate: once anything is showing nothing else
   * can interrupt, so call order (first > drag > zone > snap) is enforced by
   * the caller.
   */
  const triggerDialogue = (
    type: 'first' | 'drag' | 'zone' | 'snap' | 'recall',
    zoneKey?: keyof typeof DIALOGUE.zones,
  ) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;

    let pool: string[] = [];

    // Rare override — 8 %, never back-to-back (skip for recall, keep it grounded)
    if (type !== 'recall' && !lastRareRef.current && Math.random() < 0.08) {
      pool = DIALOGUE.rare;
      lastRareRef.current = true;
    } else {
      lastRareRef.current = false;
      const n = interactionRef.current;
      if      (type === 'first')  pool = DIALOGUE.first;
      else if (type === 'drag')   pool = DIALOGUE.progression[n < 4 ? 0 : n < 8 ? 1 : 2];
      else if (type === 'zone' && zoneKey) pool = DIALOGUE.zones[zoneKey];
      else if (type === 'snap')   pool = DIALOGUE.snap;
      else if (type === 'recall') pool = DIALOGUE.recall;
    }

    if (!pool.length) { cooldownRef.current = false; return; }

    const filtered = pool.filter(m => m !== lastMessageRef.current);
    const src      = filtered.length ? filtered : pool;
    const selected = src[Math.floor(Math.random() * src.length)];

    if (type === 'first') {
      // Two-phase: scanning → real line
      showMessage('Scanning…', 750);
      setTimeout(() => showMessage(selected, 1900), 950);
    } else {
      showMessage(selected, 1600);
    }
  };

  // ── reset ─────────────────────────────────────────────────────────────────

  const doReset = useCallback(() => {
    if (snapTimerRef.current) { clearTimeout(snapTimerRef.current); snapTimerRef.current = null; }
    posRef.current            = { x: 0, y: 0 };
    hasLeftThresholdRef.current = false;
    draggingRef.current       = false;
    lastZoneRef.current       = null;
    pendingZoneRef.current    = null;
    setPosition({ x: 0, y: 0 });
    setPhase('returning');
    document.body.classList.remove('porygon-dragging');
    setTimeout(() => setPhase('idle'), 520);
  }, []);

  // ── single-mount pointer effect ───────────────────────────────────────────
  // All mutable logic goes through refs — effect runs exactly once.

  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;

      // Picking up while snapped cancels the auto-reset
      if (snapTimerRef.current) { clearTimeout(snapTimerRef.current); snapTimerRef.current = null; }

      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      // Cursor offset within the element — preserved throughout the drag
      dragAnchorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      // Natural (untranslated) viewport position — fixed for this drag session
      naturalPosRef.current = { x: rect.left - posRef.current.x, y: rect.top - posRef.current.y };

      draggingRef.current = true;
      setPhase('dragging');
      document.body.classList.add('porygon-dragging');

      interactionRef.current += 1;

      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        triggerDialogue('first');              // highest priority
      } else if (interactionRef.current % 3 === 0) {
        triggerDialogue('drag');               // every 3rd pick-up only
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;

      // Pixel-accurate position: element top-left placed so cursor stays at dragAnchor
      const newX = e.clientX - dragAnchorRef.current.x - naturalPosRef.current.x;
      const newY = e.clientY - dragAnchorRef.current.y - naturalPosRef.current.y;
      const dist = Math.sqrt(newX * newX + newY * newY);

      if (dist > 80) hasLeftThresholdRef.current = true;

      // Magnetic return: pulled close to origin after straying → auto-reset
      if (dist < 50 && hasLeftThresholdRef.current) {
        doReset();
        return;
      }

      posRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });

      // Zone detection — 100 ms dwell before triggering to prevent flicker
      const zone = detectZone(e.clientX, e.clientY);
      if (zone !== pendingZoneRef.current) {
        pendingZoneRef.current = zone;
        if (zoneTimerRef.current) clearTimeout(zoneTimerRef.current);

        if (zone && zone !== lastZoneRef.current && !zoneLockRef.current) {
          zoneTimerRef.current = setTimeout(() => {
            if (pendingZoneRef.current === zone) {
              lastZoneRef.current = zone;
              triggerDialogue('zone', zone as keyof typeof DIALOGUE.zones);
              // Brief lock so boundary jitter can't re-fire
              zoneLockRef.current = true;
              setTimeout(() => { zoneLockRef.current = false; }, 500);
            }
          }, 100);
        } else if (!zone) {
          // Exited all zones — allow same zone to trigger again next entry
          lastZoneRef.current = null;
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current    = false;
      pendingZoneRef.current = null;
      document.body.classList.remove('porygon-dragging');

      const zone = detectZone(e.clientX, e.clientY);
      if (zone === 'name') {
        setPhase('snapped');
        triggerDialogue('snap');
        snapTimerRef.current = setTimeout(doReset, 1000);
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
      // ⚠️ intentionally NOT clearing snapTimerRef here —
      //    the cleanup runs on unmount only (single-mount effect),
      //    and doReset() already owns the timer lifecycle.
    };
  }, [doReset]); // doReset is stable via useCallback; effect mounts once.

  // ── derived ───────────────────────────────────────────────────────────────

  const isDragging  = phase === 'dragging';
  const isSnapped   = phase === 'snapped';
  const isReturning = phase === 'returning';
  const hasMoved    = phase !== 'idle' || position.x !== 0 || position.y !== 0;

  const transition = isDragging
    ? 'none'
    : isReturning
    ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    : 'transform 0.2s ease';

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex items-center justify-center w-24 h-24">

      {/* Return-to-origin button */}
      {hasMoved && !isSnapped && (
        <button
          onClick={() => { triggerDialogue('recall'); doReset(); }}
          className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-dashed border-accent text-accent flex items-center justify-center bg-paper hover:bg-accent-light hover:border-solid transition-all z-0 group"
          title="Return Porygon"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      )}

      {/* Porygon */}
      <div
        ref={iconRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition, touchAction: 'none' }}
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

        {/* Dialogue bubble */}
        {message && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 font-mono text-[9px] text-accent border border-dashed border-accent bg-accent-light px-3 py-1.5 whitespace-nowrap pointer-events-none select-none z-[100000]"
            style={{ borderRadius: 2, animation: 'fadein 0.2s ease forwards' }}
          >
            {message}
          </div>
        )}

        {/* Spinning ring while dragging */}
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