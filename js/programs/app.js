// Programme page: a student walks term by term through one curriculum (data/programs/<id>.json, taken from the
// programme's มคอ.2). Each course group is an icon round the student that grows with the required courses taken;
// a PLO radar chart grows alongside; the student graduates in the red KMITL gown, then stands small at the foot of
// a fan of paths to the careers the curriculum lists (and to further study) and walks down whichever is picked.
import { createStage } from './stage.js';
import { createRadar } from './radar.js';
import { GROUP_ICONS, CAREER_ICONS, iconURL, FONT } from './icons.js';

const KINDS = {
  math: 'คณิต-วิทยาศาสตร์', code: 'ซอฟต์แวร์', hw: 'ฮาร์ดแวร์', net: 'เครือข่าย-ระบบ', sec: 'ความปลอดภัยไซเบอร์', ai: 'AI และข้อมูล',
  soc: 'สังคม-ความยั่งยืน', lang: 'ภาษา-การสื่อสาร', team: 'ทำงานเป็นทีม', proj: 'โครงงาน-ฝึกงาน', ge: 'ศึกษาทั่วไป-เลือกเสรี',
};
const SLOT_KIND = { ge: 'ge', free: 'ge', lang: 'lang' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (id) => document.getElementById(id);
const icon = (kind) => `<img class="gi" src="${iconURL(...GROUP_ICONS[kind])}" alt="">`;

const id = new URLSearchParams(location.search).get('p') || 'cpe-2569';
const [D] = await Promise.all([fetch(`data/programs/${id}.json`).then((r) => r.json()), document.fonts.load(`600 40px ${FONT}`).catch(() => {})]);
const STUDY = { id: 'study', name: 'เรียนต่อ ป.โท / ป.เอก', en: 'Graduate study', desc: '', groups: [] };
const CAREERS = [...D.careers, ...(D.further ? [STUDY] : [])];
const stage = createStage($('stage'));
stage.setCareers(CAREERS);
stage.onPick((cid) => pickCareer(cid));
const radar = createRadar($('radar'), D.plo, (p) => { $('plo-tip').textContent = p ? `PLO ${p.n} ${p.text}` : 'ชี้ที่ชื่อ PLO เพื่ออ่านผลลัพธ์การเรียนรู้เต็ม'; });

const S = { track: 'academic', step: 0, picks: {}, career: null, playing: null };
try { Object.assign(S, JSON.parse(localStorage.getItem('prog:' + id)) || {}); } catch {}
S.playing = null; S.career = null;
const save = () => { try { localStorage.setItem('prog:' + id, JSON.stringify({ track: S.track, picks: S.picks, step: S.step })); } catch {} };

const terms = () => [...D.plan, ...D.tracks[S.track].terms];
const steps = () => [...terms().map((t, i) => ({ type: 'term', t, i })), { type: 'grad' }, { type: 'career' }];
const slotKey = (ti, ii) => `${ti >= D.plan.length ? S.track + ':' : ''}${ti}-${ii}`;
// resolve an item to a course record (or a slot with no course chosen / no course list); req = a required course
function resolve(item, ti, ii) {
  if (typeof item === 'string') return { ...D.courses[item], req: true };
  const pick = S.picks[slotKey(ti, ii)];
  if (item.slot === 'elective' && pick && D.courses[pick]) return { ...D.courses[pick], slotName: item.name, slot: item.slot, req: false };
  return { code: '', name: item.name, cr: item.cr, plo: [], kind: SLOT_KIND[item.slot] || 'ge', slot: item.slot, empty: item.slot === 'elective', req: false };
}
function takenUpTo(n) { // courses of terms 0..n (inclusive)
  const out = [];
  terms().slice(0, n + 1).forEach((t, ti) => t.items.forEach((it, ii) => out.push(resolve(it, ti, ii))));
  return out;
}
function groupStats(list) {
  const s = {};
  for (const x of list) { if (x.empty) continue; const g = (s[x.kind] ||= { req: 0, el: 0 }); x.req ? g.req++ : g.el++; }
  return s;
}
const ploSums = (list) => D.plo.map((p) => list.reduce((a, x) => a + (x.plo.includes(p.n) ? Math.max(1, x.cr) : 0), 0));

// ---------- timeline ----------
function renderTimeline() {
  const st = steps();
  $('timeline').innerHTML = st.map((s, i) => {
    const lab = s.type === 'term' ? (s.t.t === 3 ? `${s.t.y}/ร้อน` : `${s.t.y}/${s.t.t}`) : s.type === 'grad' ? 'รับปริญญา' : 'อาชีพ';
    const title = s.type === 'term' ? s.t.label : lab;
    return `<button class="tl ${i === S.step ? 'on' : ''} ${i < S.step ? 'done' : ''} ${s.type !== 'term' ? 'wide' : ''}" data-i="${i}" title="${esc(title)}">${esc(lab)}</button>`;
  }).join('');
  $('prev').disabled = S.step === 0; $('next').disabled = S.step === st.length - 1;
  const on = $('timeline').querySelector('.on'), tl = $('timeline');   // keep the current step in view on narrow screens
  if (on) tl.scrollLeft = on.offsetLeft - tl.offsetLeft - (tl.clientWidth - on.offsetWidth) / 2;
}
$('timeline').onclick = (e) => { const b = e.target.closest('.tl'); if (b) go(+b.dataset.i); };
$('prev').onclick = () => go(S.step - 1);
$('next').onclick = () => go(S.step + 1);
$('play').onclick = () => {
  if (S.playing) { clearInterval(S.playing); S.playing = null; $('play').textContent = '▶ เล่นอัตโนมัติ'; return; }
  if (S.step >= steps().length - 1) go(0);
  $('play').textContent = '❚❚ หยุด';
  S.playing = setInterval(() => { if (S.step >= steps().length - 2) { clearInterval(S.playing); S.playing = null; $('play').textContent = '▶ เล่นอัตโนมัติ'; } go(S.step + 1); }, 3200);
};
addEventListener('keydown', (e) => { if (e.target.closest('select,input')) return; if (e.key === 'ArrowRight') go(S.step + 1); if (e.key === 'ArrowLeft') go(S.step - 1); });

// ---------- step ----------
let prevStats = {};
function go(i, quiet) {
  const st = steps(); i = Math.max(0, Math.min(st.length - 1, i));
  S.step = i; save();
  const s = st[i], lastTerm = terms().length - 1;
  const taken = takenUpTo(s.type === 'term' ? s.i : lastTerm);
  const stats = groupStats(taken);
  const grew = Object.keys(stats).filter((k) => stats[k].req + stats[k].el > ((prevStats[k]?.req || 0) + (prevStats[k]?.el || 0)));
  stage.setGroups(stats, quiet || s.type !== 'term' ? [] : grew, KINDS);
  if (s.type === 'term') stage.setMode('study');
  else if (s.type === 'grad') stage.setMode('grad');
  else stage.setMode('careers', { career: S.career });
  if (!quiet && s.type === 'term' && grew.length) toast(grew.slice(0, 3).map((k) => KINDS[k]).join(' · ') + (grew.length > 3 ? ` และอีก ${grew.length - 3} กลุ่ม` : '') + ' โตขึ้น');
  prevStats = stats;
  radar.set(ploSums(taken), ploSums(takenUpTo(lastTerm)));
  const credits = taken.reduce((a, x) => a + x.cr, 0);
  $('progress').textContent = `สะสม ${credits} / ${D.credits} หน่วยกิต`;
  renderTimeline(); renderInventory(stats);
  $('inventory').hidden = s.type === 'career';
  if (s.type === 'term') renderTerm(s);
  else if (s.type === 'grad') renderGrad();
  else renderCareers();
}

function ploChips(list) { return list.length ? list.map((n) => `<span class="plo" title="${esc(D.plo[n - 1].text)}">PLO ${n}</span>`).join('') : '<span class="plo none">ไม่อยู่ในตาราง Curriculum Mapping</span>'; }
function renderTerm(s) {
  const t = s.t, ti = s.i;
  const list = t.items.map((it, ii) => resolve(it, ti, ii));
  const cr = list.reduce((a, x) => a + x.cr, 0);
  let h = `<h2>${esc(t.label)} <small>${cr} หน่วยกิต</small></h2>`;
  h += `<p class="hint">แต่ละวิชาเติมไอคอนกลุ่มวิชาของมัน ไอคอนรอบตัวนักศึกษาจะใหญ่ขึ้นตามจำนวนวิชาบังคับที่เรียนแล้ว กดที่วิชาเพื่ออ่านคำอธิบายรายวิชา</p><div class="cards">`;
  list.forEach((c, ii) => {
    const it = t.items[ii];
    h += `<details class="card${c.empty ? ' empty' : ''}"><summary>${icon(c.kind)}<span class="nm"><b>${esc(c.name)}</b>`;
    h += `<small>${c.code ? esc(c.code) + ' · ' : ''}${esc(c.en || (c.slot ? c.slotName || '' : ''))}</small></span><span class="cr">${c.cr} นก.<em>${c.req ? 'บังคับ' : 'เลือก'}</em></span></summary>`;
    h += `<div class="body"><div class="tags"><span class="kind">${esc(KINDS[c.kind])}</span>${ploChips(c.plo)}</div>`;
    if (typeof it !== 'string' && it.slot === 'elective') {
      const cur = S.picks[slotKey(ti, ii)] || '';
      h += `<label class="pick">${esc(it.name)}: <select data-k="${slotKey(ti, ii)}"><option value="">— เลือกวิชา —</option>`;
      for (const g of D.groups) h += `<optgroup label="${esc(g.name)}">${g.courses.map((cc) => `<option value="${cc}" ${cc === cur ? 'selected' : ''}>${cc} ${esc(D.courses[cc].name)}</option>`).join('')}</optgroup>`;
      h += `</select></label>`;
    }
    if (c.desc) h += `<p>${esc(c.desc)}</p>`;
    else if (c.slot === 'ge' || c.slot === 'lang') h += `<p class="hint">เลือกเรียนจากรายวิชาที่สถาบันเปิดสอนในหมวดวิชาศึกษาทั่วไป</p>`;
    else if (c.slot === 'free') h += `<p class="hint">เลือกเรียนวิชาใดก็ได้ที่สถาบันเปิดสอน</p>`;
    else if (!c.empty) h += `<p class="hint">ไม่มีคำอธิบายรายวิชานี้ในเล่ม มคอ.2 ของหลักสูตร</p>`;
    h += `</div></details>`;
  });
  h += `</div>`;
  const yearEnd = ti === terms().length - 1 || terms()[ti + 1].y !== t.y;
  if (yearEnd && D.years[t.y]) h += `<div class="outcomes"><h3>เมื่อจบชั้นปีที่ ${t.y} นักศึกษาจะสามารถ</h3><ul>${D.years[t.y].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  $('panel-body').innerHTML = h;
  $('panel-body').querySelectorAll('select[data-k]').forEach((sel) => (sel.onchange = () => { S.picks[sel.dataset.k] = sel.value; go(S.step, true); }));
}
function renderGrad() {
  let h = `<h2>สำเร็จการศึกษา</h2><p class="lead">${esc(D.name)} · ${D.credits} หน่วยกิต</p>`;
  h += `<p class="hint">${esc(D.philosophy)}</p><div class="outcomes"><h3>ผลลัพธ์การเรียนรู้ระดับหลักสูตร (PLO)</h3><ol>${D.plo.map((p) => `<li><b>${esc(p.short)}</b> ${esc(p.text)}</li>`).join('')}</ol></div>`;
  h += `<button class="primary" id="to-career">ไปดูเส้นทางอาชีพ →</button>`;
  $('panel-body').innerHTML = h; $('to-career').onclick = () => go(S.step + 1);
}
function chosenGroups() {
  const set = new Set();
  for (const [k, code] of Object.entries(S.picks)) {
    if (!code || (k.includes(':') && !k.startsWith(S.track + ':'))) continue;
    for (const g of D.groups) if (g.courses.includes(code)) set.add(g.id);
  }
  return set;
}
function pickCareer(cid) {
  if (steps()[S.step].type !== 'career') go(steps().length - 1, true);
  S.career = cid; stage.selectCareer(cid); renderCareers();
}
function renderCareers() {
  const groups = chosenGroups();
  let h = `<h2>จบแล้วไปทางไหนได้บ้าง</h2><p class="hint">ตำแหน่งงานตามเล่ม มคอ.2 และหลักสูตรเรียนต่อในคณะ กดที่ทางบนเวทีหรือที่การ์ด แล้วนักศึกษาจะเดินไปตามทางนั้น</p><div class="careers">`;
  for (const c of CAREERS) {
    const hit = c.groups.some((g) => groups.has(g));
    h += `<button class="career ${S.career === c.id ? 'on' : ''}" data-id="${c.id}"><img class="gi" src="${iconURL(...CAREER_ICONS[c.id])}" alt=""><span><b>${esc(c.name)}</b><small>${esc(c.en)}</small>${hit ? `<span class="match">ตรงกับวิชาเลือกที่เลือก</span>` : ''}</span></button>`;
  }
  h += `</div>`;
  const c = CAREERS.find((x) => x.id === S.career);
  if (c && c.id === 'study') {
    h += `<div class="outcomes"><h3>${esc(c.name)}</h3><p class="hint">${esc(D.further.note)}</p><ul class="further">`;
    for (const p of D.further.programs) h += `<li><span class="lvl">${esc(p.level)}</span> <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a> <small>${esc(p.version)}</small></li>`;
    h += `</ul></div>`;
  } else if (c) {
    const rel = c.groups.map((g) => D.groups.find((x) => x.id === g).name);
    h += `<div class="outcomes"><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p>`;
    h += rel.length ? `<p class="hint">กลุ่มวิชาเลือกที่เกี่ยวข้อง: ${rel.map(esc).join(', ')} (เราจับคู่จากชื่อกลุ่มวิชา เล่มหลักสูตรไม่ได้ระบุไว้)</p>` : `<p class="hint">ใช้ความรู้จากทุกกลุ่มวิชาของหลักสูตร</p>`;
    h += `</div>`;
  }
  if (S.career) h += `<button class="secondary" id="back-start">กลับจุดเริ่มต้น</button>`;
  $('panel-body').innerHTML = h;
  $('panel-body').querySelectorAll('.career').forEach((b) => (b.onclick = () => pickCareer(b.dataset.id)));
  $('back-start')?.addEventListener('click', () => { S.career = null; stage.selectCareer(null); renderCareers(); });
}
function renderInventory(stats) {
  $('inventory').innerHTML = Object.entries(KINDS).map(([k, lab]) => {
    const s = stats[k];
    return `<li class="${s ? '' : 'off'}">${icon(k)}<span>${esc(lab)}</span><span class="lv">${s ? `${s.req}${s.el ? `+${s.el}` : ''}` : '—'}</span></li>`;
  }).join('');
}
let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = '+ ' + msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

// ---------- header ----------
$('prog-name').textContent = D.name;
$('prog-sub').textContent = `${D.version} · ${D.dept} ${D.faculty}`;
$('source').href = D.source.url; $('source').title = D.source.title;
$('track').innerHTML = Object.entries(D.tracks).map(([k, t]) => `<option value="${k}" ${k === S.track ? 'selected' : ''}>ปี 4: ${esc(t.name)}</option>`).join('');
$('track').onchange = (e) => { S.track = e.target.value; go(Math.min(S.step, steps().length - 1), true); };
$('gender').onclick = () => { const f = $('gender').dataset.f !== '1'; $('gender').dataset.f = f ? '1' : '0'; $('gender').textContent = f ? 'นักศึกษาหญิง' : 'นักศึกษาชาย'; stage.setFemale(f); };
document.title = `${D.name} | KMITL 3D`;
go(S.step || 0, true);
