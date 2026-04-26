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

// Robust Mermaid Component
const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!chart) return;
      try {
        // Clear previous error and SVG
        setError(null);
        const { svg: renderedSvg } = await mermaid.render(id.current, chart);
        if (isMounted) setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) setError('Diagram rendering failed. Check syntax.');
      }
    };
    renderChart();
    return () => { isMounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div className="my-8 p-6 bg-red-50 border border-dashed border-red-200 rounded-[2px] font-mono text-[11px] text-red-600">
        <div className="font-bold mb-2 uppercase tracking-widest">[MERMAID_ERROR]</div>
        {error}
        <pre className="mt-4 opacity-70 overflow-x-auto p-4 bg-white/50">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-chart my-10 flex justify-center bg-[rgba(0,71,255,0.02)] border border-dashed border-accent/15 p-8 rounded-[2px] transition-all hover:border-accent/30 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg || '<div class="animate-pulse font-mono text-[10px] text-accent">Compiling Diagram...</div>' }}
    />
  );
};

interface ResearchFile {
  title: string;
  header: string;
  html: string;
  markdown?: string;
}

interface ResearchNode {
  id: string;
  name: string;
  group: string;
  color: string;
  description: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tags?: string[];
}

interface ResearchLink {
  source: any;
  target: any;
}

interface ResearchData {
  nodes: ResearchNode[];
  links: { source: string; target: string }[];
  files: Record<string, ResearchFile>;
}

const researchData = rawResearchData as unknown as ResearchData;

interface GardenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GardenModal({ isOpen, onClose }: GardenModalProps) {
  const fileKeys = Object.keys(researchData.files);
  const [activeFileId, setActiveFileId] = useState<string>(fileKeys[0] || '');
  const [showGraph, setShowGraph] = useState(false);
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

  const categories = useMemo(() => {
    const groups: Record<string, string[]> = {
      "Intelligence & AI": [],
      "Systems & Infrastructure": [],
      "Security & Governance": [],
      "ML & Physics Research": [],
      "General": []
    };
    
    const groupMapping: Record<string, string> = {
      'ai': 'Intelligence & AI',
      'intelligence': 'Intelligence & AI',
      'agent': 'Intelligence & AI',
      'systems': 'Systems & Infrastructure',
      'kernel': 'Systems & Infrastructure',
      'security': 'Security & Governance',
      'ml': 'ML & Physics Research',
      'physics': 'ML & Physics Research',
      'pinn': 'ML & Physics Research',
      'pde': 'ML & Physics Research'
    };

    researchData.nodes.forEach(node => {
      const nodeTags = node.tags || [];
      let placed = false;

      nodeTags.forEach(tag => {
        const cat = groupMapping[tag.toLowerCase()];
        if (cat && groups[cat]) {
          if (!groups[cat].includes(node.id)) {
            groups[cat].push(node.id);
            placed = true;
          }
        }
      });

      if (!placed) {
        const cat = groupMapping[node.group] || 'General';
        if (!groups[cat].includes(node.id)) {
          groups[cat].push(node.id);
        }
      }
    });

    return groups;
  }, []);

  const activeFile = researchData.files[activeFileId];

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const activeFileIdRef = useRef(activeFileId);
  useEffect(() => { activeFileIdRef.current = activeFileId; }, [activeFileId]);

  // Physics Simulation
  useEffect(() => {
    if (!showGraph || !isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(entries => {
      const dpr = window.devicePixelRatio || 1;
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        
        nodesRef.current.forEach(n => {
          n.x = Math.max(20, Math.min(width - 20, n.x));
          n.y = Math.max(20, Math.min(height - 20, n.y));
        });
      }
    });

    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    if (nodesRef.current.length === 0) {
      const rect = canvas.getBoundingClientRect();
      const lw = rect.width || 400;
      const lh = rect.height || 600;
      
      nodesRef.current = researchData.nodes.map(n => ({
        ...n,
        x: lw / 2 + (Math.random() - 0.5) * 200,
        y: lh / 2 + (Math.random() - 0.5) * 400,
        vx: 0,
        vy: 0,
        radius: researchData.links.filter(l => l.source === n.id || l.target === n.id).length > 2 ? 14 : 10
      }));
    }
    
    const simNodes = nodesRef.current;
    const simLinks = researchData.links
      .map(l => ({
        source: simNodes.find(n => n.id === l.source),
        target: simNodes.find(n => n.id === l.target),
      }))
      .filter((l): l is { source: any; target: any } => l.source && l.target);

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = simNodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.radius + 15);
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

    const handleMouseUp = () => { dragNodeRef.current = null; };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const tick = () => {
      const dpr = window.devicePixelRatio || 1;
      const lw = canvas.width / dpr;
      const lh = canvas.height / dpr;
      
      ctx.clearRect(0, 0, lw, lh);

      const k = 0.05, damping = 0.9, repulsion = 6000, centerPull = 0.015, linkDist = 130;

      for (let i = 0; i < simNodes.length; i++) {
        const n1 = simNodes[i];
        if (n1 === dragNodeRef.current) continue;
        n1.vx += (lw / 2 - n1.x) * centerPull;
        n1.vy += (lh / 2 - n1.y) * centerPull;

        for (let j = i + 1; j < simNodes.length; j++) {
          const n2 = simNodes[j];
          const dx = n1.x - n2.x, dy = n1.y - n2.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);
          const f = repulsion / distSq;
          const fx = (dx / dist) * f, fy = (dy / dist) * f;
          n1.vx += fx; n1.vy += fy;
          n2.vx -= fx; n2.vy -= fy;
        }
      }

      simLinks.forEach(l => {
        const dx = l.source.x - l.target.x, dy = l.source.y - l.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (dist - linkDist) * k;
        const fx = (dx / dist) * f, fy = (dy / dist) * f;
        if (l.source !== dragNodeRef.current) { l.source.vx -= fx; l.source.vy -= fy; }
        if (l.target !== dragNodeRef.current) { l.target.vx += fx; l.target.vy += fy; }
      });

      simNodes.forEach(n => {
        if (n === dragNodeRef.current) return;
        n.vx *= damping; n.vy *= damping;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(lw - 20, n.x));
        n.y = Math.max(20, Math.min(lh - 20, n.y));
      });

      // Draw Edges (High Visibility)
      simLinks.forEach(l => {
        const isActive = l.source.id === activeFileIdRef.current || l.target.id === activeFileIdRef.current;
        ctx.beginPath();
        ctx.setLineDash(isActive ? [] : [4, 4]);
        ctx.strokeStyle = isActive ? 'rgba(0,71,255,0.95)' : 'rgba(26,26,26,0.6)';
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
      });

      // Draw Nodes (Premium Glass)
      simNodes.forEach(node => {
        const isActive = node.id === activeFileIdRef.current;
        const isConnected = simLinks.some(l => 
          (l.source.id === node.id && l.target.id === activeFileIdRef.current) ||
          (l.target.id === node.id && l.source.id === activeFileIdRef.current)
        );
        const col = node.color || '#BDBDBD';
        const r = node.radius;

        if (isActive || isConnected) {
          ctx.shadowBlur = isActive ? 35 : 18;
          ctx.shadowColor = isActive ? 'rgba(0,71,255,0.6)' : 'rgba(0,71,255,0.3)';
        } else ctx.shadowBlur = 0;

        const pulse = isActive ? Math.sin(Date.now() / 300) * 3 : 0;

        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = isActive ? 1.0 : (isConnected ? 0.9 : 0.6);
        ctx.arc(node.x, node.y, r + 8 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        ctx.beginPath();
        ctx.setLineDash([]);
        const grad = ctx.createRadialGradient(node.x - 2, node.y - 2, 0, node.x, node.y, r);
        if (isActive) { grad.addColorStop(0, col); grad.addColorStop(1, col); }
        else {
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.8, isConnected ? 'rgba(0,71,255,0.25)' : '#F9F9F7');
          grad.addColorStop(1, isConnected ? 'rgba(0,71,255,0.35)' : '#F3F3F0');
        }
        ctx.fillStyle = grad;
        ctx.strokeStyle = isActive ? col : (isConnected ? 'rgba(0,71,255,0.8)' : 'rgba(26,26,26,0.5)');
        ctx.lineWidth = isActive ? 4 : 2.2;
        ctx.arc(node.x, node.y, isActive ? 9 : 7, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Labels (High Visibility Black/Dark)
        ctx.shadowBlur = 0;
        ctx.font = isActive 
          ? '700 13px "JetBrains Mono", var(--font-mono), monospace' 
          : '600 11px "JetBrains Mono", var(--font-mono), monospace';
        
        const text = node.name;
        const tw = ctx.measureText(text).width;
        
        if (isActive) {
          ctx.fillStyle = 'rgba(0,71,255,0.1)';
          ctx.beginPath();
          ctx.roundRect(node.x - tw/2 - 8, node.y + r + 14, tw + 16, 22, 4);
          ctx.fill();
          ctx.fillStyle = '#000000'; // Pure black for active
        } else {
          ctx.fillStyle = isConnected ? '#1A1A1A' : '#333333'; // Deep ink for others
        }
        
        ctx.globalAlpha = (isActive || isConnected) ? 1.0 : 0.85;
        ctx.textAlign = 'center';
        ctx.fillText(text, node.x, node.y + r + 30);
        ctx.globalAlpha = 1.0;
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

  const renderContent = () => {
    if (!activeFile) return null;
    const rawContent = activeFile.markdown || activeFile.html;

    // Process wikilinks: [[ID|Label]] or [[ID]] -> <wiki-link data-id="id">label</wiki-link>
    const content = rawContent.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, id, label) => {
      const targetId = id.toLowerCase().replace(/\s+/g, '_');
      return `<wiki-link data-id="${targetId}">${label || id}</wiki-link>`;
    });

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          'wiki-link': ({ node, ...props }: any) => (
            <button 
              onClick={() => setActiveFileId(props['data-id'])}
              className="text-accent font-bold hover:underline decoration-dashed underline-offset-4 transition-all"
            >
              {props.children}
            </button>
          ),
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const contentString = String(children).replace(/\n$/, '');
            if (!inline && match && match[1] === 'mermaid') return <Mermaid chart={contentString} />;
            
            return inline ? (
              <code className="bg-[rgba(0,71,255,0.08)] px-1.5 py-0.5 rounded-[2px] text-accent font-mono text-[11px] font-medium" {...props}>
                {children}
              </code>
            ) : (
              <div className="my-8 rounded-[2px] overflow-hidden border border-dashed border-border-strong group">
                <div className="bg-[rgba(26,26,26,0.03)] border-b border-dashed border-border-strong px-4 py-2 flex justify-between items-center">
                  <div className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{match?.[1] || 'source'} // buffer</div>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-ink-faint/30" /><div className="w-1.5 h-1.5 rounded-full bg-ink-faint/30" />
                  </div>
                </div>
                <pre className="bg-[rgba(26,26,26,0.01)] p-6 overflow-x-auto">
                  <code className="font-mono text-[12.5px] leading-[1.8] text-ink block" {...props}>{children}</code>
                </pre>
              </div>
            );
          },
          h1: ({ children }: any) => <h1 className="font-serif text-[32px] font-medium mb-8 text-ink mt-12">{children}</h1>,
          h2: ({ children }: any) => <h2 className="font-serif text-[24px] font-medium mb-6 text-ink mt-10 border-b border-dashed border-border-strong pb-2">{children}</h2>,
          h3: ({ children }: any) => <h3 className="font-serif text-[20px] font-medium mb-4 text-ink mt-8">{children}</h3>,
          p: ({ children }: any) => <div className="font-serif text-[16px] leading-[1.8] text-ink-muted mb-6">{children}</div>,
          ul: ({ children }: any) => <ul className="list-none space-y-3 mb-8 pl-4">{children}</ul>,
          li: ({ children }: any) => (
            <li className="flex items-start gap-3 text-ink-muted font-serif text-[16px]">
              <span className="text-accent mt-1.5 shrink-0"><ChevronRight size={14} /></span>{children}
            </li>
          ),
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-2 border-dashed border-accent bg-[rgba(0,71,255,0.02)] pl-6 py-4 my-8 italic text-ink-muted font-serif text-[17px]">{children}</blockquote>
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-8">
      <div className="absolute inset-0 bg-[rgba(253,253,251,0.98)] backdrop-blur-[16px]" onClick={onClose} />
      <div 
        className="relative bg-paper border border-dashed border-border-strong flex flex-col shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] w-full md:w-[98vw] h-[98vh] md:h-[96vh] rounded-[2px] overflow-hidden animate-modal-in"
        style={{ backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.25) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      >
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-dashed border-border-strong bg-paper relative z-30">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex gap-2">
              <button onClick={onClose} className="w-3 h-3 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/40" />
              <div className="w-3 h-3 rounded-full border border-yellow-500/30 bg-yellow-500/10" />
              <div className="w-3 h-3 rounded-full border border-green-500/30 bg-green-500/10" />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong hover:text-accent"
            >
              {isSidebarOpen ? '[CLOSE MENU]' : '[OPEN MENU]'}
            </button>
          </div>

          <div className="flex-1 text-center hidden sm:flex items-center justify-center gap-3">
            <Globe size={14} className="text-ink-faint" />
            <div className="font-mono text-[10px] md:text-[11px] font-bold tracking-[0.2em] md:tracking-[0.4em] text-ink uppercase truncate max-w-[200px] md:max-w-none">
              Knowledge Garden AUTHORITY // {fileKeys.length} NODES
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <button onClick={() => setIsGraphMaximized(!isGraphMaximized)} className={`font-mono text-[9px] md:text-[10px] px-3 py-1 border border-dashed border-border-strong hover:border-accent hover:text-accent transition-all flex items-center gap-2 ${isGraphMaximized ? 'bg-accent-light text-accent' : ''}`}>
              {isGraphMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />} 
              <span className="hidden xs:inline">{isGraphMaximized ? 'RESTORE' : 'MAX GRAPH'}</span>
            </button>
            <button onClick={() => setShowGraph(!showGraph)} className="font-mono text-[9px] md:text-[10px] px-4 py-1 border border-dashed border-border-strong hover:border-accent hover:text-accent whitespace-nowrap">
              [{showGraph ? 'HIDE GRAPH' : 'SHOW GRAPH'}]
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Sidebar (Explorer) */}
          <div className={`
            absolute lg:relative z-20 h-full w-[260px] border-r border-dashed border-border-strong overflow-y-auto bg-paper lg:bg-[rgba(26,26,26,0.01)] transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 space-y-2">
              {Object.entries(categories).map(([category, files]) => (
                <div key={category} className="mb-4">
                  <button onClick={() => toggleFolder(category)} className="w-full font-mono text-[10px] text-ink-muted tracking-widest uppercase mb-1 flex items-center gap-2 hover:text-accent py-1">
                    {expandedFolders[category] ? <ChevronDown size={12} className="text-accent" /> : <ChevronRight size={12} />}
                    <span className={expandedFolders[category] ? 'text-ink font-bold' : ''}>{category}</span>
                  </button>
                  {expandedFolders[category] && (
                    <div className="space-y-0.5 pl-3 border-l border-dashed border-border-strong/40 ml-1.5 mt-1">
                      {files.map(id => {
                        const file = researchData.files[id];
                        if (!file) return null;
                        return (
                          <button key={id} onClick={() => { setActiveFileId(id); setIsSidebarOpen(false); }} className={`w-full text-left font-mono text-[11px] px-3 py-1.5 transition-all flex items-center gap-2 ${activeFileId === id ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'}`}>
                            <FileText size={10} className={activeFileId === id ? 'text-accent' : 'opacity-30'} />
                            <span className="truncate">{file.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overlay for sidebar on mobile */}
          {isSidebarOpen && (
            <div className="absolute inset-0 bg-black/5 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}

          {/* Main Editor */}
          {!isGraphMaximized && (
            <div className="flex-1 overflow-y-auto relative bg-paper transition-all">
              <div className="relative z-10 p-6 md:p-12 lg:p-20 max-w-[900px] mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8 md:mb-12">
                  <div className="font-mono text-[9px] md:text-[10px] text-accent tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold flex items-center gap-4">
                    <span className="hidden xs:block h-px w-8 md:w-12 bg-accent/40"></span>
                    {activeFile?.header}
                  </div>
                  <Share2 size={14} className="text-ink-faint shrink-0" />
                </div>
                <div className="garden-content">{renderContent()}</div>
              </div>
            </div>
          )}

          {/* Graph View */}
          {showGraph && (
            <div className={`
              ${isGraphMaximized ? 'w-full' : 'hidden lg:flex w-[400px] border-l border-dashed border-border-strong'}
              bg-[rgba(26,26,26,0.01)] overflow-hidden shrink-0 flex-col relative transition-all duration-500
            `}>
              <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
