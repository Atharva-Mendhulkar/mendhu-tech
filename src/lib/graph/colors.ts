// lib/graph/colors.ts

const colorCache = new Map<string, string>();
const alphaCache = new Map<string, string>();

/**
 * Computes a deterministic color from a string (tag).
 */
export function computeTagColor(tag: string): string {
  const key = tag.replace('#', '').toLowerCase();
  if (colorCache.has(key)) return colorCache.get(key)!;

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const color = `hsl(${h}, 75%, 55%)`;
  colorCache.set(key, color);
  return color;
}

/**
 * Converts a hex or hsl color to one with transparency.
 */
export function computeAlpha(color: string, alpha: string): string {
  const key = `${color}${alpha}`;
  if (alphaCache.has(key)) return alphaCache.get(key)!;

  let result = color;
  if (color.startsWith('hsl')) {
    result = color.replace('hsl', 'hsla').replace(')', `, 0.${alpha})`);
  } else if (color.startsWith('#')) {
    result = color + alpha;
  }
  
  alphaCache.set(key, result);
  return result;
}

/**
 * Cached wrappers for performance in render loops.
 */
export function cachedTagColor(tag: string): string {
  return computeTagColor(tag);
}

export function cachedAlpha(color: string, alpha: string): string {
  return computeAlpha(color, alpha);
}
