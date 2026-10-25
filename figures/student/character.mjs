// A chibi KMITL student in uniform, built from kit solids. Pure and import-free so the
// page can inline it and rebuild the pose every frame: makeCharacter(k, G, P, ground).

export function makeCharacter(k, G, P, ground) {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const turn = (v, axis, angle) => {
    const c = Math.cos(angle), s = Math.sin(angle);
    const [x, y, z] = axis;
    const d = x * v[0] + y * v[1] + z * v[2];
    return [
      v[0] * c + (y * v[2] - z * v[1]) * s + x * d * (1 - c),
      v[1] * c + (z * v[0] - x * v[2]) * s + y * d * (1 - c),
      v[2] * c + (x * v[1] - y * v[0]) * s + z * d * (1 - c),
    ];
  };
  const X = [1, 0, 0], Y = [0, 1, 0];
  const depth = (p) => k.depthOf(p, P);

  // rounded square cross-section in a frame's (u, v) plane
  const section = (w, d, r = 1.4, steps = 4) => k.ringOf({ x: -w / 2, y: -d / 2, w, d, r }, steps);
  // rest frame of a limb hanging straight down: a = -z, u = x, v = -y (u × v = a)
  const limbFrame = (o, turns) => {
    let a = [0, 0, -1], u = [1, 0, 0], v = [0, -1, 0];
    for (const [axis, angle] of turns) { a = turn(a, axis, angle); u = turn(u, axis, angle); v = turn(v, axis, angle); }
    return { o, a, u, v };
  };
  const at = (F, s, x = 0, y = 0) => add(add(F.o, mul(F.a, s)), add(mul(F.u, x), mul(F.v, y)));

  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const wrap = (cls, svg) => `<g class="${cls}">${svg}</g>`;

  // torso and head outlines (character space, z from the turntable top)
  const TORSO = { x: -13, y: -8, w: 26, d: 16, r: 3.5 };
  const HEAD = { x: -15, y: -13.5, w: 30, d: 27, r: 7 };
  const FRONT = 8;
  const FACE = 13.5;

  // a band round a box, seen from outside: the slab's visible sides with no top, so it can
  // be drawn over the body it wraps without its lid covering that body
  function band(plan, z, h, steps) {
    const ring = k.ringOf(plan, steps);
    const paths = k.extrude(ring, z, h, P);
    const [vx, vy] = k.towardViewer(P);
    const n = ring.length;
    const cx = ring.reduce((sum, p) => sum + p[0], 0) / n, cy = ring.reduce((sum, p) => sum + p[1], 0) / n;
    const facing = ring.map(([ax, ay], i) => {
      const [bx, by] = ring[(i + 1) % n];
      let nx = by - ay, ny = ax - bx;
      if (nx * ((ax + bx) / 2 - cx) + ny * ((ay + by) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      return nx * vx + ny * vy > 1e-9;
    });
    let start = facing.findIndex((f, i) => f && !facing[(i - 1 + n) % n]);
    if (start < 0) start = 0;
    const run = [];
    for (let i = 0; i < n && facing[(start + i) % n]; i++) run.push((start + i) % n);
    run.push((run[run.length - 1] + 1) % n);
    const top = run.map((i) => k.iso([ring[i][0], ring[i][1], z + h], P));
    const bottom = run.map((i) => k.iso([ring[i][0], ring[i][1], z], P)).reverse();
    const fill = [...top, ...bottom].map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + "Z";
    return { ...paths, fill, outline: fill, top: "", crease: "", bevel: "" };
  }

  function shoe(end, up) {
    const plan = { x: end[0] - 4.8, y: end[1] - 5.6, w: 9.6, d: 16, r: 4 };
    const z = end[2] - 5;
    const out = [];
    out.push(wrap("m-sole", S(k.slabOf(plan, z, 1.6, P, 6), { tone: "hi" })));
    const upper = k.insetPlan(plan, 0.5);
    out.push(wrap("m-black", S(k.slabOf(upper, z + 1.6, 3.9, P, 6, 0.5), { tone: "hi", inner: L(k.sideSeam(upper, z + 3.2, P, 6), { tone: "faint" }) })));
    const lace = [0, 1, 2].map((i) => k.iso([end[0], end[1] + 4.4 + i * 1.8, z + 5.5], P));
    out.push(wrap("m-black", L(k.lineOnTop([end[0] - 2, end[1] + 4], [end[0] + 2, end[1] + 4], z + 5.5, P), { tone: "mid" }) + D(lace, { size: 0.45, tone: "hi" })));
    return out.join("");
  }

  function leg(side, swing) {
    const hip = [side * 6, 0, ground + 33];
    const F = limbFrame(hip, [[X, swing]]);
    const LEN = 28;
    const end = at(F, LEN);
    const body = G.prismOf(F, section(10.4, 10, 2.2), -2, LEN, P);
    const crease = k.segment(at(F, 0.5, side * -0.5, -5), at(F, LEN, side * -0.5, -5), P);
    return shoe(end) + wrap("m-black", S(body, { tone: "hi", inner: L(crease, { tone: "faint" }) }));
  }

  function arm(side, pose) {
    const shoulder = [side * 17.6, 0, ground + pose.up + 64.5];
    const turns = pose.turns;
    const F1 = limbFrame(shoulder, turns.upper);
    const L1 = 12;
    const elbow = at(F1, L1);
    const F2 = limbFrame(elbow, turns.fore);
    const L2 = 11;
    const wrist = at(F2, L2);
    const hand = at(F2, L2 + 2.6);
    const parts = [];
    parts.push({ at: at(F1, 4), svg: wrap("m-skin", S(G.prismOf(F1, section(6.2, 6.2, 2, 3), 8, L1 + 0.6, P), { tone: "hi" })) });
    const sleeve = G.prismOf(F1, section(9.2, 9.2, 2.6, 4), -1.6, 10, P);
    const hemLine = [-1, 1].map((sx) => at(F1, 8.8, sx * 4.6, 0));
    parts.push({ at: at(F1, 3.2), bias: 2, svg: wrap("m-white", S(sleeve, { tone: "hi" })) });
    parts.push({ at: at(F1, 8.9), bias: 2.1, svg: wrap("m-white", S(G.prismOf(F1, section(9.9, 9.9, 2.8, 4), 7.8, 10.2, P), { tone: "hi" })) });
    parts.push({ at: elbow, svg: wrap("m-skin", S(G.sphereOf(elbow, 3.2, P, { steps: 32 }), { tone: "hi", crease: "none" })) });
    const fore = G.prismOf(F2, section(6, 6, 2, 3), 0, L2, P);
    parts.push({ at: at(F2, L2 / 2), svg: wrap("m-skin", S(fore, { tone: "hi" })) });
    if (side > 0) {
      const band = G.prismOf(F2, section(6.9, 6.9, 2.2, 3), 7.4, 9.2, P);
      parts.push({ at: at(F2, 8.3), bias: 0.5, svg: wrap("m-black", S(band, { tone: "hi" })) });
    }
    parts.push({ at: hand, bias: 0.3, svg: wrap("m-skin", S(G.sphereOf(hand, 3.7, P, { steps: 40 }), { tone: "hi", crease: "none" })) });
    void hemLine; void wrist;
    return parts.sort((a, b) => depth(a.at) + (a.bias || 0) - depth(b.at) - (b.bias || 0)).map((part) => part.svg).join("");
  }

  function pelvis() {
    const z = ground + 30.5;
    const plan = k.insetPlan(TORSO, 0.4);
    const fly = k.segment([0.6, FRONT - 0.4, z], [0.6, FRONT - 0.4, z + 7], P);
    return wrap("m-black", S(k.slabOf(plan, z, 7.5, P, 5), { tone: "hi", inner: L(fly, { tone: "faint" }) }));
  }

  function torso(up, accent) {
    const z0 = ground + 38 + up;
    const z1 = z0 + 28;
    const out = [];
    out.push(wrap("m-white", S(k.slabOf(TORSO, z0, 28, P, 6, 0.8), { tone: "hi" })));
    // shirt front, drawn in the plane of the front face: local x = world x, local y = -z
    const m = k.sideMatrix([0, FRONT], z0, P, "left");
    const pocket = "M-10 -18.5L-3.6 -18.5L-3.6 -12.2Q-3.6 -10.6 -5.2 -10.6L-8.4 -10.6Q-10 -10.6 -10 -12.2Z";
    out.push(`<g class="m-white" transform="${m}">`
      + `<path class="iso-line" data-tone="faint" d="M0 -2.4L0 -28"/>`
      + `<path class="iso-line" data-tone="lo" d="${pocket}"/>`
      + `<path class="iso-line" data-tone="faint" d="M-10 -16.8L-3.6 -16.8"/>`
      + `<rect class="pen" x="-5.6" y="-21.2" width="1.3" height="4.6" rx=".5"/>`
      + `<rect class="pen-clip" x="-5.25" y="-21.2" width=".55" height="3.4" rx=".2"/>`
      + `<g class="emblem" transform="translate(-7.6 -14.2)"><circle r="1.5"/><path d="M-0.8 0.5L0 -0.9L0.8 0.5Z"/></g>`
      + `<circle class="button" cx="0" cy="-5.4" r=".55"/>`
      + `</g>`);
    // collar band, neck and collar points
    out.push(wrap("m-skin", S(k.cylinder(0, 0, 3.6, z1 - 1, 4, P, 24), { tone: "hi" })));
    out.push(wrap("m-white", S(k.cylinder(0, 0.6, 5.6, z1 - 0.4, 2.8, P, 28), { tone: "hi" })));
    for (const side of [-1, 1]) {
      const ring = [[side * 0.6, FRONT + 0.2], [side * 6.6, FRONT - 0.6], [side * 5.6, 2.4], [side * 0.6, 4.6]];
      out.push(wrap("m-white", S(k.extrude(side < 0 ? ring.reverse() : ring, z1 - 0.6, 1.4, P), { tone: "hi" })));
    }
    // tie: blade in the plane of the shirt front (frame along +y, v = -z), then the knot
    const TF = { o: [0, FRONT, z0], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] };
    const blade = [[-1.6, -24.6], [1.6, -24.6], [2.7, -8.6], [0, -6.2], [-2.7, -8.6]];
    out.push(wrap("m-tie", S(G.prismOf(TF, blade, 0, 1.1, P), { tone: "hi" })));
    const clip = k.segment([-2.4, FRONT + 1.15, z0 + 14], [2.4, FRONT + 1.15, z0 + 14], P);
    out.push(L(clip, { tone: "mid" }));
    const knot = [[-2.2, -27.4], [2.2, -27.4], [1.5, -24], [-1.5, -24]];
    out.push(wrap("m-tie", S(G.prismOf(TF, knot, 0.2, 2, P), { tone: "hi" })));
    // belt, loops and buckle
    out.push(wrap("m-black", S(band(k.insetPlan(TORSO, -0.35), z0 - 1.2, 3.6, 6), { tone: "hi" })));
    for (const x of [-8.4, 7.6]) out.push(wrap("m-black", S(k.slabOf({ x, y: FRONT + 0.2, w: 0.9, d: 0.7, r: 0.2 }, z0 - 1.6, 4.4, P, 1), { tone: "hi" })));
    const buckle = { x: -3.6, y: FRONT + 0.25, w: 7.2, d: 1, r: 0.6 };
    out.push(S(k.slabOf(buckle, z0 - 0.9, 3, P, 3, 0.3), { tone: "hi", lit: true }));
    const bm = k.sideMatrix([0, FRONT + 1.25], z0 - 0.9, P, "left");
    out.push(`<g transform="${bm}"><rect class="iso-line" data-tone="mid" x="-2.6" y="-2.4" width="5.2" height="1.8" rx=".4"/><circle class="emblem-dot" cx="0" cy="-1.5" r=".55"/></g>`);
    void accent;
    return out.join("");
  }

  function head(up, blink) {
    const z0 = ground + 68 + up;
    const out = [];
    const ear = (side) => {
      const plan = { x: side > 0 ? 14.6 : -17.2, y: -3.4, w: 2.6, d: 6.4, r: 1.8 };
      return wrap("m-skin", S(k.slabOf(plan, z0 + 9, 8, P, 4), { tone: "hi" }));
    };
    // hair at the back and far side, then the far ear, all behind the head
    out.push(wrap("m-hair", S(k.slabOf({ x: -16.2, y: -15.4, w: 32.4, d: 3.4, r: 2 }, z0 + 7, 18, P, 4), { tone: "hi" })));
    out.push(ear(-1));
    out.push(wrap("m-skin", S(k.slabOf(HEAD, z0, 27, P, 8, 1), { tone: "hi" })));
    // the face, in the plane of the front of the head
    const m = k.sideMatrix([0, FACE], z0, P, "left");
    const eye = (x) => `<ellipse class="eye" cx="${x}" cy="-12" rx="2.1" ry="${(3.1 * (1 - blink) + 0.25).toFixed(2)}"/>`
      + (blink < 0.5 ? `<circle class="eye-hi" cx="${x + 0.7}" cy="-13.2" r=".75"/>` : "");
    out.push(`<g transform="${m}">`
      + `<ellipse class="blush" cx="-7" cy="-7.4" rx="1.9" ry="1"/><ellipse class="blush" cx="7" cy="-7.4" rx="1.9" ry="1"/>`
      + eye(-5.2) + eye(5.2)
      + `<path class="mouth" d="M-2 -6.4Q0 -4.2 2 -6.4Z"/>`
      + `</g>`);
    out.push(ear(1));
    // hair: side lock on the near side, fringe locks, the crown, a cowlick
    out.push(wrap("m-hair", S(k.slabOf({ x: 15, y: -15.4, w: 1.9, d: 17.6, r: 1 }, z0 + 16.4, 8.6, P, 3), { tone: "hi" })));
    const fringe = [[-15.2, 6.2, 20.2], [-9.4, 6.4, 17.6], [-3.4, 6.6, 19.6], [2.8, 6.4, 17.2], [8.8, 6.4, 20]];
    for (const [x, w, z] of fringe) {
      out.push(wrap("m-hair", S(k.slabOf({ x, y: FACE - 0.3, w, d: 2.6, r: 1.2 }, z0 + z, 25 - z + 0.01, P, 3), { tone: "hi" })));
    }
    out.push(wrap("m-hair", S(k.slabOf({ x: -16.1, y: -15.4, w: 32.2, d: 31.4, r: 9.5 }, z0 + 25, 5.6, P, 8, 1.2), { tone: "hi" })));
    out.push(wrap("m-hair", L(k.lineOnTop([-4.5, 15.9], [-4.5, -15.3], z0 + 30.6, P) + k.lineOnTop([3.5, 15.9], [3.5, -15.3], z0 + 30.6, P), { tone: "faint" })));
    return out.join("");
  }

  // pose: { swing, up, drop, blink, wave, waveSwing }
  function draw(pose) {
    const g = { ...pose };
    const legSwing = g.swing;
    const armSwing = -g.swing * 0.9;
    const near = {
      up: g.up,
      turns: {
        upper: [[X, armSwing * (1 - g.wave)], [Y, -g.wave * 1.75]],
        fore: [[X, armSwing * (1 - g.wave) + 0.12], [Y, -g.wave * (2.9 + g.waveSwing)]],
      },
    };
    const far = { up: g.up, turns: { upper: [[X, -armSwing], [Y, 0.06]], fore: [[X, -armSwing + 0.12], [Y, 0.06]] } };
    const shift = k.translateAlong(P, [0, 0, -g.drop]);
    return `<g transform="${shift}">`
      + leg(-1, legSwing)
      + arm(-1, far)
      + leg(1, -legSwing)
      + pelvis()
      + torso(g.up)
      + head(g.up, g.blink)
      + arm(1, near)
      + `</g>`;
  }

  return { draw };
}
