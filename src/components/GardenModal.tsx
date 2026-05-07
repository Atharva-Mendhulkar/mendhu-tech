"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronRight, ChevronDown, FileText, Maximize2, Minimize2, Share2, Globe, Minus, X, Settings, Search } from 'lucide-react';
import rawResearchData from '@/data/research.json';

import { cachedTagColor, cachedAlpha } from '@/lib/graph/colors';
import { buildQuadtree, applyRepulsion, type SimNode as BaseSimNode, type QNode } from '@/lib/graph/quadtree';
import { runPhysicsStep, warmupAsync, type SimLink } from '@/lib/graph/physics';

// ── Mermaid ────────────────────────────────────────────────────────────────

const MermaidBlock = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let isMounted = true;
    import('mermaid').then((mermaidModule) => {
      if (!isMounted) return;
      const mermaid = mermaidModule.default;
      mermaid.initialize({ 
        startOnLoad: false, 
        theme: 'base', 
        themeVariables: {
          primaryColor: '#F0EFE8',
          primaryTextColor: '#1A1A1A',
          primaryBorderColor: 'rgba(0,71,255,0.2)',
          lineColor: '#555555',
          secondaryColor: '#FFFFFF',
          tertiaryColor: '#FDFDFB'
        },
        securityLevel: 'loose' 
      });
      const uniqueId = `mmd-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
      mermaid.render(uniqueId, chart)
        .then(r => { if (isMounted) setSvg(r.svg); })
        .catch((err) => {
          console.error('Failed to render Mermaid chart:', err);
          if (isMounted) {
            setSvg(`<div class="p-4 border border-dashed border-red-500/30 text-red-500 font-mono text-[10px] bg-red-500/5 my-4">
              <strong>Mermaid Render Error:</strong>
              <pre class="mt-2 text-[9px] text-ink-muted select-all overflow-x-auto whitespace-pre-wrap">${String(err)}</pre>
              <pre class="mt-2 text-[9px] text-ink-muted border-t border-dashed border-red-500/20 pt-2 select-all overflow-x-auto whitespace-pre-wrap">${chart}</pre>
            </div>`);
          }
        });
    });
    return () => { isMounted = false; };
  }, [chart]);

  return (
    <div className="my-8 p-6 border border-dashed border-accent/20 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg || '<span class="font-mono text-[10px] text-ink-faint">rendering…</span>' }} />
  );
};

// ── Types ──────────────────────────────────────────────────────────────────
interface ResearchFile { title: string; header: string; html?: string; markdown?: string }
interface RawNode { id: string; name?: string; label?: string; group: string; color: string; description?: string; tags?: string[] }
interface ResearchData {
  nodes: RawNode[];
  links: { source: string; target: string }[];
  files: Record<string, ResearchFile>;
}
const data = rawResearchData as unknown as ResearchData;

interface SimNode extends BaseSimNode {
  label: string;
  group: string;
  tags: string[];
  r: number;
  revealAt: number;
  isTag: boolean;
  _fillColor?: string;
  _ringColor?: string;
  _glowColor?: string;
  _labelColor?: string;
}

interface GraphSettings {
  nodeSize: number; linkThickness: number; centerForce: number;
  repelForce: number; linkForce: number; linkDistance: number;
  groupByTags: boolean; searchQuery: string;
}

const DEFAULT: GraphSettings = {
  nodeSize:1.0, linkThickness:1.0, centerForce:0.003,
  repelForce:6000, linkForce:0.018, linkDistance:220,
  groupByTags:true, searchQuery:'',
};

function buildSimGraph(raw: ResearchData, W: number, H: number, existing: SimNode[]) {
  const cx = W/2, cy = H/2;
  const existingById = new Map(existing.map(n => [n.id, n]));
  
  const fileNodes: SimNode[] = raw.nodes.map((n) => {
    const ex = existingById.get(n.id);
    const node: SimNode = (ex ? { ...ex } : {
      id:n.id, x:cx+(Math.random()-.5)*300, y:cy+(Math.random()-.5)*300,
      vx:0, vy:0, revealAt:0, isTag: false,
    }) as SimNode;
    
    node.label = n.name??n.label??n.id;
    node.color = n.color ?? (n.tags?.[0] ? cachedTagColor(n.tags[0]) : '#888');
    node.group = n.group;
    node.tags = n.tags ?? [];
    node.r = 8;
    node.isTag = false;
    
    node._fillColor = cachedAlpha(node.color, '44');
    node._ringColor = cachedAlpha(node.color, '80');
    node._labelColor = '#555555';
    
    return node;
  });

  const fileLinks: SimLink[] = raw.links.flatMap(l => {
    const s=fileNodes.find(n=>n.id===l.source), t=fileNodes.find(n=>n.id===l.target);
    return s&&t?[{source:s,target:t}]:[];
  });

  const allTags = new Set<string>();
  fileNodes.forEach(n => n.tags.forEach(t => allTags.add(t.replace('#','').toLowerCase())));

  const tagNodes: SimNode[] = Array.from(allTags).map(t => {
    const id = `tag-${t}`;
    const ex = existingById.get(id);
    const node: SimNode = (ex ? { ...ex } : {
      id, x: cx+(Math.random()-.5)*600, y: cy+(Math.random()-.5)*600,
      vx: 0, vy: 0, revealAt: 0, isTag: true,
    }) as SimNode;
    
    node.label = `#${t}`;
    node.color = cachedTagColor(t);
    node.group = 'tag';
    node.tags = [];
    node.r = 14;
    node.isTag = true;
    
    node._fillColor = cachedAlpha(node.color, '44');
    node._ringColor = cachedAlpha(node.color, '80');
    node._labelColor = node.color;
    
    return node;
  });

  const tagLinks: SimLink[] = [];
  fileNodes.forEach(fn => {
    fn.tags.forEach(t => {
      const cleanT = t.replace('#','').toLowerCase();
      const tn = tagNodes.find(tag => tag.label === `#${cleanT}`);
      if (tn) tagLinks.push({ source: fn, target: tn, isTag: true });
    });
  });

  return { fileNodes, fileLinks, tagNodes, tagLinks };
}

interface SliderRowProps {
  label: string;
  k: keyof GraphSettings;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  settings: GraphSettings;
  updateSetting: (k: keyof GraphSettings, v: any) => void;
}

const SliderRow = ({ label, k, min, max, step, fmt, settings, updateSetting }: SliderRowProps) => (
  <div>
    {k === 'nodeSize' ? (
      <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted">
        <span className="tracking-wider uppercase text-[9px]">{label}</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => updateSetting(k, Math.max(min, (settings[k] as number) - step))}
            className="w-8 h-8 flex items-center justify-center bg-paper hover:bg-accent-light text-ink border border-dashed border-border-strong hover:border-accent hover:text-accent font-bold text-[16px] rounded-[2px] transition-all select-none"
          >
            -
          </button>
          <span className="text-accent font-bold text-[13px] min-w-[32px] text-center">
            {fmt(settings[k] as number)}
          </span>
          <button 
            onClick={() => updateSetting(k, Math.min(max, (settings[k] as number) + step))}
            className="w-8 h-8 flex items-center justify-center bg-paper hover:bg-accent-light text-ink border border-dashed border-border-strong hover:border-accent hover:text-accent font-bold text-[16px] rounded-[2px] transition-all select-none"
          >
            +
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="flex justify-between font-mono text-[9.5px] text-ink-muted mb-1 items-center">
          <span>{label}</span>
          <span className="text-accent">{fmt(settings[k] as number)}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={settings[k] as number}
          onChange={e=>updateSetting(k,parseFloat(e.target.value))}
          className="w-full accent-accent h-1"/>
      </>
    )}
  </div>
);

interface ToggleProps {
  label: string;
  k: keyof GraphSettings;
  onToggle?: (v: boolean) => void;
  settings: GraphSettings;
  updateSetting: (k: keyof GraphSettings, v: any) => void;
}

const Toggle = ({ label, k, onToggle, settings, updateSetting }: ToggleProps) => (
  <label className="flex items-center justify-between font-mono text-[10px] text-ink-muted cursor-pointer">
    <span>{label}</span>
    <button
      onClick={()=>{const nv=!settings[k];onToggle?onToggle(nv as boolean):updateSetting(k,nv);}}
      className={`w-9 h-5 rounded-full border border-dashed transition-all relative ${settings[k]?'bg-accent border-accent':'border-border-strong'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${settings[k]?'left-4':'left-0.5'}`}/>
    </button>
  </label>
);

interface Props { isOpen:boolean; onClose:()=>void; onMinimize:(id:string,title:string)=>void; initialFileId?:string }

export default function GardenModal({ isOpen, onClose, onMinimize, initialFileId }: Props) {
  const fileKeys = useMemo(() => Object.keys(data.files), []);
  const [activeFileId, setActiveFileId] = useState(fileKeys[0]??'');
  const hasAppliedInitialFileId = useRef(false);

  // Phase 1: Energy Gating
  const SLEEP_THRESHOLD = 0.002;
  const sleepRef = useRef(false);
  const energyRef = useRef(1.0);
  const dirtyRef = useRef(true);

  // Phase 9d: Connected-IDs Lookup
  const connectedIds = useMemo(() => {
    const s = new Set<string>();
    if (!activeFileId) return s;
    data.links.forEach(l => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      if (srcId === activeFileId) s.add(tgtId);
      if (tgtId === activeFileId) s.add(srcId);
    });
    return s; 
  }, [activeFileId]);
  const connectedIdsRef = useRef(connectedIds);
  useEffect(() => { connectedIdsRef.current = connectedIds; }, [connectedIds]);

  useEffect(() => {
    if (
      !hasAppliedInitialFileId.current &&
      initialFileId &&
      fileKeys.includes(initialFileId)
    ) {
      setActiveFileId(initialFileId);
      hasAppliedInitialFileId.current = true;
    }
  }, [initialFileId, fileKeys]);

  const [showGraph, setShowGraph]       = useState(false);
  const [isMaxGraph, setIsMaxGraph]     = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted]       = useState(false);

  useEffect(() => {
    if (isOpen && activeFileId) {
      const newUrl = `/garden/${activeFileId}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [activeFileId, isOpen]);

  useEffect(() => {
    if (!isOpen && isMounted) {
      if (window.location.pathname.startsWith('/garden/')) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [isOpen, isMounted]);

  const [settings, setSettings]         = useState<GraphSettings>({...DEFAULT});
  const settingsRef                     = useRef<GraphSettings>({...DEFAULT});
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const activeTagRef = useRef<string | null>(null);
  useEffect(()=>{activeTagRef.current=activeTag;},[activeTag]);

  const updateSetting = <K extends keyof GraphSettings>(k: K, v: GraphSettings[K]) => {
    settingsRef.current = {...settingsRef.current, [k]:v};
    dirtyRef.current = true;
    energyRef.current = 1.0;
    if (sleepRef.current && tickRef.current) {
      sleepRef.current = false;
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
    if (isSettingsOpen) {
      setSettings(s => ({...s,[k]:v}));
    }
  };

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number|null>(null);
  const simNodesRef  = useRef<SimNode[]>([]);
  const simLinksRef  = useRef<SimLink[]>([]);
  
  const fileNodesRef = useRef<SimNode[]>([]);
  const tagNodesRef  = useRef<SimNode[]>([]);
  const fileLinksRef = useRef<SimLink[]>([]);
  const tagLinksRef  = useRef<SimLink[]>([]);

  const dragNodeRef  = useRef<SimNode|null>(null);
  const tickRef      = useRef<(()=>void)|null>(null);
  const transformRef = useRef({scale:1,x:0,y:0});
  const isPanRef     = useRef(false);
  const panStartRef  = useRef({x:0,y:0});
  const activeIdRef  = useRef(activeFileId);
  useEffect(()=>{activeIdRef.current=activeFileId;},[activeFileId]);

  const categories = useMemo(()=>{
    const map:Record<string,string[]>={
      'Intelligence & AI':[],'Systems & Infra':[],'Security & Governance':[],'ML & Physics':[],'General':[],
    };
    const mapping:Record<string,string>={
      ai:'Intelligence & AI',agents:'Intelligence & AI',intelligence:'Intelligence & AI',
      systems:'Systems & Infra',kernel:'Systems & Infra',infrastructure:'Systems & Infra',
      security:'Security & Governance',governance:'Security & Governance',
      ml:'ML & Physics',physics:'ML & Physics',pinn:'ML & Physics',pde:'ML & Physics',
    };
    data.nodes.forEach(n=>{
      const tags=n.tags??[];
      let placed=false;
      for(const t of tags){
        const cat=mapping[t.toLowerCase().replace('#','')];
        if(cat&&!map[cat].includes(n.id)){map[cat].push(n.id);placed=true;break;}
      }
      if(!placed){const cat=mapping[n.group]??'General';if(!map[cat].includes(n.id))map[cat].push(n.id);}
    });
    return map;
  },[]);

  const [expandedFolders,setExpandedFolders] = useState<Record<string,boolean>>(
    Object.fromEntries(Object.keys(categories).map(k=>[k,true]))
  );

  useEffect(()=>{
    if (isOpen) {
      setTimeout(()=>setIsMounted(true), 10);
    } else {
      setIsMounted(false);
      hasAppliedInitialFileId.current = false;
    }
  },[isOpen]);

  useEffect(()=>{
    document.body.style.overflow=isOpen?'hidden':'';
    return ()=>{document.body.style.overflow='';};
  },[isOpen]);

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[onClose]);

  const handleGroupToggle = (v:boolean)=>{
    updateSetting('groupByTags',v);
  };

  const triggerAnimate = () => {
    setIsSettingsOpen(false);
    const now = Date.now();
    simNodesRef.current.forEach((n, i) => {
      n.revealAt = now + (n.isTag ? 0 : i * 50);
    });
    energyRef.current = 1.0;
    dirtyRef.current = true;
    if (sleepRef.current && tickRef.current) {
      sleepRef.current = false;
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
        energyRef.current = 0.5;
        dirtyRef.current = true;
        if (tickRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // ── SIMULATION ───────────────────────────────────────────────────────────
  useEffect(()=>{
    if(!showGraph||!isOpen||!canvasRef.current) return;
    const canvas=canvasRef.current;
    const ctx=canvas.getContext('2d')!;
    const dpr=window.devicePixelRatio||1;

    const ro=new ResizeObserver(()=>{
      const p=canvas.parentElement!;
      canvas.width=p.clientWidth*dpr; canvas.height=p.clientHeight*dpr;
      canvas.style.width=`${p.clientWidth}px`; canvas.style.height=`${p.clientHeight}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    });
    ro.observe(canvas.parentElement!);

    const rebuildView = () => {
      const s = settingsRef.current;
      simNodesRef.current = s.groupByTags
        ? [...tagNodesRef.current, ...fileNodesRef.current]
        : [...fileNodesRef.current];
      simLinksRef.current = s.groupByTags
        ? [...fileLinksRef.current, ...tagLinksRef.current]
        : [...fileLinksRef.current];
      dirtyRef.current = true;
    };

    const rebuild = () => {
      const p = canvas.parentElement!;
      const { fileNodes, fileLinks, tagNodes, tagLinks } = buildSimGraph(data, p.clientWidth, p.clientHeight, fileNodesRef.current);
      
      fileNodesRef.current = fileNodes;
      fileLinksRef.current = fileLinks;
      tagNodesRef.current = tagNodes;
      tagLinksRef.current = tagLinks;
      
      rebuildView();

      if (fileNodes.length > 0 && fileNodes[0].vx === 0 && fileNodes[0].vy === 0) {
        const cx = p.clientWidth / 2;
        const cy = p.clientHeight / 2;
        
        warmupAsync(
          simNodesRef.current, 
          simLinksRef.current, 
          cx, cy, 
          () => {
            const now = Date.now();
            simNodesRef.current.forEach((n, i) => {
              n.revealAt = now + (n.isTag ? 0 : i * 20);
            });
            energyRef.current = 1.0;
            dirtyRef.current = true;
          },
          (nodes) => {
            const W = p.clientWidth, H = p.clientHeight;
            const padding = 100;
            const qt = buildQuadtree(nodes, { x: -padding, y: -padding, w: W + padding*2, h: H + padding*2 });
            return (body) => applyRepulsion(qt, body, 12000);
          }
        );
      }
    };
    if(fileNodesRef.current.length === 0) rebuild();

    const getGraph=(mx:number,my:number)=>{
      const t=transformRef.current;
      return {gx:(mx-t.x)/t.scale,gy:(my-t.y)/t.scale};
    };

    let touchStartDist = 0;
    let touchStartScale = 1;

    const onDown=(e:MouseEvent)=>{
      energyRef.current = 1.0; sleepRef.current = false;
      const r=canvas.getBoundingClientRect();
      const {gx,gy}=getGraph(e.clientX-r.left,e.clientY-r.top);
      const s=settingsRef.current;
      const hit=simNodesRef.current.find(n=>Math.hypot(n.x-gx,n.y-gy)<(n.isTag?n.r*1.5:n.r)*s.nodeSize+12);
      if(hit){
        dragNodeRef.current=hit;
        if(!hit.isTag) {
          setActiveFileId(hit.id);
          setActiveTag(null);
        } else {
          setActiveTag(prev => prev === hit.label ? null : hit.label);
        }
      }
      else{isPanRef.current=true;panStartRef.current={x:(e.clientX-r.left)-transformRef.current.x,y:(e.clientY-r.top)-transformRef.current.y};}
      dirtyRef.current = true;
    };
    const onMove=(e:MouseEvent)=>{
      const r=canvas.getBoundingClientRect();
      const {gx,gy}=getGraph(e.clientX-r.left,e.clientY-r.top);
      if(dragNodeRef.current){
        dragNodeRef.current.x=gx;dragNodeRef.current.y=gy;dragNodeRef.current.vx=0;dragNodeRef.current.vy=0; 
        energyRef.current = 1.0; sleepRef.current = false; dirtyRef.current = true;
      }
      else if(isPanRef.current){
        const mx=e.clientX-r.left,my=e.clientY-r.top;
        transformRef.current.x=mx-panStartRef.current.x;transformRef.current.y=my-panStartRef.current.y; 
        energyRef.current = 1.0; sleepRef.current = false; dirtyRef.current = true;
      }
    };
    const onUp=()=>{dragNodeRef.current=null;isPanRef.current=false; energyRef.current = 1.0; sleepRef.current = false; dirtyRef.current = true;};
    const onWheel=(e:WheelEvent)=>{
      e.preventDefault();
      energyRef.current = 1.0; sleepRef.current = false;
      const r=canvas.getBoundingClientRect();
      const mx=e.clientX-r.left,my=e.clientY-r.top;
      const t=transformRef.current;
      const gx=(mx-t.x)/t.scale,gy=(my-t.y)/t.scale;
      const ns=Math.max(0.1,Math.min(5,t.scale*(e.deltaY<0?1.12:0.88)));
      t.x=mx-gx*ns;t.y=my-gy*ns;t.scale=ns;
      dirtyRef.current = true;
    };

    const onTouchStart=(e:TouchEvent)=>{
      energyRef.current = 1.0; sleepRef.current = false;
      const r=canvas.getBoundingClientRect();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const {gx,gy}=getGraph(touch.clientX-r.left, touch.clientY-r.top);
        const s=settingsRef.current;
        const hit=simNodesRef.current.find(n=>Math.hypot(n.x-gx,n.y-gy)<(n.isTag?n.r*1.5:n.r)*s.nodeSize+12);
        if(hit){
          dragNodeRef.current=hit;
          if(!hit.isTag) {
            setActiveFileId(hit.id);
            setActiveTag(null);
          } else {
            setActiveTag(prev => prev === hit.label ? null : hit.label);
          }
        } else {
          isPanRef.current=true;
          panStartRef.current={x:(touch.clientX-r.left)-transformRef.current.x,y:(touch.clientY-r.top)-transformRef.current.y};
        }
      } else if (e.touches.length === 2) {
        isPanRef.current=false;
        dragNodeRef.current=null;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        touchStartScale = transformRef.current.scale;
      }
      dirtyRef.current = true;
    };

    const onTouchMove=(e:TouchEvent)=>{
      const r=canvas.getBoundingClientRect();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const {gx,gy}=getGraph(touch.clientX-r.left, touch.clientY-r.top);
        if(dragNodeRef.current){
          dragNodeRef.current.x=gx;dragNodeRef.current.y=gy;dragNodeRef.current.vx=0;dragNodeRef.current.vy=0; 
          energyRef.current = 1.0; sleepRef.current = false;
        } else if(isPanRef.current){
          const mx=touch.clientX-r.left, my=touch.clientY-r.top;
          transformRef.current.x=mx-panStartRef.current.x;transformRef.current.y=my-panStartRef.current.y; 
          energyRef.current = 1.0; sleepRef.current = false;
        }
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const factor = dist / (touchStartDist || 1);
        const mx = (t1.clientX + t2.clientX) / 2 - r.left;
        const my = (t1.clientY + t2.clientY) / 2 - r.top;
        const t=transformRef.current;
        const gx=(mx-t.x)/t.scale,gy=(my-t.y)/t.scale;
        const ns=Math.max(0.1,Math.min(5, touchStartScale * factor));
        t.x=mx-gx*ns;t.y=my-gy*ns;t.scale=ns;
        energyRef.current = 1.0; sleepRef.current = false;
      }
      dirtyRef.current = true;
    };

    const onTouchEnd=()=>{
      dragNodeRef.current=null;
      isPanRef.current=false; 
      energyRef.current = 1.0; sleepRef.current = false;
      dirtyRef.current = true;
    };

    canvas.addEventListener('mousedown',onDown);
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
    canvas.addEventListener('wheel',onWheel,{passive:false});
    canvas.addEventListener('touchstart',onTouchStart,{passive:false});
    canvas.addEventListener('touchmove',onTouchMove,{passive:false});
    canvas.addEventListener('touchend',onTouchEnd);

    const tick=()=>{
      tickRef.current = tick;
      const s=settingsRef.current;
      const W=canvas.width/dpr, H=canvas.height/dpr;
      const nodes = simNodesRef.current as SimNode[];
      const links = simLinksRef.current as any[];

      const hasTagNodes = nodes.some(n => n.isTag);
      if (s.groupByTags !== hasTagNodes) rebuildView();

      if (energyRef.current > SLEEP_THRESHOLD || dragNodeRef.current) {
        energyRef.current *= 0.96;
        const cx=W/2, cy=H/2;
        
        const padding = 100;
        const qt = buildQuadtree(nodes, { x: -padding, y: -padding, w: W + padding*2, h: H + padding*2 });

        runPhysicsStep(nodes, links, cx, cy, { 
          repelForce: s.repelForce,
          linkDistance: s.linkDistance,
          linkForce: s.linkForce,
          centerForce: s.centerForce,
          damping: 0.82 
        }, (body) => applyRepulsion(qt, body, s.repelForce));
        
        dirtyRef.current = true;
      } else {
        sleepRef.current = true;
      }

      if (!dirtyRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      const t = transformRef.current;
      ctx.translate(t.x, t.y); ctx.scale(t.scale, t.scale);

      const now = Date.now();
      const activeId = activeIdRef.current;
      const q = s.searchQuery.toLowerCase();

      // Draw edges
      links.forEach(l => {
        if (now < l.source.revealAt || now < l.target.revealAt) return;
        
        const isTagActive = activeTagRef.current && (
          l.source.label === activeTagRef.current || 
          l.target.label === activeTagRef.current ||
          l.source.tags.map((t: string) => `#${t.replace('#','').toLowerCase()}`).includes(activeTagRef.current.toLowerCase()) ||
          l.target.tags.map((t: string) => `#${t.replace('#','').toLowerCase()}`).includes(activeTagRef.current.toLowerCase())
        );
        
        const active = l.source.id === activeId || l.target.id === activeId || isTagActive;
        const matches = !q || l.source.label.toLowerCase().includes(q) || l.target.label.toLowerCase().includes(q);
        ctx.globalAlpha = matches ? 1 : 0.07;
        ctx.setLineDash(active ? [] : [3, 5]);
        ctx.lineWidth = (active ? 2.2 : 1.0) * s.linkThickness;
        
        if (active) ctx.strokeStyle = 'rgba(0,71,255,0.85)';
        else if (l.isTag) {
          ctx.strokeStyle = cachedAlpha(l.target.color, '44');
        } else ctx.strokeStyle = 'rgba(26,26,26,0.3)';

        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Draw nodes
      nodes.forEach(node => {
        if (now < node.revealAt) return;
        
        const isTagActive = activeTagRef.current && (
          node.label === activeTagRef.current ||
          node.tags.map(t=>`#${t.replace('#','').toLowerCase()}`).includes(activeTagRef.current.toLowerCase())
        );
        
        const isActive = node.id === activeId || isTagActive;
        const isConn = links.some(l => (l.source.id === node.id && l.target.id === activeId) || (l.target.id === node.id && l.source.id === activeId));
        const matches = !q || node.label.toLowerCase().includes(q);
        const nr = node.r * s.nodeSize * (node.isTag ? 1.6 : 1);
        ctx.globalAlpha = matches ? 1 : 0.08;

        // Glow
        if (isActive || isConn || node.isTag) {
          ctx.shadowBlur = isActive ? 30 : node.isTag ? 18 : 10;
          ctx.shadowColor = node.isTag ? cachedAlpha(node.color, 'BB') : isActive ? 'rgba(0,71,255,0.5)' : cachedAlpha(node.color, '55');
        } else ctx.shadowBlur = 0;

        // Outer ring (wireframe)
        const pulse = isActive ? Math.sin(now / 280) * 2.5 : 0;
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = cachedAlpha(node.color, '80');
        ctx.lineWidth = node.isTag ? 2 : 1.2;
        ctx.arc(node.x, node.y, nr + 7 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fill
        ctx.beginPath();
        if (isActive) ctx.fillStyle = node.color;
        else if (node.isTag) ctx.fillStyle = node.color;
        else {
          const g = ctx.createRadialGradient(node.x - 1, node.y - 1, 0, node.x, node.y, nr);
          g.addColorStop(0, '#FFFFFF');
          g.addColorStop(1, isConn ? cachedAlpha(node.color, '44') : '#F0EFE8');
          ctx.fillStyle = g;
        }
        
        ctx.strokeStyle = node.isTag ? 'rgba(255,255,255,0.25)' : isActive ? node.color : (isConn ? node.color : 'rgba(26,26,26,0.35)');
        ctx.lineWidth = isActive || node.isTag ? 2.5 : 1.5;
        ctx.arc(node.x, node.y, nr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        const lsz = node.isTag ? 12 : isActive ? 11 : 10;
        ctx.font = `${node.isTag || isActive ? '700' : '500'} ${lsz}px var(--font-mono)`;
        ctx.textAlign = 'center';
        
        if (isActive) {
          const tw = ctx.measureText(node.label).width;
          ctx.fillStyle = 'rgba(0,71,255,0.08)';
          ctx.beginPath();
          ctx.roundRect(node.x - tw / 2 - 6, node.y + nr + 8, tw + 12, 18, 3);
          ctx.fill();
        }
        
        ctx.fillStyle = node.isTag ? node.color : isActive ? 'rgba(0,71,255,1.0)' : (isConn ? '#1A1A1A' : '#555');
        ctx.fillText(node.label, node.x, node.y + nr + 22);
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      dirtyRef.current = false;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return ()=>{
      if(rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown',onDown);
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
      canvas.removeEventListener('wheel',onWheel);
      canvas.removeEventListener('touchstart',onTouchStart);
      canvas.removeEventListener('touchmove',onTouchMove);
      canvas.removeEventListener('touchend',onTouchEnd);
    };
  },[showGraph,isOpen]); 

  const activeFile=data.files[activeFileId];
  const renderedContent = useMemo(() => {
    if(!activeFile) return null;
    const raw=activeFile.markdown??activeFile.html??'';
    const content=raw.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,(_,id,label)=>
      `<wiki-link data-id="${id.toLowerCase().replace(/\s+/g,'_')}">${label??id}</wiki-link>`
    );
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
        'wiki-link':({node,...p}:any)=>(
          <button onClick={()=>setActiveFileId(p['data-id'])} className="text-accent font-bold border-b border-dashed border-accent hover:bg-accent-light px-0.5 transition-all">{p.children}</button>
        ),
        code({inline,className,children,...p}:any){
          const lang=/language-(\w+)/.exec(className??'')?.[1];
          const str=String(children).replace(/\n$/,'');
          if(!inline&&lang==='mermaid') return <MermaidBlock chart={str}/>;
          return inline
            ?<code className="bg-accent/10 text-accent px-1 rounded font-mono text-[12px]"{...p}>{children}</code>
            :<div className="my-6 border border-dashed border-border-strong rounded-[2px] overflow-hidden">
              <div className="bg-black/5 border-b border-dashed border-border-strong px-4 py-2 font-mono text-[9px] text-ink-faint uppercase tracking-widest">{lang??'code'}</div>
              <pre className="p-6 overflow-x-auto"><code className="font-mono text-[12px] leading-[1.8] text-ink block">{children}</code></pre>
            </div>;
        },
        h1:({children}:any)=><h1 className="font-serif text-[30px] font-medium mb-6 text-ink mt-10">{children}</h1>,
        h2:({children}:any)=><h2 className="font-serif text-[22px] font-medium mb-4 text-ink mt-8 border-b border-dashed border-border-strong pb-2">{children}</h2>,
        h3:({children}:any)=><h3 className="font-serif text-[18px] font-medium mb-3 text-ink mt-6">{children}</h3>,
        p:({children}:any)=><div className="font-serif text-[15px] leading-[1.85] text-ink-muted mb-5">{children}</div>,
        ul:({children}:any)=><ul className="space-y-2 mb-6 pl-4">{children}</ul>,
        li:({children}:any)=><li className="flex items-start gap-3 text-ink-muted font-serif text-[15px]"><ChevronRight size={12} className="text-accent mt-1.5 shrink-0"/>{children}</li>,
        blockquote:({children}:any)=><blockquote className="border-l-2 border-dashed border-accent bg-accent/5 pl-6 py-3 my-6 italic text-ink-muted">{children}</blockquote>,
        table:({children}:any)=><div className="overflow-x-auto my-6 border border-dashed border-border-strong"><table className="w-full font-mono text-[12px]">{children}</table></div>,
        th:({children}:any)=><th className="text-left px-4 py-2 font-bold text-ink bg-black/5 border-b border-dashed border-border-strong">{children}</th>,
        td:({children}:any)=><td className="px-4 py-2 text-ink-muted border-b border-dashed border-border-strong/40">{children}</td>,
      } as any}>{content}</ReactMarkdown>
    );
  }, [activeFileId, activeFile]);

  if(!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-6 transition-opacity duration-300 ${isMounted?'opacity-100':'opacity-0'}`}>
      <div className="absolute inset-0 bg-[rgba(253,253,251,0.97)] backdrop-blur-[12px]" onClick={onClose}/>
      <div className="relative bg-paper border border-dashed border-border-strong flex flex-col w-full md:w-[98vw] h-[98vh] md:h-[95vh] rounded-[2px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)]">

        {/* Chrome */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-dashed border-border-strong bg-paper shrink-0 z-30">
          <div className="flex gap-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400/60 border border-red-500/30 hover:bg-red-500 group flex items-center justify-center"><X size={7} className="text-red-800 opacity-0 group-hover:opacity-100"/></button>
            <button onClick={()=>onMinimize('garden-authority','Knowledge Garden')} className="w-3 h-3 rounded-full bg-yellow-400/60 border border-yellow-500/30 hover:bg-yellow-500 group flex items-center justify-center"><Minus size={7} className="text-yellow-800 opacity-0 group-hover:opacity-100"/></button>
            <div className="w-3 h-3 rounded-full bg-green-400/60 border border-green-500/30"/>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Globe size={13} className="text-ink-faint"/>
            <span className="font-mono text-[10px] tracking-[0.3em] text-ink-muted uppercase font-bold">Knowledge Garden // {fileKeys.length} nodes</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const isMobile = window.innerWidth < 1024;
                if (isMobile) {
                  const nextState = !showGraph;
                  setShowGraph(nextState);
                  setIsMaxGraph(nextState);
                } else {
                  setShowGraph(!showGraph);
                  if (showGraph) setIsMaxGraph(false);
                }
              }} 
              className={`font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong flex items-center gap-1.5 transition-all hover:border-accent hover:text-accent ${showGraph ? 'bg-accent-light text-accent' : 'text-ink-muted'}`}
            >
              <span>{showGraph ? 'hide graph' : 'show graph'}</span>
            </button>
            {showGraph && (
              <button 
                onClick={() => setIsMaxGraph(!isMaxGraph)} 
                className={`hidden lg:flex font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong items-center gap-1.5 transition-all hover:border-accent hover:text-accent ${isMaxGraph ? 'bg-accent-light text-accent' : 'text-ink-muted'}`}
              >
                {isMaxGraph ? <Minimize2 size={11}/> : <Maximize2 size={11}/>}
                <span className="hidden sm:inline">{isMaxGraph ? 'restore' : 'max graph'}</span>
              </button>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong text-ink-muted hover:text-accent">[menu]</button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`absolute lg:relative z-20 h-full w-[240px] shrink-0 border-r border-dashed border-border-strong overflow-y-auto bg-paper transition-transform duration-300 ${isSidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
            <div className="p-3 sticky top-0 bg-paper z-10 border-b border-dashed border-border-strong">
              <div className="relative">
                <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"/>
                <input type="text" value={settings.searchQuery} onChange={e=>updateSetting('searchQuery',e.target.value)} placeholder="search nodes…" className="w-full font-mono text-[10px] pl-7 pr-3 py-2 border border-dashed border-border-strong bg-transparent focus:outline-none focus:border-accent placeholder:text-ink-faint"/>
              </div>
            </div>
            <div className="p-3 space-y-3">
              {Object.entries(categories).map(([cat,ids])=>{
                const q = settings.searchQuery.toLowerCase();
                const filtered = ids.filter(id => {
                  const f = data.files[id];
                  if (!f) return false;
                  const node = data.nodes.find(n => n.id === id);
                  const tags = node?.tags ?? [];
                  return !q || f.title.toLowerCase().includes(q) || tags.some(t => t.toLowerCase().includes(q));
                });
                if (filtered.length === 0) return null;
                const isExpanded = expandedFolders[cat] || q.length > 0;
                
                return (
                  <div key={cat}>
                    <button onClick={()=>setExpandedFolders(p=>({...p,[cat]:!p[cat]}))} className={`w-full flex items-center gap-2 px-2 py-1.5 font-mono text-[9.5px] tracking-widest uppercase transition-all ${isExpanded?'text-accent':'text-ink-muted hover:text-ink'}`}>
                      {isExpanded?<ChevronDown size={11}/>:<ChevronRight size={11}/>}{cat}<span className="ml-auto text-ink-faint">{filtered.length}</span>
                    </button>
                    {isExpanded&&(
                      <div className="ml-4 pl-3 border-l border-dashed border-border-strong/50 space-y-0.5 mt-1">
                        {filtered.map(id=>{const f=data.files[id];if(!f)return null;return(
                          <button key={id} onClick={()=>{setActiveFileId(id);setIsSidebarOpen(false);}} className={`w-full text-left flex items-center gap-2 px-2 py-1.5 font-mono text-[10px] rounded-[2px] transition-all truncate ${activeFileId===id?'bg-accent text-white':'text-ink-muted hover:text-accent hover:bg-accent-light'}`}>
                            <FileText size={9} className={activeFileId===id?'text-white shrink-0':'shrink-0 opacity-40'}/><span className="truncate">{f.title}</span>
                          </button>
                        );})}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {isSidebarOpen&&<div className="absolute inset-0 z-10 lg:hidden" onClick={()=>setIsSidebarOpen(false)}/>}

          {/* Editor */}
          {!isMaxGraph&&(
            <div className="flex-1 overflow-y-auto bg-paper">
              <div className="p-8 md:p-14 max-w-[820px] mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <span className="font-mono text-[9px] text-accent tracking-[0.25em] uppercase font-bold">{activeFile?.header}</span>
                  <div className="flex-1 h-px bg-accent/20"/>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/garden/${activeFileId}`;
                        navigator.clipboard.writeText(url).then(() => {
                          window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: `mendhu.tech/garden/${activeFileId}` } }));
                        });
                        window.history.replaceState({}, "", `/garden/${activeFileId}`);
                      }}
                      title={`Copy link: mendhu.tech/garden/${activeFileId}`}
                      className="group flex items-center gap-1.5 font-mono text-[9px] text-ink-faint hover:text-accent transition-colors px-2 py-1 border border-dashed border-transparent hover:border-accent rounded-[2px]"
                    >
                      <Share2 size={11} />
                      <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {`/garden/${activeFileId}`}
                      </span>
                    </button>
                  </div>
                </div>
                {renderedContent}
              </div>
            </div>
          )}

          {/* Graph */}
          {showGraph&&(
            <div className={`relative flex flex-col shrink-0 overflow-hidden border-l border-dashed border-border-strong transition-all duration-300 ${isMaxGraph?'flex-1':'w-[380px] hidden lg:flex'}`}>
              <canvas ref={canvasRef} className="w-full h-full block cursor-none relative z-10"/>

              {/* Settings Toggle Icon — only visible when graph is maximised */}
              {isMaxGraph && (
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`absolute top-3 right-3 z-30 p-2 border border-dashed border-border-strong bg-[rgba(253,253,251,0.95)] hover:border-accent hover:text-accent transition-all ${isSettingsOpen ? 'text-accent border-accent' : 'text-ink-muted'}`}
                >
                  <Settings size={14} />
                </button>
              )}

              {/* Settings panel — visible when isMaxGraph AND isSettingsOpen */}
              {isMaxGraph && isSettingsOpen && (
                <div className="absolute top-12 right-3 z-20 w-[240px] bg-[rgba(253,253,251,0.97)] border border-dashed border-border-strong shadow-lg">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-dashed border-border-strong">
                    <Settings size={11} className="text-accent"/><span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold">Graph Controls</span>
                  </div>
                  <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
                     <Toggle label="Group by tags" k="groupByTags" onToggle={handleGroupToggle} settings={settings} updateSetting={updateSetting}/>
                     <div className="border-t border-dashed border-border-strong pt-3 space-y-3">
                       <SliderRow label="Node size"      k="nodeSize"      min={0.4} max={2.5}   step={0.1}    fmt={v=>v.toFixed(1)+'×'} settings={settings} updateSetting={updateSetting}/>
                       <SliderRow label="Link thickness" k="linkThickness" min={0.3} max={3.5}   step={0.1}    fmt={v=>v.toFixed(1)+'×'} settings={settings} updateSetting={updateSetting}/>
                       <SliderRow label="Link distance"  k="linkDistance"  min={80}  max={450}   step={10}     fmt={v=>v+'px'}           settings={settings} updateSetting={updateSetting}/>
                       <SliderRow label="Repel force"    k="repelForce"    min={500} max={20000} step={500}    fmt={v=>''+v}             settings={settings} updateSetting={updateSetting}/>
                       <SliderRow label="Center force"   k="centerForce"   min={0.0005} max={0.02} step={0.0005} fmt={v=>v.toFixed(4)}   settings={settings} updateSetting={updateSetting}/>
                       <SliderRow label="Link force"     k="linkForce"     min={0.002} max={0.08} step={0.002}  fmt={v=>v.toFixed(3)}    settings={settings} updateSetting={updateSetting}/>
                    </div>
                    <div className="border-t border-dashed border-border-strong pt-3">
                      <button onClick={triggerAnimate} className="w-full font-mono text-[9px] py-1.5 border border-dashed border-border-strong text-ink-muted hover:border-accent hover:text-accent transition-all uppercase tracking-wider font-bold">Animate Making</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dot grid overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-40 z-0"
                style={{backgroundImage:'radial-gradient(rgba(0,0,0,0.5) 1.2px,transparent 1.2px)',backgroundSize:'16px 16px'}}/>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}