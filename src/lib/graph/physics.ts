// lib/graph/physics.ts
import { SimNode } from './quadtree';

export interface SimLink {
  source: SimNode;
  target: SimNode;
  isTag?: boolean;
}

export interface PhysicsParams {
  repelForce: number;
  linkDistance: number;
  linkForce: number;
  centerForce: number;
  damping: number;
}

export function runPhysicsStep(
  nodes: SimNode[],
  links: SimLink[],
  cx: number,
  cy: number,
  params: PhysicsParams,
  applyRepulsionFn: (body: SimNode) => void
) {
  // 1. Center force
  for (const n of nodes) {
    n.vx += (cx - n.x) * params.centerForce * (n.isTag ? 4 : 1);
    n.vy += (cy - n.y) * params.centerForce * (n.isTag ? 4 : 1);
    
    // 2. Repulsion (via Quadtree function passed in)
    applyRepulsionFn(n);
  }

  // 3. Links
  for (const l of links) {
    const dx = l.target.x - l.source.x;
    const dy = l.target.y - l.source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - params.linkDistance) * params.linkForce;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    
    l.source.vx += fx;
    l.source.vy += fy;
    l.target.vx -= fx;
    l.target.vy -= fy;
  }

  // 4. Update positions
  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    n.vx *= params.damping;
    n.vy *= params.damping;
  }
}

export async function warmupAsync(
  nodes: SimNode[],
  links: SimLink[],
  cx: number,
  cy: number,
  onDone: () => void,
  applyRepulsionFn: (nodes: SimNode[]) => (body: SimNode) => void
) {
  const TOTAL = 120, CHUNK = 20;
  let iter = 0;

  const params: PhysicsParams = {
    repelForce: 12000,
    linkDistance: 280,
    linkForce: 0.02,
    centerForce: 0.003,
    damping: 0.82
  };

  const step = () => {
    const end = Math.min(iter + CHUNK, TOTAL);
    
    // Rebuild quadtree for this chunk
    const currentRepulsion = applyRepulsionFn(nodes);

    for (; iter < end; iter++) {
      runPhysicsStep(nodes, links, cx, cy, params, currentRepulsion);
    }
    
    if (iter < TOTAL) {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(step as any, { timeout: 100 });
      } else {
        setTimeout(step, 0);
      }
    } else {
      onDone();
    }
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(step as any, { timeout: 100 });
  } else {
    setTimeout(step, 0);
  }
}
