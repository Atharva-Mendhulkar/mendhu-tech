"use client";

import React from "react";
import { Project } from "@/data/projects";

interface VisualContextDiagramProps {
  project: Project;
  featureIndex: number;
}

export default function VisualContextDiagram({ project, featureIndex }: VisualContextDiagramProps) {
  const feature = project.features[featureIndex] || project.features[0];
  const projectId = project.id;
  const featureId = feature?.id || "";

  // Unique marker ID per render to avoid collisions
  const markerId = `arrow-${projectId}-${featureIndex}`;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      <style>{`
        @keyframes flowPulse {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .anim-flow {
          stroke-dasharray: 4 4;
          animation: flowPulse 1.8s linear infinite;
        }
      `}</style>

      {/* Diagram Top Bar */}
      <div className="flex items-center justify-between border-b border-dashed border-border-strong pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[9px] text-accent tracking-wider uppercase font-medium">
            {feature.media?.label || "SYSTEM_FLOW"}
          </span>
        </div>
        <span className="font-mono text-[8px] text-ink-faint uppercase tracking-widest">
          SVG // TELEMETRY
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 w-full flex items-center justify-center min-h-[140px]">
        <svg
          viewBox="0 0 340 130"
          className="w-full h-full max-h-[145px] text-ink"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" opacity="0.6" />
            </marker>
            <marker
              id={`${markerId}-accent`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-accent, #0047FF)" />
            </marker>
          </defs>

          {renderDiagram(projectId, featureId, featureIndex, markerId)}
        </svg>
      </div>

      {/* Diagram Sub-Label / Legend */}
      <div className="flex items-center justify-between border-t border-dashed border-border-strong pt-1.5 mt-2 font-mono text-[7.5px] text-ink-muted uppercase tracking-wider">
        <span>MOD_0{featureIndex + 1} {"//"} {feature.heading.slice(0, 28)}...</span>
        <span className="text-accent font-semibold">STATE: SYNCHRONIZED</span>
      </div>
    </div>
  );
}

function renderDiagram(projectId: string, featureId: string, idx: number, markerId: string) {
  // ── FLOEWORK DIAGRAMS ──────────────────────────────────────────
  if (projectId === "floework") {
    if (featureId === "occ" || idx === 0) {
      return (
        <g>
          {/* Node 1: Client Write */}
          <rect x="10" y="20" width="85" height="32" rx="3" className="fill-card stroke-border-strong" strokeDasharray="2 2" />
          <text x="52" y="35" textAnchor="middle" className="font-mono text-[8px] fill-current font-bold">CLIENT WRITE</text>
          <text x="52" y="45" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">version = v1</text>

          {/* Node 2: OCC Gate */}
          <rect x="125" y="20" width="90" height="32" rx="3" className="fill-card stroke-border-strong" />
          <text x="170" y="35" textAnchor="middle" className="font-mono text-[8px] fill-current font-bold">OCC VERSION GATE</text>
          <text x="170" y="45" textAnchor="middle" className="font-mono text-[7px] fill-accent font-medium">v == v_db ?</text>

          {/* Node 3A: Commit */}
          <rect x="245" y="10" width="85" height="28" rx="3" className="fill-card stroke-accent" />
          <text x="287" y="23" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">COMMIT (v2)</text>
          <text x="287" y="32" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">200 OK &middot; Broadcast</text>

          {/* Node 3B: Conflict & Jitter */}
          <rect x="245" y="55" width="85" height="32" rx="3" className="fill-card stroke-border-strong" strokeDasharray="3 2" />
          <text x="287" y="69" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">409 STALE_UPDATE</text>
          <text x="287" y="79" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">Jitter (50-200ms)</text>

          {/* Connectors */}
          <line x1="95" y1="36" x2="123" y2="36" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="215" y1="28" x2="243" y2="24" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="215" y1="42" x2="243" y2="65" className="stroke-border-strong" strokeDasharray="2 2" markerEnd={`url(#${markerId})`} />
          <path d="M 287 87 L 287 110 L 52 110 L 52 54" className="stroke-border-strong anim-flow" fill="none" strokeDasharray="3 3" markerEnd={`url(#${markerId})`} />
          <text x="170" y="105" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-faint">AUTO-RECONCILIATION LOOP</text>
        </g>
      );
    }

    if (featureId === "cloud-architecture" || idx === 1) {
      return (
        <g>
          {/* Edge Perimeter */}
          <rect x="10" y="35" width="75" height="42" rx="3" className="fill-card stroke-border-strong" strokeDasharray="2 2" />
          <text x="47" y="52" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">EDGE INGRESS</text>
          <text x="47" y="62" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">CloudFront + ALB</text>
          <text x="47" y="71" textAnchor="middle" className="font-mono text-[6px] fill-accent">SigV4 + SSL</text>

          {/* VPC App Subnets */}
          <rect x="115" y="20" width="105" height="68" rx="3" className="fill-card stroke-accent" />
          <text x="167" y="34" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">VPC PRIVATE SUBNETS</text>
          <text x="167" y="47" textAnchor="middle" className="font-mono text-[7px] fill-current">ECS Fargate Cluster</text>
          <text x="167" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Multi-AZ (Task 1 &amp; 2)</text>
          <text x="167" y="74" textAnchor="middle" className="font-mono text-[6px] fill-accent">Fastify Monolith :3000</text>

          {/* Isolated Data Tier */}
          <rect x="250" y="15" width="80" height="34" rx="3" className="fill-card stroke-border-strong" />
          <text x="290" y="29" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">RDS POSTGRES 16</text>
          <text x="290" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Multi-AZ Standby</text>

          <rect x="250" y="60" width="80" height="34" rx="3" className="fill-card stroke-border-strong" strokeDasharray="2 2" />
          <text x="290" y="74" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">DYNAMODB</text>
          <text x="290" y="85" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">WS Connection TTL</text>

          {/* Arrows */}
          <line x1="85" y1="56" x2="113" y2="56" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="220" y1="42" x2="248" y2="32" className="stroke-accent" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="220" y1="62" x2="248" y2="72" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
          <text x="167" y="106" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">10.0.0.0/16 &middot; ZERO PUBLIC DATA ACCESS</text>
        </g>
      );
    }

    if (featureId === "fifo-workers" || idx === 2) {
      return (
        <g>
          {/* Fastify Route */}
          <rect x="10" y="30" width="80" height="36" rx="3" className="fill-card stroke-border-strong" />
          <text x="50" y="46" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">FASTIFY HTTP</text>
          <text x="50" y="57" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-medium">202 Accepted &lt;15ms</text>

          {/* SQS FIFO */}
          <rect x="115" y="30" width="95" height="36" rx="3" className="fill-card stroke-accent" />
          <text x="162" y="46" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">SQS FIFO QUEUE</text>
          <text x="162" y="57" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">focus-completion.fifo</text>

          {/* Worker Pool */}
          <rect x="240" y="15" width="90" height="32" rx="3" className="fill-card stroke-border-strong" />
          <text x="285" y="29" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">WORKER POOL</text>
          <text x="285" y="39" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">20s Long Polling</text>

          {/* DLQ */}
          <rect x="240" y="65" width="90" height="32" rx="3" className="fill-card stroke-border-strong" strokeDasharray="3 2" />
          <text x="285" y="79" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">DEAD-LETTER (DLQ)</text>
          <text x="285" y="89" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-faint">Fail &gt; 3 &middot; 14d Retain</text>

          {/* Connectors */}
          <line x1="90" y1="48" x2="113" y2="48" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="210" y1="40" x2="238" y2="31" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="210" y1="56" x2="238" y2="76" className="stroke-border-strong" strokeDasharray="2 2" markerEnd={`url(#${markerId})`} />
          <text x="165" y="112" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">GUARANTEED ORDERING + AT-LEAST-ONCE DLQ</text>
        </g>
      );
    }

    // Default floework: dag-intelligence
    return (
      <g>
        {/* Graph Input */}
        <circle cx="35" cy="35" r="14" className="fill-card stroke-border-strong" />
        <text x="35" y="38" textAnchor="middle" className="font-mono text-[8px] fill-current">TaskA</text>
        
        <circle cx="85" cy="35" r="14" className="fill-card stroke-accent" />
        <text x="85" y="38" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">TaskB</text>

        <line x1="49" y1="35" x2="69" y2="35" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

        {/* 3-Color Engine */}
        <rect x="125" y="15" width="105" height="58" rx="3" className="fill-card stroke-accent" />
        <text x="177" y="30" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">3-COLOR DFS ENGINE</text>
        <text x="177" y="44" textAnchor="middle" className="font-mono text-[6.5px] fill-current">VISITING &rarr; Back Edge?</text>
        <text x="177" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Detects Cycles (A&rarr;B&rarr;A)</text>

        {/* Verdicts */}
        <rect x="250" y="15" width="80" height="26" rx="3" className="fill-card stroke-accent" />
        <text x="290" y="31" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">ACYCLIC // OK</text>

        <rect x="250" y="50" width="80" height="26" rx="3" className="fill-card stroke-border-strong" strokeDasharray="2 2" />
        <text x="290" y="66" textAnchor="middle" className="font-mono text-[7px] fill-current">CYCLE &rarr; 400 ERR</text>

        <line x1="99" y1="35" x2="123" y2="35" className="stroke-accent" markerEnd={`url(#${markerId}-accent)`} />
        <line x1="230" y1="30" x2="248" y2="28" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
        <line x1="230" y1="52" x2="248" y2="60" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
        
        <text x="170" y="102" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">TOPOLOGICAL CRITICAL PATH + BEDROCK NARRATIVE</text>
      </g>
    );
  }

  // ── AVARA DIAGRAMS ──────────────────────────────────────────
  if (projectId === "avara") {
    if (featureId === "problem" || idx === 0) {
      return (
        <g>
          {/* Agent Action */}
          <rect x="15" y="25" width="85" height="35" rx="3" className="fill-card stroke-border-strong" />
          <text x="57" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">AUTONOMOUS AGENT</text>
          <text x="57" y="51" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Machine-Speed Tools</text>

          {/* Legacy Gap */}
          <rect x="125" y="20" width="95" height="45" rx="3" className="fill-card stroke-border-strong" strokeDasharray="3 2" />
          <text x="172" y="37" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">LEGACY PERIMETER</text>
          <text x="172" y="48" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">WAF / Static RBAC</text>
          <text x="172" y="58" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">Bypassed by Intent Drift</text>

          {/* Uncontrolled Impact */}
          <rect x="245" y="25" width="85" height="35" rx="3" className="fill-card stroke-accent" />
          <text x="287" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">UNCHECKED ACCESS</text>
          <text x="287" y="51" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Zero-Click Exploit Risk</text>

          <line x1="100" y1="42" x2="123" y2="42" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
          <line x1="220" y1="42" x2="243" y2="42" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="100" textAnchor="middle" className="font-mono text-[7.5px] fill-ink-muted">THE RUNTIME GAP: CONTROLS MUST INTERCEPT AT EXECUTION</text>
        </g>
      );
    }

    if (featureId === "architecture" || idx === 1) {
      return (
        <g>
          {/* Agent */}
          <rect x="10" y="35" width="55" height="30" rx="3" className="fill-card stroke-border-strong" />
          <text x="37" y="52" textAnchor="middle" className="font-mono text-[7px] fill-current">AGENT</text>

          {/* 8-Guard Mesh */}
          <rect x="80" y="15" width="160" height="70" rx="3" className="fill-card stroke-accent" />
          <text x="160" y="30" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">AVARA CONTROL PLANE</text>
          
          <rect x="90" y="38" width="65" height="18" rx="2" className="fill-card stroke-border-strong" />
          <text x="122" y="50" textAnchor="middle" className="font-mono text-[6px] fill-current">Intent Validator</text>

          <rect x="165" y="38" width="65" height="18" rx="2" className="fill-card stroke-border-strong" />
          <text x="197" y="50" textAnchor="middle" className="font-mono text-[6px] fill-current">RAG Provenance</text>

          <rect x="90" y="60" width="65" height="18" rx="2" className="fill-card stroke-border-strong" />
          <text x="122" y="72" textAnchor="middle" className="font-mono text-[6px] fill-current">Tool MCP Guard</text>

          <rect x="165" y="60" width="65" height="18" rx="2" className="fill-card stroke-border-strong" />
          <text x="197" y="72" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">Circuit Breaker</text>

          {/* Safe Output */}
          <rect x="255" y="35" width="75" height="30" rx="3" className="fill-card stroke-accent" />
          <text x="292" y="52" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">AUDIT LEDGER</text>

          <line x1="65" y1="50" x2="78" y2="50" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="240" y1="50" x2="253" y2="50" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="160" y="108" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">SUB-5MS OVERHEAD &middot; DETERMINISTIC GATEWAY</text>
        </g>
      );
    }

    if (featureId === "circuitbreaker" || idx === 2) {
      return (
        <g>
          {/* Action */}
          <rect x="10" y="30" width="75" height="34" rx="3" className="fill-card stroke-border-strong" />
          <text x="47" y="46" textAnchor="middle" className="font-mono text-[7px] fill-current font-bold">DESTRUCTIVE OP</text>
          <text x="47" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">eg. Delete/Transfer</text>

          {/* Intercept & Halt */}
          <rect x="110" y="30" width="95" height="34" rx="3" className="fill-card stroke-accent" />
          <text x="157" y="46" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">HALT &amp; PENDING</text>
          <text x="157" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-current">403 PENDING_APPROVAL</text>

          {/* Human Webhook */}
          <rect x="235" y="15" width="95" height="30" rx="3" className="fill-card stroke-border-strong" />
          <text x="282" y="30" textAnchor="middle" className="font-mono text-[7px] fill-current font-bold">WEBHOOK NOTIFY</text>
          <text x="282" y="39" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Slack / Telegram / Mail</text>

          <rect x="235" y="55" width="95" height="30" rx="3" className="fill-card stroke-accent" />
          <text x="282" y="69" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">HUMAN DECISION</text>
          <text x="282" y="78" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Approve / Revoke Agent</text>

          <line x1="85" y1="47" x2="108" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="205" y1="40" x2="233" y2="30" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
          <line x1="205" y1="54" x2="233" y2="65" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="108" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">ZERO-CLICK RESISTANCE &middot; ASYNCHRONOUS ESCALATION</text>
        </g>
      );
    }

    // Default AVARA: integration
    return (
      <g>
        <rect x="15" y="30" width="80" height="34" rx="3" className="fill-card stroke-border-strong" />
        <text x="55" y="46" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">LANGCHAIN APP</text>
        <text x="55" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">initialize_agent()</text>

        <rect x="120" y="25" width="105" height="44" rx="3" className="fill-card stroke-accent" />
        <text x="172" y="42" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">AVARA CALLBACK</text>
        <text x="172" y="53" textAnchor="middle" className="font-mono text-[6.5px] fill-current">on_tool_start Hook</text>
        <text x="172" y="62" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">3-Line Drop-in Adapter</text>

        <rect x="250" y="30" width="80" height="34" rx="3" className="fill-card stroke-accent" />
        <text x="290" y="46" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">AVARA DAEMON</text>
        <text x="290" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Pass / Halt Signal</text>

        <line x1="95" y1="47" x2="118" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
        <line x1="225" y1="47" x2="248" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

        <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">NO ARCHITECTURAL REFACTORING NEEDED FOR CREWAI / AUTOGEN</text>
      </g>
    );
  }

  // ── KPHD DIAGRAMS ──────────────────────────────────────────
  if (projectId === "kphd") {
    if (featureId === "problem" || idx === 0) {
      return (
        <g>
          {/* Thread stalls */}
          <rect x="10" y="25" width="85" height="35" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="40" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">THREAD STARVES</text>
          <text x="52" y="50" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Runqueue Wait Spikes</text>

          {/* K-PHD Early Warning */}
          <rect x="120" y="18" width="105" height="48" rx="3" className="fill-card stroke-accent" />
          <text x="172" y="34" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">K-PHD PREDICTION</text>
          <text x="172" y="46" textAnchor="middle" className="font-mono text-[7px] fill-current">1.5s &ndash; 2.8s LEAD TIME</text>
          <text x="172" y="56" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">94% Precision &middot; Netlink Alert</text>

          {/* Late Watchdog */}
          <rect x="250" y="25" width="80" height="35" rx="3" className="fill-card stroke-border-strong" strokeDasharray="3 2" />
          <text x="290" y="40" textAnchor="middle" className="font-mono text-[7px] fill-current font-bold">OS WATCHDOG</text>
          <text x="290" y="50" textAnchor="middle" className="font-mono text-[6px] fill-ink-faint">Fires After Freeze (0s)</text>

          <line x1="95" y1="42" x2="118" y2="42" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="225" y1="42" x2="248" y2="42" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">PREEMPTS SYSTEM LOCKUPS BEFORE THE USER-VISIBLE FREEZE OCCURS</text>
        </g>
      );
    }

    if (featureId === "architecture" || idx === 1) {
      return (
        <g>
          {/* Ring 0 */}
          <rect x="10" y="20" width="95" height="52" rx="3" className="fill-card stroke-accent" />
          <text x="57" y="35" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">RING-0 KERNEL</text>
          <text x="57" y="46" textAnchor="middle" className="font-mono text-[6.5px] fill-current">kphd.ko Module</text>
          <text x="57" y="56" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">sched_wakeup + switch</text>
          <text x="57" y="65" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">1024-bucket hash</text>

          {/* IPC Bridge */}
          <rect x="130" y="25" width="85" height="42" rx="3" className="fill-card stroke-border-strong" />
          <text x="172" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">IPC BRIDGE</text>
          <text x="172" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Netlink GENL Multicast</text>
          <text x="172" y="61" textAnchor="middle" className="font-mono text-[6px] fill-ink-faint">/proc/kphd_stats</text>

          {/* User space */}
          <rect x="240" y="20" width="90" height="52" rx="3" className="fill-card stroke-border-strong" />
          <text x="285" y="35" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">RING-3 USERSPACE</text>
          <text x="285" y="46" textAnchor="middle" className="font-mono text-[6.5px] fill-current">kphd_daemon</text>
          <text x="285" y="56" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">EMA Smoothing &alpha;=0.3</text>
          <text x="285" y="65" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Alert Aggregator</text>

          <line x1="105" y1="46" x2="128" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="215" y1="46" x2="238" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">&lt;0.5% KERNEL OVERHEAD &middot; FLOATING POINT KEPT IN USERSPACE</text>
        </g>
      );
    }

    // Default KPHD: prediction (EMA)
    return (
      <g>
        {/* Latency Input */}
        <rect x="10" y="30" width="80" height="34" rx="3" className="fill-card stroke-border-strong" />
        <text x="50" y="46" textAnchor="middle" className="font-mono text-[7px] fill-current font-bold">SCHED LATENCY</text>
        <text x="50" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">L_t (nanoseconds)</text>

        {/* EMA Equation */}
        <rect x="110" y="20" width="115" height="54" rx="3" className="fill-card stroke-accent" />
        <text x="167" y="35" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">EMA RECURSION</text>
        <text x="167" y="48" textAnchor="middle" className="font-mono text-[6.5px] fill-current">&alpha;&middot;L_t + (1&minus;&alpha;)&middot;EMA_t-1</text>
        <text x="167" y="60" textAnchor="middle" className="font-mono text-[6px] fill-accent">&alpha; = 0.3 Smooth Factor</text>

        {/* Alert Levels */}
        <rect x="245" y="10" width="85" height="22" rx="2" className="fill-card stroke-border-strong" />
        <text x="287" y="24" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">EMA &lt; 2ms &middot; INFO</text>

        <rect x="245" y="36" width="85" height="22" rx="2" className="fill-card stroke-border-strong" strokeDasharray="2 2" />
        <text x="287" y="50" textAnchor="middle" className="font-mono text-[6.5px] fill-current font-medium">EMA 2-5ms &middot; WARNING</text>

        <rect x="245" y="62" width="85" height="22" rx="2" className="fill-card stroke-accent" />
        <text x="287" y="76" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">EMA &gt; 5ms x3 &middot; DANGER</text>

        <line x1="90" y1="47" x2="108" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
        <line x1="225" y1="36" x2="243" y2="24" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
        <line x1="225" y1="47" x2="243" y2="47" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
        <line x1="225" y1="58" x2="243" y2="70" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

        <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">3 CONSECUTIVE DANGER SPIKES = STARVATION DECLARED</text>
      </g>
    );
  }

  // ── STRATARL DIAGRAMS ──────────────────────────────────────────
  if (projectId === "stratarl") {
    if (featureId === "problem" || idx === 0) {
      return (
        <g>
          {/* Mixed batch */}
          <rect x="10" y="25" width="85" height="44" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="41" textAnchor="middle" className="font-mono text-[7px] fill-current font-bold">MIXED DOMAINS</text>
          <text x="52" y="51" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">GSM8K (High Reward)</text>
          <text x="52" y="60" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">StrategyQA (Lower Raw)</text>

          {/* Global Norm */}
          <rect x="120" y="25" width="100" height="44" rx="3" className="fill-card stroke-border-strong" strokeDasharray="3 2" />
          <text x="170" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">GLOBAL Z-NORM</text>
          <text x="170" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-medium">Cross-Stratum Bias</text>
          <text x="170" y="61" textAnchor="middle" className="font-mono text-[6px] fill-ink-faint">Hard domain gets -Adv</text>

          {/* Failure result */}
          <rect x="245" y="25" width="85" height="44" rx="3" className="fill-card stroke-accent" />
          <text x="287" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">DOMAIN COLLAPSE</text>
          <text x="287" y="52" textAnchor="middle" className="font-mono text-[6px] fill-current">StrategyQA: -5%</text>
          <text x="287" y="61" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Catastrophic Forgetting</text>

          <line x1="95" y1="47" x2="118" y2="47" className="stroke-border-strong" markerEnd={`url(#${markerId})`} />
          <line x1="220" y1="47" x2="243" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">WHY STANDARD GRPO FAILS ON MULTI-DOMAIN REASONING</text>
        </g>
      );
    }

    if (featureId === "san" || idx === 1) {
      return (
        <g>
          {/* Rollouts G=8 */}
          <rect x="10" y="25" width="75" height="38" rx="3" className="fill-card stroke-border-strong" />
          <text x="47" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">ROLLOUTS G=8</text>
          <text x="47" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Sampled Traces</text>

          {/* Stratified Engine */}
          <rect x="105" y="15" width="125" height="58" rx="3" className="fill-card stroke-accent" />
          <text x="167" y="31" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">STRATIFIED Z-NORM (SAN)</text>
          <text x="167" y="44" textAnchor="middle" className="font-mono text-[7px] fill-current">A_i = (R_i &minus; &mu;_d) / &sigma;_d</text>
          <text x="167" y="54" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Zero-Variance Center Only</text>
          <text x="167" y="63" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">Low-Variance Dampening</text>

          {/* Output Advantages */}
          <rect x="250" y="25" width="80" height="38" rx="3" className="fill-card stroke-accent" />
          <text x="290" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">NORMALIZED ADV</text>
          <text x="290" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Clipped &plusmn;5.0</text>

          <line x1="85" y1="44" x2="103" y2="44" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="230" y1="44" x2="248" y2="44" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">EVALUATES REASONING RELATIVE TO PEERS IN SAME DOMAIN</text>
        </g>
      );
    }

    if (featureId === "structural-rewards" || idx === 2) {
      return (
        <g>
          {/* Output text */}
          <rect x="10" y="25" width="80" height="42" rx="3" className="fill-card stroke-border-strong" />
          <text x="50" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">MODEL OUTPUT</text>
          <text x="50" y="52" textAnchor="middle" className="font-mono text-[6px] fill-accent">&lt;think&gt; ... &lt;/think&gt;</text>
          <text x="50" y="60" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">&lt;answer&gt; ... &lt;/answer&gt;</text>

          {/* Regex & SymPy */}
          <rect x="115" y="15" width="115" height="62" rx="3" className="fill-card stroke-accent" />
          <text x="172" y="31" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">ZERO-PRM VERIFIERS</text>
          <text x="172" y="44" textAnchor="middle" className="font-mono text-[6.5px] fill-current">R_struct: XML Tag Regex</text>
          <text x="172" y="54" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">&lt;decompose&gt; &lt;compute&gt;</text>
          <text x="172" y="66" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-medium">R_outcome: SymPy Numeric</text>

          {/* Composite Reward */}
          <rect x="250" y="25" width="80" height="42" rx="3" className="fill-card stroke-accent" />
          <text x="290" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">COMPOSITE REWARD</text>
          <text x="290" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-current">R &isin; [&minus;2.0, 2.0]</text>
          <text x="290" y="60" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">GDPO Annealed Noise</text>

          <line x1="90" y1="46" x2="113" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="230" y1="46" x2="248" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">NO EXPENSIVE REWARD MODELS &middot; STRICT FORMAL VERIFICATION</text>
        </g>
      );
    }

    // Default StrataRL: memory-opt (pi_ref = pi_old)
    return (
      <g>
        <rect x="10" y="30" width="75" height="36" rx="3" className="fill-card stroke-border-strong" />
        <text x="47" y="46" textAnchor="middle" className="font-mono text-[7px] fill-current font-bold">ROLLOUT STEP</text>
        <text x="47" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Capture Logprobs</text>

        <rect x="110" y="20" width="115" height="56" rx="3" className="fill-card stroke-accent" />
        <text x="167" y="36" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">&pi;_ref = &pi;_old DESIGN</text>
        <text x="167" y="49" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Eliminate Frozen Reference</text>
        <text x="167" y="59" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">&minus;1.8 GB VRAM SAVED</text>
        <text x="167" y="68" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Exact KL Divergence Alignment</text>

        <rect x="245" y="30" width="85" height="36" rx="3" className="fill-card stroke-accent" />
        <text x="287" y="46" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">G=8 ON CONSUMER GPU</text>
        <text x="287" y="56" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">P100 / T4 / M4 Unified</text>

        <line x1="85" y1="48" x2="108" y2="48" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
        <line x1="225" y1="48" x2="243" y2="48" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

        <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">DEDICATED FORWARD PASS PREVENTS KL-DRIFT DRIFT BUGS</text>
      </g>
    );
  }

  // ── UPRS DIAGRAMS ──────────────────────────────────────────
  if (projectId === "uprs") {
    if (featureId === "telemetry-cross-signal" || idx === 0) {
      return (
        <g>
          {/* Kernel Telemetry */}
          <rect x="10" y="25" width="85" height="42" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">KERNEL TELEMETRY</text>
          <text x="52" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">14 Metrics @ 100Hz</text>
          <text x="52" y="61" textAnchor="middle" className="font-mono text-[6px] fill-accent">task_info / /proc</text>

          {/* RingBuffer */}
          <rect x="115" y="25" width="95" height="42" rx="3" className="fill-card stroke-accent" />
          <text x="162" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">RING BUFFER (N=20)</text>
          <text x="162" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-current">2.0s Sliding Window</text>
          <text x="162" y="61" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">O(1) Circular Array</text>

          {/* Cross-Signals */}
          <rect x="230" y="15" width="100" height="58" rx="3" className="fill-card stroke-accent" />
          <text x="280" y="30" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">CROSS-SIGNALS</text>
          <text x="280" y="42" textAnchor="middle" className="font-mono text-[6px] fill-current">Livelock = IPC &times; CPU</text>
          <text x="280" y="53" textAnchor="middle" className="font-mono text-[6px] fill-current">Contention = Lock &times; Queue</text>
          <text x="280" y="64" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">46-Dim Feature Vector</text>

          <line x1="95" y1="46" x2="113" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="210" y1="46" x2="228" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">NOVEL CROSS-SIGNAL CORRELATION DISTINGUISHES BUSY FROM HANG</text>
        </g>
      );
    }

    if (featureId === "xgboost-inference" || idx === 1) {
      return (
        <g>
          <rect x="10" y="25" width="85" height="40" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">46-DIM VECTOR</text>
          <text x="52" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Aggregates + Trends</text>

          <rect x="115" y="20" width="105" height="48" rx="3" className="fill-card stroke-accent" />
          <text x="167" y="36" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">XGBOOST COREML</text>
          <text x="167" y="47" textAnchor="middle" className="font-mono text-[6.5px] fill-current">100 Trees &middot; Depth 6</text>
          <text x="167" y="57" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Logits [z_ok, z_pre, z_hang]</text>

          <rect x="240" y="25" width="90" height="40" rx="3" className="fill-card stroke-accent" />
          <text x="285" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">SOFTMAX PROB</text>
          <text x="285" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-current">P(Hang) &isin; [0, 1] &lt;5ms</text>

          <line x1="95" y1="45" x2="113" y2="45" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="220" y1="45" x2="238" y2="45" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">SMOTE CLASS BALANCING &middot; 92.5% PRE_HANG PRECISION (&lt;1% FP)</text>
        </g>
      );
    }

    if (featureId === "policy-safety-gate" || idx === 2) {
      return (
        <g>
          {/* Policy */}
          <rect x="10" y="20" width="95" height="52" rx="3" className="fill-card stroke-border-strong" />
          <text x="57" y="35" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">POLICY ENGINE</text>
          <text x="57" y="47" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">P &gt; 0.8 &rarr; IMMINENT</text>
          <text x="57" y="58" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">P &lt; 0.3 &rarr; NORMAL</text>
          <text x="57" y="66" textAnchor="middle" className="font-mono text-[6px] fill-ink-faint">Hysteresis Anti-Noise</text>

          {/* Safety Gate */}
          <rect x="125" y="15" width="105" height="60" rx="3" className="fill-card stroke-accent" />
          <text x="177" y="30" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">SAFETY GATE</text>
          <text x="177" y="42" textAnchor="middle" className="font-mono text-[6px] fill-current">Main Thread (TID 0)? REJECT</text>
          <text x="177" y="52" textAnchor="middle" className="font-mono text-[6px] fill-current">Kernel Lock Held? REJECT</text>
          <text x="177" y="62" textAnchor="middle" className="font-mono text-[6px] fill-current">Daemon (PID&lt;100)? REJECT</text>

          {/* Action Approval */}
          <rect x="250" y="25" width="80" height="40" rx="3" className="fill-card stroke-accent" />
          <text x="290" y="42" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">MITIGATION</text>
          <text x="290" y="53" textAnchor="middle" className="font-mono text-[6.5px] fill-current">APPROVED</text>

          <line x1="105" y1="46" x2="123" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="230" y1="46" x2="248" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">DETERMINISTIC VALIDATION PREVENTS ACCIDENTAL SYSTEM LOCKUPS</text>
        </g>
      );
    }

    if (featureId === "reversible-mitigation" || idx === 3) {
      return (
        <g>
          <rect x="10" y="20" width="85" height="42" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="36" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">PLAN &amp; SNAPSHOT</text>
          <text x="52" y="47" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Read Nice Priority</text>
          <text x="52" y="56" textAnchor="middle" className="font-mono text-[6px] fill-accent">PID + StartTime Tuple</text>

          <rect x="115" y="20" width="95" height="42" rx="3" className="fill-card stroke-accent" />
          <text x="162" y="36" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">APPLY (TOCTOU SAFE)</text>
          <text x="162" y="47" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Re-query StartTime</text>
          <text x="162" y="56" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">setpriority(nice + 10)</text>

          <rect x="235" y="20" width="95" height="42" rx="3" className="fill-card stroke-accent" />
          <text x="282" y="36" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">AUTO ROLLBACK</text>
          <text x="282" y="47" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Restore on NORMAL</text>
          <text x="282" y="56" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Zero User Data Loss</text>

          <line x1="95" y1="41" x2="113" y2="41" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="210" y1="41" x2="233" y2="41" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <path d="M 282 64 L 282 85 L 52 85 L 52 64" className="stroke-border-strong anim-flow" fill="none" strokeDasharray="3 3" markerEnd={`url(#${markerId})`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">PLAN-APPLY-COMMIT PROTOCOL PREVENTS RECYCLED PID ATTACKS</text>
        </g>
      );
    }

    if (featureId === "uprs-architecture" || idx === 4) {
      return (
        <g>
          {/* Layer 1: Data */}
          <rect x="6" y="14" width="74" height="52" rx="3" className="fill-card stroke-border-strong" />
          <text x="43" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">1. ACQUISITION</text>
          <text x="43" y="39" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Mach / /proc @ 100Hz</text>
          <text x="43" y="49" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">20-Slot RingBuffer</text>
          <text x="43" y="58" textAnchor="middle" className="font-mono text-[5.5px] fill-ink-faint">Zero-Alloc Path</text>

          {/* Layer 2: Intelligence */}
          <rect x="88" y="14" width="76" height="52" rx="3" className="fill-card stroke-accent" />
          <text x="126" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">2. INTELLIGENCE</text>
          <text x="126" y="39" textAnchor="middle" className="font-mono text-[6.5px] fill-current">46D Feature Vector</text>
          <text x="126" y="49" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">XGBoost CoreML</text>
          <text x="126" y="58" textAnchor="middle" className="font-mono text-[5.5px] fill-ink-muted">Softmax P(Hang) &lt;5ms</text>

          {/* Layer 3: Decision */}
          <rect x="172" y="14" width="76" height="52" rx="3" className="fill-card stroke-accent" />
          <text x="210" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">3. DECISION</text>
          <text x="210" y="39" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Hysteresis (0.8 / 0.3)</text>
          <text x="210" y="49" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">SafetyGate Filter</text>
          <text x="210" y="58" textAnchor="middle" className="font-mono text-[5.5px] fill-ink-muted">TID 0 / Lock Guard</text>

          {/* Layer 4: Action */}
          <rect x="256" y="14" width="78" height="52" rx="3" className="fill-card stroke-border-strong" />
          <text x="295" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">4. ACTION LAYER</text>
          <text x="295" y="39" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Plan-Apply-Commit</text>
          <text x="295" y="49" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">Nice +10 Shift</text>
          <text x="295" y="58" textAnchor="middle" className="font-mono text-[5.5px] fill-ink-faint">Auto-Rollback Bus</text>

          <line x1="80" y1="40" x2="86" y2="40" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="164" y1="40" x2="170" y2="40" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="248" y1="40" x2="254" y2="40" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <path d="M 295 68 L 295 86 L 43 86 L 43 68" className="stroke-border-strong anim-flow" fill="none" strokeDasharray="3 3" markerEnd={`url(#${markerId})`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">CLOSED-LOOP ARCHITECTURE: 4-TIER DAEMON WITH PREDICTIVE LEAD &amp; ZERO DATA LOSS</text>
        </g>
      );
    }

    // Default UPRS / idx === 5: uprs-novelty-points
    return (
      <g>
        {/* Prior Art Column */}
        <rect x="10" y="14" width="150" height="58" rx="3" className="fill-card stroke-border-strong" />
        <text x="85" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">PRIOR ART (REACTIVE WATCHDOG)</text>
        <text x="85" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">&bull; 4s&ndash;5s Delay (WindowServer Beachball)</text>
        <text x="85" y="50" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">&bull; Destructive OOM / Force-Quit Data Loss</text>
        <text x="85" y="60" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">&bull; Coarse System-Wide Aggregate Metrics</text>

        {/* UPRS Patent Column */}
        <rect x="175" y="14" width="155" height="58" rx="3" className="fill-card stroke-accent" />
        <text x="252" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">UPRS NOVELTY (PATENT-PENDING)</text>
        <text x="252" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-current">&bull; 0.5s&ndash;5.0s Pre-Hang Predictive Window</text>
        <text x="252" y="50" textAnchor="middle" className="font-mono text-[6.5px] fill-current">&bull; Cross-Signals: Contention = Lock &times; Queue</text>
        <text x="252" y="60" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">&bull; Non-Destructive Reversible Priority Shift</text>

        <line x1="160" y1="43" x2="173" y2="43" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

        <text x="170" y="93" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">VALIDATED: 92.5% PRECISION &middot; 82% FREEZE REDUCTION &middot; &lt;0.5% CPU OVERHEAD</text>
        <text x="170" y="105" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">INDIAN PATENT ACT 1970 &middot; TOCTOU IMMUNITY &middot; INTERVENTION-AWARE DRIFT GUARD</text>
      </g>
    );
  }

  // ── JOINTPINN DIAGRAMS ──────────────────────────────────────────
  if (projectId === "jointpinn") {
    if (featureId === "pde-transport" || idx === 0) {
      return (
        <g>
          {/* PDE Equation Banner */}
          <rect x="25" y="10" width="290" height="22" rx="2" className="fill-card stroke-border-strong" strokeDasharray="2 2" />
          <text x="170" y="24" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">&part;C/&part;t + u&middot;&nabla;C = &nabla;&middot;(K&nabla;C) + S</text>

          {/* Advection */}
          <rect x="15" y="42" width="90" height="34" rx="3" className="fill-card stroke-border-strong" />
          <text x="60" y="56" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">ADVECTION</text>
          <text x="60" y="66" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">ERA5 Wind (u10, v10)</text>

          {/* Diffusion */}
          <rect x="120" y="42" width="100" height="34" rx="3" className="fill-card stroke-border-strong" />
          <text x="170" y="56" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">DIFFUSION &nabla;&sup2;C</text>
          <text x="170" y="66" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Turbulent Mixing K-Net</text>

          {/* Loss graph */}
          <rect x="235" y="42" width="95" height="34" rx="3" className="fill-card stroke-accent" />
          <text x="282" y="56" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">PDE LOSS GRAPH</text>
          <text x="282" y="66" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-medium">100.0% Pass Rate</text>

          <line x1="105" y1="59" x2="118" y2="59" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="220" y1="59" x2="233" y2="59" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">CONSERVES PM2.5 MASS DURING SEVERE WINTER INVERSION LAYERS</text>
        </g>
      );
    }

    if (featureId === "k-net-diffusivity" || idx === 1) {
      return (
        <g>
          <rect x="10" y="25" width="85" height="42" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">ERA5 METEOROLOGY</text>
          <text x="52" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">u10, v10, t2m, blh</text>
          <text x="52" y="61" textAnchor="middle" className="font-mono text-[6px] fill-ink-faint">Boundary Layer Depth</text>

          <rect x="115" y="20" width="105" height="52" rx="3" className="fill-card stroke-accent" />
          <text x="167" y="36" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">DIFFUSIVITYNET (K-NET)</text>
          <text x="167" y="48" textAnchor="middle" className="font-mono text-[7px] fill-current">Secondary MLP Subnet</text>
          <text x="167" y="59" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">Coupled to Autograd Graph</text>

          <rect x="240" y="25" width="90" height="42" rx="3" className="fill-card stroke-accent" />
          <text x="285" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">DYNAMIC TENSOR</text>
          <text x="285" y="52" textAnchor="middle" className="font-mono text-[6.5px] fill-current">K(x, y, t) m&sup2;/s</text>
          <text x="285" y="61" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Inventory-Free</text>

          <line x1="95" y1="46" x2="113" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="220" y1="46" x2="238" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">DYNAMICALLY PARAMETERIZES TURBULENT MIXING WITHOUT STATIC INVENTORIES</text>
        </g>
      );
    }

    if (featureId === "deep-tanh-architecture" || idx === 2) {
      return (
        <g>
          <rect x="10" y="28" width="75" height="38" rx="3" className="fill-card stroke-border-strong" />
          <text x="47" y="44" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">18-DIM INPUT</text>
          <text x="47" y="54" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">x, y, t, Lags, GIS</text>

          <rect x="105" y="18" width="125" height="56" rx="3" className="fill-card stroke-accent" />
          <text x="167" y="34" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">AIRQUALITYNET (9 &times; 128)</text>
          <text x="167" y="47" textAnchor="middle" className="font-mono text-[7px] fill-current">Tanh Activation Function</text>
          <text x="167" y="58" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">f&apos;&apos;(x) &ne; 0 &middot; Smooth Laplacians</text>
          <text x="167" y="67" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Xavier Uniform Initialization</text>

          <rect x="250" y="28" width="80" height="38" rx="3" className="fill-card stroke-accent" />
          <text x="290" y="44" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">TEST R&sup2; = 0.926</text>
          <text x="290" y="54" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">RMSE 21.05 &mu;g/m&sup3;</text>

          <line x1="85" y1="47" x2="103" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="230" y1="47" x2="248" y2="47" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">RELU DIES AT 2ND DERIVATIVES &middot; TANH SUSTAINS HIGHER-ORDER PDE AUTOGRAD</text>
        </g>
      );
    }

    if (featureId === "ra-bpinn-nullspace" || idx === 3) {
      return (
        <g>
          <rect x="10" y="25" width="85" height="42" rx="3" className="fill-card stroke-border-strong" />
          <text x="52" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">INVERSE SOURCE</text>
          <text x="52" y="51" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">y = J_s S + &epsilon;</text>
          <text x="52" y="60" textAnchor="middle" className="font-mono text-[6px] fill-ink-faint">Sparse Sensors</text>

          <rect x="115" y="18" width="110" height="54" rx="3" className="fill-card stroke-accent" />
          <text x="170" y="33" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">Pe - Da PHASE BOUNDARY</text>
          <text x="170" y="45" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Degrees of Freedom (DFS)</text>
          <text x="170" y="56" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">Fisher Info in Prior</text>
          <text x="170" y="65" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Isolates Null-Space Modes</text>

          <rect x="245" y="25" width="85" height="42" rx="3" className="fill-card stroke-accent" />
          <text x="287" y="41" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">RA-BPINN UQ</text>
          <text x="287" y="51" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">93.8% Coverage</text>
          <text x="287" y="60" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Std B-PINN: 52.1%</text>

          <line x1="95" y1="46" x2="113" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="225" y1="46" x2="243" y2="46" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">PREVENTS ARTIFICIAL AI HALLUCINATION IN UNOBSERVABLE ATMOSPHERIC REGIONS</text>
        </g>
      );
    }

    if (featureId === "jointpinn-architecture" || idx === 4) {
      return (
        <g>
          {/* Inputs Box */}
          <rect x="6" y="18" width="76" height="54" rx="3" className="fill-card stroke-border-strong" />
          <text x="44" y="32" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">18-DIM INPUTS</text>
          <text x="44" y="43" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">(x, y, t) Spatio-Temporal</text>
          <text x="44" y="53" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">ERA5 Reanalysis</text>
          <text x="44" y="63" textAnchor="middle" className="font-mono text-[5.5px] fill-ink-faint">AR Lags (1h, 6h, 24h)</text>

          {/* Primary Net */}
          <rect x="94" y="8" width="114" height="34" rx="3" className="fill-card stroke-accent" />
          <text x="151" y="21" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">AIRQUALITYNET (9 &times; 128)</text>
          <text x="151" y="32" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Tanh Activation &middot; C(x,y,t)</text>

          {/* Diffusivity Net */}
          <rect x="94" y="48" width="114" height="34" rx="3" className="fill-card stroke-accent" />
          <text x="151" y="61" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">DIFFUSIVITYNET (K-NET)</text>
          <text x="151" y="72" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Turbulent Tensor K(x,y,t)</text>

          {/* Coupled Loss */}
          <rect x="220" y="12" width="114" height="66" rx="3" className="fill-card stroke-border-strong" />
          <text x="277" y="27" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">PDE LOSS GRAPH</text>
          <text x="277" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">&part;C/&part;t + u&middot;&nabla;C = &nabla;&middot;(K&nabla;C) + S</text>
          <text x="277" y="52" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Autograd Differentiation</text>
          <text x="277" y="64" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">100% Mass Conserved</text>

          <line x1="82" y1="36" x2="92" y2="25" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="82" y1="52" x2="92" y2="65" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="208" y1="25" x2="218" y2="36" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
          <line x1="208" y1="65" x2="218" y2="52" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />

          <text x="170" y="105" textAnchor="middle" className="font-mono text-[7px] fill-ink-muted">DUAL-NETWORK CONVERGENCE: AIRQUALITYNET &amp; K-NET IN UNIFIED AUTOGRAD GRAPH</text>
        </g>
      );
    }

    // Default JointPINN / idx === 5: jointpinn-novelty-points
    return (
      <g>
        {/* Card 1 */}
        <rect x="6" y="14" width="102" height="60" rx="3" className="fill-card stroke-accent" />
        <text x="57" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">1. DYNAMIC K-NET</text>
        <text x="57" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Learned Dispersion</text>
        <text x="57" y="51" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">Inventory-Free Source</text>
        <text x="57" y="62" textAnchor="middle" className="font-mono text-[6px] fill-accent font-medium">Replaces Static K</text>

        {/* Card 2 */}
        <rect x="118" y="14" width="104" height="60" rx="3" className="fill-card stroke-accent" />
        <text x="170" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-accent font-bold">2. RA-BPINN PRIOR</text>
        <text x="170" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-current">Fisher Info Matrix</text>
        <text x="170" y="51" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">DFS Null-Space Guard</text>
        <text x="170" y="62" textAnchor="middle" className="font-mono text-[6px] fill-accent font-bold">52.1% &rarr; 93.8% UQ</text>

        {/* Card 3 */}
        <rect x="232" y="14" width="102" height="60" rx="3" className="fill-card stroke-border-strong" />
        <text x="283" y="28" textAnchor="middle" className="font-mono text-[7.5px] fill-current font-bold">3. 7-YR BENCHMARK</text>
        <text x="283" y="40" textAnchor="middle" className="font-mono text-[6.5px] fill-accent font-bold">Test R&sup2; = 0.926</text>
        <text x="283" y="51" textAnchor="middle" className="font-mono text-[6px] fill-current">RMSE 21.05 &mu;g/m&sup3;</text>
        <text x="283" y="62" textAnchor="middle" className="font-mono text-[6px] fill-ink-muted">p &lt; 1e-10 vs 19 MLs</text>

        <text x="170" y="93" textAnchor="middle" className="font-mono text-[7px] fill-accent font-bold">NOVELTY: ELIMINATES SPECTRAL BIAS &amp; ENFORCES CONTINUOUS HIGHER-ORDER PDEs</text>
        <text x="170" y="105" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">223K HOURLY SAMPLES &middot; 100.0% MASS CONSERVATION &middot; INVERSE NULL-SPACE QUANTIFIED</text>
      </g>
    );
  }

  // Fallback generic schematic
  return (
    <g>
      <rect x="20" y="35" width="80" height="35" rx="3" className="fill-card stroke-border-strong" />
      <text x="60" y="55" textAnchor="middle" className="font-mono text-[8px] fill-current">INPUT NODE</text>
      
      <rect x="130" y="25" width="80" height="55" rx="3" className="fill-card stroke-accent" />
      <text x="170" y="48" textAnchor="middle" className="font-mono text-[8px] fill-accent font-bold">KERNEL ENGINE</text>
      <text x="170" y="60" textAnchor="middle" className="font-mono text-[6.5px] fill-ink-muted">Telemetry Gate</text>

      <rect x="240" y="35" width="80" height="35" rx="3" className="fill-card stroke-border-strong" />
      <text x="280" y="55" textAnchor="middle" className="font-mono text-[8px] fill-current">OUTPUT STATE</text>

      <line x1="100" y1="52" x2="128" y2="52" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
      <line x1="210" y1="52" x2="238" y2="52" className="stroke-accent anim-flow" markerEnd={`url(#${markerId}-accent)`} />
    </g>
  );
}

