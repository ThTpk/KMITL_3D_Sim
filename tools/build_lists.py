"""Write building_list.md (every named building) and modeled.md (buildings surveyed to build a model).

Reads data/kmitl_data.js (OSM + overrides already merged) and the header comments of js/models/*.js.
Run again after adding a model or changing overrides: python tools/build_lists.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TYPE_TH = {
    'university': 'อาคารมหาวิทยาลัย', 'school': 'อาคารเรียน', 'office': 'สำนักงาน', 'dormitory': 'หอพัก',
    'apartments': 'อพาร์ตเมนต์/หอพัก', 'residential': 'ที่พักอาศัย', 'house': 'บ้าน', 'terrace': 'ทาวน์เฮาส์',
    'retail': 'ร้านค้า', 'commercial': 'อาคารพาณิชย์', 'temple': 'วัด/ศาสนสถาน', 'roof': 'หลังคา/โรงจอดรถ',
    'garage': 'โรงรถ', 'carport': 'ที่จอดรถมีหลังคา', 'shed': 'โรงเก็บของ', 'industrial': 'อาคารอุตสาหกรรม',
    'service': 'อาคารบริการ', 'sports_centre': 'ศูนย์กีฬา', 'stadium': 'สนามกีฬา', 'train_station': 'สถานีรถไฟ',
    'construction': 'กำลังก่อสร้าง', 'yes': 'อาคาร',
}


def load_data():
    s = (ROOT / 'data/kmitl_data.js').read_text(encoding='utf-8')
    return json.loads(s[s.index('{'):s.rindex('}') + 1])


def in_ring(x, z, ring):
    inside = False
    for i in range(len(ring)):
        xi, zi = ring[i]
        xj, zj = ring[i - 1]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            inside = not inside
    return inside


def name_of(b):
    return b.get('n') or b.get('th') or b.get('en')


def cell(v):
    return '' if v is None else str(v).replace('|', '/').replace('\n', ' ')


def fmt_num(v):
    return '' if v is None else (str(int(v)) if float(v).is_integer() else str(v))


def model_header(key):
    """Leading comment block of js/models/<key>.js split into title, survey notes and form notes."""
    path = ROOT / 'js/models' / f'{key}.js'
    lines = []
    for ln in path.read_text(encoding='utf-8').splitlines():
        if not ln.startswith('//'):
            break
        lines.append(ln[2:].strip())
    text = '\n'.join(lines)
    survey = re.search(r'(Surveyed.*?)(?:Photos were only looked at|\n\n|$)', text, re.S)
    survey = ' '.join(survey.group(1).split()) if survey else ''
    form = ''
    if 'x = east' in text:
        part = text.split('x = east', 1)[1].split('\n\n')[0].split('\n')[1:]
        form = ' '.join(ln.strip() for ln in part)
    return survey, form


def main():
    d = load_data()
    rings = [c['o'] for c in d['campus']]
    blds = d['buildings']
    for b in blds:
        b['_kmitl'] = bool(b.get('model')) or any(in_ring(b['c'][0], b['c'][1], r) for r in rings)
    by_id = {b['id']: b for b in blds}

    def status(b):
        if b.get('model'):
            return f"โมเดลเฉพาะ (`{b['model']}`)"
        if b.get('hide'):
            return 'ส่วนของโมเดลเฉพาะ'
        if b.get('sv') or b.get('src'):
            return 'สำรวจ (ค่าใน overrides)'
        return ''

    def table(rows):
        out = ['| # | ชื่ออาคาร | ชื่อภาษาอังกฤษ | ประเภท | ชั้น | OSM id | สถานะ |', '|---|---|---|---|---|---|---|']
        for i, b in enumerate(rows, 1):
            out.append(f"| {i} | {cell(name_of(b))} | {cell(b.get('en') if b.get('en') != name_of(b) else '')} | "
                       f"{TYPE_TH.get(b['bt'], b['bt'])} | {fmt_num(b.get('lv'))} | {b['id']} | {status(b)} |")
        return out

    named = sorted((b for b in blds if name_of(b)), key=lambda b: name_of(b))
    inside = [b for b in named if b['_kmitl']]
    outside = [b for b in named if not b['_kmitl']]
    unnamed_in = sum(1 for b in blds if b['_kmitl'] and not name_of(b))
    unnamed_out = sum(1 for b in blds if not b['_kmitl'] and not name_of(b))

    md = [
        '# รายชื่ออาคารทั้งหมด',
        '',
        f"สร้างจาก `data/kmitl_data.js` (OpenStreetMap ณ {d['osm_timestamp'][:10]} รวมค่าจาก `data/overrides.json`) "
        'ด้วย `python tools/build_lists.py` — แก้ข้อมูลต้นทางแล้วรันใหม่ อย่าแก้ไฟล์นี้ด้วยมือ',
        '',
        f"- อาคารทั้งหมดในข้อมูล: {len(blds)} หลัง (มีชื่อ {len(named)} หลัง)",
        f"- อาคารของ สจล. (ภายในเขตสถาบันหรือมีโมเดลเฉพาะ — แสดงเป็น 3 มิติในเว็บ): "
        f"{len(inside) + unnamed_in} หลัง มีชื่อ {len(inside)} หลัง ไม่มีชื่อ {unnamed_in} หลัง",
        f"- อาคารภายนอก สจล. (ไม่แสดงเป็น 3 มิติ): {len(outside) + unnamed_out} หลัง "
        f"มีชื่อ {len(outside)} หลัง ไม่มีชื่อ {unnamed_out} หลัง",
        f"- โมเดลเฉพาะ: {sum(1 for b in blds if b.get('model'))} หลัง ดูรายละเอียดการสำรวจใน [modeled.md](modeled.md)",
        '',
        'สถานะ: **โมเดลเฉพาะ** = สร้างด้วยมือใน `js/models/` · **สำรวจ** = บันทึกสี/ชั้น/รูปแบบหน้าอาคารจากภาพ '
        'แต่ใช้รูปทรงอัตโนมัติจาก OSM · **ส่วนของโมเดลเฉพาะ** = รูปทรง OSM ที่ไม่วาด เพราะรวมอยู่ในโมเดลเฉพาะแล้ว',
        '',
        f'## อาคารของ สจล. ({len(inside)} หลังที่มีชื่อ)',
        '',
        *table(inside),
        '',
        f'## อาคารภายนอก สจล. ({len(outside)} หลังที่มีชื่อ)',
        '',
        *table(outside),
        '',
    ]
    (ROOT / 'building_list.md').write_text('\n'.join(md), encoding='utf-8')

    ov = json.loads((ROOT / 'data/overrides.json').read_text(encoding='utf-8'))
    models = [b for b in blds if b.get('model')]
    hidden = {}
    for k, v in ov.items():
        if not k.startswith('_') and v.get('hide'):
            hidden.setdefault('x', []).append(int(k))

    md = [
        '# อาคารที่สำรวจเพื่อสร้างโมเดล',
        '',
        'สร้างจาก `data/overrides.json`, `data/kmitl_data.js` และคำอธิบายหัวไฟล์ `js/models/*.js` '
        'ด้วย `python tools/build_lists.py` — แก้ข้อมูลต้นทางแล้วรันใหม่ อย่าแก้ไฟล์นี้ด้วยมือ',
        '',
        f"สำรวจเมื่อ {ov.get('_surveyed', '')} ถึงปัจจุบัน ภาพจาก Google Street View / Google Maps / ภาพดาวเทียม "
        'ใช้เป็นข้อมูลอ้างอิงในการขึ้นรูปเท่านั้น ไม่ได้แสดงในหน้าเว็บ รูปทรงทั้งหมดสร้างด้วยโค้ด',
        '',
        f'## สรุปโมเดลเฉพาะ ({len(models)} หลัง)',
        '',
        '| # | อาคาร | ไฟล์โมเดล | ชั้น | สูง (ม.) | OSM id |',
        '|---|---|---|---|---|---|',
    ]
    for i, b in enumerate(models, 1):
        md.append(f"| {i} | [{cell(name_of(b))}](#{b['model']}) | `js/models/{b['model']}.js` | "
                  f"{fmt_num(b.get('lv'))} | {fmt_num(b.get('ht'))} | {b['id']} |")
    md.append('')
    hid = [by_id[i] for i in hidden.get('x', []) if i in by_id]
    if hid:
        md += ['รูปทรง OSM ที่ซ่อนไว้เพราะเป็นส่วนของโมเดลเฉพาะ (`hide`): ' + ', '.join(str(b['id']) for b in hid), '']

    for b in models:
        survey, form = model_header(b['model'])
        md += [f"## {name_of(b)} <a id=\"{b['model']}\"></a>", '']
        if b.get('en') and b.get('en') != name_of(b):
            md += [f"*{b['en']}*", '']
        md += [
            f"- OSM id: {b['id']} · ไฟล์: `js/models/{b['model']}.js` · ชั้น: {fmt_num(b.get('lv'))} · "
            f"สูง: {fmt_num(b.get('ht'))} ม.",
            '- แหล่งภาพอ้างอิง: ' + re.sub(r'\s*\(โมเดลเฉพาะ[^)]*\)', '', b.get('src', '')),
        ]
        if survey:
            md.append(f'- การสำรวจ (จากหัวไฟล์โมเดล): {survey}')
        if b.get('sv'):
            md.append('- ลักษณะอาคารที่บันทึก: ' + ' / '.join(p.strip() for p in b['sv'].split('|')))
        if form:
            md.append(f'- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): {form}')
        md.append('')

    surveyed = [b for b in blds if not b.get('model') and not b.get('hide') and (b.get('sv') or b.get('src'))]
    if surveyed:
        md += [
            f'## อาคารที่สำรวจแต่ยังไม่มีโมเดลเฉพาะ ({len(surveyed)} หลัง)',
            '',
            'บันทึกสี จำนวนชั้น รูปหลังคา และรูปแบบหน้าอาคารใน `data/overrides.json` แต่ใช้รูปทรงอัตโนมัติจาก OSM',
            '',
            '| # | อาคาร | ชั้น | แหล่งภาพ | ลักษณะที่บันทึก | OSM id |',
            '|---|---|---|---|---|---|',
        ]
        for i, b in enumerate(surveyed, 1):
            md.append(f"| {i} | {cell(name_of(b) or ('สนาม ' + b['pitch'] if b.get('pitch') else '(ไม่มีชื่อ)'))} | "
                      f"{fmt_num(b.get('lv'))} | {cell(b.get('src') or 'Street View')} | {cell(b.get('sv'))} | {b['id']} |")
        md.append('')
    (ROOT / 'modeled.md').write_text('\n'.join(md), encoding='utf-8')
    print(f'building_list.md: {len(named)} named ({len(inside)} KMITL); modeled.md: {len(models)} models, '
          f'{len(surveyed)} surveyed only')


if __name__ == '__main__':
    main()
