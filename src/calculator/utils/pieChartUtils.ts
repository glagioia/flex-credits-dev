/**
 * Shared pie chart logic for app (DOM) and PDF (react-pdf) components.
 */

export type Slice = {
  label: string;
  color: string;
  percentage: number;
};

export type SliceInfo = {
  d: Slice;
  fraction: number;
  angle: number;
  r: number;
  start: number;
  end: number;
  pathData: string;
  labelPos: { x: number; y: number };
  labelRadius: number;
  fontSize: number;
  largeArc: number;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Returns a label color (white or dark) for sufficient contrast on the given fill color. */
export function getLabelColorForSlice(hex: string): string {
  const m = hex.replace(/^#/, '').match(/.{2}/g);
  if (!m) return '#032D60';
  const [r, g, b] = m.map((x) => parseInt(x, 16) / 255);
  const luminance = 0.299 * r + 0.587 * g + 0.116 * b;
  return luminance < 0.5 ? '#FFFFFF' : '#032D60';
}

export function polar(cx: number, cy: number, r: number, angle: number) {
  const a = toRad(angle);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const minFactor = 0.75;
const maxFactor = 1.0;

/**
 * Computes slice geometry (paths, label positions) for pie chart rendering.
 * Shared by PieChart (app) and PieChartPdf.
 */
export function computePieSlices(
  data: Slice[],
  size: number
): { slices: SliceInfo[]; total: number; cx: number; cy: number; canvasSize: number; baseRadius: number } {
  const padding = Math.round(size * 0.15);
  const canvasSize = size + padding * 2;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const baseRadius = size / 2;

  const totalSum = data.reduce((acc, d) => acc + d.percentage, 0) || 1;
  let currentAngle = -90;

  const slices: SliceInfo[] = data.map((d) => {
    const fraction = d.percentage / totalSum;
    const rawAngle = fraction * 360;
    const angle = rawAngle >= 360 ? 359.999 : rawAngle;
    const r = baseRadius * (minFactor + fraction * (maxFactor - minFactor));
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle = start + rawAngle;

    const p1 = polar(cx, cy, r, start);
    const p2 = polar(cx, cy, r, end);
    const largeArc = angle > 180 ? 1 : 0;
    let pathData: string;
    if (angle >= 359.999) {
      const pMid = polar(cx, cy, r, start + 180);
      pathData = [`M ${cx} ${cy}`, `L ${p1.x} ${p1.y}`, `A ${r} ${r} 0 1 1 ${pMid.x} ${pMid.y}`, `A ${r} ${r} 0 1 1 ${p1.x} ${p1.y}`, `Z`].join(' ');
    } else if (angle <= 0.001) {
      pathData = `M ${cx} ${cy} Z`;
    } else {
      pathData = [`M ${cx} ${cy}`, `L ${p1.x} ${p1.y}`, `A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`, `Z`].join(' ');
    }

    const midAngle = start + angle / 2;
    const scale = Math.max(0.3, Math.min(1, Math.min(angle / 90, r / baseRadius)));
    const isSmallSlice = Math.round(d.percentage) < 15;
    const labelRadius = isSmallSlice
      ? r * 0.7
      : r * (0.38 + 0.18 * scale);
    const labelPos = polar(cx, cy, labelRadius, midAngle);
    const fontSize = Math.max(12, Math.round(size * (0.05 + 0.05 * scale)));

    return {
      d,
      fraction,
      angle,
      r,
      start,
      end,
      pathData,
      labelPos,
      labelRadius,
      fontSize,
      largeArc,
    };
  });

  return { slices, total: totalSum, cx, cy, canvasSize, baseRadius };
}
