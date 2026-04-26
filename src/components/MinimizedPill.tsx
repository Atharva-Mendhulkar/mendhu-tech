"use client";

import React from 'react';
import { X, Maximize2 } from 'lucide-react';

interface MinimizedPillProps {
  item: { id: string; title: string; type: 'garden' | 'project' };
  onRestore: () => void;
  onClose: () => void;
}

export default function MinimizedPill({ item, onRestore, onClose }: MinimizedPillProps) {
  return (
    <div className="group flex items-center gap-3 bg-paper border border-solid border-accent p-1.5 pl-4 rounded-full shadow-[0_8px_30px_rgba(0,71,255,0.15)] animate-pill-in hover:scale-105 transition-all cursor-pointer">
      {/* Banyan Stylized SVG */}
      <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent">
          <path d="M12 22V14M12 14C12 14 11 11 8 11M12 14C12 14 13 11 16 11M12 8C12 8 9 8 7 11M12 8C12 8 15 8 17 11M12 5V8M12 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <div 
        onClick={onRestore}
        className="flex flex-col pr-4 border-r border-dashed border-accent/20"
      >
        <span className="font-mono text-[8px] text-accent/60 uppercase tracking-widest leading-none mb-1">
          {item.type === 'garden' ? 'Archive' : 'Project'}
        </span>
        <span className="font-serif text-[13px] text-ink italic font-medium leading-none truncate max-w-[120px]">
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onRestore(); }}
          className="p-1.5 hover:bg-accent-light rounded-full text-accent transition-colors"
          title="Restore"
        >
          <Maximize2 size={12} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1.5 hover:bg-red-50 rounded-full text-red-500 transition-colors"
          title="Close"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
