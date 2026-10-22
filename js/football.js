// ฟุตบอลประเพณีและกีฬา 3 พระจอมเกล้า (Feb-Mar, the three King Mongkut universities in rotation; see events.md),
// played at the KMITL central stadium: KMITL in orange against KMUTNB, as in 2025. The home crowd fills the west
// grandstand with a card section (แปรอักษร) in the lower tier flipping pictures; the visitors stand on the east
// bank. Twenty-two players, two referees' worth of running and a ball: a simple game of passing, dribbling,
// tackles and shots, with goals, saves, throw-ins and kick-offs, and the score and minute on the north scoreboard.
// The opponent's kit colour is not confirmed by any source found (OPP below).
//
// x = east, z = south, y = up. Pitch 100 x 64 m centred on the track's infield (-626, -256), long axis north-south;
// grandstand seat rows from stad.js (front arc, 16 rows, walkway on row 9).
import * as THREE from 'three';
import { rng } from './builders.js';
import { Crowd } from './crowd.js';
import { STAD_OUTLINE } from './models/stad.js';

const C = [-626, -256], HW = 32, HL = 50;            // pitch centre, half width (x), half length (z)
const GOAL_W = 3.66, GOAL_H = 2.44;
const HOME = { name: 'สจล.', shirt: '#e8641e', gk: '#1f8a4c' };
const OPP = { name: 'มจพ.', shirt: '#7a1f2b', gk: '#d8c13a' };
// 4-4-2: [lateral -1..1 (x), depth 0..1 from own goal]
const FORM = [[0, 0.02], [-0.75, 0.2], [-0.25, 0.17], [0.25, 0.17], [0.75, 0.2], [-0.75, 0.45], [-0.25, 0.42], [0.25, 0.42], [0.75, 0.45], [-0.2, 0.68], [0.2, 0.7]];
// card pictures, CW x 9 cards on the north half of the lower tier (the VIP box hides the middle): text drawn white on black, then each card takes fg or bg (no in-between shades)
const CW = 50, CARD_COL0 = 68;
const CARD_PICS = [
  { text: 'KMITL', fg: '#ffffff', bg: '#e8641e', size: 10 },
  { text: '3K', fg: '#e8641e', bg: '#ffffff', size: 10 },
  { text: '♥ ♥ ♥', fg: '#d8233a', bg: '#ffffff', size: 10 },
  { text: 'GO!', fg: '#1f1f22', bg: '#f2c230', size: 10 },
];

export function buildFootball({ say }) {
  const group = new THREE.Group();
  let built = null;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

  function build() {
    const R = rng(3003);
    const crowd = new Crowd();
    const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; group.add(m); return m; };

    // ===== pitch markings and goals =====
    const white = new THREE.MeshBasicMaterial({ color: '#f4f4ef' });
    const line = (x0, z0, x1, z1) => { const l = Math.hypot(x1 - x0, z1 - z0); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, l).rotateX(-Math.PI / 2), white); m.position.set((x0 + x1) / 2, 0.27, (z0 + z1) / 2); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); group.add(m); };
    const rect = (x0, z0, x1, z1) => { line(x0, z0, x1, z0); line(x1, z0, x1, z1); line(x1, z1, x0, z1); line(x0, z1, x0, z0); };
    rect(C[0] - HW, C[1] - HL, C[0] + HW, C[1] + HL);
    line(C[0] - HW, C[1], C[0] + HW, C[1]);
    const ring = new THREE.Mesh(new THREE.RingGeometry(9.1, 9.22, 64).rotateX(-Math.PI / 2), white); ring.position.set(C[0], 0.27, C[1]); group.add(ring);
    for (const s of [-1, 1]) {
      const zg = C[1] + s * HL;
      rect(C[0] - 20.15, zg, C[0] + 20.15, zg - s * 16.5);
      rect(C[0] - 9.16, zg, C[0] + 9.16, zg - s * 5.5);
      // goal: posts, crossbar, see-through net
      const post = std('#ffffff');
      for (const x of [-GOAL_W, GOAL_W]) box(0.12, GOAL_H, 0.12, post, C[0] + x, GOAL_H / 2, zg);
      box(GOAL_W * 2 + 0.12, 0.12, 0.12, post, C[0], GOAL_H, zg);
      const net = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
      const back = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_W * 2, GOAL_H), net); back.position.set(C[0], GOAL_H / 2, zg + s * 2); group.add(back);
      for (const x of [-GOAL_W, GOAL_W]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(2, GOAL_H), net); sd.rotation.y = Math.PI / 2; sd.position.set(C[0] + x, GOAL_H / 2, zg + s); group.add(sd); }
      const top = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_W * 2, 2).rotateX(-Math.PI / 2), net); top.position.set(C[0], GOAL_H, zg + s); group.add(top);
    }
    // corner flags
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { box(0.05, 1.5, 0.05, std('#f2f2f2'), C[0] + sx * HW, 0.75, C[1] + sz * HL); box(0.02, 0.35, 0.45, std('#e8641e'), C[0] + sx * HW, 1.3, C[1] + sz * HL - sz * 0.25); }

    // ===== scoreboard face (stad.js board at x -635.6..-620.4, y 4..7, z -352.5, facing south) =====
    const sbCanvas = document.createElement('canvas'); sbCanvas.width = 768; sbCanvas.height = 152;
    const sbTex = new THREE.CanvasTexture(sbCanvas); sbTex.colorSpace = THREE.SRGBColorSpace;
    const sb = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 3), new THREE.MeshBasicMaterial({ map: sbTex }));
    sb.position.set(-628, 5.5, -352.4); group.add(sb);

    // ===== ball =====
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), std('#ffffff', { roughness: 0.4 }));
    ball.castShadow = true; group.add(ball);

    // ===== players and referee =====
    const players = [];
    for (const [ti, team] of [HOME, OPP].entries()) {
      FORM.forEach(([lx, d], i) => {
        const m = crowd.add(R, false, i === 0 ? team.gk : team.shirt);
        players.push({ m, team: ti, i, gk: i === 0, lx, d, x: 0, z: 0, yaw: 0, v: 0, cool: 0 });
      });
    }
    const ref = { m: crowd.add(R, false, '#111214'), x: C[0], z: C[1], yaw: 0, v: 0 };

    // ===== home fans in the grandstand (seated: a figure sunk into the step), card section in the lower tier =====
    const O = STAD_OUTLINE, Fr = O.slice(1, 17), Bk = O.slice(18, 34).reverse();
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const ROWS = 16, WALK = 9, SUB = 8, SEAT0 = 4.0, SEAT1 = 11.5, COLS = (Fr.length - 1) * SUB;
    const fans = [], cards = [];
    for (let i = 0; i < Fr.length - 1; i++) {
      const s0 = lerp(Fr[i], Bk[i], 0.08), s1 = lerp(Fr[i + 1], Bk[i + 1], 0.08), t0 = lerp(Fr[i], Bk[i], 0.9), t1 = lerp(Fr[i + 1], Bk[i + 1], 0.9);
      const fx = (Fr[i][0] + Fr[i + 1][0]) / 2 - (Bk[i][0] + Bk[i + 1][0]) / 2, fz = (Fr[i][1] + Fr[i + 1][1]) / 2 - (Bk[i][1] + Bk[i + 1][1]) / 2;
      const yaw = Math.atan2(fx, fz);                                             // facing the pitch
      for (let k = 0; k < ROWS; k++) {
        if (k === WALK) continue;
        for (let c = 0; c < SUB; c++) {
          const col = COLS - 1 - (i * SUB + c);                                   // 0 = left as seen from the pitch
          const card = k < WALK && col >= CARD_COL0 && col < CARD_COL0 + CW;
          if (!card && R() > 0.62) continue;
          const v = (c + 0.5) / SUB, u = (k + 0.55) / ROWS;
          const p = lerp(lerp(s0, s1, v), lerp(t0, t1, v), u);
          const y = SEAT0 + ((SEAT1 - SEAT0) * (k + 1)) / ROWS - 0.42;
          const shirt = R() < 0.65 ? HOME.shirt : R() < 0.5 ? '#f4f4f1' : '#1f1f22';
          const f = { m: crowd.add(R, R() < 0.45, shirt), x: p[0], y, z: p[1], yaw, ph: R() * 6.28 };
          fans.push(f);
          if (card) cards.push({ f, col: col - CARD_COL0, row: WALK - 1 - k });        // row 0 = top of the picture
        }
      }
    }
    // visitors on the east bank (bank ellipse from stad.js: centre -626,-256, inner radii 47/92, crest at 0.4 out)
    const away = [];
    for (let n = 0; n < 420; n++) {
      const t = (R() - 0.5) * 1.4, r = 0.15 + R() * 0.25;                       // east side, part way up the bank
      const rx = 47 + (66 - 47) * r, rz = 92 + (105 - 92) * r;
      const x = C[0] + rx * Math.cos(t), z = C[1] + rz * Math.sin(t);
      const y = 0.2 + 1.6 * Math.min(1, r / 0.4);
      away.push({ m: crowd.add(R, R() < 0.4, R() < 0.75 ? OPP.shirt : '#f4f4f1'), x, y, z, yaw: Math.atan2(C[0] - x, C[1] - z), ph: R() * 6.28 });
    }
    group.add(crowd.finish());

    // card section: one instanced card per holder, colours from the pictures
    const cardMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.45, 0.03), new THREE.MeshStandardMaterial({ roughness: 0.7 }), cards.length);
    cardMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cardMesh.frustumCulled = false;
    group.add(cardMesh);
    const pics = CARD_PICS.map(({ text, fg, bg, size }) => {
      const cv = document.createElement('canvas'); cv.width = CW; cv.height = 9;
      const g = cv.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, CW, 9);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `800 ${size}px Arial, sans-serif`; g.fillText(text, CW / 2, 5);
      const d = g.getImageData(0, 0, CW, 9).data, F = new THREE.Color(fg), Bc = new THREE.Color(bg);
      return cards.map((cd) => (d[(cd.row * CW + cd.col) * 4] > 110 ? F : Bc));
    });

    built = { crowd, players, ref, ball, fans, away, cards, cardMesh, pics, sbCanvas, sbTex };
  }

  // ---------- match state ----------
  let t = 0, ftT = 0, score = [0, 0], owner = null, lastTouch = 0, pause = 0, celebrate = -1, half = 0, minute = 0, shownPic = -1, picT = 0, sbKey = '';
  const B = { x: 0, y: 0.2, z: 0, vx: 0, vy: 0, vz: 0 };
  // team 0 attacks south (+z) in the first half
  const attackDir = (team) => ((team === 0) !== (half === 1) ? 1 : -1);
  const homeSpot = (p) => {
    const dir = attackDir(p.team), ownGoal = C[1] - dir * HL;
    return [C[0] + p.lx * HW * 0.85, ownGoal + dir * p.d * HL * 2];
  };

  function kickoff(team) {
    Object.assign(B, { x: C[0], y: 0.2, z: C[1], vx: 0, vy: 0, vz: 0 });
    for (const p of built.players) {
      const [x, z] = homeSpot(p);
      const dir = attackDir(p.team);
      p.x = x; p.z = (z - C[1]) * dir < 0 ? z : C[1] - dir * 1;                // everybody in their own half
      p.v = 0; p.cool = 0;
    }
    const st = built.players.filter((p) => p.team === team && p.i >= 9);
    owner = st[0]; owner.x = C[0]; owner.z = C[1] - attackDir(team) * 0.6;
    lastTouch = team; pause = 2;
  }
  function start() {
    if (!built) build();
    t = 0; ftT = 0; score = [0, 0]; half = 0; celebrate = -1; minute = 0; shownPic = -1; picT = 0;
    kickoff(0);
  }
  function stop() {}

  function kick(p, tx, tz, speed, loft) {
    const dx = tx - B.x, dz = tz - B.z, l = Math.hypot(dx, dz) || 1;
    B.vx = (dx / l) * speed; B.vz = (dz / l) * speed; B.vy = loft;
    owner = null; p.cool = 0.6; lastTouch = p.team;
  }

  function scoreboard() {
    const key = `${score[0]}-${score[1]}-${minute}-${half}`;
    if (key === sbKey) return; sbKey = key;
    const g = built.sbCanvas.getContext('2d');
    g.fillStyle = '#0c0f14'; g.fillRect(0, 0, 768, 152);
    g.textBaseline = 'middle'; g.font = '700 58px "IBM Plex Sans Thai", sans-serif';
    g.fillStyle = HOME.shirt; g.textAlign = 'left'; g.fillText(HOME.name, 24, 76);
    g.fillStyle = '#ff8f8f'; g.textAlign = 'right'; g.fillText(OPP.name, 744, 76);
    g.fillStyle = '#ffe680'; g.textAlign = 'center'; g.font = '700 78px "IBM Plex Sans Thai", sans-serif'; g.fillText(`${score[0]} - ${score[1]}`, 384, 66);
    g.font = '600 30px "IBM Plex Sans Thai", sans-serif'; g.fillStyle = '#9fe0ff'; g.fillText(minute >= 90 ? 'จบเกม' : `${minute}'`, 384, 128);
    built.sbTex.needsUpdate = true;
  }

  function update(dt, dtReal) {
    const { players, ref, ball, crowd, fans, away, cards, cardMesh, pics } = built;
    t += dt;
    // match clock: one minute every 6 s; half time at 45, full time at 90, then a new match
    minute = Math.min(90, Math.floor(t / 6));
    if (half === 0 && minute >= 45) { half = 1; kickoff(1); }
    if (minute >= 90) {                                                         // full time: a pause, then a new match
      if (!ftT) { ftT = 8; owner = null; }
      ftT -= dt;
      if (ftT <= 0) { ftT = 0; t = 0; minute = 0; score = [0, 0]; half = 0; kickoff(0); }
    }
    if (pause > 0) pause -= dt;
    const live = pause <= 0 && minute < 90;

    // ---- ball ----
    if (owner) {
      const ax = Math.sin(owner.yaw), az = Math.cos(owner.yaw);
      B.x = owner.x + ax * 0.55; B.z = owner.z + az * 0.55; B.y = 0.2; B.vx = B.vy = B.vz = 0;
    } else {
      B.vy -= 9.8 * dt; B.x += B.vx * dt; B.y += B.vy * dt; B.z += B.vz * dt;
      if (B.y < 0.2) { B.y = 0.2; B.vy = Math.abs(B.vy) > 1.5 ? -B.vy * 0.45 : 0; }
      const f = Math.exp(-(B.y > 0.25 ? 0.15 : 0.9) * dt); B.vx *= f; B.vz *= f;
    }
    // goal, out of play
    if (live) {
      const over = Math.abs(B.z - C[1]) > HL, side = B.z > C[1] ? 1 : -1;
      if (over && Math.abs(B.x - C[0]) < GOAL_W && B.y < GOAL_H) {
        const scorer = players.find((p) => attackDir(p.team) === side).team;
        score[scorer]++; celebrate = scorer; pause = 5; owner = null;
        say(`⚽ ประตู! ${scorer === 0 ? HOME.name : OPP.name} ยิงได้ · ${HOME.name} ${score[0]} - ${score[1]} ${OPP.name}`);
      } else if (over) {                                                          // goal kick or corner
        const defending = players.find((p) => attackDir(p.team) === -side).team;
        const taker = lastTouch === defending
          ? players.filter((p) => p.team !== defending && !p.gk).sort((a, b) => Math.hypot(a.x - B.x, a.z - B.z) - Math.hypot(b.x - B.x, b.z - B.z))[0]
          : players.find((p) => p.team === defending && p.gk);
        if (taker.gk) { Object.assign(B, { x: C[0], z: C[1] + side * (HL - 5.5) }); }
        else { Object.assign(B, { x: C[0] + Math.sign(B.x - C[0] || 1) * HW, z: C[1] + side * HL }); }
        taker.x = B.x - Math.sign(B.x - C[0] || 1) * 0.3; taker.z = B.z - side * 0.3; owner = taker; pause = 1.2;
      } else if (Math.abs(B.x - C[0]) > HW) {                                   // throw-in
        const x = C[0] + Math.sign(B.x - C[0]) * (HW - 0.3);
        const taker = players.filter((p) => p.team !== lastTouch && !p.gk).sort((a, b) => Math.hypot(a.x - x, a.z - B.z) - Math.hypot(b.x - x, b.z - B.z))[0];
        B.x = x; taker.x = x; taker.z = B.z; owner = taker; pause = 1.0;
      }
    }
    if (pause > 0 && celebrate >= 0 && pause < 0.3) { const conceded = 1 - celebrate; celebrate = -1; kickoff(conceded); }
    ball.position.set(B.x, B.y, B.z);
    ball.rotation.x += B.vz * dt * 3; ball.rotation.z -= B.vx * dt * 3;

    // ---- players ----
    const nearest = [0, 1].map((team) => players.filter((p) => p.team === team && !p.gk).reduce((a, p) => (Math.hypot(p.x - B.x, p.z - B.z) < Math.hypot(a.x - B.x, a.z - B.z) ? p : a)));
    for (const p of players) {
      p.cool -= dt;
      const dir = attackDir(p.team);
      let [tx, tz] = homeSpot(p);
      let vmax = 3.2;
      if (p.gk) {
        tx = C[0] + THREE.MathUtils.clamp((B.x - C[0]) * 0.15, -3, 3);
        tz = C[1] - dir * (HL - 1.2);
        if (Math.abs(B.z - (C[1] - dir * HL)) < 16 && Math.abs(B.x - C[0]) < 20 && !owner) { tx = B.x; tz = B.z; vmax = 5; }
      } else {
        // shift the shape towards the ball
        tx += (B.x - C[0]) * 0.35; tz += (B.z - C[1]) * 0.45;
        if (nearest[p.team] === p && owner !== p) { tx = B.x; tz = B.z; vmax = 6.5; }
        if (owner && owner.team === p.team && owner !== p && p.i >= 5) tz += dir * 8;      // run forward in attack
      }
      if (celebrate === p.team) { tx = p.x + Math.sin(t * 2 + p.i) * 0.5; tz = p.z; }
      if (owner === p) {
        // dribble towards goal; pass, shoot or keep going
        const gx = C[0], gz = C[1] + dir * HL, dGoal = Math.hypot(gx - p.x, gz - p.z);
        tx = p.x + (gx - p.x) * 0.3 + (Math.random() - 0.5) * 2; tz = p.z + dir * 6; vmax = 4.6;
        const pressed = players.some((q) => q.team !== p.team && Math.hypot(q.x - p.x, q.z - p.z) < 2.2);
        if (live && p.cool < -0.4) {
          if (dGoal < 24 && Math.random() < dt * 1.6) kick(p, gx + (Math.random() - 0.5) * GOAL_W * 2.6, gz, 22, 1 + Math.random() * 3);
          else if (p.gk || (pressed && Math.random() < dt * 3) || Math.random() < dt * 0.6) {
            const mates = players.filter((q) => q.team === p.team && q !== p && !q.gk && (q.z - p.z) * dir > -6 && Math.hypot(q.x - p.x, q.z - p.z) < (p.gk ? 50 : 32));
            const q = mates[Math.floor(Math.random() * mates.length)];
            if (q) { const d = Math.hypot(q.x - p.x, q.z - p.z); kick(p, q.x + Math.sin(q.yaw) * 2, q.z + dir * 2, Math.min(22, 8 + d * 0.45), d > 25 ? 6 : 0.5); }
          }
        }
      } else if (live && !owner && p.cool <= 0 && Math.hypot(B.x - p.x, B.z - p.z) < (p.gk ? 1.6 : 0.8) && B.y < (p.gk ? 2.6 : 1.0)) {
        owner = p; lastTouch = p.team;                                          // control, or a save
      } else if (live && owner && owner.team !== p.team && Math.hypot(owner.x - p.x, owner.z - p.z) < 1.1 && Math.random() < dt * 1.5) {
        owner.cool = 0.8; owner = p; lastTouch = p.team;                        // tackle
      }
      if (!live && celebrate < 0 && owner !== p) vmax = Math.min(vmax, 2);
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      const v = d > 0.3 ? Math.min(vmax, d * 1.5) : 0;
      p.v += (v - p.v) * Math.min(1, dt * 4);
      if (d > 0.01) { p.x += (dx / d) * p.v * dt; p.z += (dz / d) * p.v * dt; }
      const want = p.v > 0.4 ? Math.atan2(dx, dz) : Math.atan2(B.x - p.x, B.z - p.z);
      p.yaw += Math.atan2(Math.sin(want - p.yaw), Math.cos(want - p.yaw)) * Math.min(1, dt * 6);
      p.m.phase += (p.v / 0.9) * Math.PI * dt;
      const joy = celebrate === p.team;
      crowd.place(p.m, p.x, 0.27 + (joy ? Math.abs(Math.sin(t * 6 + p.i)) * 0.3 : 0), p.z, p.yaw, Math.sin(p.m.phase) * Math.min(1, p.v / 3), joy ? -2.8 : p.gk && !owner ? -0.5 : null);
    }
    // referee trails the play
    {
      const tx = B.x + 8, tz = B.z - 6, dx = tx - ref.x, dz = tz - ref.z, d = Math.hypot(dx, dz);
      const v = Math.min(5, d * 0.8); ref.x += (dx / (d || 1)) * v * dt; ref.z += (dz / (d || 1)) * v * dt;
      ref.yaw = Math.atan2(B.x - ref.x, B.z - ref.z); ref.m.phase += (v / 0.9) * Math.PI * dt;
      crowd.place(ref.m, ref.x, 0.27, ref.z, ref.yaw, Math.sin(ref.m.phase) * Math.min(1, v / 3));
    }

    // ---- crowds ----
    const tense = !owner || Math.abs(B.z - C[1]) > HL - 20;
    for (const f of fans) {
      if (f.card) continue;
      f.ph += dtReal * 7;
      const up = celebrate === 0 ? -2.8 + 0.25 * Math.sin(f.ph) : tense && Math.sin(f.ph * 0.13 + f.x) > 0.85 ? -1.3 + 0.2 * Math.sin(f.ph) : 0;
      crowd.place(f.m, f.x, f.y + (celebrate === 0 ? 0.35 : 0), f.z, f.yaw, 0, up);
    }
    for (const a of away) {
      a.ph += dtReal * 7;
      const up = celebrate === 1 ? -2.8 + 0.25 * Math.sin(a.ph) : Math.sin(a.ph * 0.11 + a.z) > 0.9 ? -1.3 + 0.2 * Math.sin(a.ph) : 0;
      crowd.place(a.m, a.x, a.y + (celebrate === 1 ? Math.abs(Math.sin(a.ph * 0.5)) * 0.25 : 0), a.z, a.yaw, 0, up);
    }
    // card section: a new picture every 8 s, flipped as a wave from left to right
    picT += dtReal;
    const pic = Math.floor(picT / 8) % pics.length, waveT = picT % 8;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), S = new THREE.Vector3(1, 1, 1), P = new THREE.Vector3();
    cards.forEach((cd, i) => {
      const f = cd.f; f.card = true;
      crowd.place(f.m, f.x, f.y, f.z, f.yaw, 0, -1.55);
      const flipped = waveT > cd.col * 0.02;
      const showPic = flipped ? pic : (pic + pics.length - 1) % pics.length;
      if (shownPic !== pic || waveT < 1.5) cardMesh.setColorAt(i, pics[showPic][i]);
      const turn = Math.abs(waveT - cd.col * 0.02) < 0.15 ? 0.2 : 1;
      Q.setFromAxisAngle(Y, f.yaw);
      P.set(f.x + Math.sin(f.yaw) * 0.42, f.y + 1.28, f.z + Math.cos(f.yaw) * 0.42);
      M.compose(P, Q, S.set(1, turn, 1));
      cardMesh.setMatrixAt(i, M);
    });
    if (waveT > 1.5) shownPic = pic;
    cardMesh.instanceMatrix.needsUpdate = true;
    if (cardMesh.instanceColor) cardMesh.instanceColor.needsUpdate = true;
    crowd.flush();

    scoreboard();
    if (celebrate < 0 && pause <= 0) say(`ฟุตบอลประเพณี 3 พระจอมเกล้า · สนามกีฬากลาง · ${HOME.name} ${score[0]} - ${score[1]} ${OPP.name} · นาที ${minute}${half ? ' (ครึ่งหลัง)' : ''}`);
  }

  const F = new THREE.Vector3();
  return { group, start, stop, update, focus: () => (built ? F.set(B.x * 0.4 + C[0] * 0.6, 0, B.z * 0.5 + C[1] * 0.5) : null), view: { dist: 150, polar: 55, az: 75 } };
}
