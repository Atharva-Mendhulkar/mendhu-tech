"use client";

import { useEffect, useState } from 'react';

const MermaidBlock = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  
  useEffect(() => {
    let isMounted = true;
    
    const loadMermaid = async () => {
      try {
        const mermaidModule = await import('mermaid');
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
        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);
        
        if (isMounted) setSvg(renderedSvg);
      } catch (err) {
        console.error('Failed to render Mermaid chart:', err);
        if (isMounted) {
          setSvg(`<div class="p-4 border border-dashed border-red-500/30 text-red-500 font-mono text-[10px] bg-red-500/5 my-4">
            <strong>Mermaid Render Error:</strong>
            <pre class="mt-2 text-[9px] text-ink-muted select-all overflow-x-auto whitespace-pre-wrap">${String(err)}</pre>
            <pre class="mt-2 text-[9px] text-ink-muted border-t border-dashed border-red-500/20 pt-2 select-all overflow-x-auto whitespace-pre-wrap">${chart}</pre>
          </div>`);
        }
      }
    };

    loadMermaid();
    return () => { isMounted = false; };
  }, [chart]);

  return (
    <div className="my-8 p-6 border border-dashed border-accent/20 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg || '<span class="font-mono text-[10px] text-ink-faint">rendering graph…</span>' }} />
  );
};

export default MermaidBlock;
