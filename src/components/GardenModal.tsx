"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { ChevronRight, ChevronDown, FileText, Folder, Maximize2, Minimize2, Share2, Globe, Minus, X, Settings } from 'lucide-react';
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
  onMinimize: (id: string, title: string) => void;
}

export default function GardenModal({ isOpen, onClose, onMinimize }: GardenModalProps) {
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

  const [panelConfig, setPanelConfig] = useState({
    nodeSize: 1.2,
    linkThickness: 1.5,
    centerForce: 0.004,
    repelForce: 7500,
    linkForce: 0.02,
    linkDistance: 260,
    groupByTags: false,
    searchQuery: '',
    showArrows: false,
    showTags: true,
  });

  const transformRef = useRef({ scale: 1, x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  
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
      
      nodesRef.current = researchData.nodes.map((n, i) => ({
        ...n,
        x: lw / 2 + (Math.random() - 0.5) * 200,
        y: lh / 2 + (Math.random() - 0.5) * 400,
        vx: 0,
        vy: 0,
        radius: researchData.links.filter(l => l.source === n.id || l.target === n.id).length > 2 ? 14 : 10,
        revealTime: i * 150 // Staggered reveal
      }));
    }
    
    const startTime = Date.now();
    
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
      const transform = transformRef.current;
      const gx = (mx - transform.x) / transform.scale;
      const gy = (my - transform.y) / transform.scale;
      
      const hit = simNodes.find(n => Math.hypot(n.x - gx, n.y - gy) < (n.radius * panelConfig.nodeSize) + 15 / transform.scale);
      if (hit) {
        dragNodeRef.current = hit;
        setActiveFileId(hit.id);
      } else {
        isPanningRef.current = true;
        panStartRef.current = { x: mx - transform.x, y: my - transform.y };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const transform = transformRef.current;
      const gx = (mx - transform.x) / transform.scale;
      const gy = (my - transform.y) / transform.scale;

      if (dragNodeRef.current) {
        dragNodeRef.current.x = gx;
        dragNodeRef.current.y = gy;
        dragNodeRef.current.vx = 0;
        dragNodeRef.current.vy = 0;
      } else if (isPanningRef.current) {
        transform.x = mx - panStartRef.current.x;
        transform.y = my - panStartRef.current.y;
      }
    };

    const handleMouseUp = () => { 
      dragNodeRef.current = null; 
      isPanningRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const transform = transformRef.current;
      
      const gx = (mx - transform.x) / transform.scale;
      const gy = (my - transform.y) / transform.scale;
      
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newScale = Math.max(0.15, Math.min(4, transform.scale * zoomFactor));
      
      transform.x = mx - gx * newScale;
      transform.y = my - gy * newScale;
      transform.scale = newScale;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const tick = () => {
      const dpr = window.devicePixelRatio || 1;
      const lw = canvas.width / dpr;
      const lh = canvas.height / dpr;
      
      ctx.clearRect(0, 0, lw, lh);

      const k = panelConfig.linkForce;
      const damping = 0.8;
      const repulsion = panelConfig.repelForce;
      const centerPull = panelConfig.centerForce;
      const linkDist = panelConfig.linkDistance;

      ctx.save();
      const transform = transformRef.current;
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const groupCenters: Record<string, { x: number, y: number }> = {
        "Intelligence & AI": { x: lw * 0.35, y: lh * 0.35 },
        "Systems & Infrastructure": { x: lw * 0.65, y: lh * 0.35 },
        "Security & Governance": { x: lw * 0.35, y: lh * 0.65 },
        "ML & Physics Research": { x: lw * 0.65, y: lh * 0.65 },
        "General": { x: lw * 0.5, y: lh * 0.5 }
      };

      for (let i = 0; i < simNodes.length; i++) {
        const n1 = simNodes[i];
        if (n1 === dragNodeRef.current) continue;

        if (panelConfig.groupByTags) {
          let group = 'General';
          for (const [cat, nodes] of Object.entries(categories)) {
            if (nodes.includes(n1.id)) {
              group = cat;
              break;
            }
          }
          const center = groupCenters[group] || { x: lw / 2, y: lh / 2 };
          n1.vx += (center.x - n1.x) * (centerPull * 2.5);
          n1.vy += (center.y - n1.y) * (centerPull * 2.5);
        } else {
          n1.vx += (lw / 2 - n1.x) * centerPull;
          n1.vy += (lh / 2 - n1.y) * centerPull;
        }

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
        n.vx = Math.max(-15, Math.min(15, n.vx * damping));
        n.vy = Math.max(-15, Math.min(15, n.vy * damping));
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(lw - 20, n.x));
        n.y = Math.max(20, Math.min(lh - 20, n.y));
      });

      // Draw Edges
      const elapsed = Date.now() - startTime;
      simLinks.forEach(l => {
        if (elapsed < l.source.revealTime || elapsed < l.target.revealTime) return;
        
        const sourceMatches = !panelConfig.searchQuery || l.source.name.toLowerCase().includes(panelConfig.searchQuery.toLowerCase());
        const targetMatches = !panelConfig.searchQuery || l.target.name.toLowerCase().includes(panelConfig.searchQuery.toLowerCase());
        const matchesSearch = sourceMatches || targetMatches;

        const isActive = l.source.id === activeFileIdRef.current || l.target.id === activeFileIdRef.current;
        
        ctx.beginPath();
        ctx.setLineDash(isActive ? [] : [4, 4]);
        ctx.strokeStyle = isActive ? 'rgba(0,71,255,0.95)' : 'rgba(26,26,26,0.6)';
        ctx.lineWidth = (isActive ? 3 : 2) * panelConfig.linkThickness;
        ctx.globalAlpha = matchesSearch ? 1.0 : 0.1;
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
      });

      // Draw Nodes
      simNodes.forEach(node => {
        if (elapsed < node.revealTime) return;
        const matchesSearch = !panelConfig.searchQuery || node.name.toLowerCase().includes(panelConfig.searchQuery.toLowerCase());

        const isActive = node.id === activeFileIdRef.current;
        const isConnected = simLinks.some(l => 
          (l.source.id === node.id && l.target.id === activeFileIdRef.current) ||
          (l.target.id === node.id && l.source.id === activeFileIdRef.current)
        );
        const col = node.color || '#BDBDBD';
        const r = node.radius * panelConfig.nodeSize;

        ctx.globalAlpha = matchesSearch ? 1.0 : 0.15;

        if (isActive || isConnected) {
          ctx.shadowBlur = isActive ? 35 : 18;
          ctx.shadowColor = isActive ? 'rgba(0,71,255,0.6)' : 'rgba(0,71,255,0.3)';
        } else ctx.shadowBlur = 0;

        const pulse = isActive ? Math.sin(Date.now() / 300) * 3 : 0;

        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = matchesSearch ? (isActive ? 1.0 : (isConnected ? 0.9 : 0.6)) : 0.1;
        ctx.arc(node.x, node.y, r + 8 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = matchesSearch ? 1.0 : 0.15;

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

        // Labels
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
          ctx.fillStyle = '#000000';
        } else {
          ctx.fillStyle = isConnected ? '#1A1A1A' : '#333333';
        }
        
        ctx.globalAlpha = matchesSearch ? ((isActive || isConnected) ? 1.0 : 0.85) : 0.1;
        ctx.textAlign = 'center';
        ctx.fillText(text, node.x, node.y + r + 30);
        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
      simulationRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      if (simulationRef.current) cancelAnimationFrame(simulationRef.current);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsMounted(true), 10);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-8 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-[rgba(253,253,251,0.98)] backdrop-blur-[16px]" onClick={onClose} />
      <div 
        className="relative bg-paper border border-dashed border-border-strong flex flex-col shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] w-full md:w-[98vw] h-[98vh] md:h-[96vh] rounded-[2px] overflow-hidden transition-all duration-500 animate-modal-enter"
      >
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-dashed border-border-strong bg-paper relative z-30">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex gap-2">
              <button onClick={onClose} className="w-3 h-3 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/40 flex items-center justify-center group">
                <X size={8} className="text-red-600 opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={() => onMinimize('garden-authority', 'Knowledge Garden')}
                className="w-3 h-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/40 flex items-center justify-center group"
              >
                <Minus size={8} className="text-yellow-600 opacity-0 group-hover:opacity-100" />
              </button>
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
            {showGraph && (
              <button onClick={() => setIsGraphMaximized(!isGraphMaximized)} className={`font-mono text-[9px] md:text-[10px] px-3 py-1 border border-dashed border-border-strong hover:border-accent hover:text-accent transition-all flex items-center gap-2 ${isGraphMaximized ? 'bg-accent-light text-accent' : ''}`}>
                {isGraphMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />} 
                <span className="hidden xs:inline">{isGraphMaximized ? 'RESTORE' : 'MAX GRAPH'}</span>
              </button>
            )}
            <button 
              onClick={() => {
                if (showGraph) setIsGraphMaximized(false);
                setShowGraph(!showGraph);
              }} 
              className="font-mono text-[9px] md:text-[10px] px-4 py-1 border border-dashed border-border-strong hover:border-accent hover:text-accent whitespace-nowrap"
            >
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
                  <button 
                    onClick={() => toggleFolder(category)} 
                    className={`w-full font-mono text-[10px] tracking-widest uppercase mb-1 flex items-center gap-2 px-3 py-2 rounded-[2px] transition-all
                      ${expandedFolders[category] ? 'bg-accent-light text-accent border border-dashed border-accent/30' : 'text-ink-muted hover:bg-black/5 hover:text-ink'}`}
                  >
                    {expandedFolders[category] ? <ChevronDown size={12} className="text-accent" /> : <ChevronRight size={12} />}
                    <span className={expandedFolders[category] ? 'font-bold' : ''}>{category}</span>
                  </button>
                  {expandedFolders[category] && (
                    <div className="space-y-0.5 pl-3 border-l border-dashed border-border-strong/40 ml-1.5 mt-1">
                      {files.map(id => {
                        const file = researchData.files[id];
                        if (!file) return null;
                        return (
                          <button 
                            key={id} 
                            onClick={() => { setActiveFileId(id); setIsSidebarOpen(false); }} 
                            className={`w-full text-left font-mono text-[11px] px-3 py-2 rounded-[2px] transition-all flex items-center gap-2 mb-0.5
                              ${activeFileId === id ? 'bg-accent text-white shadow-md' : 'text-ink-muted hover:bg-accent-light hover:text-accent'}`}
                          >
                            <FileText size={10} className={activeFileId === id ? 'text-white' : 'opacity-30'} />
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
              
              {/* Obsidian-Style Control Panel */}
              {isGraphMaximized && (
                <div className="absolute top-4 right-4 z-20 w-[280px] bg-[rgba(253,253,251,0.95)] backdrop-blur-md border border-dashed border-border-strong rounded-[2px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] flex flex-col p-4 font-mono text-[11px] text-ink overflow-y-auto max-h-[90%]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-border-strong">
                    <span className="font-bold tracking-widest uppercase text-[10px] text-accent">Graph Controls</span>
                    <Settings size={14} className="text-accent animate-spin-slow" />
                  </div>

                  {/* Filters / Search */}
                  <div className="mb-4">
                    <div className="font-bold uppercase text-[9px] text-ink-faint tracking-widest mb-2">Search Nodes</div>
                    <input 
                      type="text" 
                      value={panelConfig.searchQuery} 
                      onChange={(e) => setPanelConfig({ ...panelConfig, searchQuery: e.target.value })}
                      placeholder="Type to filter..."
                      className="w-full bg-[rgba(26,26,26,0.03)] border border-dashed border-border-strong px-3 py-1.5 font-mono text-[11px] rounded-[2px] focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Groups */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold uppercase text-[9px] text-ink-faint tracking-widest">Group By Tags</div>
                      <input 
                        type="checkbox" 
                        checked={panelConfig.groupByTags}
                        onChange={(e) => setPanelConfig({ ...panelConfig, groupByTags: e.target.checked })}
                        className="accent-accent"
                      />
                    </div>
                  </div>

                  {/* Display */}
                  <div className="mb-4 pb-2 border-t border-dashed border-border-strong pt-2">
                    <div className="font-bold uppercase text-[9px] text-ink-faint tracking-widest mb-2">Display</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Node Size</span>
                          <span>{panelConfig.nodeSize.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="3" step="0.1"
                          value={panelConfig.nodeSize}
                          onChange={(e) => setPanelConfig({ ...panelConfig, nodeSize: parseFloat(e.target.value) })}
                          className="w-full accent-accent"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Link Thickness</span>
                          <span>{panelConfig.linkThickness.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="4" step="0.1"
                          value={panelConfig.linkThickness}
                          onChange={(e) => setPanelConfig({ ...panelConfig, linkThickness: parseFloat(e.target.value) })}
                          className="w-full accent-accent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Forces */}
                  <div className="mb-2 pb-2 border-t border-dashed border-border-strong pt-2">
                    <div className="font-bold uppercase text-[9px] text-ink-faint tracking-widest mb-2">Forces</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Centre Force</span>
                          <span>{panelConfig.centerForce.toFixed(4)}</span>
                        </div>
                        <input 
                          type="range" min="0.0005" max="0.015" step="0.0005"
                          value={panelConfig.centerForce}
                          onChange={(e) => setPanelConfig({ ...panelConfig, centerForce: parseFloat(e.target.value) })}
                          className="w-full accent-accent"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Repel Force</span>
                          <span>{panelConfig.repelForce}</span>
                        </div>
                        <input 
                          type="range" min="1000" max="15000" step="500"
                          value={panelConfig.repelForce}
                          onChange={(e) => setPanelConfig({ ...panelConfig, repelForce: parseInt(e.target.value) })}
                          className="w-full accent-accent"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Link Distance</span>
                          <span>{panelConfig.linkDistance}px</span>
                        </div>
                        <input 
                          type="range" min="100" max="400" step="10"
                          value={panelConfig.linkDistance}
                          onChange={(e) => setPanelConfig({ ...panelConfig, linkDistance: parseInt(e.target.value) })}
                          className="w-full accent-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Background Dots */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{ backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.25) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
