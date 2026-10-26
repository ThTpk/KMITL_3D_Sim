// CE Skill Tree: B.Eng. Computer Engineering 2569 drawn as a game skill tree. Freshy on the left, one line per
// skill area, required courses placed by the study plan (มคอ.2), electives taken from the registrar's timetables
// (2568/1–2569/1), careers from the มคอ.2 at the right. Every course counts as taken; clicking one shows what it
// adds to the 8-skill radar, and Play walks a career path term by term. Skill points per course are our estimate.

const SVGNS = 'http://www.w3.org/2000/svg';
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
const ROWS = [
  { name: 'คณิตศาสตร์', en: 'MATHEMATICS', c: '#f5a524', ic: 'math' },
  { name: 'ปัญญาประดิษฐ์', en: 'MACHINE INTELLIGENCE', c: '#8b5cf6', ic: 'ai' },
  { name: 'วิศวกรรมข้อมูล', en: 'DATA', c: '#0ea5e9', ic: 'data' },
  { name: 'การพัฒนาซอฟต์แวร์', en: 'SOFTWARE', c: '#22c55e', ic: 'code' },
  { name: 'เครือข่ายและระบบ', en: 'NETWORK & SYSTEMS', c: '#14b8a6', ic: 'net' },
  { name: 'ความปลอดภัยไซเบอร์', en: 'CYBERSECURITY', c: '#ef4444', ic: 'sec' },
  { name: 'ฮาร์ดแวร์และสถาปัตยกรรม', en: 'HARDWARE', c: '#ec4899', ic: 'hw' },
  { name: 'โครงงานและการฝึกงาน', en: 'PROJECTS', c: '#ff6b00', ic: 'proj' },
  { name: 'ภาษาและสังคม', en: 'COMMUNICATION', c: '#6366f1', ic: 'ge' },
];
const TERM = ['ปี 1 ภาค 1', 'ปี 1 ภาค 2', 'ปี 2 ภาค 1', 'ปี 2 ภาค 2', 'ปี 3 ภาค 1', 'ปี 3 ภาค 2', 'ปี 3 ภาคฤดูร้อน', 'ปี 4'];
const RY = (r) => 170 + r * 92;
const TX = (t, s) => (t === 6 ? 1006 : t === 7 ? 1090 + s * 60 : 190 + t * 136 + s * 62);

// [code, row, term, slot, abbr, th, en, credits, skill points, optional]
const CORE = [
  ['01076140', 0, 0, 0, 'CAL 1', 'แคลคูลัส 1', 'Calculus 1', 3, 'math3'],
  ['01076143', 0, 1, 0, 'DISC', 'โครงสร้างแบบดิสครีต', 'Discrete Structures', 3, 'math2 algo2'],
  ['01076141', 0, 1, 1, 'CAL 2', 'แคลคูลัส 2', 'Calculus 2', 3, 'math3'],
  ['01076142', 0, 2, 0, 'LINALG', 'พีชคณิตเชิงเส้น', 'Linear Algebra', 3, 'math3 ai1'],
  ['01076253', 0, 3, 0, 'STAT', 'ความน่าจะเป็นและสถิติ', 'Probability and Statistics', 3, 'math3 ai2'],
  ['01076121', 0, 5, 0, 'TOC', 'ทฤษฎีการคำนวณ', 'Theory of Computation', 3, 'math2 algo3'],
  ['01076641', 1, 4, 0, 'ML/DL', 'การเรียนรู้ของเครื่องและการเรียนรู้เชิงลึกเบื้องต้น', 'Introduction to Machine Learning and Deep Learning', 3, 'ai4 math1'],
  ['01076002', 3, 0, 0, 'PROG', 'พื้นฐานการเขียนโปรแกรมคอมพิวเตอร์', 'Programming Fundamental', 3, 'sw2 algo2'],
  ['01076045', 3, 1, 0, 'OOP', 'การเขียนโปรแกรมเชิงวัตถุ', 'Object Oriented Programming', 3, 'sw3 algo1'],
  ['01076046', 3, 2, 0, 'DSA', 'โครงสร้างข้อมูลและอัลกอริทึม', 'Data Structures and Algorithms', 4, 'algo4 sw1'],
  ['01076263', 3, 2, 1, 'DB', 'ระบบฐานข้อมูล', 'Database Systems', 3, 'sw3 ai1'],
  ['01076047', 3, 3, 0, 'WEB', 'การพัฒนาโปรแกรมบนเว็บ', 'Web Application Development', 4, 'sw4'],
  ['01076048', 3, 3, 1, 'SW DES', 'การออกแบบซอฟต์แวร์', 'Software Design', 3, 'sw3 soft1'],
  ['01076034', 3, 4, 0, 'SW PROC', 'หลักการของกระบวนการพัฒนาซอฟต์แวร์', 'Principles of Software Development Process', 3, 'sw3 soft2'],
  ['01076033', 4, 1, 0, 'COMM', 'พื้นฐานของระบบการสื่อสาร', 'Fundamentals of Communication Systems', 3, 'net3 math1'],
  ['01076054', 4, 2, 0, 'NET', 'เครือข่ายคอมพิวเตอร์', 'Computer Networks', 4, 'net4'],
  ['01076055', 4, 3, 0, 'INET', 'มาตรฐานและเทคโนโลยีเครือข่าย', 'Internetworking Standards and Technologies', 4, 'net4'],
  ['01076011', 4, 4, 0, 'OS', 'ระบบปฏิบัติการ', 'Operating Systems', 3, 'net2 hw1 sw1'],
  ['01076118', 4, 4, 1, 'SYS ADM', 'การดูแลแพลทฟอร์มระบบ', 'System Platform Administration', 3, 'net3 sec1'],
  ['01076056', 5, 5, 0, 'CYBER', 'ความรู้เบื้องต้นเกี่ยวกับความมั่นคงปลอดภัยไซเบอร์', 'Introduction to Cyber Security', 3, 'sec3 net1'],
  ['01006020', 6, 0, 0, 'PHY 1', 'ฟิสิกส์ทั่วไป 1', 'General Physics 1', 3, 'math2 hw1'],
  ['01076003', 6, 1, 0, 'CIRCUIT', 'วงจรไฟฟ้าและอิเล็กทรอนิกส์', 'Circuits and Electronics', 4, 'hw4'],
  ['01076006', 6, 2, 0, 'DIGITAL', 'พื้นฐานระบบดิจิตอล', 'Digital System Fundamentals', 4, 'hw4'],
  ['01076114', 6, 3, 0, 'COMP ARCH', 'องค์ประกอบและสถาปัตยกรรมคอมพิวเตอร์', 'Computer Organization and Architecture', 3, 'hw4'],
  ['01076049', 6, 4, 0, 'MCU', 'การประยุกต์และพัฒนาไมโครคอนโทรลเลอร์', 'Microcontroller Application and Development', 4, 'hw3 sw1'],
  ['01076020', 7, 0, 0, 'INTRO CE', 'วิศวกรรมคอมพิวเตอร์เบื้องต้น', 'Introduction to Computer Engineering', 3, 'soft1 sw1 hw1'],
  ['90642036', 7, 0, 1, 'PRE-ENG', 'เตรียมความพร้อมสำหรับวิศวกร', 'Pre-Activities for Engineers', 1, 'soft2'],
  ['90641004', 7, 1, 0, 'TEAM 1', 'โครงงานกลุ่ม 1', 'Team-Project 1', 1, 'soft2'],
  ['90641005', 7, 3, 0, 'TEAM 2', 'โครงงานกลุ่ม 2', 'Team-Project 2', 1, 'soft2'],
  ['01076016', 7, 4, 0, 'PREP', 'การเตรียมโครงงานวิศวกรรมคอมพิวเตอร์', 'Computer Engineering Project Preparation', 2, 'soft2 sw1'],
  ['90641006', 7, 5, 0, 'TEAM 3', 'โครงงานกลุ่ม 3', 'Team-Project 3', 1, 'soft2'],
  ['01076311', 7, 5, 1, 'PROJ 1', 'โครงงาน 1', 'Project 1', 3, 'soft2 sw2'],
  ['01006004', 7, 6, 0, 'INTERN', 'การฝึกงานอุตสาหกรรม', 'Industrial Training', 0, 'soft3 sw1'],
  ['01076312', 7, 7, 0, 'PROJ 2', 'โครงงาน 2', 'Project 2', 3, 'soft2 sw2'],
  ['01006029', 7, 7, 1, 'CO-OP', 'สหกิจศึกษา', 'Co-operative Education', 6, 'soft3 sw2', true],
  ['90641007', 8, 0, 0, 'DIGI CIT', 'พลเมืองดิจิทัล', 'Digital Citizen', 3, 'soft2 sec1'],
  ['90642118', 8, 1, 0, 'BIZ APP', 'โปรแกรมคอมพิวเตอร์ประยุกต์ทางธุรกิจ', 'Application Software for Business', 2, 'soft1 sw1'],
  ['90641009', 8, 2, 0, 'ENG 1', 'ทักษะการสื่อสารภาษาอังกฤษระหว่างวัฒนธรรม 1', 'Intercultural Communication Skills in English 1', 3, 'soft3'],
  ['90641010', 8, 3, 0, 'ENG 2', 'ทักษะการสื่อสารภาษาอังกฤษระหว่างวัฒนธรรม 2', 'Intercultural Communication Skills in English 2', 3, 'soft3'],
  ['01076038', 8, 5, 0, 'SOCIETY', 'วิศวกรรมคอมพิวเตอร์กับสังคมและความยั่งยืน', 'Computer Engineering, Society and Sustainability', 3, 'soft3'],
];

// [code, row, index, abbr, th, en, credits, points, timetable terms, enrolled, note]
const ELECTIVES = [
  ['01076582', 1, 0, 'AI', 'ปัญญาประดิษฐ์', 'Artificial Intelligence', 3, 'ai3 algo1', '2568/2, 2569/1', 39, ''],
  ['01076533', 1, 1, 'DEEP L', 'การเรียนรู้เชิงลึก', 'Deep Learning', 3, 'ai4 math1', '2568/2', 12, 'หลักสูตร 2569 ใช้รหัส 01076642'],
  ['01076567', 1, 2, 'IMG PROC', 'การประมวลผลภาพ', 'Image Processing', 3, 'ai3 math1', '2568/1, 2568/2, 2569/1', 28, 'หลักสูตร 2569 ใช้รหัส 01076643'],
  ['01076646', 1, 3, 'LLM', 'แบบจำลองภาษาขนาดใหญ่', 'Large Language Model', 3, 'ai4 sw1', '2568/1, 2568/2, 2569/1', 10, ''],
  ['01076645', 1, 4, 'EDGE AI', 'ปัญญาประดิษฐ์สำหรับการประมวลผลแบบ Edge Computing', 'Artificial Intelligence for Edge Computing', 3, 'ai3 hw1', '2568/1, 2569/1', 4, 'หลักสูตร 2569 ใช้รหัส 01076648'],
  ['01076598', 2, 0, 'ANALYTICS', 'การวิเคราะห์ข้อมูลเบื้องต้น', 'Introduction to Data Analytics', 3, 'ai3 math1', '2569/1', 42, ''],
  ['01076595', 2, 1, 'SEARCH', 'การสืบค้นสารสนเทศและการค้นหาเว็บ', 'Information Storage and Web Search', 3, 'ai2 algo1 sw1', '2568/1, 2568/2, 2569/1', 123, ''],
  ['01076566', 2, 2, 'MEDIA', 'ระบบสื่อผสม', 'Multimedia Systems', 3, 'ai2 sw1 hw1', '2568/2', 27, ''],
  ['01076564', 3, 0, 'ALGO', 'การออกแบบและวิเคราะห์อัลกอริทึม', 'Design and Analysis of Algorithms', 3, 'algo4 math1', '2569/1', 19, ''],
  ['01076568', 3, 1, 'HCI', 'การปฏิสัมพันธ์ระหว่างมนุษย์และคอมพิวเตอร์', 'Human Computer Interaction', 3, 'sw2 soft2', '2568/1, 2568/2, 2569/1', 56, ''],
  ['01076583', 3, 2, 'GRAPHICS', 'คอมพิวเตอร์กราฟิกส์', 'Computer Graphics', 3, 'sw2 math2', '2569/1', 21, ''],
  ['01076597', 3, 3, 'AR', 'โลกเสมือนผสานโลกจริง', 'Augmented Reality', 3, 'sw2 hw1 ai1', '2568/2', 26, ''],
  ['01076422', 3, 4, 'IT BIZ', 'การประกอบการและการจัดการด้านเทคโนโลยีสารสนเทศ', 'IT Entrepreneurship and Management', 3, 'soft3 sw1', '2568/2', 15, ''],
  ['01076616', 4, 0, 'CLOUD', 'สถาปัตยกรรมคลาวด์เบื้องต้น', 'Introduction to Cloud Architecture', 3, 'net3 sw1', '2568/1, 2568/2', 208, 'ในตารางสอนใช้รหัส 01076043 + 01076044 (ปฏิบัติ)'],
  ['01076627', 5, 0, 'SEC ARCH', 'สถาปัตยกรรมและการบริหารความมั่นคงไอซีที', 'ICT Security Architecture and Management', 3, 'sec4', '2568/1, 2569/1', 96, ''],
  ['01076628', 5, 1, 'SEC AUDIT', 'การประเมินความมั่นคงเทคโนโลยีสารสนเทศ', 'Information Technology Security Assessment', 3, 'sec4', '2568/2', 14, ''],
  ['01076629', 5, 2, 'PENTEST', 'การทดสอบเจาะระบบและการแฮกแบบมีจริยธรรมเบื้องต้น', 'Basic Penetration Testing and Ethical Hacking', 3, 'sec4 net1', '2568/2', 63, ''],
  ['01076420', 6, 0, 'HDL', 'การออกแบบดิจิตอลขั้นสูงโดยใช้เฮชดีแอล', 'Advanced Digital Design using HDL', 3, 'hw4', '2568/2', 4, ''],
  ['01076411', 6, 1, 'ROBOT', 'การพัฒนาหุ่นยนต์ขนาดเล็ก', 'Micro Robot Development', 3, 'hw3 sw1', '2568/1', 10, ''],
  ['01076418', 6, 2, 'HPC', 'การประมวลผลสมรรถนะสูง', 'High Performance Computing', 3, 'hw2 algo2', '2569/1', 42, ''],
];

// [id, x, y, label, th, en, icon, electives on this path, desc]
const CAREERS = [
  ['software', 1440, 446, 'นักพัฒนาซอฟต์แวร์', 'ผู้พัฒนาซอฟต์แวร์ / วิศวกรซอฟต์แวร์', 'Software Developer / Software Engineer', 'code', ['01076564', '01076568', '01076583', '01076597', '01076422'], 'วิเคราะห์ความต้องการ ออกแบบ เขียนโค้ด ทดสอบ แก้ข้อบกพร่อง และดูแลซอฟต์แวร์ให้ทำงานได้ดี'],
  ['ai', 1440, 308, 'วิศวกร AI', 'วิศวกรปัญญาประดิษฐ์', 'AI Engineer', 'ai', ['01076582', '01076533', '01076567', '01076646', '01076645', '01076598', '01076595', '01076566'], 'พัฒนาและฝึกโมเดล Machine Learning ประมวลผลภาษาและภาพ แล้วนำระบบ AI ไปใช้แก้ปัญหาจริง'],
  ['devops', 1526, 492, 'DevOps / Cloud', 'วิศวกร DevOps / วิศวกร Cloud', 'DevOps Engineer / Cloud Engineer', 'net', ['01076616', '01076564', '01076568', '01076583', '01076597', '01076422'], 'สร้างและดูแล CI/CD pipeline โครงสร้างพื้นฐานบนคลาวด์ container และระบบอัตโนมัติ'],
  ['network', 1440, 538, 'วิศวกรเครือข่าย', 'วิศวกรเครือข่าย', 'Network Engineer', 'net', ['01076616'], 'ออกแบบ ติดตั้ง และบริหารเครือข่ายคอมพิวเตอร์ แก้ปัญหาการเชื่อมต่อ และดูแลความปลอดภัยของเครือข่าย'],
  ['system', 1526, 584, 'วิศวกรระบบ', 'วิศวกรควบคุมดูแลระบบคอมพิวเตอร์', 'System Engineer', 'hw', ['01076616'], 'ดูแลเซิร์ฟเวอร์และระบบปฏิบัติการขององค์กร สำรองและกู้คืนข้อมูล จัดการสิทธิ์การเข้าถึง'],
  ['cyber', 1440, 630, 'วิศวกรความปลอดภัย', 'วิศวกรระบบความปลอดภัยคอมพิวเตอร์', 'Cybersecurity Engineer', 'sec', ['01076627', '01076628', '01076629'], 'ประเมินช่องโหว่ ติดตั้งระบบป้องกันการโจมตี ตรวจจับการบุกรุก และสอบสวนเหตุการณ์ด้านความมั่นคงปลอดภัย'],
  ['hardware', 1440, 722, 'วิศวกรฮาร์ดแวร์ / ฝังตัว', 'วิศวกรฮาร์ดแวร์ / วิศวกรระบบฝังตัว', 'Hardware Engineer / Embedded Systems Engineer', 'hw', ['01076420', '01076411', '01076418'], 'ออกแบบวงจรอิเล็กทรอนิกส์ เขียนโปรแกรมไมโครคอนโทรลเลอร์ และผสานฮาร์ดแวร์กับซอฟต์แวร์ในอุปกรณ์ IoT'],
  ['computer', 1440, 814, 'วิศวกรคอมพิวเตอร์', 'วิศวกรคอมพิวเตอร์', 'Computer Engineer', 'grad', [], 'ออกแบบ พัฒนา และบำรุงรักษาระบบคอมพิวเตอร์ทั้งฮาร์ดแวร์และซอฟต์แวร์ ครอบคลุมวิชาบังคับทั้งหลักสูตร'],
];

// ---------- build the graph ----------
const pts = (s) => {
  const o = Object.fromEntries(AX.map((k) => [k, 0]));
  for (const p of s.split(' ')) { const m = p.match(/^([a-z]+)(\d+)$/); if (m) o[m[1]] = +m[2]; }
  return o;
};
const N = {};
const ids = [];
const add = (o) => { N[o.id] = o; ids.push(o.id); };
add({ id: 'start', kind: 'start', row: 4, x: 62, y: 538, ab: 'FRESHY', th: 'Freshy — นักศึกษาปี 1', en: 'Freshman, Computer Engineering', cr: 0, p: pts(''), code: 'START' });
for (const a of CORE) add({ id: a[0], code: a[0], kind: 'core', row: a[1], t: a[2], s: a[3], x: TX(a[2], a[3]), y: RY(a[1]), ab: a[4], th: a[5], en: a[6], cr: a[7], p: pts(a[8]), opt: !!a[9] });
for (const a of ELECTIVES) add({ id: a[0], code: a[0], kind: 'elec', row: a[1], idx: a[2], x: 1090 + a[2] * 60, y: RY(a[1]), ab: a[3], th: a[4], en: a[5], cr: a[6], p: pts(a[7]), terms: a[8], n: a[9], note: a[10] });
const coreIds = ids.filter((id) => N[id].kind === 'core' && !N[id].opt);
for (const a of CAREERS) add({ id: a[0], code: 'CAREER', kind: 'career', x: a[1], y: a[2], ab: a[3], th: a[4], en: a[5], ic: a[6], plan: a[7], desc: a[8], cr: 0, p: pts('') });

const rowCore = {}, rowEl = {};
for (let r = 0; r < ROWS.length; r++) {
  rowCore[r] = ids.filter((id) => N[id].kind === 'core' && N[id].row === r).sort((a, b) => N[a].x - N[b].x);
  rowEl[r] = ids.filter((id) => N[id].kind === 'elec' && N[id].row === r).sort((a, b) => N[a].idx - N[b].idx);
}

// lines: rows start at Freshy's trunk or branch off a course in another row; elective rails hang off a row's base course
const BASE = { 1: '01076641', 2: '01076263', 3: '01076034', 4: '01076118', 5: '01076056', 6: '01076049' };
const half = (n) => (n.kind === 'career' ? 32 : n.kind === 'elec' ? 22 : n.kind === 'start' ? 38 : 24);
const E = [{ d: 'M100 538 H130 M130 170 V906', always: true }];
for (const r of [0, 3, 4, 6, 7, 8]) { const f = N[rowCore[r][0]]; E.push({ d: `M130 ${f.y} H${f.x - half(f)}`, t: f.id }); }
for (let r = 0; r < ROWS.length; r++) {
  const c = rowCore[r];
  for (let i = 1; i < c.length; i++) { const a = N[c[i - 1]], b = N[c[i]]; E.push({ d: `M${a.x + half(a)} ${a.y} H${b.x - half(b)}`, a: a.id, b: b.id }); }
}
{
  const st = N['01076253'], ml = N['01076641'], nt = N['01076054'], cy = N['01076056'];
  E.push({ d: `M${st.x} ${st.y + 24} V${ml.y} H${ml.x - 24}`, t: ml.id });
  E.push({ d: `M${nt.x} ${nt.y + 24} V${cy.y} H${cy.x - 24}`, t: cy.id });
}
for (const r of [1, 2, 3, 4, 5, 6]) {
  const els = rowEl[r].map((id) => N[id]), b = N[BASE[r]];
  E.push({ d: r === 2 ? `M${b.x} ${b.y - 24} V${els[0].y} H${els[0].x - 22}` : `M${b.x + 24} ${b.y} H${els[0].x - 22}`, any: els.map((n) => n.id) });
  for (let i = 1; i < els.length; i++) E.push({ d: `M${els[i - 1].x + 22} ${els[i].y} H${els[i].x - 22}`, any: els.slice(i).map((n) => n.id) });
}
const lastOf = (r) => N[rowEl[r][rowEl[r].length - 1]];
const toCareer = (from, cid) => {
  const c = N[cid], x0 = from.x + half(from);
  return from.y === c.y ? `M${x0} ${from.y} H${c.x - 32}` : `M${x0} ${from.y} H1395 V${c.y} H${c.x - 32}`;
};
for (const [r, cid] of [[1, 'ai'], [2, 'ai'], [3, 'software'], [3, 'devops'], [4, 'devops'], [4, 'network'], [4, 'system'], [5, 'cyber'], [6, 'hardware']]) E.push({ d: toCareer(lastOf(r), cid), t: cid });
E.push({ d: toCareer(N['01006029'], 'computer'), t: 'computer' });
E.push({ d: toCareer(N['01076038'], 'computer'), t: 'computer' });

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

// ---------- static DOM ----------
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const svgIcon = (d, cls = '') => `<svg class="${cls}" width="24" height="24" aria-hidden="true"><path d="${d}"/></svg>`;
const colorOf = (n) => (n.kind === 'career' || n.kind === 'start' ? ACC : ROWS[n.row].c);
const iconOf = (n) => (n.kind === 'career' ? IC[n.ic] : n.kind === 'start' ? IC.start : IC[ROWS[n.row].ic]);

const bands = [];
for (let t = 0; t < 6; t++) bands.push([190 + t * 136 - 36, 136, TERM[t], 'band']);
bands.push([970, 80, 'ฤดูร้อน', 'band'], [1050, 335, 'ปี 3–4 · วิชาเลือก', 'band el'], [1385, 195, 'สายอาชีพ', 'band ca']);
for (const [l, w, label, cls] of bands) { const b = el('div', cls, `<span>${label}</span>`); b.style.left = `${l}px`; b.style.width = `${w}px`; $('bands').append(b); }

const LX = { 1: 710, 2: 540, 5: 846 };
ROWS.forEach((r, i) => {
  const first = rowCore[i].length ? N[rowCore[i][0]] : N[rowEl[i][0]];
  const lab = el('div', 'rl', `${r.name}<i>${r.en}</i>`);
  Object.assign(lab.style, { left: `${LX[i] || first.x - 24}px`, top: `${RY(i) - 52}px` });
  lab.style.setProperty('--c', r.c);
  $('rowlabels').append(lab);
});

const nodeEl = {};
for (const id of ids) {
  const n = N[id];
  const w = n.kind === 'career' ? 64 : n.kind === 'elec' ? 44 : n.kind === 'start' ? 76 : 48;
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

for (const id of ids.filter((k) => N[k].kind === 'career')) {
  const o = el('option'); o.value = id; o.textContent = id === 'computer' ? 'วิศวกรคอมพิวเตอร์ (วิชาบังคับครบหลักสูตร)' : N[id].th; $('goal').append(o);
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
const params = new URLSearchParams(location.search);
const S = { sel: 'start', career: N[params.get('career')]?.kind === 'career' ? params.get('career') : 'software', cursor: -1, timer: 0 };
let shown = vec([]), raf = 0;

function draw(v, bef, tg) {
  $('r-cur').setAttribute('points', poly(v));
  barEls.forEach((b, i) => {
    const c = v[i];
    let al = c, aw = 0;
    if (bef) { aw = Math.min(Math.max(0, after(S.sel, planFor(S.career))[i] - bef[i]), c); al = Math.max(0, c - aw); }
    b.c.style.width = `${c.toFixed(1)}%`;
    b.a.style.left = `${al.toFixed(1)}%`;
    b.a.style.width = `${aw.toFixed(1)}%`;
    b.g.style.left = `${Math.min(99, tg[i]).toFixed(1)}%`;
  });
}

function tweenTo(target, bef, tg) {
  cancelAnimationFrame(raf);
  const from = shown.slice(), t0 = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = (now) => {
    const k = reduce ? 1 : Math.min(1, (now - t0) / 520), e = 1 - (1 - k) ** 3;
    shown = from.map((v, i) => v + (target[i] - v) * e);
    draw(shown, bef, tg);
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

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

  // panel
  const n = N[S.sel];
  const isCourse = n.kind === 'core' || n.kind === 'elec';
  const aft = after(S.sel, plan);
  const bef = isCourse ? vec(before(S.sel, plan)) : null;
  const tg = vec(plan);
  $('p-pic').style.setProperty('--c', colorOf(n));
  $('p-ico').setAttribute('d', iconOf(n));
  $('p-code').textContent = n.kind === 'career' ? n.en : n.code;
  $('p-th').textContent = n.th;
  $('p-en').textContent = n.kind === 'career' ? 'สายอาชีพปลายทาง' : n.en;
  const gains = bef ? AX.map((k, i) => [AXN[i], aft[i] - bef[i]]).filter(([, d]) => d > 0.05).sort((a, b) => b[1] - a[1]) : [];
  const gainTxt = gains.length ? `เพิ่มทักษะ: ${gains.map(([nm, d]) => `${nm} +${Math.round(d)}%`).join(' · ')}` : '';
  let meta, status = '', req = [], hint;
  if (n.kind === 'start') {
    meta = 'จุดเริ่มต้นของทุกเส้นทาง เส้นจาก Freshy แตกออกเป็นสายทักษะ 9 สาย ปลายสุดของแต่ละสายคืออาชีพที่หลักสูตรระบุไว้ใน มคอ.2';
    status = 'เลือกเส้นทางอาชีพด้านบน แล้วกด “เล่นเส้นทาง” เพื่อดูทักษะเติบโตทีละภาคเรียน หรือคลิกวิชาใดก็ได้เพื่อดูว่าเพิ่มทักษะด้านใด';
    hint = 'เรดาร์แสดงทักษะ 8 ด้านที่สะสมตามลำดับการเรียน เส้นประสีเทาคือโปรไฟล์ทักษะเมื่อจบตามเส้นทางอาชีพที่เลือก';
  } else if (n.kind === 'career') {
    meta = n.desc;
    status = n.plan.length ? `เส้นทางนี้ = วิชาบังคับทั้งหลักสูตร + วิชาเลือก ${n.plan.length} วิชา` : 'เส้นทางนี้ = วิชาบังคับทั้งหลักสูตร';
    req = n.plan.map((id) => `• ${N[id].th}`);
    hint = 'อาชีพและกลุ่มวิชาเลือกที่เกี่ยวข้องอ้างอิงจาก มคอ.2';
  } else if (n.kind === 'core') {
    meta = `วิชาบังคับ · ${n.cr} หน่วยกิต · ${TERM[n.t]} · ที่มา มคอ.2 ปรับปรุง 2569${n.opt ? ' · เส้นทางเลือกในภาคการศึกษาสุดท้าย' : ''}`;
    status = gainTxt;
    hint = 'แถบสีฟ้าคือส่วนที่วิชานี้เพิ่มจากทักษะที่สะสมมาก่อนหน้า';
  } else {
    meta = `วิชาเลือกเฉพาะสาขา · ${n.cr} หน่วยกิต · ตารางสอนภาค ${n.terms} · ผู้ลงทะเบียนรวม ${n.n} คน${n.note ? ` · ${n.note}` : ''}`;
    status = gainTxt;
    hint = 'แถบสีฟ้าคือส่วนที่วิชานี้เพิ่มจากทักษะที่สะสมมาก่อนหน้า';
  }
  $('p-meta').textContent = meta;
  $('p-status').textContent = status;
  $('p-req').replaceChildren(...req.map((t) => { const s = el('span'); s.textContent = t; return s; }));
  $('p-hint').textContent = hint;
  $('k-cur').textContent = isCourse ? 'หลังเรียนวิชานี้' : 'ทักษะสะสม';
  $('r-tg').setAttribute('points', poly(tg));
  $('r-alt').setAttribute('points', poly(bef || aft));
  $('r-alt').style.display = bef ? '' : 'none';
  barEls.forEach((b, i) => {
    const d = bef ? aft[i] - bef[i] : 0;
    b.v.textContent = bef ? (d > 0.05 ? `+${Math.round(d)}%` : '') : `${Math.round(aft[i])}%`;
  });
  tweenTo(aft, bef, tg);
}

function stop() { clearInterval(S.timer); S.timer = 0; }
function pick(id) { stop(); S.sel = id; S.cursor = -1; render(); }
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
