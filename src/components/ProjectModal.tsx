"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Minus, X, Terminal, ChevronDown, ChevronUp, Layout } from 'lucide-react';
import { projects, Project } from '@/data/projects';

interface ProjectModalProps {
  activeId: string | null;
  onClose: () => void;
  onMinimize: (id: string, title: string) => void;
  skipBoot?: boolean;
}

type ModalState = 'idle' | 'booting' | 'detail';

export default function ProjectModal({ activeId, onClose, onMinimize, skipBoot }: ProjectModalProps) {
  const [modalState, setModalState] = useState<ModalState>(skipBoot ? 'detail' : 'idle');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [localFeatureIdx, setLocalFeatureIdx] = useState(0); // For mobile independent swiping
  const [showMetrics, setShowMetrics] = useState(false);
  const project = projects.find(p => p.id === activeId);
  
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeId && project) {
      setShowMetrics(false);
      setLocalFeatureIdx(0);
      setActiveFeatureIdx(0);
      if (skipBoot) {
        setModalState('detail');
      } else {
        setModalState('booting');
        setBootLines([]);
        
        let currentLine = 0;
        const typeNextLine = () => {
          if (currentLine < project.terminalBoot.length) {
            const line = project.terminalBoot[currentLine];
            setBootLines(prev => [...prev, line]);
            currentLine++;
            const delay = line.startsWith('$') ? 250 : 120;
            setTimeout(typeNextLine, delay);
          } else {
            setTimeout(() => setModalState('detail'), 600);
          }
        };
        
        setTimeout(typeNextLine, 200);
      }
      document.body.style.overflow = 'hidden';
    } else {
      setModalState('idle');
      document.body.style.overflow = '';
    }
  }, [activeId, project, skipBoot]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Sync local index with scroll index initially or when scrolling
  useEffect(() => {
    setLocalFeatureIdx(activeFeatureIdx);
  }, [activeFeatureIdx]);

  useEffect(() => {
    if (modalState !== 'detail') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = featureRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveFeatureIdx(idx);
          }
        });
      },
      { threshold: 0.4, root: scrollRef.current }
    );
    featureRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [modalState, project]);

  if (!activeId || !project) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${activeId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-[rgba(253,253,251,0.92)] backdrop-blur-[8px]" onClick={onClose} />

      <div className={`relative w-full h-full md:w-[92vw] md:h-[85vh] bg-paper rounded-[2px] border border-dashed border-border-strong overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col ${modalState !== 'idle' ? 'animate-modal-enter' : 'opacity-0 scale-[0.96]'}`}>
        
        {/* Background Hatching */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
             style={{ backgroundImage: `repeating-linear-gradient(-45deg, var(--ink) 0px, var(--ink) 1px, transparent 1px, transparent 10px)` }} />

        {/* Chrome Bar */}
        <div className="flex items-center gap-4 p-4 border-b border-dashed border-border-strong shrink-0 relative z-10 bg-paper">
          <div className="flex gap-1.5 px-2">
            <button 
              onClick={onClose}
              className="w-3 h-3 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/40 transition-colors flex items-center justify-center group"
            >
              <X size={8} className="text-red-600 opacity-0 group-hover:opacity-100" />
            </button>
            <button 
              onClick={() => onMinimize(project.id, project.title)}
              className="w-3 h-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/40 transition-colors flex items-center justify-center group"
            >
              <Minus size={8} className="text-yellow-600 opacity-0 group-hover:opacity-100" />
            </button>
            <div className="w-3 h-3 rounded-full border border-green-500/30 bg-green-500/10" />
          </div>
          
          <div className="flex-1 text-center font-mono text-[10px] text-ink-faint uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Terminal size={12} />
            {project.slug}.sys_inspect
          </div>

          <div className="flex items-center gap-2">
            {/* Analysis button ONLY on mobile description */}
            <button 
              onClick={() => setShowMetrics(!showMetrics)}
              className={`md:hidden font-mono text-[10px] px-3 py-1.5 transition-all flex items-center gap-2 border border-dashed ${showMetrics ? 'bg-accent text-white border-accent' : 'text-ink-muted border-border-strong hover:bg-accent-light hover:border-solid hover:text-accent'}`}
            >
              <Layout size={12} />
              <span>{showMetrics ? 'HIDE ANALYSIS' : 'VIEW ANALYSIS'}</span>
            </button>
            {project.links.github && (
              <a 
                href={project.links.github} 
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-ink-muted hover:text-accent border border-dashed border-border-strong px-3 py-1.5 transition-all cursor-pointer flex items-center gap-2 hover:bg-accent-light hover:border-solid"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span className="hidden sm:inline">CODE</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 relative flex overflow-hidden">
          {/* BOOT PHASE */}
          {modalState === 'booting' && (
            <div className="absolute inset-0 p-6 md:p-12 font-mono text-[12px] md:text-[13px] text-ink bg-paper z-20 flex flex-col">
              <div className="max-w-2xl">
                {bootLines.map((line, i) => (
                  <div key={i} className={`mb-2 ${line.startsWith('$') ? 'text-accent' : 'text-ink-muted'}`}>
                    {line}
                  </div>
                ))}
                <div className="w-2 h-4 bg-accent animate-pulse inline-block align-middle ml-1" />
              </div>
            </div>
          )}

          {/* DETAIL PHASE */}
          <div className={`flex-1 flex flex-col md:flex-row overflow-hidden transition-opacity duration-700 ${modalState === 'detail' ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* LEFT: Content */}
            <div ref={scrollRef} className={`flex-1 overflow-y-auto transition-all duration-500 border-dashed border-border-strong p-6 md:p-16 scroll-smooth bg-paper/50 relative z-10 md:w-[60%] md:border-r`}>
              <div className="mb-12 md:mb-20">
                <div className="font-mono text-[10px] text-accent tracking-[0.15em] mb-4 uppercase font-medium">
                  {project.category} · {project.statusLabel}
                </div>
                <h1 className="font-serif text-[28px] md:text-[42px] text-ink font-normal mb-6 leading-tight italic">
                  {project.title}
                </h1>
                <p className="font-mono text-[12px] md:text-[13px] text-ink-muted tracking-tight leading-relaxed max-w-[480px]">
                  {project.oneLiner}
                </p>
              </div>

              {/* Mobile: Inline metrics panel */}
              {showMetrics && (
                <div className="md:hidden mb-10 space-y-6 animate-modal-enter">
                  {/* Visualizer - swipe to change analysis independent of text scroll */}
                  <div 
                    className="relative border border-dashed border-border-strong bg-[rgba(0,71,255,0.01)] h-[240px] flex flex-col items-center justify-center p-8 touch-pan-x cursor-ew-resize"
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      (e.currentTarget as any).startX = touch.clientX;
                    }}
                    onTouchEnd={(e) => {
                      const touch = e.changedTouches[0];
                      const startX = (e.currentTarget as any).startX;
                      const diff = touch.clientX - startX;
                      if (Math.abs(diff) > 50) {
                        const nextIdx = diff > 0 
                          ? Math.max(0, localFeatureIdx - 1)
                          : Math.min(project.features.length - 1, localFeatureIdx + 1);
                        setLocalFeatureIdx(nextIdx);
                      }
                    }}
                  >
                    <div className="font-mono text-[10px] text-accent text-center uppercase tracking-widest mb-2 px-4 py-1 border border-dashed border-accent/20">
                      {project.features[localFeatureIdx]?.heading || 'ANALYSIS'}
                    </div>
                    <div className="font-mono text-[9px] text-ink-faint uppercase tracking-tighter mt-4">
                      Visual Context Generator v1.0
                    </div>
                    <div className="absolute inset-x-12 top-1/2 h-[1px] bg-border-strong/30" />
                    <div className="absolute inset-y-12 left-1/2 w-[1px] bg-border-strong/30" />
                    
                    <div className="absolute bottom-4 flex gap-1.5">
                      {project.features.map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 h-1 rounded-full ${i === localFeatureIdx ? 'bg-accent' : 'bg-border-strong'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-border-strong border border-dashed border-border-strong">
                    {project.metrics.map((metric, i) => (
                      <div key={i} className="bg-paper p-4">
                        <div className="font-mono text-[14px] font-medium text-ink italic">
                          {metric.value}
                        </div>
                        <div className="font-mono text-[8px] text-ink-faint uppercase tracking-wider mt-1">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {project.techStack.map(tech => (
                      <span key={tech} className="font-mono text-[10px] text-ink-muted border border-dashed border-border-strong px-2.5 py-1">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-16 md:space-y-24">
                {project.features.map((feature, i) => (
                  <div 
                    key={feature.id} 
                    ref={el => { featureRefs.current[i] = el; }}
                    className="feature-block border-t border-dashed border-border-strong pt-10 md:pt-16 first:border-t-0 first:pt-0"
                  >
                    <div className="font-mono text-[9px] text-ink-faint mb-4 md:mb-6 uppercase tracking-[0.25em]">
                      module_0{i + 1}
                    </div>
                    <h2 className="font-serif text-[18px] md:text-[22px] text-ink font-medium mb-4 md:mb-6 italic">
                      {feature.heading}
                    </h2>
                    <p className="font-mono text-[11px] md:text-[12px] text-ink-muted leading-[1.8] max-w-[520px]">
                      {feature.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-40" />
            </div>

            {/* RIGHT: Visuals/Metrics — Always visible on desktop */}
            <div className="hidden md:flex md:w-[40%] bg-paper p-16 flex-col gap-10 relative z-10">
              <span className="absolute top-4 left-4 font-mono text-[10px] text-ink-faint">+</span>
              <span className="absolute top-4 right-4 font-mono text-[10px] text-ink-faint">+</span>
              <span className="absolute bottom-4 left-4 font-mono text-[10px] text-ink-faint">+</span>
              <span className="absolute bottom-4 right-4 font-mono text-[10px] text-ink-faint">+</span>

              <div className="relative border border-dashed border-border-strong bg-[rgba(0,71,255,0.01)] h-[240px] flex flex-col items-center justify-center p-8">
                <div className="font-mono text-[10px] text-accent text-center uppercase tracking-widest mb-2 px-4 py-1 border border-dashed border-accent/20">
                  {project.features[activeFeatureIdx]?.heading || 'ANALYSIS'}
                </div>
                <div className="font-mono text-[9px] text-ink-faint uppercase tracking-tighter mt-4">
                  Visual Context Generator v1.0
                </div>
                <div className="absolute inset-x-12 top-1/2 h-[1px] bg-border-strong/30" />
                <div className="absolute inset-y-12 left-1/2 w-[1px] bg-border-strong/30" />
              </div>

              <div className="grid grid-cols-2 gap-px bg-border-strong border border-dashed border-border-strong">
                {project.metrics.map((metric, i) => (
                  <div key={i} className="bg-paper p-6">
                    <div className="font-mono text-[16px] font-medium text-ink italic">
                      {metric.value}
                    </div>
                    <div className="font-mono text-[9px] text-ink-faint uppercase tracking-wider mt-1">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {project.techStack.map(tech => (
                  <span key={tech} className="font-mono text-[10px] text-ink-muted border border-dashed border-border-strong px-2.5 py-1">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
