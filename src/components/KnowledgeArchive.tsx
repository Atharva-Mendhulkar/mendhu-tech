"use client";

import React from 'react';

interface KnowledgeArchiveProps {
  onOpenGarden: () => void;
}

export default function KnowledgeArchive({ onOpenGarden }: { onOpenGarden: () => void }) {
  return (
    <section className="pt-8 pb-10 border-b border-dashed border-border-strong relative z-10">
      <div className="section-tag">[04_DIGITAL_GARDEN]</div>
      
      <div 
        className="garden-tile grid grid-cols-1 md:grid-cols-2 gap-6 items-center border border-dashed border-border-strong p-10 bg-paper rounded-xl relative z-10 group cursor-pointer hover:border-solid hover:border-accent transition-all duration-300 overflow-hidden fade-in"
        onClick={onOpenGarden}
      >
        {/* Background Asset - Banyan Tree with hatching */}
        <div className="absolute right-[-40px] top-[-40px] w-[450px] h-[450px] opacity-[0.1] pointer-events-none select-none group-hover:opacity-[0.15] transition-opacity">
          <img src="/banyan.svg" alt="Digital Garden Banyan Tree Illustration" className="w-full h-full object-contain" />
        </div>

        {/* Corner Marks */}
        <span className="absolute top-2 left-2 font-mono text-[9px] text-ink-faint">+</span>
        <span className="absolute top-2 right-2 font-mono text-[9px] text-ink-faint">+</span>
        <span className="absolute bottom-2 left-2 font-mono text-[9px] text-ink-faint">+</span>
        <span className="absolute bottom-2 right-2 font-mono text-[9px] text-ink-faint">+</span>

        <div className="relative z-10">
          <div className="font-serif text-[22px] text-ink font-medium mb-4 italic tracking-tight">The Knowledge Garden</div>
          <div className="font-mono text-[11px] text-ink-muted leading-[1.8] max-w-[420px]">
            An interactive knowledge graph built from research notes. 
            Synthesizing 20+ nodes across fluid dynamics, kernel architecture, and agentic security.
          </div>
        </div>
        
        <div className="flex justify-end relative">
          {/* Background Overlay Layer (Banyan Watermark) */}
          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-40 transform translate-x-4 translate-y-[-4px] hidden md:flex">
            <img src="/banyan.svg" alt="" className="w-[240px] h-[240px] object-contain" />
          </div>

          <div className="relative z-10">
            <button 
              className="font-mono text-[11px] text-accent border border-dashed border-accent px-8 py-2.5 hover:bg-accent-light transition-all cursor-pointer group-hover:border-solid uppercase tracking-widest bg-paper/50 backdrop-blur-[2px]" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenGarden();
              }}
            >
              [open garden →]
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
