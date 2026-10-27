// Skill Tree: one bachelor programme of the Computer Engineering department drawn as a game skill tree
// (data/skilltree/<id>.json, chosen with ?p=). Freshy on the left, one lane per skill area, required courses placed
// by the study plan (มคอ.2), electives taken from the registrar's timetables, careers from the มคอ.2 at the right.
// Required courses are taken a whole term at a time; electives are picked one by one or a track (lane) at a time,
// and a click on a picked one drops it. Careers stand apart from the courses: each unlocks once the 8-axis skills
// reach what the job asks for, and clicking one picks its recommended electives. Skill points and career profiles
// are our estimate.

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
// and the career board; everything narrows together when a long plan would run into the panel
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
const CA = EL0 + (maxEl - 1) * ESP + 100, CB = CA + 82, BOARD = CA - 50;

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
// optional core courses (alternative final-year tracks) are picked like electives
const pickable = (id) => N[id].kind === 'elec' || N[id].opt;
const coreIds = ids.filter((id) => N[id].kind === 'core' && !N[id].opt);
const termCourses = TERM.map((_, t) => coreIds.filter((id) => N[id].t === t));

// careers: a zig-zag board of their own, not tied to any lane
const careerIds = P.careers.map((c) => c.id);
const cstep = careerIds.length > 1 ? Math.min(120, 736 / (careerIds.length - 1)) : 0;
P.careers.forEach((c, i) => {
  const y = 538 - (cstep * (careerIds.length - 1)) / 2 + i * cstep;
  add({ ...c, code: 'CAREER', kind: 'career', x: i % 2 ? CB : CA, y, ab: c.label, ic: c.icon, rec: c.electives || [], cr: 0, p: pts('') });
});

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

// ---------- skills ----------
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
// what a career asks for, measured against the whole core plus its recommended electives: the job's main axes
// (profile 85+) need all of that, so those electives or others as strong; minor axes need their profile share,
// which the required courses already give
for (const cid of careerIds) {
  const c = N[cid], full = vec(coreIds.concat(c.rec));
  const prof = c.profile ? pts(c.profile) : null;
  c.key = AX.map((k, i) => (prof ? prof[k] >= 85 : full[i] === Math.max(...full)));
  c.need = full.map((v, i) => Math.floor(c.key[i] ? v : v * (prof ? prof[AX[i]] / 100 : 0.6)));
}
const short = (have, need) => AX.map((_, i) => [AXN[i], need[i] - have[i]]).filter(([, d]) => d > 0.5);
// readiness bar: how far the main axes are towards the need
const readiness = (have, c) => {
  const axes = c.need.map((v, i) => [v, i]).filter(([v, i]) => v > 0 && c.key[i]);
  return axes.length ? axes.reduce((s, [v, i]) => s + Math.min(1, have[i] / v), 0) / axes.length : 1;
};

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
src.append('วิชาบังคับ: ', link, ` จัดวางตามแผนการศึกษา · วิชาเลือก: ${P.timetable ? `คัดจากตารางสอนสำนักทะเบียน สจล. ภาค ${P.timetable}` : 'จาก มคอ.2'} · อาชีพจาก มคอ.2 · เส้นเชื่อมเรียงตามแผนการเรียน ไม่ใช่วิชาบังคับก่อนอย่างเป็นทางการ · คะแนนทักษะของวิชาและเกณฑ์ทักษะของอาชีพเป็นการประมาณเพื่อการแสดงผล`);

// term columns: the header of each is the button that takes (or drops) that term
const termBtn = [];
TERM.forEach((label, t) => {
  const b = el('div', 'band');
  Object.assign(b.style, { left: `${colX[t] - 36}px`, width: `${colW[t]}px` });
  const btn = el('button', 'tb');
  btn.textContent = label.includes('ฤดูร้อน') ? 'ฤดูร้อน' : label;
  btn.title = `เรียน${label}`;
  btn.addEventListener('click', () => pickTerm(t));
  b.append(btn);
  $('bands').append(b);
  termBtn.push(btn);
});
const endX = colX[TERM.length - 1] + colW[TERM.length - 1] - 36;
for (const [l, w, label, cls] of [[endX, EL0 - 40 - endX, '', 'band'], [EL0 - 40, BOARD - (EL0 - 40), 'วิชาเลือก', 'band el'], [BOARD, 1585 - BOARD, 'อาชีพ', 'band ca']]) {
  const b = el('div', cls, `<span>${label}</span>`); b.style.left = `${l}px`; b.style.width = `${w}px`; $('bands').append(b);
}

ROWS.forEach((r, i) => {
  const first = rowCore[i].length ? N[rowCore[i][0]] : null;
  const lab = el('div', 'rl', `${r.name}<i>${r.en}</i>`);
  Object.assign(lab.style, { left: `${first ? first.x - 24 : 160}px`, top: `${RY(i) - Math.min(50, GAP - 40)}px` });
  lab.style.setProperty('--c', r.c);
  $('rowlabels').append(lab);
});

// a "whole track" chip in front of each lane's electives
const chips = {};
ROWS.forEach((r, i) => {
  if (!rowEl[i].length) return;
  const c = el('button', 'chip');
  c.textContent = 'ทั้งแทร็ก';
  c.title = `เลือก/ยกเลิกวิชาเลือกทั้งแทร็ก${r.name}`;
  Object.assign(c.style, { left: `${EL0 - 34 - 62}px`, top: `${RY(i) - 11}px` });
  c.style.setProperty('--c', r.c);
  c.addEventListener('click', () => pickTrack(i));
  $('nodes').append(c);
  chips[i] = c;
});

const nodeEl = {};
for (const id of ids) {
  const n = N[id];
  const w = size(n);
  const b = el('button', `nd ${n.kind}`, `<span class="fr">${svgIcon(iconOf(n), 'ico')}</span><span class="burst"></span><span class="ab"></span>${n.kind === 'career' ? '<span class="pg"><i></i></span>' : ''}`);
  b.querySelector('.ab').textContent = n.ab;
  b.title = n.th;
  b.setAttribute('aria-label', n.th);
  Object.assign(b.style, { left: `${n.x - w / 2}px`, top: `${n.y - w / 2}px`, width: `${w}px`, height: `${w}px` });
  b.style.setProperty('--c', colorOf(n));
  b.addEventListener('click', () => click(id));
  $('nodes').append(b);
  nodeEl[id] = b;
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
// term: the last term taken (-1 = Freshy); picked: electives and optional courses; sel: what the panel shows
// (a node id or 'term:<t>'); goal: the career whose bar marks and grey outline are shown
const S = { term: -1, picked: new Set(), sel: 'start', goal: null, timer: 0 };
const takenIds = () => coreIds.filter((id) => N[id].t <= S.term).concat([...S.picked]);
let shown = vec([]), raf = 0;

function draw(v, gain, tg) {
  $('r-cur').setAttribute('points', poly(v));
  barEls.forEach((b, i) => {
    const c = v[i], aw = gain ? Math.min(gain[i], c) : 0;
    b.c.style.width = `${c.toFixed(1)}%`;
    b.a.style.left = `${(c - aw).toFixed(1)}%`;
    b.a.style.width = `${aw.toFixed(1)}%`;
    b.g.style.display = tg ? '' : 'none';
    if (tg) b.g.style.left = `${Math.min(99, tg[i]).toFixed(1)}%`;
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
const gainText = (d) => {
  const g = AX.map((_, i) => [AXN[i], d[i]]).filter(([, x]) => x > 0.05).sort((a, b) => b[1] - a[1]);
  return g.length ? g.map(([nm, x]) => `${nm} +${Math.round(x)}%`).join(' · ') : '';
};
const termLabel = (t) => (t < 0 ? 'ยังไม่เริ่ม (Freshy)' : TERM[t]);

function render() {
  const taken = new Set(takenIds());
  const have = vec([...taken]);
  const unlocked = new Set(careerIds.filter((cid) => short(have, N[cid].need).length === 0));
  for (const id of ids) {
    const n = N[id], b = nodeEl[id];
    const on = n.kind === 'start' || (n.kind === 'career' ? unlocked.has(id) : taken.has(id));
    b.classList.toggle('on', on);
    b.classList.toggle('todo', !on);
    b.classList.toggle('sel', S.sel === id);
    b.classList.toggle('goal', S.goal === id);
    if (n.kind === 'career') b.querySelector('.pg i').style.width = `${Math.round(readiness(have, n) * 100)}%`;
  }
  for (const [r, c] of Object.entries(chips)) c.classList.toggle('on', rowEl[r].every((id) => S.picked.has(id)));
  termBtn.forEach((b, t) => { b.classList.toggle('done', t <= S.term); b.classList.toggle('next', t === S.term + 1); b.classList.toggle('sel', S.sel === `term:${t}`); });

  let on = '', off = '', all = '';
  for (const e of E) {
    const lit = e.always || (e.t && taken.has(e.t)) || (e.a && taken.has(e.a) && taken.has(e.b)) || (e.any && e.any.some((k) => taken.has(k)));
    all += `${e.d} `;
    if (lit) on += `${e.d} `; else off += `${e.d} `;
  }
  $('e-all').setAttribute('d', all); $('e-off').setAttribute('d', off); $('e-onb').setAttribute('d', on); $('e-on').setAttribute('d', on);

  $('st-credits').textContent = [...taken].reduce((s, id) => s + N[id].cr, 0);
  $('st-elec').textContent = [...S.picked].filter((id) => N[id].kind === 'elec').length;
  $('st-car').textContent = `${unlocked.size}/${careerIds.length}`;
  $('term-lbl').textContent = termLabel(S.term);
  $('prev').disabled = S.term < 0;
  $('next').disabled = S.term >= TERM.length - 1;
  const playing = !!S.timer;
  $('play-lbl').textContent = playing ? 'หยุด' : 'เล่นทีละเทอม';
  $('play-ico').setAttribute('d', playing ? 'M8 5v14M16 5v14' : 'M7 4l13 8-13 8z');

  // panel: the radar is always the skills so far (orange); a course or term adds a blue outline of the skills
  // without it (or with it, if not taken yet); the grey outline and the bar marks are the goal career's need
  const goalNeed = S.goal ? N[S.goal].need : null;
  let alt = null, gain = null, meta, status = '', req = [], hint, pic, ico, code, th, en, kAlt = '';
  const term = typeof S.sel === 'string' && S.sel.startsWith('term:') ? +S.sel.slice(5) : null;
  const n = term == null ? N[S.sel] : null;
  if (term != null) {
    const list = termCourses[term], done = term <= S.term;
    const other = vec([...taken].filter((id) => !list.includes(id)).concat(done ? [] : list));
    alt = other; gain = (done ? have.map((v, i) => v - other[i]) : null); kAlt = done ? 'ก่อนภาคเรียนนี้' : 'ถ้าเรียนภาคเรียนนี้';
    pic = ACC; ico = IC.grad; code = 'TERM'; th = TERM[term]; en = `วิชาบังคับ ${list.length} วิชา · ${list.reduce((s, id) => s + N[id].cr, 0)} หน่วยกิต`;
    meta = done ? 'เรียนภาคเรียนนี้แล้ว กดหัวคอลัมน์อีกครั้งเพื่อย้อนกลับไปก่อนภาคเรียนนี้' : 'กดหัวคอลัมน์เพื่อเรียนถึงภาคเรียนนี้';
    status = `${done ? 'ภาคเรียนนี้เพิ่ม' : 'ภาคเรียนนี้จะเพิ่ม'}: ${gainText(done ? have.map((v, i) => v - other[i]) : other.map((v, i) => v - have[i]))}`;
    req = list.map((id) => `• ${N[id].th}`);
    hint = 'วิชาบังคับเรียนทีละภาคเรียนตามแผนการศึกษาใน มคอ.2';
  } else if (n.kind === 'start') {
    pic = ACC; ico = IC.start; code = n.code; th = n.th; en = n.en;
    meta = `จุดเริ่มต้นของทุกเส้นทาง เส้นจาก Freshy แตกออกเป็นสายทักษะ ${ROWS.length} สาย`;
    status = 'กด › หรือหัวคอลัมน์เพื่อเรียนวิชาบังคับทีละภาคเรียน แล้วเลือกวิชาเลือกที่สนใจ อาชีพทางขวาจะปลดล็อกเมื่อทักษะถึงเกณฑ์ หรือกดอาชีพเพื่อเลือกวิชาเลือกที่แนะนำ';
    hint = 'เรดาร์แสดงทักษะ 8 ด้านที่สะสมจากวิชาที่เรียนแล้ว เส้นประสีเทาคือเกณฑ์ของอาชีพที่เลือกไว้';
  } else if (n.kind === 'career') {
    pic = ACC; ico = iconOf(n); code = n.en; th = n.th; en = unlocked.has(n.id) ? 'ปลดล็อกแล้ว' : `ความพร้อม ${Math.round(readiness(have, n) * 100)}%`;
    meta = n.desc;
    const miss = short(have, n.need);
    status = `ทักษะหลักของอาชีพนี้: ${top3(n.need)} · ${miss.length ? `ยังขาด: ${miss.map(([nm, d]) => `${nm} ${Math.ceil(d)}%`).join(' · ')}` : 'ทักษะถึงเกณฑ์แล้ว'}`;
    req = n.rec.map((id) => `${S.picked.has(id) ? '✓' : '○'} ${N[id].th}`);
    hint = n.rec.length
      ? `วิชาเลือกที่แนะนำ ${n.rec.length} วิชา กดอาชีพเพื่อเลือกทั้งหมด กดอีกครั้งเพื่อยกเลิก เกณฑ์ทักษะต้องเรียนวิชาบังคับครบทุกภาคเรียนด้วย`
      : 'อาชีพนี้ใช้วิชาบังคับครบทุกภาคเรียน ไม่มีวิชาเลือกที่แนะนำเฉพาะ';
  } else {
    const isTaken = taken.has(n.id);
    const other = vec(isTaken ? [...taken].filter((id) => id !== n.id) : [...taken, n.id]);
    alt = other; kAlt = isTaken ? 'ไม่รวมวิชานี้' : 'ถ้าเรียนวิชานี้';
    gain = isTaken ? have.map((v, i) => v - other[i]) : null;
    pic = colorOf(n); ico = iconOf(n); code = n.code; th = n.th; en = n.en;
    const d = isTaken ? have.map((v, i) => v - other[i]) : other.map((v, i) => v - have[i]);
    status = gainText(d) ? `${isTaken ? 'เพิ่มทักษะ' : 'จะเพิ่มทักษะ'}: ${gainText(d)}` : '';
    if (n.kind === 'core' && !n.opt) {
      meta = `วิชาบังคับ · ${n.cr} หน่วยกิต · ${TERM[n.t]} · ที่มา มคอ.2 ${P.kind} ${P.year}`;
      hint = 'วิชาบังคับเรียนทีละภาคเรียน กดหัวคอลัมน์ภาคเรียนเพื่อเรียนหรือย้อนกลับ';
    } else {
      meta = n.kind === 'core'
        ? `วิชาในแนวทางเลือกของภาคการศึกษาสุดท้าย · ${n.cr} หน่วยกิต · ${TERM[n.t]}`
        : `วิชาเลือกเฉพาะสาขา · ${n.cr} หน่วยกิต${n.terms ? ` · ตารางสอนภาค ${n.terms}` : ''}${n.n ? ` · ผู้ลงทะเบียนรวม ${n.n} คน` : ''}${n.note ? ` · ${n.note}` : ''}`;
      hint = isTaken ? 'เลือกวิชานี้แล้ว กดอีกครั้งเพื่อยกเลิก' : 'กดอีกครั้งเพื่อเลือกวิชานี้';
      const uses = careerIds.filter((cid) => N[cid].rec.includes(n.id)).map((cid) => N[cid].label);
      if (uses.length) req = [`แนะนำสำหรับ: ${uses.join(', ')}`];
    }
  }
  $('p-pic').style.setProperty('--c', pic);
  $('p-ico').setAttribute('d', ico);
  $('p-code').textContent = code;
  $('p-th').textContent = th;
  $('p-en').textContent = en;
  $('p-meta').textContent = meta;
  $('p-status').textContent = status;
  $('p-req').replaceChildren(...req.map((t) => { const s = el('span'); s.textContent = t; return s; }));
  $('p-hint').textContent = hint;
  $('k-cur').textContent = 'ทักษะตอนนี้';
  $('k-alt').textContent = kAlt;
  $('k-alt').parentElement.style.display = alt ? '' : 'none';
  $('k-tg').textContent = S.goal ? `เกณฑ์ ${N[S.goal].label}` : '';
  $('k-tg').parentElement.style.display = goalNeed ? '' : 'none';
  $('r-tg').setAttribute('points', poly(goalNeed || AX.map(() => 0)));
  $('r-tg').style.display = goalNeed ? '' : 'none';
  $('r-alt').setAttribute('points', poly(alt || have));
  $('r-alt').style.display = alt ? '' : 'none';
  barEls.forEach((b, i) => {
    const d = gain ? gain[i] : 0;
    b.v.textContent = d > 0.05 ? `+${Math.round(d)}%` : `${Math.round(have[i])}%`;
  });
  tweenTo(have, gain, goalNeed);
}

// ---------- actions ----------
function stop() { clearInterval(S.timer); S.timer = 0; }
function setTerm(t) { S.term = Math.max(-1, Math.min(TERM.length - 1, t)); }
// clicking the last term taken drops it; any other term takes everything up to it
function pickTerm(t) { stop(); setTerm(t === S.term ? t - 1 : t); S.sel = `term:${t}`; render(); }
function toggle(id) { if (S.picked.has(id)) S.picked.delete(id); else S.picked.add(id); }
function pickTrack(r) {
  stop();
  const els = rowEl[r], allOn = els.every((id) => S.picked.has(id));
  for (const id of els) if (allOn) S.picked.delete(id); else S.picked.add(id);
  S.sel = els[0];
  render();
}
function click(id) {
  stop();
  const n = N[id];
  if (n.kind === 'career') {
    // a career picks its recommended electives; clicking it again while they are all picked drops them
    const allOn = n.rec.length && n.rec.every((e) => S.picked.has(e));
    for (const e of n.rec) if (allOn) S.picked.delete(e); else S.picked.add(e);
    S.goal = allOn ? null : id;
  } else if (pickable(id)) {
    toggle(id);                          // a second click on a picked course drops it
  }
  S.sel = id;
  render();
}
function play() {
  stop();
  if (S.term >= TERM.length - 1) setTerm(-1);
  S.sel = 'start';
  const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 900 : 650;
  S.timer = setInterval(() => {
    if (S.term >= TERM.length - 1) { stop(); render(); return; }
    setTerm(S.term + 1); S.sel = `term:${S.term}`; render();
  }, ms);
  render();
}
$('prev').addEventListener('click', () => { stop(); setTerm(S.term - 1); S.sel = S.term < 0 ? 'start' : `term:${S.term}`; render(); });
$('next').addEventListener('click', () => { stop(); setTerm(S.term + 1); S.sel = `term:${S.term}`; render(); });
$('play').addEventListener('click', () => { if (S.timer) { stop(); render(); } else play(); });
$('reset').addEventListener('click', () => { stop(); S.term = -1; S.picked.clear(); S.goal = null; S.sel = 'start'; render(); });

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
const want = params.get('career');
if (N[want]?.kind === 'career') { setTerm(TERM.length - 1); click(want); } else { render(); setTimeout(play, 900); }
