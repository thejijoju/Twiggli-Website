/** Brush-stroke stars for Doodled.astro, generated at build time.
 *
 *  Each stroke is a filled shape rather than a line: it starts with a little
 *  press, keeps an even body, eases off towards the end and bows slightly,
 *  with a small irregular wobble in its width — the way a loaded brush
 *  moves. The rough, dry edge comes from a filter in the component. All in a
 *  100 × 100 box. */
type Point = [number, number];

function stroke([x0, y0]: Point, [x1, y1]: Point, w: number, { bow = 0, start = 0.78, end = 0.62, seed = 1 } = {}): string {
  const N = 18;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const ease = (a: number, b: number, t: number) => {
    const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return k * k * (3 - 2 * k);
  };
  const left: Point[] = [], right: Point[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const b = bow * Math.sin(Math.PI * t);
    const px = x0 + dx * t + nx * b, py = y0 + dy * t + ny * b;
    let width = (start + (1 - start) * ease(0, 0.2, t)) * (end + (1 - end) * (1 - ease(0.72, 1, t)));
    width *= 1 + 0.05 * Math.sin(t * 9 + seed) + 0.03 * Math.sin(t * 21 + seed * 3);
    const half = (w * width) / 2;
    left.push([px + nx * half, py + ny * half]);
    right.push([px - nx * half, py - ny * half]);
  }
  const f = (p: Point) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  // Blunt ends, a touch past the line, as a brush leaves them.
  const tip: Point = [x1 + ux * w * 0.18, y1 + uy * w * 0.18];
  const heel: Point = [x0 - ux * w * 0.22, y0 - uy * w * 0.22];
  return `M${f(left[0])}${left.slice(1).map((p) => `L${f(p)}`).join('')}L${f(tip)}` +
    `${right.reverse().map((p) => `L${f(p)}`).join('')}L${f(heel)}Z`;
}

/** The same stroke as its centre line: a quadratic curve through the bowed
 *  midpoint, for drawing the star in with a dash before the brush shape
 *  fades in over it (HeroSparkles.astro). Returns the path and its width. */
function line([x0, y0]: Point, [x1, y1]: Point, w: number, { bow = 0 } = {}): { d: string; w: number } {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  // A quadratic passes through half its control point's offset at t = 0.5.
  const cx = (x0 + x1) / 2 + nx * bow * 2, cy = (y0 + y1) / 2 + ny * bow * 2;
  return { d: `M${x0} ${y0}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1} ${y1}`, w: +(w * 0.78).toFixed(1) };
}

export const brushStars = {
  /** Eight rays, one of them running long — the lead star. */
  burst: [
    stroke([50, 12], [53, 83], 12.0, { bow: 1.4, seed: 1 }),
    stroke([12, 50], [89, 46], 12.0, { bow: -1.8, seed: 2 }),
    stroke([24, 21], [81, 76], 11.2, { bow: 1.6, seed: 3 }),
    stroke([81, 19], [5, 97], 11.2, { bow: -1.2, end: 0.4, seed: 4 }),
  ],
  /** Six rays. */
  twinkle: [
    stroke([50, 14], [51, 86], 13.6, { bow: -1.3, seed: 5 }),
    stroke([19, 31], [82, 69], 12.8, { bow: 1.6, seed: 6 }),
    stroke([81, 29], [20, 70], 12.8, { bow: -1.6, seed: 7 }),
  ],
  /** Two strokes, for the smallest. */
  cross: [
    stroke([50, 18], [51, 82], 14.4, { bow: 1.6, seed: 8 }),
    stroke([18, 51], [82, 48], 14.4, { bow: -1.6, seed: 9 }),
  ],
};
export type BrushStar = keyof typeof brushStars;

/** Centre lines of brushStars, stroke for stroke and in the same order. */
export const brushLines: Record<BrushStar, { d: string; w: number }[]> = {
  burst: [
    line([50, 12], [53, 83], 12.0, { bow: 1.4 }),
    line([12, 50], [89, 46], 12.0, { bow: -1.8 }),
    line([24, 21], [81, 76], 11.2, { bow: 1.6 }),
    line([81, 19], [5, 97], 11.2, { bow: -1.2 }),
  ],
  twinkle: [
    line([50, 14], [51, 86], 13.6, { bow: -1.3 }),
    line([19, 31], [82, 69], 12.8, { bow: 1.6 }),
    line([81, 29], [20, 70], 12.8, { bow: -1.6 }),
  ],
  cross: [
    line([50, 18], [51, 82], 14.4, { bow: 1.6 }),
    line([18, 51], [82, 48], 14.4, { bow: -1.6 }),
  ],
};

let count = 0;
/** A fresh id per use, since each star carries its own filter and gradient. */
export const brushId = () => `brush-${++count}`;
