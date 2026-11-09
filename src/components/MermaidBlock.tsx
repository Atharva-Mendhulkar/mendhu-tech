"use client";

import React, { useEffect, useState } from "react";

interface MermaidBlockProps {
  chart: string;
  caption?: string;
}

export default function MermaidBlock({ chart, caption }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("mermaid").then((mermaidModule) => {
      if (!isMounted) return;
      const mermaid = mermaidModule.default;
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: isDark
          ? {
              primaryColor: "#0f172a",
              primaryTextColor: "#f1f5f9",
              primaryBorderColor: "rgba(0, 71, 255, 0.45)",
              lineColor: "#64748b",
              secondaryColor: "#020617",
              tertiaryColor: "#090d16",
              edgeLabelBackground: "#0b1120",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: "11px",
            }
          : {
              primaryColor: "#f8fafc",
              primaryTextColor: "#0f172a",
              primaryBorderColor: "rgba(0, 71, 255, 0.35)",
              lineColor: "#475569",
              secondaryColor: "#ffffff",
              tertiaryColor: "#f1f5f9",
              edgeLabelBackground: "#f8fafc",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: "11px",
            },
        securityLevel: "loose",
        flowchart: {
          curve: "basis",
          htmlLabels: true,
          useMaxWidth: true,
        },
      });

      const uniqueId = `mermaid-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
      mermaid
        .render(uniqueId, chart.trim())
        .then((result) => {
          if (isMounted) {
            setSvg(result.svg);
            setError(null);
          }
        })
        .catch((err) => {
          console.error("Mermaid rendering failed:", err);
          if (isMounted) {
            setError(String(err));
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="my-6 border border-dashed border-border-strong bg-accent/[0.02] p-4 md:p-6 rounded-[2px] overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-border-strong">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[9px] text-accent font-semibold tracking-wider uppercase">
            {caption || "ARCHITECTURE_DIAGRAM // SYSTEM_TOPOLOGY"}
          </span>
        </div>
        <span className="font-mono text-[8px] text-ink-faint uppercase tracking-widest">
          MERMAID.JS
        </span>
      </div>

      {error ? (
        <div className="p-3 text-red-500 font-mono text-[10px] bg-red-500/5 border border-dashed border-red-500/30">
          <div>Architecture render fallback:</div>
          <pre className="mt-1 text-[9px] text-ink-muted overflow-x-auto whitespace-pre-wrap">{chart}</pre>
        </div>
      ) : svg ? (
        <div
          className="mermaid-svg-container w-full overflow-x-auto flex justify-center py-2 [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="py-8 flex items-center justify-center font-mono text-[10px] text-ink-faint gap-2">
          <span className="w-2 h-2 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>compiling_mermaid_graph...</span>
        </div>
      )}
    </div>
  );
}
