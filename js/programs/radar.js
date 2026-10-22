// Radar chart of the programme's PLOs, drawn as SVG. Each axis = credits taken so far in courses that the
// curriculum mapping ticks for that PLO; all axes share one scale (the largest axis at graduation), so the
// shape shows where the programme puts its weight. The dashed outline is the shape at graduation.
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; };

export function createRadar(host, plos, onHover) {
  const W = 380, H = 320, cx = W / 2, cy = H / 2 + 2, R = 100, n = plos.length;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'radar', role: 'img', 'aria-label': 'แผนภูมิเรดาร์ผลลัพธ์การเรียนรู้ระดับหลักสูตร (PLO)' }, host);
  const ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  for (const f of [0.25, 0.5, 0.75, 1]) el('polygon', { points: plos.map((_, i) => pt(i, R * f).join(',')).join(' '), class: 'grid' }, svg);
  const labels = [];
  plos.forEach((p, i) => {
    const [x, y] = pt(i, R); el('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'axis' }, svg);
    const [lx, ly] = pt(i, R + 22), c = Math.cos(ang(i));
    const g = el('g', { class: 'lab', tabindex: 0 }, svg);
    const anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
    el('text', { x: lx, y: ly - 3, 'text-anchor': anchor, class: 'n' }, g).textContent = `PLO ${p.n}`;
    el('text', { x: lx, y: ly + 10, 'text-anchor': anchor, class: 's' }, g).textContent = p.short;
    g.addEventListener('mouseenter', () => onHover?.(p)); g.addEventListener('focus', () => onHover?.(p));
    g.addEventListener('mouseleave', () => onHover?.(null)); g.addEventListener('blur', () => onHover?.(null));
    labels.push(g);
  });
  const target = el('polygon', { class: 'target' }, svg);
  const cur = el('polygon', { class: 'cur' }, svg);
  const dots = plos.map(() => el('circle', { r: 3, class: 'dot' }, svg));
  let shown = plos.map(() => 0), raf = 0;
  function set(values, goal) {
    const max = Math.max(1, ...goal);
    target.setAttribute('points', goal.map((v, i) => pt(i, (v / max) * R).join(',')).join(' '));
    const from = shown.slice(), to = values.map((v) => v / max), t0 = performance.now();
    cancelAnimationFrame(raf);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - p, 3);
      shown = from.map((f, i) => f + (to[i] - f) * e);
      cur.setAttribute('points', shown.map((v, i) => pt(i, v * R).join(',')).join(' '));
      shown.forEach((v, i) => { const [x, y] = pt(i, v * R); dots[i].setAttribute('cx', x); dots[i].setAttribute('cy', y); });
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  return { set };
}
