// lib/graph/quadtree.ts

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTag?: boolean;
  color: string;
}

export interface QBounds { x: number; y: number; w: number; h: number }

export interface QNode {
  bounds: QBounds;
  cx: number; cy: number;   // centre-of-mass
  mass: number;
  children: QNode[] | null; // null = leaf
  body: SimNode | null;     // non-null only for leaves with 1 body
}

const THETA = 0.9; // Barnes-Hut opening angle

export function buildQuadtree(nodes: SimNode[], bounds: QBounds): QNode {
  const root: QNode = { bounds, cx: 0, cy: 0, mass: 0, children: null, body: null };
  for (const n of nodes) insertQuad(root, n);
  computeMass(root);
  return root;
}

const MAX_DEPTH = 20;

function insertQuad(node: QNode, body: SimNode, depth: number = 0) {
  if (node.body === null && node.children === null) {
    node.body = body; return;
  }
  
  if (node.children === null) {
    const b = node.body!;
    // If they are at the exact same position and we are deep enough, 
    // just stop splitting to avoid infinite recursion.
    if (depth >= MAX_DEPTH || (Math.abs(b.x - body.x) < 0.01 && Math.abs(b.y - body.y) < 0.01)) {
      return; 
    }

    const { x, y, w, h } = node.bounds;
    const hw = w / 2, hh = h / 2;
    node.children = [
      { bounds: { x: x,      y: y,      w: hw, h: hh }, cx:0, cy:0, mass:0, children:null, body:null },
      { bounds: { x: x + hw, y: y,      w: hw, h: hh }, cx:0, cy:0, mass:0, children:null, body:null },
      { bounds: { x: x,      y: y + hh, w: hw, h: hh }, cx:0, cy:0, mass:0, children:null, body:null },
      { bounds: { x: x + hw, y: y + hh, w: hw, h: hh }, cx:0, cy:0, mass:0, children:null, body:null },
    ];
    
    node.body = null;
    insertQuad(node, b, depth); 
  }
  
  const mx = node.bounds.x + node.bounds.w / 2;
  const my = node.bounds.y + node.bounds.h / 2;
  const q = (body.x >= mx ? 1 : 0) + (body.y >= my ? 2 : 0);
  insertQuad(node.children![q], body, depth + 1);
}

function computeMass(node: QNode) {
  if (node.children === null) {
    if (node.body) { 
      node.cx = node.body.x; 
      node.cy = node.body.y; 
      node.mass = 1; 
    }
    return;
  }
  
  node.cx = 0; node.cy = 0; node.mass = 0;
  for (const c of node.children) {
    computeMass(c);
    node.mass += c.mass;
    node.cx += c.cx * c.mass;
    node.cy += c.cy * c.mass;
  }
  if (node.mass > 0) { 
    node.cx /= node.mass; 
    node.cy /= node.mass; 
  }
}

export function applyRepulsion(node: QNode, body: SimNode, repelForce: number) {
  if (node.mass === 0 || node.body === body) return;
  
  const dx = body.x - node.cx;
  const dy = body.y - node.cy;
  const d2 = dx * dx + dy * dy + 1e-6;
  const d  = Math.sqrt(d2);

  if (node.children === null || node.bounds.w / d < THETA) {
    const f = repelForce * node.mass / d2;
    body.vx += (dx / d) * f;
    body.vy += (dy / d) * f;
    return;
  }
  
  for (const c of node.children) {
    applyRepulsion(c, body, repelForce);
  }
}
