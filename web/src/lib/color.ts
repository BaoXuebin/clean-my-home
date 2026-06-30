// Colour helpers ported from the original dashboard (used by the canvas charts).

export function hexToRgb(h: string): { r: number; g: number; b: number } {
  h = (h || '#888').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex: string, a: number): string {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

/** Pick readable text colour (dark or light) for a given fill. */
export function textOn(hex: string): string {
  const c = hexToRgb(hex);
  const lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
  return lum > 0.62 ? '#1b1408' : '#fdf6ec';
}
