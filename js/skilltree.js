// Skill Tree: one bachelor programme of the Computer Engineering department drawn as a game skill tree
// (data/skilltree/<id>.json, chosen with ?p=). Freshy on the left, one lane per skill area, required courses placed
// by the study plan (มคอ.2), electives taken from the registrar's timetables, careers from the มคอ.2 at the right.
// Every course counts as taken; clicking one shows what it adds to the 8-skill radar against the skill profile of the
// chosen career, and Play walks that career's path term by term. Skill points and career profiles are our estimate.

const $ = (id) => document.getElementById(id);
const ACC = '#ff6b00';

const AX = ['math', 'algo', 'sw', 'hw', 'net', 'sec', 'ai', 'soft'];
const AXN = ['คณิตศาสตร์', 'อัลกอริทึม', 'ซอฟต์แวร์', 'ฮาร์ดแวร์', 'เครือข่าย/ระบบ', 'ความปลอดภัย', 'AI/ข้อมูล', 'ทีม/สื่อสาร'];
const IC = {
  math: 'M17 4H7l6 8-6 8h10',
  ai: 'M8 8h8v8H8zM10 4v4M14 4v4M10 16v4M14 16v4M4 10h4M4 14h4M16 10h4M16 14h4',
  data: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  net: 'M10 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4zM12 7v5M5 17v-5h14v5',
  sec: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  hw: 'M7 7h10v10H7zM10 10h4v4h-4zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
  proj: 'M5 21V4M5 4h12l-3 4 3 4H5',
  ge: 'M4 5h16v10H10l-5 4v-4H4z',
  start: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5',
  grad: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',
};

const params = new URLSearchParams(location.search);
const PID = /^[a-z0-9-]+$/.test(params.get('p') || '') ? params.get('p') : 'cpe-2569';
let P;
try {
  P = await fetch(`data/skilltree/${PID}.json`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
} catch {
  document.body.innerHTML = '<p style="padding:24px">ไม่พบข้อมูลหลักสูตรนี้ <a href="programs.html">กลับไปเลือกหลักสูตร</a></p>';
  throw new Error(`no skill tree for ${PID}`);
}
Object.assign(IC, P.icons || {});
const ROWS = P.rows, TERM = P.terms;

// ---------- layout ----------
// lanes share the height around Freshy; a term column is as wide as its busiest lane, then come the elective zone
// and two career columns; everything narrows together when a long plan would run into the panel
const GAP = Math.min(92, 736 / Math.max(1, ROWS.length - 1));
const RY = (r) => 538 - (GAP * (ROWS.length - 1)) / 2 + r * GAP;
const slots = TERM.map((_, t) => Math.max(1, ...ROWS.map((_, r) => P.core.filter((c) => c.row === r && c.term === t).length)));
const maxEl = Math.max(1, ...ROWS.map((_, r) => P.electives.filter((e) => e.row === r).length));
const span = slots.reduce((s, n) => s + n * 62 + 12, 0) - 74;
const K = Math.min(1, 1066 / (span + (maxEl - 1) * 60));
const SP = 62 * K, ESP = 60 * K;
const NS = Math.min(1, K / 0.9); // course nodes shrink a little on long plans so neighbours keep a gap
const colW = slots.map((n) => (n * 62 + 12) * K);
const colX = [];
TERM.reduce((x, _, t) => { colX.push(x); return x + colW[t]; }, 190);
const EL0 = 190 + span * K + 84;
const CA = EL0 + (maxEl - 1) * ESP + 110, CB = CA + 86, JOIN = CA - 45;

// ---------- build the graph ----------
const pts = (s) => {
  const o = Object.fromEntries(AX.map((k) => [k, 0]));
  for (const p of (s || '').split(' ')) { const m = p.match(/^([a-z]+)(\d+)$/); if (m && m[1] in o) o[m[1]] = +m[2]; }
  return o;
};
const N = {};
const ids = [];
const add = (o) => { N[o.id] = o; ids.push(o.id); };
add({ id: 'start', kind: 'start', x: 62, y: 538, ab: 'FRESHY', th: 'Freshy — นักศึกษาปี 1', en: `Freshman, ${P.en}`, cr: 0, p: pts(''), code: 'START' });
const seen = {};
for (const c of P.core) {
  const k = `${c.row}:${c.term}`, s = (seen[k] = (seen[k] ?? -1) + 1);
  add({ ...c, id: c.code, kind: 'core', t: c.term, s, x: colX[c.term] + s * SP, y: RY(c.row), ab: c.abbr, p: pts(c.pts), opt: !!c.optional });
}
const elIdx = {};
for (const e of P.electives) {
  const idx = (elIdx[e.row] = (elIdx[e.row] ?? -1) + 1);
  add({ ...e, id: e.code, kind: 'elec', idx, x: EL0 + idx * ESP, y: RY(e.row), ab: e.abbr, p: pts(e.pts) });
}
const coreIds = ids.filter((id) => N[id].kind === 'core' && !N[id].opt);

// careers sit level with the lanes they come from, in two columns so close ones don't collide
const taken = [];
const careerIds = P.careers.map((c) => c.id);
for (const c of P.careers.map((c, i) => ({ ...c, i, ty: (c.rows || []).reduce((s, r) => s + RY(r), 0) / Math.max(1, (c.rows || []).length) || 538 }))
  .sort((a, b) => a.ty - b.ty || a.i - b.i)) {
  const free = (x, y) => !taken.some((o) => o.x === x && Math.abs(o.y - y) < 84);
  let x = CA, y = Math.min(906, Math.max(170, c.ty));
  if (!free(CA, y)) { if (free(CB, y)) x = CB; else while (!free(CA, y)) y += 46; }
  taken.push({ x, y });
  const need = pts(c.profile);
  add({ ...c, code: 'CAREER', kind: 'career', x, y, ab: c.label, ic: c.icon, plan: c.electives || [], cr: 0, p: pts(''),
    need: c.profile ? AX.map((k) => need[k]) : null });
}

const rowCore = {}, rowEl = {};
for (let r = 0; r < ROWS.length; r++) {
  rowCore[r] = ids.filter((id) => N[id].kind === 'core' && N[id].row === r).sort((a, b) => N[a].x - N[b].x);
  rowEl[r] = ids.filter((id) => N[id].kind === 'elec' && N[id].row === r);
}

// lines: lanes start at Freshy's trunk unless a link leads into them; elective rails hang off the lane's last course
const size = (n) => (n.kind === 'career' ? 64 : n.kind === 'start' ? 76 : (n.kind === 'elec' ? 44 : 48) * NS);
const half = (n) => size(n) / 2;
const ys = ROWS.map((_, r) => RY(r));
const E = [{ d: `M100 538 H130 M130 ${Math.min(...ys, 538)} V${Math.max(...ys, 538)}`, always: true }];
const linked = new Set();
for (const [a, b] of P.links || []) {
  const f = N[a], t = N[b];
  if (!f || !t) continue;
  linked.add(b);
  E.push({ d: `M${f.x} ${f.y + (t.y > f.y ? half(f) : -half(f))} V${t.y} H${t.x - half(t)}`, t: b, any: t.kind === 'elec' ? rowEl[t.row] : null });
}
for (let r = 0; r < ROWS.length; r++) {
  const c = rowCore[r], els = rowEl[r].map((id) => N[id]);
  if (c.length && !linked.has(c[0])) { const f = N[c[0]]; E.push({ d: `M130 ${f.y} H${f.x - half(f)}`, t: f.id }); }
  for (let i = 1; i < c.length; i++) { const a = N[c[i - 1]], b = N[c[i]]; E.push({ d: `M${a.x + half(a)} ${a.y} H${b.x - half(b)}`, a: a.id, b: b.id }); }
  if (!els.length) continue;
  if (!linked.has(els[0].id)) {
    const from = c.length ? N[c[c.length - 1]] : null;
    E.push({ d: `M${from ? from.x + half(from) : 130} ${els[0].y} H${els[0].x - half(els[0])}`, any: els.map((n) => n.id) });
  }
  for (let i = 1; i < els.length; i++) E.push({ d: `M${els[i - 1].x + half(els[i])} ${els[i].y} H${els[i].x - half(els[i])}`, any: els.slice(i).map((n) => n.id) });
}
for (const cid of careerIds) {
  const c = N[cid];
  for (const r of c.rows || []) {
    const list = rowEl[r].length ? rowEl[r] : rowCore[r];
    if (!list.length) continue;
    const from = N[list[list.length - 1]], x0 = from.x + half(from);
    E.push({ d: from.y === c.y && c.x === CA ? `M${x0} ${from.y} H${c.x - 32}` : `M${x0} ${from.y} H${JOIN} V${c.y} H${c.x - 32}`, t: cid });
  }
}

// an axis is full at all core courses plus the three strongest electives for it
const MAX = Object.fromEntries(AX.map((k) => {
  const core = coreIds.reduce((s, id) => s + N[id].p[k], 0);
  const el = ids.filter((id) => N[id].kind === 'elec').map((id) => N[id].p[k]).sort((a, b) => b - a).slice(0, 3).reduce((s, v) => s + v, 0);
  return [k, Math.max(1, core + el)];
}));
const vec = (list) => {
  const v = AX.map(() => 0);
  for (const id of list) if (N[id]) AX.forEach((k, i) => { v[i] += N[id].p[k]; });
  return v.map((x, i) => Math.min(100, (x / MAX[AX[i]]) * 100));
};
// a career's journey: Freshy, every core course by term, its electives, the career itself
const planFor = (cid) => ['start'].concat(
  coreIds.slice().sort((a, b) => N[a].t - N[b].t || N[a].row - N[b].row || N[a].s - N[b].s), N[cid].plan, [cid]);
// courses before `id` on the path; an elective off the path comes after all core courses
const before = (id, plan) => { const i = plan.indexOf(id); return i >= 0 ? plan.slice(0, i) : coreIds.slice(); };
const after = (id, plan) => (N[id].kind === 'career' ? vec(plan) : N[id].kind === 'start' ? vec([]) : vec(before(id, plan).concat([id])));
// what the job asks for; a career without a profile falls back to what its path gives
const needOf = (cid) => N[cid].need || vec(planFor(cid));

// ---------- static DOM ----------
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const svgIcon = (d, cls = '') => `<svg class="${cls}" width="24" height="24" aria-hidden="true"><path d="${d}"/></svg>`;
const colorOf = (n) => (n.kind === 'career' || n.kind === 'start' ? ACC : ROWS[n.row].c);
const iconOf = (n) => IC[n.kind === 'career' ? n.ic : n.kind === 'start' ? 'start' : ROWS[n.row].ic] || IC.grad;

document.title = `${P.th} · Skill Tree | KMITL 3D`;
$('h-th').textContent = `Skill Tree · ${P.th}`;
$('h-sub').textContent = `เส้นทางจาก Freshy สู่สายอาชีพ · ${P.degree} ${P.kind} พ.ศ. ${P.year}`;
const src = $('src'), link = el('a');
link.href = P.source.url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = P.source.label;
src.append('วิชาบังคับ: ', link, ` จัดวางตามแผนการศึกษา · วิชาเลือก: ${P.timetable ? `คัดจากตารางสอนสำนักทะเบียน สจล. ภาค ${P.timetable}` : 'จาก มคอ.2'} · อาชีพจาก มคอ.2 · เส้นเชื่อมเรียงตามแผนการเรียน ไม่ใช่วิชาบังคับก่อนอย่างเป็นทางการ · คะแนนทักษะของวิชาและโปรไฟล์ทักษะของอาชีพเป็นการประมาณเพื่อการแสดงผล`);

const endX = colX[TERM.length - 1] + colW[TERM.length - 1] - 36;
const bands = TERM.map((label, t) => [colX[t] - 36, colW[t], label.includes('ฤดูร้อน') ? 'ฤดูร้อน' : label, 'band']);
bands.push([endX, EL0 - 40 - endX, '', 'band'], [EL0 - 40, JOIN - 10 - (EL0 - 40), 'วิชาเลือก', 'band el'], [JOIN - 10, 1585 - JOIN, 'สายอาชีพ', 'band ca']);
for (const [l, w, label, cls] of bands) { const b = el('div', cls, `<span>${label}</span>`); b.style.left = `${l}px`; b.style.width = `${w}px`; $('bands').append(b); }

ROWS.forEach((r, i) => {
  const first = rowCore[i].length ? N[rowCore[i][0]] : null;
  const lab = el('div', 'rl', `${r.name}<i>${r.en}</i>`);
  Object.assign(lab.style, { left: `${first ? first.x - 24 : 160}px`, top: `${RY(i) - Math.min(50, GAP - 40)}px` });
  lab.style.setProperty('--c', r.c);
  $('rowlabels').append(lab);
});

const nodeEl = {};
for (const id of ids) {
  const n = N[id];
  const w = size(n);
  const b = el('button', `nd ${n.kind} on`, `<span class="fr">${svgIcon(iconOf(n), 'ico')}</span><span class="burst"></span><span class="ab"></span>`);
  b.querySelector('.ab').textContent = n.ab;
  b.title = n.th;
  b.setAttribute('aria-label', n.th);
  Object.assign(b.style, { left: `${n.x - w / 2}px`, top: `${n.y - w / 2}px`, width: `${w}px`, height: `${w}px` });
  b.style.setProperty('--c', colorOf(n));
  b.addEventListener('click', () => pick(id));
  $('nodes').append(b);
  nodeEl[id] = b;
}

for (const id of careerIds) {
  const o = el('option'); o.value = id; o.textContent = N[id].plan.length ? N[id].th : `${N[id].th} (วิชาบังคับครบหลักสูตร)`; $('goal').append(o);
}

const angle = (i) => ((-90 + i * 45) * Math.PI) / 180;
const poly = (v) => v.map((x, i) => { const r = (92 * Math.max(0, x)) / 100; return `${(138 + r * Math.cos(angle(i))).toFixed(1)},${(120 + r * Math.sin(angle(i))).toFixed(1)}`; }).join(' ');
$('r-grid').setAttribute('d', [25, 50, 75, 100].map((p) => `M${poly(AX.map(() => p)).split(' ').join(' L')} Z`).join(' '));
$('r-ax').setAttribute('d', AX.map((k, i) => `M138 120 L${(138 + 92 * Math.cos(angle(i))).toFixed(1)} ${(120 + 92 * Math.sin(angle(i))).toFixed(1)}`).join(' '));
AXN.forEach((name, i) => {
  const l = el('div', 'rlab'); l.textContent = name;
  Object.assign(l.style, { left: `${(138 + 112 * Math.cos(angle(i))).toFixed(0)}px`, top: `${(120 + 110 * Math.sin(angle(i))).toFixed(0)}px` });
  $('r-labels').append(l);
});
const barEls = AXN.map((name) => {
  const row = el('div', 'bar', `<span class="bl"></span><span class="bt"><span class="bc"></span><span class="ba"></span><span class="bg"></span></span><span class="bv"></span>`);
  row.querySelector('.bl').textContent = name;
  $('bars').append(row);
  return { c: row.querySelector('.bc'), a: row.querySelector('.ba'), g: row.querySelector('.bg'), v: row.querySelector('.bv') };
});

// ---------- state ----------
const S = { sel: 'start', career: N[params.get('career')]?.kind === 'career' ? params.get('career') : careerIds.find((id) => N[id].plan.length) || careerIds[0], cursor: -1, timer: 0 };
let shown = vec([]), raf = 0;

// v: main polygon and bars; gain: per-axis part of the bar drawn blue; tg: the grey target marks
function draw(v, gain, tg) {
  $('r-cur').setAttribute('points', poly(v));
  barEls.forEach((b, i) => {
    const c = v[i], aw = gain ? Math.min(gain[i], c) : 0;
    b.c.style.width = `${c.toFixed(1)}%`;
    b.a.style.left = `${(c - aw).toFixed(1)}%`;
    b.a.style.width = `${aw.toFixed(1)}%`;
    b.g.style.left = `${Math.min(99, tg[i]).toFixed(1)}%`;
  });
}

function tweenTo(target, gain, tg) {
  cancelAnimationFrame(raf);
  const from = shown.slice(), t0 = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = (now) => {
    const k = reduce ? 1 : Math.min(1, (now - t0) / 520), e = 1 - (1 - k) ** 3;
    shown = from.map((v, i) => v + (target[i] - v) * e);
    draw(shown, gain, tg);
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

const top3 = (v) => AX.map((_, i) => [AXN[i], v[i]]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([nm]) => nm).join(', ');

function render() {
  const plan = planFor(S.career);
  const onPlan = new Set(plan);
  // everything counts as taken; during playback only the courses reached so far are filled in
  const V = new Set(S.cursor < 0 ? ids : plan.slice(0, S.cursor + 1));
  for (const id of ids) {
    const n = N[id], b = nodeEl[id];
    b.classList.toggle('on', V.has(id));
    b.classList.toggle('todo', !V.has(id));
    b.classList.toggle('sel', S.sel === id);
    b.classList.toggle('dim', (n.kind === 'elec' || n.kind === 'career') && !onPlan.has(id));
  }
  let on = '', off = '', all = '';
  for (const e of E) {
    const lit = e.always || (e.t && V.has(e.t)) || (e.a && V.has(e.a) && V.has(e.b)) || (e.any && e.any.some((k) => V.has(k)));
    all += `${e.d} `;
    if (lit) on += `${e.d} `; else off += `${e.d} `;
  }
  $('e-all').setAttribute('d', all); $('e-off').setAttribute('d', off); $('e-onb').setAttribute('d', on); $('e-on').setAttribute('d', on);

  $('st-courses').textContent = plan.filter((id) => N[id].kind === 'core' || N[id].kind === 'elec').length;
  $('st-credits').textContent = plan.reduce((s, id) => s + N[id].cr, 0);
  $('st-elec').textContent = N[S.career].plan.length;
  $('goal').value = S.career;
  const playing = !!S.timer;
  $('play-lbl').textContent = playing ? 'หยุด' : 'เล่นเส้นทาง';
  $('play-ico').setAttribute('d', playing ? 'M8 5v14M16 5v14' : 'M7 4l13 8-13 8z');

  // panel: a course shows skills after it (orange) and before it (blue) against the chosen career's profile (grey);
  // a career shows the skills the job asks for (orange) against what its path gives by graduation (blue)
  const n = N[S.sel];
  const isCourse = n.kind === 'core' || n.kind === 'elec';
  const isCareer = n.kind === 'career';
  const aft = after(S.sel, plan);
  const bef = isCourse ? vec(before(S.sel, plan)) : null;
  const need = needOf(isCareer ? S.sel : S.career);
  const main = isCareer ? need : aft, alt = isCareer ? aft : bef;
  $('p-pic').style.setProperty('--c', colorOf(n));
  $('p-ico').setAttribute('d', iconOf(n));
  $('p-code').textContent = isCareer ? n.en : n.code;
  $('p-th').textContent = n.th;
  $('p-en').textContent = isCareer ? 'สายอาชีพปลายทาง' : n.en;
  const gains = bef ? AX.map((k, i) => [AXN[i], aft[i] - bef[i]]).filter(([, d]) => d > 0.05).sort((a, b) => b[1] - a[1]) : [];
  const gainTxt = gains.length ? `เพิ่มทักษะ: ${gains.map(([nm, d]) => `${nm} +${Math.round(d)}%`).join(' · ')}` : '';
  let meta, status = '', req = [], hint;
  if (n.kind === 'start') {
    meta = `จุดเริ่มต้นของทุกเส้นทาง เส้นจาก Freshy แตกออกเป็นสายทักษะ ${ROWS.length} สาย ปลายสุดของแต่ละสายคืออาชีพที่หลักสูตรระบุไว้ใน มคอ.2`;
    status = 'เลือกเส้นทางอาชีพด้านบน แล้วกด “เล่นเส้นทาง” เพื่อดูทักษะเติบโตทีละภาคเรียน หรือคลิกวิชาใดก็ได้เพื่อดูว่าเพิ่มทักษะด้านใด';
    hint = 'เรดาร์แสดงทักษะ 8 ด้านที่สะสมตามลำดับการเรียน เส้นประสีเทาคือทักษะที่อาชีพเป้าหมายต้องการ';
  } else if (isCareer) {
    meta = n.desc;
    status = `ทักษะหลักของอาชีพนี้: ${top3(need)} · เส้นทางนี้ = วิชาบังคับทั้งหลักสูตร${n.plan.length ? ` + วิชาเลือก ${n.plan.length} วิชา` : ''}`;
    req = n.plan.map((id) => `• ${N[id].th}`);
    hint = 'อาชีพและกลุ่มวิชาเลือกที่เกี่ยวข้องอ้างอิงจาก มคอ.2 ระดับทักษะที่อาชีพต้องการเป็นการประมาณ';
  } else if (n.kind === 'core') {
    meta = `วิชาบังคับ · ${n.cr} หน่วยกิต · ${TERM[n.t]} · ที่มา มคอ.2 ${P.kind} ${P.year}${n.opt ? ' · เส้นทางเลือกในภาคการศึกษาสุดท้าย' : ''}`;
    status = gainTxt;
    hint = 'แถบสีฟ้าคือส่วนที่วิชานี้เพิ่มจากทักษะที่สะสมมาก่อนหน้า ขีดดำคือระดับที่อาชีพเป้าหมายต้องการ';
  } else {
    meta = `วิชาเลือกเฉพาะสาขา · ${n.cr} หน่วยกิต${n.terms ? ` · ตารางสอนภาค ${n.terms}` : ''}${n.n ? ` · ผู้ลงทะเบียนรวม ${n.n} คน` : ''}${n.note ? ` · ${n.note}` : ''}`;
    status = gainTxt;
    hint = 'แถบสีฟ้าคือส่วนที่วิชานี้เพิ่มจากทักษะที่สะสมมาก่อนหน้า ขีดดำคือระดับที่อาชีพเป้าหมายต้องการ';
  }
  $('p-meta').textContent = meta;
  $('p-status').textContent = status;
  $('p-req').replaceChildren(...req.map((t) => { const s = el('span'); s.textContent = t; return s; }));
  $('p-hint').textContent = hint;
  $('k-cur').textContent = isCareer ? 'อาชีพนี้ต้องการ' : isCourse ? 'หลังเรียนวิชานี้' : 'ทักษะสะสม';
  $('k-alt').textContent = isCareer ? 'เมื่อจบเส้นทางนี้' : 'ก่อนเรียนวิชานี้';
  $('k-alt').parentElement.style.display = alt ? '' : 'none';
  $('k-tg').parentElement.style.display = isCareer ? 'none' : '';
  $('r-tg').setAttribute('points', poly(need));
  $('r-tg').style.display = isCareer ? 'none' : '';
  $('r-alt').setAttribute('points', poly(alt || aft));
  $('r-alt').style.display = alt ? '' : 'none';
  barEls.forEach((b, i) => {
    const d = bef ? aft[i] - bef[i] : 0;
    b.v.textContent = bef ? (d > 0.05 ? `+${Math.round(d)}%` : '') : `${Math.round(main[i])}%`;
  });
  tweenTo(main, bef ? aft.map((v, i) => Math.max(0, v - bef[i])) : null, isCareer ? aft : need);
}

function stop() { clearInterval(S.timer); S.timer = 0; }
function pick(id) { stop(); S.sel = id; S.cursor = -1; if (N[id].kind === 'career') S.career = id; render(); }
function play() {
  stop();
  const plan = planFor(S.career);
  S.cursor = 0; S.sel = 'start';
  const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 700 : 420;
  S.timer = setInterval(() => {
    if (S.cursor + 1 >= plan.length) { stop(); render(); return; }
    S.cursor += 1; S.sel = plan[S.cursor]; render();
  }, ms);
  render();
}
$('play').addEventListener('click', () => { if (S.timer) { stop(); render(); } else play(); });
$('all').addEventListener('click', () => { stop(); S.sel = 'start'; S.cursor = -1; render(); });
$('goal').addEventListener('change', (e) => { stop(); S.career = e.target.value; S.sel = S.career; S.cursor = -1; render(); });

// fit the 1920×1080 stage to the window; on a tall narrow screen fit the width and scroll
function fit() {
  const w = innerWidth, h = innerHeight;
  const tall = w / h < 1;
  const k = tall ? w / 1920 : Math.min(w / 1920, h / 1080);
  const st = $('stage');
  st.style.transform = `scale(${k})`;
  st.style.left = `${Math.max(0, (w - 1920 * k) / 2)}px`;
  st.style.top = tall ? '0px' : `${Math.max(0, (h - 1080 * k) / 2)}px`;
  document.body.classList.toggle('tall', tall);
  $('fit').style.height = tall ? `${1080 * k}px` : '100%';
}
addEventListener('resize', fit);
fit();
render();
setTimeout(play, 900);
