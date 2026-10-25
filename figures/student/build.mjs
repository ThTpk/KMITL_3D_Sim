import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { makeCharacter } from "./character.mjs";

const SKILL = join(homedir(), ".claude", "skills", "anatomy");
const k = await import(pathToFileURL(join(SKILL, "kit", "iso-kit.mjs")).href);
const G = await import(pathToFileURL(join(SKILL, "kit", "lathe.mjs")).href);
const { kitScript } = await import(pathToFileURL(join(SKILL, "scripts", "inline-kit.mjs")).href);

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : process.argv.includes("--dark") ? "dark" : "light";

const WIDTH = 600;
const HEIGHT = 470;
const PLATE = { x: -50, y: -50, w: 100, d: 100, r: 10 };
const PLATE_H = 11;
const FOOT_H = 5;
const TABLE_R = 41;
const GROUND = 4;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, GROUND + 108], [34, 0, GROUND + 92], [-20, 0, GROUND + 70]],
  WIDTH,
  HEIGHT,
  { pad: 28, azimuth: 52 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const wrap = (cls, svg) => `<g class="${cls}">${svg}</g>`;
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 16))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  const seam = k.sideSeam(PLATE, -4, P, 8);
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge
  const strip = { x: -36, y: PLATE.y + PLATE.d - 8.4, w: 72, d: 5, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 2.5, 4, strip.y + 0.6, 0.6, [1.6, 3.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  // name plate on the right margin, the one engraved label
  const label = { x: PLATE.x + PLATE.w - 8.6, y: -24, w: 6, d: 30, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.1), 0.8, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4.4, label.y + label.d / 2], 0.8, P, "y"), "KMITL", { size: 3.6, tone: "mid", anchor: "middle" }));
  out.push(D([at([label.x + 3.2, label.y + 2.6, 0.8]), at([label.x + 3.2, label.y + label.d - 2.6, 0.8])], { size: 0.45 }));
  return out.join("");
}

function turntable() {
  const out = [];
  out.push(S(k.cylinder(0, 0, TABLE_R + 2, 0, 1.2, P, 72), { tone: "lo" }));
  out.push(S(k.cylinder(0, 0, TABLE_R, 1.2, GROUND - 1.2, P, 80, 0.8), { tone: "mid", inner: L(k.knurl(0, 0, TABLE_R, 1.4, GROUND - 0.2, 120, P, 0.3), { tone: "faint" }) }));
  const ticks = k.radialTicks(0, 0, TABLE_R - 1.2, 72, 6, GROUND, [1.2, 2.8], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(0, 0, TABLE_R - 1.2, GROUND, P, 96) + k.ring(0, 0, TABLE_R - 4, GROUND, P, 80), { tone: "faint" }));
  out.push(L(k.ring(0, 0, 3, GROUND, P, 24), { tone: "lo" }));
  return out.join("");
}

function book(plan, z, h, cover) {
  const out = [];
  const pages = { x: plan.x + 0.2, y: plan.y + 0.6, w: plan.w - 0.8, d: plan.d - 1.2, r: 0.6 };
  out.push(wrap(cover, S(k.slabOf(plan, z, 0.7, P, 3), { tone: "hi" })));
  const lines = [0.3, 0.55, 0.8].map((f) => k.sideSeam(pages, z + 0.7 + (h - 1.4) * f, P, 3)).join("");
  out.push(wrap("m-white", S(k.slabOf(pages, z + 0.7, h - 1.4, P, 3), { tone: "hi", inner: L(lines, { tone: "faint" }) })));
  out.push(wrap(cover, S(k.slabOf(plan, z + h - 0.7, 0.7, P, 3, 0.3), { tone: "hi" })));
  return out.join("");
}

function books() {
  const out = [];
  out.push(book({ x: 12.5, y: -27.5, w: 18, d: 13, r: 0.8 }, GROUND, 4.4, "m-book-a"));
  out.push(book({ x: 13.8, y: -26.4, w: 15, d: 10.8, r: 0.8 }, GROUND + 4.4, 3.4, "m-book-b"));
  out.push(book({ x: 13, y: -27, w: 16.6, d: 12, r: 0.8 }, GROUND + 7.8, 3.8, "m-book-c"));
  const top = GROUND + 7.8 + 3.8;
  const dir = [Math.cos(0.42), Math.sin(0.42), 0];
  const F = G.frameAlong([15.4, -24.6, top + 0.9], dir);
  const hex = Array.from({ length: 6 }, (_, i) => [0.9 * Math.cos((i / 6) * Math.PI * 2), 0.9 * Math.sin((i / 6) * Math.PI * 2)]);
  out.push(wrap("m-eraser", S(G.disc(-2.2, -0.8, 0.85, F, P), { tone: "hi" })));
  out.push(wrap("m-metal", S(G.disc(-0.9, 0.4, 0.95, F, P), { tone: "hi" })));
  out.push(wrap("m-pencil", S(G.prismOf(F, hex, 0.4, 11, P), { tone: "hi" })));
  out.push(wrap("m-wood", S(G.solidOf([[11, 0.9, 1], [13.2, 0.3, 1], [13.6, 0.2]], F, P), { tone: "hi" })));
  return out.join("");
}

const C = makeCharacter(k, G, P, GROUND);
const REST = { swing: 0, up: 0, drop: 0, blink: 0, wave: 0, waveSwing: 0 };

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A chibi KMITL student, built like a game character, standing on a character-select turntable: white short-sleeved shirt with a dark tie, a pocket with a pen and the orange university emblem, a black belt with a silver buckle, black trousers and black leather shoes. A stack of textbooks with a pencil sits behind him.",
  body: [
    plate(),
    turntable(),
    books(),
    `<path class="iso-halo" d="${k.haloOf({ x: -14, y: -9, w: 28, d: 22, r: 8 }, GROUND, 0.1, P)}" style="filter:blur(5px)"/>`,
    `<g data-part="student">${C.draw(REST)}</g>`,
  ],
});

const strip = (file) => readFileSync(file, "utf8").replace(/^import .*$/gm, "").replace(/^export /gm, "");
const latheSource = `const G = (() => {${strip(join(SKILL, "kit", "lathe.mjs"))}\nreturn { prismOf, sphereOf, frameAlong, disc, solidOf };})();`;
const characterSource = strip(join(HERE, "character.mjs"));

const live = `
${latheSource}
${characterSource}
const P = ${JSON.stringify(P)};
const kit = { towardViewer, depthOf, solidSvg, lineSvg, dotsSvg, slabOf, insetPlan, sideSeam, iso, lineOnTop, segment, ringOf, cylinder, extrude, sideMatrix, translateAlong };
const C = makeCharacter(kit, G, P, ${GROUND});
const stage = document.querySelector(".iso-stage");
const student = stage.querySelector('[data-part="student"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const TOUR = [["idle", 2.6], ["wave", 2.8], ["walk", 3.6]];
const TOUR_LEN = TOUR.reduce((sum, [, s]) => sum + s, 0);
const tourAt = (t) => { let at = t % TOUR_LEN; for (const [mode, s] of TOUR) { if (at < s) return mode; at -= s; } return "idle"; };
let mode = "idle", touring = true, clock = 0, time = 0, last = 0, frame = 0, visible = false, idleTimer = 0, waveUntil = 0;
let walk = 0, wave = 0, phase = 0, steps = 0;
const follow = (value, target, dt, tau) => value + (target - value) * (1 - Math.exp(-dt / tau));
function say() {
  const text = (mode === "walk" ? "เดิน" : mode === "wave" ? "โบกมือทักทาย" : "ยืนพัก") + " · " + steps + " ก้าว";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function pose() {
  const blinkAt = time % 3.7;
  const blink = blinkAt < 0.16 ? 1 - Math.abs(blinkAt - 0.08) / 0.08 : 0;
  const swing = 0.3 * walk * Math.sin(phase);
  return {
    swing,
    up: 0.35 * Math.sin(time * Math.PI * 2 / 3.4) + 0.9 * walk * Math.abs(Math.sin(phase)),
    drop: 28 * (1 - Math.cos(swing)) * 0.6,
    blink,
    wave,
    waveSwing: 0.34 * Math.sin(time * Math.PI * 2 * 2.1) * wave,
  };
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  time += dt;
  if (touring) { clock += dt; mode = tourAt(clock); }
  else if (mode === "wave" && time > waveUntil) mode = "idle";
  walk = follow(walk, mode === "walk" ? 1 : 0, dt, 0.28);
  wave = follow(wave, mode === "wave" ? 1 : 0, dt, 0.24);
  if (walk > 0.002) {
    const before = Math.sin(phase);
    phase += dt * Math.PI * 2 * 1.5;
    if (walk > 0.5 && Math.sign(Math.sin(phase)) !== Math.sign(before)) steps++;
  } else phase = 0;
  student.innerHTML = C.draw(pose());
  say();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } };
const hold = () => { touring = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = true; clock = 0; run(); }, 3600); run(); };
const doWave = () => { hold(); mode = "wave"; waveUntil = time + 2.6; if (still.matches) { wave = 1; student.innerHTML = C.draw(pose()); say(); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", () => { if (mode !== "wave") { hold(); mode = "walk"; } else hold(); });
stage.addEventListener("pointerleave", () => { if (mode === "walk") mode = "idle"; hold(); });
stage.addEventListener("click", doWave);
stage.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") { event.preventDefault(); doWave(); }
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); hold(); mode = mode === "walk" ? "idle" : "walk"; }
});
say();
`;

const MATERIALS = `
.m-skin{--anatomy-paper:#efcfb2;--anatomy-face:#efcfb2;--anatomy-top:#f8e1cc;--anatomy-shade-0:#dab08b;--anatomy-shade-1:#e2bb98;--anatomy-shade-2:#e9c5a5;--anatomy-shade-3:#efcfb2;--anatomy-hi:#6a4430;--anatomy-faint:#d8ad8a;--anatomy-lo:#c69a78}
.m-white{--anatomy-paper:#f4f5f6;--anatomy-face:#f4f5f6;--anatomy-top:#ffffff;--anatomy-shade-0:#d9dce0;--anatomy-shade-1:#e3e5e8;--anatomy-shade-2:#eceef0;--anatomy-shade-3:#f4f5f6;--anatomy-hi:#2a2a30}
.m-black{--anatomy-paper:#2e2e33;--anatomy-face:#2e2e33;--anatomy-top:#4a4a52;--anatomy-shade-0:#1f1f23;--anatomy-shade-1:#25252a;--anatomy-shade-2:#2b2b30;--anatomy-shade-3:#323238;--anatomy-hi:#0e0e10;--anatomy-mid:#77777f;--anatomy-faint:#55555d;--anatomy-dot:#d8d8dc}
.m-sole{--anatomy-paper:#1b1b1e;--anatomy-face:#1b1b1e;--anatomy-top:#2a2a2e;--anatomy-shade-0:#121214;--anatomy-shade-1:#161618;--anatomy-shade-2:#1a1a1c;--anatomy-shade-3:#1f1f22;--anatomy-hi:#050506}
.m-hair{--anatomy-paper:#2c2522;--anatomy-face:#2c2522;--anatomy-top:#463b35;--anatomy-shade-0:#1c1715;--anatomy-shade-1:#221c19;--anatomy-shade-2:#28211e;--anatomy-shade-3:#2f2724;--anatomy-hi:#0d0a09;--anatomy-faint:#4f433c}
.m-tie{--anatomy-paper:#2a3352;--anatomy-face:#2a3352;--anatomy-top:#3c4872;--anatomy-shade-0:#1c2339;--anatomy-shade-1:#212942;--anatomy-shade-2:#262f4b;--anatomy-shade-3:#2c3654;--anatomy-hi:#0e1220}
.m-book-a{--anatomy-paper:#e0622a;--anatomy-face:#e0622a;--anatomy-top:#ef7a43;--anatomy-shade-0:#bf4c1a;--anatomy-shade-1:#c9531f;--anatomy-shade-2:#d25a24;--anatomy-shade-3:#da612a;--anatomy-hi:#4a1c08}
.m-book-b{--anatomy-paper:#3a4a6b;--anatomy-face:#3a4a6b;--anatomy-top:#4d5f86;--anatomy-shade-0:#2b3752;--anatomy-shade-1:#303d5b;--anatomy-shade-2:#354464;--anatomy-shade-3:#3a4a6b;--anatomy-hi:#121827}
.m-book-c{--anatomy-paper:#8d8f86;--anatomy-face:#8d8f86;--anatomy-top:#a7a99f;--anatomy-shade-0:#74766e;--anatomy-shade-1:#7b7d75;--anatomy-shade-2:#83857c;--anatomy-shade-3:#8a8c83;--anatomy-hi:#2c2d29}
.m-pencil{--anatomy-paper:#f0c23b;--anatomy-face:#f0c23b;--anatomy-top:#f7d466;--anatomy-shade-0:#d3a420;--anatomy-shade-1:#dcad28;--anatomy-shade-2:#e5b730;--anatomy-shade-3:#ecbf38;--anatomy-hi:#5a4208}
.m-wood{--anatomy-paper:#e9c99a;--anatomy-face:#e9c99a;--anatomy-top:#f3dab4;--anatomy-shade-0:#c9a26b;--anatomy-shade-1:#d3ad77;--anatomy-shade-2:#ddb984;--anatomy-shade-3:#e5c491;--anatomy-hi:#5a4020}
.m-eraser{--anatomy-paper:#ef9a9a;--anatomy-face:#ef9a9a;--anatomy-top:#f6b4b4;--anatomy-shade-0:#d97c7c;--anatomy-shade-1:#e08585;--anatomy-shade-2:#e68e8e;--anatomy-shade-3:#ec9797;--anatomy-hi:#5a2020}
.m-metal{--anatomy-paper:#c9cace;--anatomy-face:#c9cace;--anatomy-top:#e6e7ea;--anatomy-shade-0:#a7a9ae;--anatomy-shade-1:#b1b3b8;--anatomy-shade-2:#bbbdc1;--anatomy-shade-3:#c5c6ca;--anatomy-hi:#3a3a40}
.iso-solid[data-lit]{--anatomy-face:#e9eaec;--anatomy-lit-top:#ffffff;--anatomy-lit-shade:#c4c6ca}
.eye{fill:#1e1b1d}.eye-hi{fill:#ffffff}.blush{fill:#ef8f7a;opacity:.45}
.mouth{fill:#b9534a;stroke:#6a3a2c;stroke-width:.35;stroke-linejoin:round}
.pen{fill:#2f45a8;stroke:#16205a;stroke-width:.3}.pen-clip{fill:#d6d7da}
.emblem circle,.emblem-dot{fill:#e35205}.emblem path{fill:#ffffff}
.button{fill:#ffffff;stroke:#a9abb0;stroke-width:.3}
.iso[data-theme="dark"] .m-skin{--anatomy-paper:#a8876d;--anatomy-face:#a8876d;--anatomy-top:#c4a185;--anatomy-shade-0:#8a6b53;--anatomy-shade-1:#93735b;--anatomy-shade-2:#9c7c63;--anatomy-shade-3:#a6856b;--anatomy-hi:#24170f;--anatomy-faint:#8c6d55;--anatomy-lo:#7e604a}
.iso[data-theme="dark"] .m-white{--anatomy-paper:#a2a4a7;--anatomy-face:#a2a4a7;--anatomy-top:#c4c6c9;--anatomy-shade-0:#86888c;--anatomy-shade-1:#8f9195;--anatomy-shade-2:#989a9e;--anatomy-shade-3:#a1a3a6;--anatomy-hi:#0b0b0c;--anatomy-mid:#4e5054;--anatomy-lo:#6c6e72;--anatomy-faint:#7e8084}
.iso[data-theme="dark"] .m-black{--anatomy-paper:#1c1c1f;--anatomy-face:#1c1c1f;--anatomy-top:#2c2c31;--anatomy-shade-0:#141416;--anatomy-shade-1:#17171a;--anatomy-shade-2:#1a1a1d;--anatomy-shade-3:#1e1e21;--anatomy-hi:#5c5c63;--anatomy-mid:#55555c;--anatomy-faint:#34343a}
.iso[data-theme="dark"] .m-sole{--anatomy-hi:#4a4a50}
.iso[data-theme="dark"] .m-hair{--anatomy-hi:#62554d;--anatomy-faint:#3e3430}
.iso[data-theme="dark"] .m-tie{--anatomy-hi:#5d6a92}
.iso[data-theme="dark"] .iso-solid[data-lit]{--anatomy-face:#9a9ca0;--anatomy-lit-top:#d0d2d5;--anatomy-lit-shade:#7c7e82}
.iso[data-theme="dark"] .eye-hi{fill:#d8d8d8}.iso[data-theme="dark"] .button{fill:#b8babd;stroke:#55575b}
.iso-stage{cursor:pointer;outline:none}
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "นักศึกษา สจล.",
  hint: "Hover to walk · click to wave",
  readout: "ยืนพัก · 0 ก้าว",
  keys: [
    { mark: "raised", label: "เสื้อเชิ้ตขาวแขนสั้น เนกไท กางเกงสแล็กดำ รองเท้าหนังดำ" },
    { mark: "lit", label: "หัวเข็มขัดโลหะ สจล." },
  ],
  caption:
    "นักศึกษาสถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบังในชุดนักศึกษา ทำแบบตัวละครเกมบนแท่นหมุนเลือกตัวละคร เอาเมาส์ชี้เพื่อให้เดินอยู่กับที่ คลิกหรือกด Space เพื่อโบกมือทักทาย ตัวนับก้าวนับทุกครั้งที่ขาสลับกัน",
  body: `<div class="iso-stage" tabindex="0" role="img" aria-label="KMITL student character: click or press Space to wave, arrow keys to walk">${svg}</div>`,
});

const name = theme === "light" ? "student.html" : "student-dark.html";
const page = k.pageHtml({ title: "KMITL Student", theme, body, script: kitScript() + live }).replace("</style>", `${MATERIALS}</style>`);
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
