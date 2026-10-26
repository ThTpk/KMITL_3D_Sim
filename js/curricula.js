// The institute's programmes (data/programs.json, from the OAQ list of มคอ.2 documents) for the building panel and
// the search box: which faculty a building belongs to, and that faculty's programmes by level, newest first.
// Programmes whose newest version on the list is older than OLD are shown apart: they may have been replaced
// or closed (the list does not say).

const OLD = 2564;
const LEVELS = [['ตรี', 'ปริญญาตรี'], ['โท', 'ปริญญาโท'], ['เอก', 'ปริญญาเอก']];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function loadCurricula(url = 'data/programs.json') {
  const D = await fetch(url).then((r) => r.json());
  const byModel = new Map(), byFac = new Map(), facs = new Map();
  for (const f of D.faculties) { facs.set(f.id, f); byFac.set(f.id, []); for (const m of f.buildings) byModel.set(m, f); }
  for (const p of D.programs) byFac.get(p.fac)?.push(p);
  for (const list of byFac.values()) list.sort((a, b) => b.latest - a.latest || a.field.localeCompare(b.field, 'th'));
  return {
    source: D.source,
    faculties: D.faculties,
    programs: D.programs,
    faculty: (id) => facs.get(id),
    facultyOfModel: (model) => byModel.get(model),
    programsOf: (facId) => byFac.get(facId) || [],
    // the panel section for a faculty; pid marks one programme (opened and highlighted)
    html(fac, pid = null) {
      const list = byFac.get(fac.id) || [];
      const item = (p) => {
        const old = p.latest < OLD, url = [...p.versions].reverse().find((v) => v.url)?.url;
        return `<li data-pid="${esc(p.id)}" class="${p.id === pid ? 'hl' : ''}${old ? ' old' : ''}">
          <div class="pn">${esc(p.field)}</div>
          <div class="pm">${esc(p.degree)}${p.intl ? ' <span class="tag">นานาชาติ</span>' : ''} <span class="yr">ฉบับ พ.ศ. ${p.latest}</span></div>
          <div class="pl">${url ? `<a target="_blank" rel="noopener" href="${esc(url)}">มคอ.2</a>` : ''}${p.journey ? `<a class="go" href="skilltree.html?p=${esc(p.journey)}">Skill Tree ▶</a>` : ''}</div>
        </li>`;
      };
      const sel = list.find((p) => p.id === pid);
      const levels = LEVELS.map(([lv, th]) => {
        const all = list.filter((p) => p.level === lv);
        if (!all.length) return '';
        const cur = all.filter((p) => p.latest >= OLD), old = all.filter((p) => p.latest < OLD);
        const open = sel ? sel.level === lv : lv === 'ตรี';
        return `<details${open ? ' open' : ''}><summary>${th} <small>${cur.length} หลักสูตร</small></summary>
          <ul>${cur.map(item).join('')}</ul>
          ${old.length ? `<details class="olds"${sel && sel.latest < OLD && sel.level === lv ? ' open' : ''}><summary><small>ฉบับเก่ากว่า พ.ศ. ${OLD} อีก ${old.length} หลักสูตร (อาจปรับเปลี่ยนหรือปิดแล้ว)</small></summary><ul>${old.map(item).join('')}</ul></details>` : ''}
        </details>`;
      }).join('');
      return `<section class="progs">
        <h3>หลักสูตรของ${esc(fac.th)}</h3>
        <div class="en">${esc(fac.en)}</div>
        ${levels || '<p class="note">ไม่มีหลักสูตรในรายการ</p>'}
        <div class="note">ที่มา: <a target="_blank" rel="noopener" href="${esc(D.source.url)}">${esc(D.source.title)}</a> (ดึงข้อมูล ${esc(D.source.fetched)})</div>
      </section>`;
    },
  };
}
