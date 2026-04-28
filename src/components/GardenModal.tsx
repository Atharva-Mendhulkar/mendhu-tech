"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { ChevronRight, ChevronDown, FileText, Maximize2, Minimize2, Share2, Globe, Minus, X, Settings, Search } from 'lucide-react';
import rawResearchData from '@/data/research.json';

// ── Mermaid ────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
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
}

const MermaidBlock = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    const uniqueId = `mmd-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    mermaid.render(uniqueId, chart)
      .then(r => setSvg(r.svg))
      .catch((err) => {
        console.error('Failed to render Mermaid chart:', err);
        setSvg(`<div class="p-4 border border-dashed border-red-500/30 text-red-500 font-mono text-[10px] bg-red-500/5 my-4">
          <strong>Mermaid Render Error:</strong>
          <pre class="mt-2 text-[9px] text-ink-muted select-all overflow-x-auto whitespace-pre-wrap">${String(err)}</pre>
          <pre class="mt-2 text-[9px] text-ink-muted border-t border-dashed border-red-500/20 pt-2 select-all overflow-x-auto whitespace-pre-wrap">${chart}</pre>
        </div>`);
      });
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

interface SimNode {
  id: string; label: string; color: string; group: string; tags: string[];
  x: number; y: number; vx: number; vy: number;
  r: number; isTag: boolean; revealAt: number;
}
interface SimLink { source: SimNode; target: SimNode }
interface GraphSettings {
  nodeSize: number; linkThickness: number; centerForce: number;
  repelForce: number; linkForce: number; linkDistance: number;
  groupByTags: boolean; searchQuery: string;
}

const TAG_COLORS: Record<string, string> = {
  ai:'#00FF88', agents:'#FFBD2E', systems:'#FF5F57',
  security:'#CC77FF', ml:'#0047FF', physics:'#20C9A6',
  saas:'#F97316', kernel:'#EF4444', pinn:'#3B82F6',
};
const tagColor = (t: string) => TAG_COLORS[t.replace('#','')] ?? '#888888';

const getAlphaColor = (color: string, alpha: string) => {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    } else if (hex.length === 4) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
    }
    if (hex.length === 6) return `#${hex}${alpha}`;
    if (hex.length === 8) return `#${hex.slice(0,6)}${alpha}`;
  }
  return color;
};

const DEFAULT: GraphSettings = {
  nodeSize:1.0, linkThickness:1.0, centerForce:0.003,
  repelForce:6000, linkForce:0.018, linkDistance:220,
  groupByTags:true, searchQuery:'',
};

function buildSimGraph(raw: ResearchData, groupByTags: boolean, W: number, H: number, existing: SimNode[]) {
  const cx = W/2, cy = H/2, now = Date.now();
  const fileNodes: SimNode[] = raw.nodes.map((n,i) => {
    const ex = existing.find(e => e.id === n.id);
    return ex ?? {
      id:n.id, label:n.name??n.label??n.id, color:n.color??'#888',
      group:n.group, tags:n.tags??[],
      x:cx+(Math.random()-.5)*300, y:cy+(Math.random()-.5)*300,
      vx:0, vy:0, r:8, isTag:false, revealAt:now+i*100,
    };
  });
  const fileLinks: SimLink[] = raw.links.flatMap(l => {
    const s=fileNodes.find(n=>n.id===l.source), t=fileNodes.find(n=>n.id===l.target);
    return s&&t?[{source:s,target:t}]:[];
  });
  if (!groupByTags) return { nodes:fileNodes, links:fileLinks };

  const allTags = new Set<string>();
  fileNodes.forEach(n => n.tags.forEach(t => allTags.add(t.replace('#','').toLowerCase())));
  const tagNodes: SimNode[] = [...allTags].map((tag,i) => {
    const ex = existing.find(e=>e.id===`#${tag}`);
    return ex ?? {
      id:`#${tag}`, label:`#${tag}`, color:tagColor(tag), group:'tag', tags:[],
      x:cx+Math.cos((i/allTags.size)*Math.PI*2)*160,
      y:cy+Math.sin((i/allTags.size)*Math.PI*2)*160,
      vx:0, vy:0, r:14, isTag:true, revealAt:now,
    };
  });
  const tagLinks: SimLink[] = [];
  fileNodes.forEach(fn => {
    fn.tags.forEach(t => {
      const tid=t.replace('#','').toLowerCase();
      const hub=tagNodes.find(n=>n.id===`#${tid}`);
      if(hub) tagLinks.push({source:hub, target:fn});
    });
  });
  return { nodes:[...tagNodes,...fileNodes], links:[...fileLinks,...tagLinks] };
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
  const fileKeys = Object.keys(data.files);
  const [activeFileId, setActiveFileId] = useState(fileKeys[0]??'');

  useEffect(() => {
    if (initialFileId && fileKeys.includes(initialFileId)) {
      setActiveFileId(initialFileId);
    }
  }, [initialFileId, fileKeys]);
  const [showGraph, setShowGraph]       = useState(false);
  const [isMaxGraph, setIsMaxGraph]     = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted]       = useState(false);
  const [settings, setSettings]         = useState<GraphSettings>({...DEFAULT});
  const settingsRef                     = useRef<GraphSettings>({...DEFAULT});
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const activeTagRef = useRef<string | null>(null);
  useEffect(()=>{activeTagRef.current=activeTag;},[activeTag]);

  // KEY FIX: update both state (for UI) AND ref (for RAF loop)
  const updateSetting = <K extends keyof GraphSettings>(k: K, v: GraphSettings[K]) => {
    settingsRef.current = {...settingsRef.current, [k]:v};
    setSettings(s => ({...s,[k]:v}));
    energyRef.current = 1.0;
  };

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number|null>(null);
  const simNodesRef  = useRef<SimNode[]>([]);
  const simLinksRef  = useRef<SimLink[]>([]);
  const dragNodeRef  = useRef<SimNode|null>(null);
  const energyRef    = useRef<number>(1.0);
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
    if(isOpen) setTimeout(()=>setIsMounted(true),10);
    else setIsMounted(false);
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
    const now = Date.now();
    simNodesRef.current.forEach((n, i) => {
      n.revealAt = now + (n.isTag ? 0 : i * 50);
    });
    energyRef.current = 1.0;
  };

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
    const p=canvas.parentElement!;
    canvas.width=p.clientWidth*dpr; canvas.height=p.clientHeight*dpr;
    canvas.style.width=`${p.clientWidth}px`; canvas.style.height=`${p.clientHeight}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const rebuild=()=>{
      const {nodes,links}=buildSimGraph(data,settingsRef.current.groupByTags,p.clientWidth,p.clientHeight,simNodesRef.current);
      simNodesRef.current=nodes; simLinksRef.current=links;
    };
    if(simNodesRef.current.length===0) rebuild();

    const getGraph=(mx:number,my:number)=>{
      const t=transformRef.current;
      return {gx:(mx-t.x)/t.scale,gy:(my-t.y)/t.scale};
    };

    const onDown=(e:MouseEvent)=>{
      energyRef.current = 1.0;
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
    };
    const onMove=(e:MouseEvent)=>{
      const r=canvas.getBoundingClientRect();
      const {gx,gy}=getGraph(e.clientX-r.left,e.clientY-r.top);
      if(dragNodeRef.current){dragNodeRef.current.x=gx;dragNodeRef.current.y=gy;dragNodeRef.current.vx=0;dragNodeRef.current.vy=0; energyRef.current = 1.0;}
      else if(isPanRef.current){const mx=e.clientX-r.left,my=e.clientY-r.top;transformRef.current.x=mx-panStartRef.current.x;transformRef.current.y=my-panStartRef.current.y; energyRef.current = 1.0;}
    };
    const onUp=()=>{dragNodeRef.current=null;isPanRef.current=false; energyRef.current = 1.0;};
    const onWheel=(e:WheelEvent)=>{
      e.preventDefault();
      energyRef.current = 1.0;
      const r=canvas.getBoundingClientRect();
      const mx=e.clientX-r.left,my=e.clientY-r.top;
      const t=transformRef.current;
      const gx=(mx-t.x)/t.scale,gy=(my-t.y)/t.scale;
      const ns=Math.max(0.1,Math.min(5,t.scale*(e.deltaY<0?1.12:0.88)));
      t.x=mx-gx*ns;t.y=my-gy*ns;t.scale=ns;
    };
    canvas.addEventListener('mousedown',onDown);
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
    canvas.addEventListener('wheel',onWheel,{passive:false});

    const tick=()=>{
      const s=settingsRef.current;   // LIVE — reads ref, not stale closure
      const now=Date.now();
      const W=canvas.width/dpr, H=canvas.height/dpr;
      const nodes=simNodesRef.current, links=simLinksRef.current;

      // Rebuild if groupByTags changed
      const hasTagNodes=nodes.some(n=>n.isTag);
      if(s.groupByTags!==hasTagNodes) rebuild();

      ctx.clearRect(0,0,W,H);

      ctx.save();
      const t=transformRef.current;
      ctx.translate(t.x,t.y);ctx.scale(t.scale,t.scale);

      if (energyRef.current > 0.005) {
        energyRef.current *= 0.96;
        const cx=W/2,cy=H/2;
        for(let i=0;i<nodes.length;i++){
          const n1=nodes[i];
          if(n1===dragNodeRef.current) continue;
          n1.vx+=(cx-n1.x)*s.centerForce*(n1.isTag?4:1);
          n1.vy+=(cy-n1.y)*s.centerForce*(n1.isTag?4:1);
          for(let j=i+1;j<nodes.length;j++){
            const n2=nodes[j];
            const dx=n1.x-n2.x,dy=n1.y-n2.y;
            const d2=dx*dx+dy*dy+1,d=Math.sqrt(d2);
            const f=s.repelForce/d2;
            const fx=(dx/d)*f,fy=(dy/d)*f;
            n1.vx+=fx;n1.vy+=fy;n2.vx-=fx;n2.vy-=fy;
          }
        }
        links.forEach(l=>{
          const dx=l.source.x-l.target.x,dy=l.source.y-l.target.y;
          const d=Math.sqrt(dx*dx+dy*dy)||1;
          const f=(d-s.linkDistance)*s.linkForce;
          const fx=(dx/d)*f,fy=(dy/d)*f;
          if(l.source!==dragNodeRef.current){l.source.vx-=fx;l.source.vy-=fy;}
          if(l.target!==dragNodeRef.current){l.target.vx+=fx;l.target.vy+=fy;}
        });
        const damp=0.82,maxV=12;
        nodes.forEach(n=>{
          if(n===dragNodeRef.current) return;
          n.vx=Math.max(-maxV,Math.min(maxV,n.vx*damp));
          n.vy=Math.max(-maxV,Math.min(maxV,n.vy*damp));
          n.x+=n.vx;n.y+=n.vy;
          n.x=Math.max(24,Math.min(W-24,n.x));
          n.y=Math.max(24,Math.min(H-24,n.y));
        });
      }

      const activeId=activeIdRef.current;
      const q=s.searchQuery.toLowerCase();

      // Draw edges
      links.forEach(l=>{
        if(now<l.source.revealAt||now<l.target.revealAt) return;
        
        const isTagActive = activeTagRef.current && (
          l.source.label === activeTagRef.current || 
          l.target.label === activeTagRef.current ||
          l.source.tags.map(t=>`#${t.replace('#','').toLowerCase()}`).includes(activeTagRef.current.toLowerCase()) ||
          l.target.tags.map(t=>`#${t.replace('#','').toLowerCase()}`).includes(activeTagRef.current.toLowerCase())
        );
        
        const active=l.source.id===activeId||l.target.id===activeId || isTagActive;
        const matches=!q||l.source.label.toLowerCase().includes(q)||l.target.label.toLowerCase().includes(q);
        ctx.globalAlpha=matches?1:0.07;
        ctx.setLineDash(active?[]:[3,5]);
        ctx.lineWidth=(active?2.2:1.0)*s.linkThickness;
        
        if(active) ctx.strokeStyle='rgba(0,71,255,0.85)';
        else if(l.source.isTag||l.target.isTag){
          const hub=l.source.isTag?l.source:l.target;
          ctx.strokeStyle=getAlphaColor(hub.color, '44');
        } else ctx.strokeStyle='rgba(26,26,26,0.3)';
        ctx.beginPath();ctx.moveTo(l.source.x,l.source.y);ctx.lineTo(l.target.x,l.target.y);ctx.stroke();
      });
      ctx.setLineDash([]);ctx.globalAlpha=1;

      // Draw nodes
      nodes.forEach(node=>{
        if(now<node.revealAt) return;
        
        const isTagActive = activeTagRef.current && (
          node.label === activeTagRef.current ||
          node.tags.map(t=>`#${t.replace('#','').toLowerCase()}`).includes(activeTagRef.current.toLowerCase())
        );
        
        const isActive=node.id===activeId || isTagActive;
        const isConn=links.some(l=>(l.source.id===node.id&&l.target.id===activeId)||(l.target.id===node.id&&l.source.id===activeId));
        const matches=!q||node.label.toLowerCase().includes(q);
        const nr=node.r*s.nodeSize*(node.isTag?1.6:1);
        ctx.globalAlpha=matches?1:0.08;

        // Glow
        if(isActive||isConn||node.isTag){
          ctx.shadowBlur=isActive?30:node.isTag?18:10;
          ctx.shadowColor=node.isTag?getAlphaColor(node.color, 'BB'):isActive?'rgba(0,71,255,0.5)':getAlphaColor(node.color, '55');
        } else ctx.shadowBlur=0;

        // Outer ring (wireframe)
        const pulse=isActive?Math.sin(now/280)*2.5:0;
        ctx.beginPath();ctx.setLineDash([2,4]);
        ctx.strokeStyle=getAlphaColor(node.color, '80');
        ctx.lineWidth=node.isTag?2:1.2;
        ctx.arc(node.x,node.y,nr+7+pulse,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([]);

        // Fill
        ctx.beginPath();
        if(isActive) ctx.fillStyle=node.color;
        else if(node.isTag) ctx.fillStyle=node.color;
        else {
          const g=ctx.createRadialGradient(node.x-1,node.y-1,0,node.x,node.y,nr);
          g.addColorStop(0,'#FFFFFF');
          g.addColorStop(1,isConn?getAlphaColor(node.color, '44'):'#F0EFE8');
          ctx.fillStyle=g;
        }
        ctx.strokeStyle=node.isTag?'rgba(255,255,255,0.25)':isActive?node.color:(isConn?node.color:'rgba(26,26,26,0.35)');
        ctx.lineWidth=isActive||node.isTag?2.5:1.5;
        ctx.arc(node.x,node.y,nr,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.shadowBlur=0;

        // Label
        const lsz=node.isTag?12:isActive?11:10;
        ctx.font=`${node.isTag||isActive?'700':'500'} ${lsz}px "JetBrains Mono",monospace`;
        ctx.textAlign='center';
        if(isActive){
          const tw=ctx.measureText(node.label).width;
          ctx.fillStyle='rgba(0,71,255,0.08)';
          ctx.beginPath();ctx.roundRect(node.x-tw/2-6,node.y+nr+8,tw+12,18,3);ctx.fill();
        }
        ctx.fillStyle=node.isTag?node.color:isActive?'rgba(0,71,255,1.0)':(isConn?'#1A1A1A':'#555');
        ctx.fillText(node.label,node.x,node.y+nr+22);
        ctx.globalAlpha=1;
      });

      ctx.restore();
      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);

    return ()=>{
      if(rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown',onDown);
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
      canvas.removeEventListener('wheel',onWheel);
    };
  },[showGraph,isOpen]); // intentionally minimal — all live values via refs

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
            {showGraph&&<button onClick={()=>setIsMaxGraph(!isMaxGraph)} className={`font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong flex items-center gap-1.5 transition-all hover:border-accent hover:text-accent ${isMaxGraph?'bg-accent-light text-accent':'text-ink-muted'}`}>{isMaxGraph?<Minimize2 size={11}/>:<Maximize2 size={11}/>}<span className="hidden sm:inline">{isMaxGraph?'restore':'max graph'}</span></button>}
            <button onClick={()=>{if(showGraph)setIsMaxGraph(false);setShowGraph(!showGraph);}} className="font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong text-ink-muted hover:border-accent hover:text-accent transition-all">[{showGraph?'hide graph':'show graph'}]</button>
            <button onClick={()=>setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden font-mono text-[9px] px-3 py-1 border border-dashed border-border-strong text-ink-muted hover:text-accent">[menu]</button>
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
              {Object.entries(categories).map(([cat,ids])=>(
                <div key={cat}>
                  <button onClick={()=>setExpandedFolders(p=>({...p,[cat]:!p[cat]}))} className={`w-full flex items-center gap-2 px-2 py-1.5 font-mono text-[9.5px] tracking-widest uppercase transition-all ${expandedFolders[cat]?'text-accent':'text-ink-muted hover:text-ink'}`}>
                    {expandedFolders[cat]?<ChevronDown size={11}/>:<ChevronRight size={11}/>}{cat}<span className="ml-auto text-ink-faint">{ids.length}</span>
                  </button>
                  {expandedFolders[cat]&&(
                    <div className="ml-4 pl-3 border-l border-dashed border-border-strong/50 space-y-0.5 mt-1">
                      {ids.map(id=>{const f=data.files[id];if(!f)return null;return(
                        <button key={id} onClick={()=>{setActiveFileId(id);setIsSidebarOpen(false);}} className={`w-full text-left flex items-center gap-2 px-2 py-1.5 font-mono text-[10px] rounded-[2px] transition-all truncate ${activeFileId===id?'bg-accent text-white':'text-ink-muted hover:text-accent hover:bg-accent-light'}`}>
                          <FileText size={9} className={activeFileId===id?'text-white shrink-0':'shrink-0 opacity-40'}/><span className="truncate">{f.title}</span>
                        </button>
                      );})}
                    </div>
                  )}
                </div>
              ))}
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
                  <Share2 size={12} className="text-ink-faint"/>
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