"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { ChevronRight, ChevronDown, FileText, Folder, Maximize2, Minimize2, Share2, Globe } from 'lucide-react';
import rawResearchData from '@/data/research.json';

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: 'var(--font-jetbrains-mono)',
  });
}

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      });
    }
  }, [chart]);

  return <div ref={ref} className="mermaid-chart my-8 flex justify-center bg-[rgba(0,71,255,0.02)] border border-dashed border-border-strong p-6 rounded-[2px]" />;
};

// Type the JSON import properly so string indexing works
interface ResearchFile {
  title: string;
  header: string;
  html: string;
  markdown?: string; // We'll use markdown if available, fallback to html
}

interface ResearchNode {
  id: string;
  name: string;
  group: string;
  color: string;
  description: string;
}

interface ResearchLink {
  source: string;
  target: string;
}

interface ResearchData {
  nodes: ResearchNode[];
  links: ResearchLink[];
  files: Record<string, ResearchFile>;
}

const researchData = rawResearchData as ResearchData;

interface GardenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GardenModal({ isOpen, onClose }: GardenModalProps) {
  const fileKeys = Object.keys(researchData.files);
  const [activeFileId, setActiveFileId] = useState<string>(fileKeys[0] || '');
  const [showGraph, setShowGraph] = useState(true);
  const [isGraphMaximized, setIsGraphMaximized] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Systems": true,
    "Security": true,
    "Intelligence": true,
    "General": true
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<number | null>(null);
  const nodesRef = useRef<any[]>([]);
  const dragNodeRef = useRef<any | null>(null);

  // Categorize files into folders
  const categories = {
    "Systems": ["caps", "k-phd", "floework"],
    "Security": ["avara", "shield"],
    "Intelligence": ["agents", "tgnn"],
    "General": ["design"]
  };

  const activeFile: ResearchFile | undefined = researchData.files[activeFileId];

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const activeFileIdRef = useRef(activeFileId);
  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  // Canvas-based force graph with Obsidian-like physics
  useEffect(() => {
    if (!showGraph || !isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize with Observer for smooth transitions
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        
        // Ensure nodes stay within new bounds immediately
        nodesRef.current.forEach(n => {
          n.x = Math.max(20, Math.min(width - 20, n.x));
          n.y = Math.max(20, Math.min(height - 20, n.y));
        });
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Create simulation nodes if not exists
    if (nodesRef.current.length === 0) {
      nodesRef.current = researchData.nodes.map(n => ({
        ...n,
        x: (canvas.width || 400) / 2 + (Math.random() - 0.5) * 200,
        y: (canvas.height || 600) / 2 + (Math.random() - 0.5) * 400,
        vx: 0,
        vy: 0,
        radius: researchData.links.filter(l => l.source === n.id || l.target === n.id).length > 2 ? 14 : 10
      }));
    }
    
    const simNodes = nodesRef.current;

    // Resolve links
    const simLinks = researchData.links
      .map(l => ({
        source: simNodes.find(n => n.id === l.source),
        target: simNodes.find(n => n.id === l.target),
      }))
      .filter((l): l is { source: any; target: any } =>
        l.source !== undefined && l.target !== undefined
      );

    // Interaction handling
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const hit = simNodes.find(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 15;
      });
      
      if (hit) {
        dragNodeRef.current = hit;
        setActiveFileId(hit.id);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragNodeRef.current) {
        const rect = canvas.getBoundingClientRect();
        dragNodeRef.current.x = e.clientX - rect.left;
        dragNodeRef.current.y = e.clientY - rect.top;
        dragNodeRef.current.vx = 0;
        dragNodeRef.current.vy = 0;
      }
    };

    const handleMouseUp = () => {
      dragNodeRef.current = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physics Constants (Obsidian-like gravity - tuned)
      const k = 0.05; // Spring constant
      const damping = 0.9; // Air resistance
      const repulsion = 5000; // Node-node repulsion
      const centerPull = 0.012; // Global gravity towards center
      const linkDist = 120; // Ideal link length

      // Force calculations
      for (let i = 0; i < simNodes.length; i++) {
        const n1 = simNodes[i];
        if (n1 === dragNodeRef.current) continue;
        
        // Center Pull (Gravity)
        n1.vx += (canvas.width / 2 - n1.x) * centerPull;
        n1.vy += (canvas.height / 2 - n1.y) * centerPull;

        for (let j = i + 1; j < simNodes.length; j++) {
          const n2 = simNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);
          
          // Repulsion
          const f = repulsion / distSq;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          n1.vx += fx; n1.vy += fy;
          n2.vx -= fx; n2.vy -= fy;
        }
      }

      // Link Attraction (Springs)
      simLinks.forEach(l => {
        const dx = l.source.x - l.target.x;
        const dy = l.source.y - l.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (dist - linkDist) * k;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        if (l.source !== dragNodeRef.current) {
          l.source.vx -= fx; l.source.vy -= fy;
        }
        if (l.target !== dragNodeRef.current) {
          l.target.vx += fx; l.target.vy += fy;
        }
      });

      // Update positions
      simNodes.forEach(n => {
        if (n === dragNodeRef.current) return;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        
        // Bounds (dynamic to canvas size)
        n.x = Math.max(20, Math.min(canvas.width - 20, n.x));
        n.y = Math.max(20, Math.min(canvas.height - 20, n.y));
      });

      // Draw Links
      ctx.beginPath();
      simLinks.forEach(l => {
        const isActiveLink = l.source.id === activeFileIdRef.current || l.target.id === activeFileIdRef.current;
        const isDraggingLink = l.source === dragNodeRef.current || l.target === dragNodeRef.current;
        
        ctx.setLineDash(isActiveLink ? [] : [4, 4]);
        ctx.strokeStyle = isActiveLink 
          ? 'rgba(0,71,255,0.15)' 
          : isDraggingLink ? 'rgba(0,71,255,0.1)' : 'rgba(26,26,26,0.06)';
        ctx.lineWidth = isActiveLink ? 1.5 : 1;
        
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
      });

      // Draw Nodes
      simNodes.forEach(node => {
        const isActive = node.id === activeFileIdRef.current; 
        const isConnectedToActive = simLinks.some(l => 
          (l.source.id === node.id && l.target.id === activeFileIdRef.current) ||
          (l.target.id === node.id && l.source.id === activeFileIdRef.current)
        );
        
        const col = node.color || '#BDBDBD';
        const r = node.radius;

        // Shadow/Glow for Active/Connected
        if (isActive || isConnectedToActive) {
          ctx.shadowBlur = isActive ? 20 : 10;
          ctx.shadowColor = isActive ? 'rgba(0,71,255,0.3)' : 'rgba(0,71,255,0.15)';
        } else {
          ctx.shadowBlur = 0;
        }

        // Pulse effect for active
        const pulse = isActive ? Math.sin(Date.now() / 300) * 2.5 : 0;

        // 1. Outer Orbit (Dashed)
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.globalAlpha = isActive ? 0.8 : (isConnectedToActive ? 0.4 : 0.15);
        ctx.arc(node.x, node.y, r + 6 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 2. Glass Core
        ctx.beginPath();
        ctx.setLineDash([]);
        
        // Fill gradient
        const grad = ctx.createRadialGradient(node.x - 2, node.y - 2, 0, node.x, node.y, r);
        if (isActive) {
          grad.addColorStop(0, col);
          grad.addColorStop(1, col);
        } else {
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.8, isConnectedToActive ? 'rgba(0,71,255,0.05)' : '#F9F9F7');
          grad.addColorStop(1, isConnectedToActive ? 'rgba(0,71,255,0.1)' : '#F3F3F0');
        }
        
        ctx.fillStyle = grad;
        ctx.strokeStyle = isActive ? col : (isConnectedToActive ? 'rgba(0,71,255,0.3)' : 'rgba(26,26,26,0.1)');
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.arc(node.x, node.y, isActive ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // 3. High-Quality Labels
        const labelText = node.name;
        ctx.font = isActive ? '600 11px var(--font-jetbrains-mono)' : '500 10px var(--font-jetbrains-mono)';
        const textWidth = ctx.measureText(labelText).width;
        
        // Label background pill for active
        if (isActive) {
          ctx.fillStyle = 'rgba(0,71,255,0.05)';
          ctx.beginPath();
          const px = 6, py = 3;
          ctx.roundRect(node.x - textWidth/2 - px, node.y + r + 10, textWidth + px*2, 16, 4);
          ctx.fill();
        }

        ctx.fillStyle = isActive ? 'var(--accent)' : (isConnectedToActive ? 'var(--ink)' : 'var(--ink-muted)');
        ctx.globalAlpha = (isActive || isConnectedToActive) ? 1 : 0.6;
        ctx.textAlign = 'center';
        ctx.fillText(labelText, node.x, node.y + r + 22);
        ctx.globalAlpha = 1;
      });

      simulationRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showGraph, isOpen]);
 // Removed activeFileId and isGraphMaximized to prevent simulation restarts


  const renderContent = () => {
    if (!activeFile) return null;

    // Use markdown if provided, or wrap HTML (though MD is better for "everything GitHub renders")
    const content = activeFile.markdown || activeFile.html;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'mermaid') {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />;
            }
            return inline ? (
              <code className="bg-[rgba(0,71,255,0.06)] px-1.5 py-0.5 rounded-[2px] text-accent font-mono text-[11px]" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-[rgba(26,26,26,0.02)] border border-dashed border-border-strong p-6 my-6 overflow-x-auto rounded-[2px] group relative">
                <div className="absolute top-2 right-2 font-mono text-[8px] text-ink-faint uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  {match?.[1] || 'code'}
                </div>
                <code className="font-mono text-[12px] leading-[1.7] text-ink" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          action_id: ({ children }: any) => <span className="hidden">{children}</span>,
          h1: ({ children }: any) => <h1 className="font-serif text-[32px] font-medium mb-8 text-ink mt-12">{children}</h1>,
          h2: ({ children }: any) => <h2 className="font-serif text-[24px] font-medium mb-6 text-ink mt-10 border-b border-dashed border-border-strong pb-2">{children}</h2>,
          h3: ({ children }: any) => <h3 className="font-serif text-[20px] font-medium mb-4 text-ink mt-8">{children}</h3>,
          p: ({ children }: any) => <div className="font-serif text-[16px] leading-[1.8] text-ink-muted mb-6">{children}</div>,
          ul: ({ children }: any) => <ul className="list-none space-y-3 mb-8 pl-4">{children}</ul>,
          li: ({ children }: any) => (
            <li className="flex items-start gap-3 text-ink-muted font-serif text-[16px]">
              <span className="text-accent mt-1.5 shrink-0"><ChevronRight size={14} /></span>
              {children}
            </li>
          ),
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-2 border-dashed border-accent bg-[rgba(0,71,255,0.02)] pl-6 py-4 my-8 italic text-ink-muted font-serif text-[17px]">
              {children}
            </blockquote>
          ),
          table: ({ children }: any) => (
            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse border border-dashed border-border-strong">
                {children}
              </table>
            </div>
          ),
          th: ({ children }: any) => (
            <th className="border border-dashed border-border-strong p-3 bg-[rgba(26,26,26,0.02)] font-mono text-[11px] text-ink uppercase tracking-wider text-left">
              {children}
            </th>
          ),
          td: ({ children }: any) => (
            <td className="border border-dashed border-border-strong p-3 font-serif text-[14px] text-ink-muted">
              {children}
            </td>
          ),
          img: ({ src, alt }: any) => (
            <div className="my-8 space-y-2">
              <img src={src} alt={alt} className="w-full border border-dashed border-border-strong rounded-[2px]" />
              {alt && <div className="text-center font-mono text-[10px] text-ink-faint uppercase">Fig // {alt}</div>}
            </div>
          ),
        } as any}
      >
        {content}
      </ReactMarkdown>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-[rgba(253,253,251,0.96)] backdrop-blur-[12px]" onClick={onClose} />

      <div className="relative bg-paper border border-dashed border-border-strong flex flex-col shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] w-[98vw] h-[96vh] rounded-[2px] overflow-hidden transition-all duration-500 scale-[0.99] animate-modal-in">
        
        {/* Top Header */}
        <div className="flex items-center gap-4 p-4 border-b border-dashed border-border-strong bg-paper relative z-20">
          <div className="flex gap-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/40 transition-colors" />
            <div className="w-3 h-3 rounded-full border border-yellow-500/30 bg-yellow-500/10" />
            <div className="w-3 h-3 rounded-full border border-green-500/30 bg-green-500/10" />
          </div>
          <div className="flex-1 text-center flex items-center justify-center gap-3">
            <Globe size={14} className="text-ink-faint" />
            <div className="font-mono text-[11px] font-bold tracking-[0.4em] text-ink uppercase">
              Knowledge Garden Authority // Index: {fileKeys.length}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsGraphMaximized(!isGraphMaximized)} 
              className={`font-mono text-[10px] px-3 py-1 border border-dashed border-border-strong hover:border-accent hover:text-accent transition-all flex items-center gap-2 ${isGraphMaximized ? 'bg-accent-light text-accent border-solid' : ''}`}
            >
              {isGraphMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isGraphMaximized ? 'RESTORE' : 'MAX GRAPH'}
            </button>
            <button onClick={() => setShowGraph(!showGraph)} className="font-mono text-[10px] px-4 py-1 border border-dashed border-border-strong hover:border-accent hover:text-accent transition-all">
              [{showGraph ? 'HIDE GRAPH' : 'SHOW GRAPH'}]
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* EXPLORER PANE */}
          {!isGraphMaximized && (
            <div className="w-[260px] border-r border-dashed border-border-strong overflow-y-auto shrink-0 flex flex-col bg-[rgba(26,26,26,0.01)] transition-all">
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 px-2 py-2 mb-4 border-b border-dashed border-border-strong">
                  <Folder size={14} className="text-ink-faint" />
                  <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-widest">Workspace</span>
                </div>
                
                {Object.entries(categories).map(([category, files]) => (
                  <div key={category} className="mb-4">
                    <button 
                      onClick={() => toggleFolder(category)}
                      className="w-full font-mono text-[10px] text-ink-muted tracking-widest uppercase mb-1 flex items-center gap-2 hover:text-accent transition-colors py-1 group"
                    >
                      {expandedFolders[category] ? <ChevronDown size={12} className="text-accent" /> : <ChevronRight size={12} />}
                      <span className={expandedFolders[category] ? 'text-ink font-bold' : ''}>{category}</span>
                      <span className="ml-auto text-[8px] opacity-30">[{files.length}]</span>
                    </button>
                    
                    {expandedFolders[category] && (
                      <div className="space-y-0.5 pl-3 border-l border-dashed border-border-strong/40 ml-1.5 mt-1">
                        {files.map(id => {
                          const file = researchData.files[id];
                          if (!file) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => setActiveFileId(id)}
                              className={`w-full text-left font-mono text-[11px] px-3 py-1.5 rounded-[1px] transition-all flex items-center gap-2 group ${activeFileId === id ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'}`}
                            >
                              <FileText size={10} className={activeFileId === id ? 'text-accent' : 'opacity-30 group-hover:opacity-60'} />
                              <span className="truncate">{file.title}</span>
                              {activeFileId === id && <span className="ml-auto text-[8px] animate-pulse">●</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDITOR PANE */}
          {!isGraphMaximized && (
            <div className="flex-1 overflow-y-auto relative bg-paper transition-all">
              <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0" 
                   style={{ backgroundImage: `repeating-linear-gradient(0deg, var(--ink) 0px, var(--ink) 1px, transparent 1px, transparent 32px)` }} />
              
              {activeFile ? (
                <div className="relative z-10 p-12 lg:p-20 max-w-[900px] mx-auto animate-fade-in">
                  <div className="flex items-center justify-between mb-12">
                    <div className="font-mono text-[10px] text-accent tracking-[0.3em] uppercase font-bold flex items-center gap-4">
                      <span className="h-px w-12 bg-accent/40"></span>
                      {activeFile.header}
                    </div>
                    <div className="flex gap-4">
                      <button className="text-ink-faint hover:text-ink transition-colors"><Share2 size={14} /></button>
                    </div>
                  </div>
                  
                  <div className="garden-content prose-custom">
                    {renderContent()}
                  </div>
                  
                  <div className="mt-20 pt-10 border-t border-dashed border-border-strong flex justify-between items-center">
                    <div className="font-mono text-[9px] text-ink-faint uppercase">
                      Last Indexed // APR 2026
                    </div>
                    <div className="font-mono text-[9px] text-ink-faint uppercase">
                      ID: {activeFileId}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20 grayscale">
                  <div className="w-16 h-16 border border-dashed border-ink rounded-full animate-spin-slow" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.4em]">
                    System Idle
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GRAPH PANE */}
          {showGraph && (
            <div className={`border-l border-dashed border-border-strong bg-[rgba(26,26,26,0.01)] overflow-hidden shrink-0 flex flex-col relative transition-all duration-500 ${isGraphMaximized ? 'w-full' : 'w-[360px]'}`}>
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <div className="font-mono text-[9px] text-ink-muted bg-paper/80 backdrop-blur px-2 py-1 border border-dashed border-border-strong flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  GRAPH_STATE: STABLE
                </div>
              </div>
              
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: `radial-gradient(var(--ink) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
              
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
              />
              
              {!isGraphMaximized && (
                <div className="absolute bottom-4 left-0 right-0 px-6 z-20">
                  <div className="font-mono text-[8px] text-ink-faint text-center uppercase tracking-widest leading-relaxed">
                    [ DRAG NODES TO RESTRUCTURE // CLICK TO OPEN ]<br />
                    PHYSICS: FORCE-DIRECTED RELAXATION
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
