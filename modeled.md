# อาคารที่สำรวจเพื่อสร้างโมเดล

สร้างจาก `data/overrides.json`, `data/kmitl_data.js` และคำอธิบายหัวไฟล์ `js/models/*.js` ด้วย `python tools/build_lists.py` — แก้ข้อมูลต้นทางแล้วรันใหม่ อย่าแก้ไฟล์นี้ด้วยมือ

สำรวจเมื่อ 2026-10-16 ถึงปัจจุบัน ภาพจาก Google Street View / Google Maps / ภาพดาวเทียม ใช้เป็นข้อมูลอ้างอิงในการขึ้นรูปเท่านั้น ไม่ได้แสดงในหน้าเว็บ รูปทรงทั้งหมดสร้างด้วยโค้ด

## สรุปโมเดลเฉพาะ (105 หลัง)

| # | อาคาร | ไฟล์โมเดล | ชั้น | สูง (ม.) | OSM id |
|---|---|---|---|---|---|
| 1 | [โรงยิม](#gymn) | `js/models/gymn.js` | 1 | 13.8 | -1 |
| 2 | [สระว่ายน้ำ สจล.](#pool) | `js/models/pool.js` | 1 | 9.6 | -2 |
| 3 | [ทางเดินมีหลังคาริมทางรถไฟ](#railwalk) | `js/models/railwalk.js` | 1 | 3 | -3 |
| 4 | [สะพานลอยหน้าอาคารนวัตกรรมการเรียนรู้](#footbridge) | `js/models/innov.js` | 1 | 8.6 | -4 |
| 5 | [ตึก L คณะวิศวกรรมศาสตร์](#lbld) | `js/models/lbld.js` | 4 | 17.8 | -5 |
| 6 | [Sky Walk สจล. (สะพานลอยข้ามทางรถไฟ)](#skywalk) | `js/models/skywalk.js` | 1 | 10.2 | -6 |
| 7 | [KMITL Sky Walk (ฝั่ง CMKL)](#skywalkcmkl) | `js/models/skywalk.js` | 1 | 11.6 | -7 |
| 8 | [อาคาร 2 ชั้นริมสนามบาส (หลังอาคาร HM)](#courtblock) | `js/models/scib.js` | 2 | 8.3 | -8 |
| 9 | [หอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ (วร บุนนาค)](#hall) | `js/models/hall.js` | 3 | 25 | 190697575 |
| 10 | [อาคารปฏิบัติการรวมวิศวกรรม 1](#englab1) | `js/models/englab1.js` | 6 | 25.8 | 190886412 |
| 11 | [ภาควิชาวิศวกรรมเกษตร](#ageng) | `js/models/deps.js` | 2 | 10.2 | 190890102 |
| 12 | [อาคาร HM (อาคารเฉลิมพระเกียรติ 7 รอบ) - SIIE คณะวิศวกรรมศาสตร์ หลักสูตรนานาชาติ](#siie) | `js/models/siie.js` | 8 | 30.9 | 516204082 |
| 13 | [ภาคโยธา](#civil) | `js/models/civil.js` | 2 | 10.3 | 516204085 |
| 14 | [ตึกบูรณาการ](#integ) | `js/models/engw.js` | 5 | 23.2 | 190886413 |
| 15 | [ลานจอดรถ](#carportinteg) | `js/models/carports.js` |  | 3.1 | 190886415 |
| 16 | [ตึกที่ติดกับหอประชุมสถาปัตยกรรมศาสตร์](#archsouth) | `js/models/archs.js` | 4 | 16.3 | 190880792 |
| 17 | [หอประชุมสถาปัตยกรรมศาสตร์](#archaud) | `js/models/archs.js` |  | 16.1 | 190881393 |
| 18 | [อาคารเรียนรวมสถาปัตย์](#archlec) | `js/models/archs.js` | 3 | 16.3 | 516204090 |
| 19 | [shop พลังงาน](#shoppower) | `js/models/shops.js` | 2 | 9 | 1243388144 |
| 20 | [shop ไม้](#shopwood1) | `js/models/shops.js` | 2 | 9 | 1243388146 |
| 21 | [shop Textile](#shoptextile) | `js/models/shops.js` | 2 | 9 | 1243388147 |
| 22 | [shop ดำ](#shopblack) | `js/models/shops.js` | 2 | 9 | 1491133180 |
| 23 | [shop furniture](#shopfurn1) | `js/models/shops.js` | 2 | 9 | 1491133181 |
| 24 | [shop ส้ม](#shoporange) | `js/models/shops.js` | 2 | 9 | 1491133182 |
| 25 | [shop เซรามิค](#shopceramic2) | `js/models/shops.js` | 2 | 9 | 1491133183 |
| 26 | [shop เหล็ก](#shopsteel) | `js/models/shops.js` | 2 | 9 | 1491133184 |
| 27 | [shop ไม้](#shopwood2) | `js/models/shops.js` | 2 | 9 | 1491133185 |
| 28 | [shop plastic](#shopplastic) | `js/models/shops.js` | 2 | 9 | 1491133186 |
| 29 | [shop jewelry](#shopjewel) | `js/models/shops.js` | 1 | 6 | 1491133187 |
| 30 | [shop ส้มเล็ก](#shoporanges) | `js/models/shops.js` | 1 | 6 | 1491133188 |
| 31 | [shop ceramic](#shopceramic1) | `js/models/shops.js` | 1 | 6 | 1491133189 |
| 32 | [shop furniture](#shopfurn3) | `js/models/shops.js` | 1 | 6 | 1491133190 |
| 33 | [shop furniture](#shopfurn2) | `js/models/shops.js` | 2 | 9 | 1491133191 |
| 34 | [ลานเชียร์](#cheer) | `js/models/small.js` |  |  | 404292180 |
| 35 | [ลานจอดรถ](#carportcanc2) | `js/models/carports.js` |  | 3.1 | 190886414 |
| 36 | [ยิมเล็ก](#gym) | `js/models/engw.js` |  | 13.5 | 190886418 |
| 37 | [ลานจอดรถ](#carportcanc1) | `js/models/carports.js` |  | 3.1 | 190886419 |
| 38 | [ภาควิชาวิศวกรรมวัดและควบคุม](#control) | `js/models/deps.js` | 3 | 12.5 | 190889047 |
| 39 | [เครื่องกล workshop](#workshopw) | `js/models/deps.js` | 2 | 8.4 | 190889049 |
| 40 | [ภาควิชาวิศวกรรมเครื่องกล](#mech) | `js/models/engw.js` | 4 | 17.2 | 190889051 |
| 41 | [เครื่องกล workshop](#workshope) | `js/models/deps.js` | 2 | 8.4 | 190889053 |
| 42 | [โรงอาหาร 3 (C)](#canc) | `js/models/engw.js` | 2 | 10.8 | 190890100 |
| 43 | [อาคารเรียนรวม คณะวิศวกรรมศาสตร์ (12 ชั้น)](#e12) | `js/models/e12.js` | 12 | 47.5 | 516204086 |
| 44 | [ภาคอุตสาหการ](#indus) | `js/models/engw.js` | 3 | 14.5 | 516204087 |
| 45 | [อัฒจันทร์ สนามกีฬากลาง](#stad) | `js/models/stad.js` | 3 | 17 | 1138463206 |
| 46 | [หอพักนักศึกษา อาคาร 11](#dorm11) | `js/models/dorms.js` | 10 | 36.2 | 1206348758 |
| 47 | [สำนักหอสมุดกลาง อาคารเฉลิมพระเกียรติ](#lib) | `js/models/lib.js` | 4 | 21 | 190697423 |
| 48 | [หอประชุมวิศวะ](#eaud) | `js/models/eaud.js` | 2 | 17.4 | 190868497 |
| 49 | [หอประชุมวิศวะ](#ewing) | `js/models/ewing.js` | 2 | 11.3 | 190868498 |
| 50 | [ตึกโทรคมนาคม](#tel) | `js/models/tel.js` | 4 | 14.8 | 190868528 |
| 51 | [ลานจอดรถ](#carportctrl1) | `js/models/carports.js` |  | 3.1 | 190870221 |
| 52 | [ลานจอดรถ](#carportctrl2) | `js/models/carports.js` |  | 3.1 | 190870222 |
| 53 | [ตึกบี](#bbld) | `js/models/bbld.js` | 4 | 13.6 | 190870224 |
| 54 | [โรงอาหาร A คณะวิศวกรรมศาสตร์](#cana) | `js/models/cana.js` | 1 | 8.6 | 190880523 |
| 55 | [หอประชุมจุฬาภรณ์วลับลักษณ์](#chaud) | `js/models/chaud.js` | 3 | 15.8 | 265574872 |
| 56 | [จุฬาภรณ์วลัยลักษณ์ 2](#chula2) | `js/models/chula2.js` | 6 | 23.4 | 265574874 |
| 57 | [ตึกปฏิบัติการณ์หลังใหม่](#newlab) | `js/models/newlab.js` | 10 | 38 | 265588799 |
| 58 | [โรงอาหาร คณะวิทยาศาสตร์](#scican) | `js/models/scican.js` |  | 9.5 | 265596517 |
| 59 | [ตึก วท.](#witt) | `js/models/witt.js` | 2 | 9.2 | 265596518 |
| 60 | [สโมสรนักศึกษา](#club) | `js/models/small.js` | 2 |  | 265596519 |
| 61 | [อาคารอิฐข้าง Sky Walk (ฝั่งเหนือทางรถไฟ)](#scib) | `js/models/scib.js` | 5 | 19.1 | 265596520 |
| 62 | [Lawson 108](#lawson) | `js/models/small.js` |  |  | 265596521 |
| 63 | [A-Building](#abld) | `js/models/abld.js` | 6 | 21.8 | 292807567 |
| 64 | [อาคารเฉลิมพระเกียรติ 55 พรรษา สมเด็จพระเทพฯ](#t55) | `js/models/t55.js` | 8 | 30 | 309556942 |
| 65 | [โรงอาหาร ตึก L](#lcan) | `js/models/small.js` |  |  | 309557500 |
| 66 | [ตึก ECC](#ecc) | `js/models/ecc.js` | 10 | 39.5 | 309557571 |
| 67 | [โรงอาหาร ตึกพระเทพฯ](#thepcan) | `js/models/mid.js` | 2 | 10.7 | 309919518 |
| 68 | [อาคารเรียนรวม สมเด็จพระเทพฯ](#thep) | `js/models/thep.js` | 2 | 9.4 | 309919519 |
| 69 | [คณะทันตแพทยศาสตร์](#dent) | `js/models/dent.js` | 5 | 22.2 | 501351775 |
| 70 | [สโมสรนักศึกษา คณะวิศวกรรมศาสตร์](#engclub) | `js/models/small.js` | 1 |  | 516204084 |
| 71 | [ภาคอัตโนมัติ](#automation) | `js/models/mid.js` | 3 | 16 | 516204094 |
| 72 | [ภาคไฟฟ้าและพลังงานไฟฟ้า](#elec) | `js/models/elec.js` | 2 | 11.6 | 516204095 |
| 73 | [ธนาคารและไปรษณีย์](#bank) | `js/models/mid.js` | 1 | 4.3 | 516204096 |
| 74 | [นาโน](#nano) | `js/models/mid.js` | 2 | 9 | 516204097 |
| 75 | [คลินิกเวชกรรม สจล.](#clinic) | `js/models/mid.js` | 2 | 10.9 | 516204098 |
| 76 | [ตึกกระจก](#glass) | `js/models/small.js` | 2 |  | 516204099 |
| 77 | [อาคารจอมไตร](#jomtrai) | `js/models/jomtrai.js` | 3 | 13.4 | 516308731 |
| 78 | [สำนักงานอธิการบดี สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง](#pres) | `js/models/pres.js` | 10 | 38.8 | 516308733 |
| 79 | [อาคารหอพระราชประวัติพระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว พระสยามเทวมหามกุฏวิทยมหาราช](#royal) | `js/models/royal.js` | 1 | 22 | 516308734 |
| 80 | [คณะแพทยศาสตร์](#med) | `js/models/med.js` | 3 | 14.2 | 592798785 |
| 81 | [CMKL University](#cmkl) | `js/models/cmkl.js` | 10 | 38.9 | 784091346 |
| 82 | [โรงเรียนสาธิตนานาชาติพระจอมเกล้าลาดกระบัง](#kmids) | `js/models/kmids.js` | 6 | 25.4 | 1008793634 |
| 83 | [อินทนิล](#inthanin) | `js/models/small.js` |  |  | 1136346802 |
| 84 | [ตึก A](#tka) | `js/models/tka.js` | 5 | 21.2 | 1137554506 |
| 85 | [อาคารมหาวิทยาลัย](#uni) | `js/models/uni.js` | 2 | 13.2 | 1138463196 |
| 86 | [อาคารธนาคาร](#bankw) | `js/models/mid.js` | 1 | 5.4 | 1138463212 |
| 87 | [ธนาคารกรุงศรีอยุธยา (สาขา สจล.)](#krungsri) | `js/models/mid.js` | 1 | 6.3 | 1138463213 |
| 88 | [7-Eleven](#seven) | `js/models/small.js` |  |  | 1138469403 |
| 89 | [คาเฟ่ อเมซอน](#amazon) | `js/models/small.js` |  |  | 1138988422 |
| 90 | [หอพักนักศึกษา อาคาร 9](#dorm9) | `js/models/dorms.js` | 10 | 36.2 | 1206348756 |
| 91 | [อาคารนวัตกรรมการเรียนรู้](#innov) | `js/models/innov.js` | 11 | 45.7 | 1561993799 |
| 92 | [สโมสรนักศึกษา คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี](#kruclub) | `js/models/small.js` |  |  | 1564107227 |
| 93 | [Lita cafe & roaster - KMITL](#lita) | `js/models/lita.js` | 1 | 4.8 | 1564107231 |
| 94 | [คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง](#it) | `js/models/it.js` | 8 | 32.2 | 314204881 |
| 95 | [KMITL Kosen Dormitory](#dormks) | `js/models/dorms.js` | 5 | 22.9 | 516204078 |
| 96 | [สมาคมศิษย์เก่า](#alumni) | `js/models/mid.js` | 2 | 13.7 | 516204080 |
| 97 | [โรงอาหารถิ่นชงโค](#tincan) | `js/models/small.js` |  |  | 1049724130 |
| 98 | [KMITL Dormitory](#dormk) | `js/models/dorms.js` | 5 | 22.9 | 1116753937 |
| 99 | [หอพักนักศึกษา อาคาร 10](#dorm10) | `js/models/dorms.js` | 10 | 36.2 | 1206348757 |
| 100 | [หอพักนักศึกษา อาคาร 12](#dorm12) | `js/models/dorms.js` | 10 | 36.2 | 1206348759 |
| 101 | [โรงอาหาร คณะเทคโนโลยีสารสนเทศ](#itcan) | `js/models/itcan.js` | 2 | 10.4 | 314205127 |
| 102 | [คณะบริหารธุรกิจ](#kbs) | `js/models/kbs.js` | 6 | 29.6 | 516308732 |
| 103 | [KOSEN-KMITL](#kosen) | `js/models/kosen.js` | 4 | 24.4 | 1322811831 |
| 104 | [อาคารเจ้าคุณทหาร คณะเทคโนโลยีการเกษตร](#agri) | `js/models/agri.js` | 4 | 20.4 | 2573865 |
| 105 | [จุฬาภรณ์วลัยลักษณ์ 1](#chula1) | `js/models/chula1.js` | 7 | 28 | 3568617 |

รูปทรง OSM ที่ซ่อนไว้เพราะเป็นส่วนของโมเดลเฉพาะ (`hide`): 1138463195, 1138463197, 1138463209, 1138463210

## โรงยิม <a id="gymn"></a>

- OSM id: -1 · ไฟล์: `js/models/gymn.js` · ชั้น: 1 · สูง: 13.8 ม.
- แหล่งภาพอ้างอิง: ขอบเขตอาคารจากผู้ใช้ (ไม่มีใน OSM) + ภาพดาวเทียม Google Maps (หลังคาสองช่วงกับแผงโซลาร์ อาคารต่อด้านตะวันออก) + Street View ถนนด้านใต้ สนามหญ้าด้านตะวันตก ถนนด้านตะวันออก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a long hall under two light roofs with solar panels, an annex at the east end) and Google Street View from the road along the south side (the whole south face, the entrance portico at the south-west corner), the west lawn (the west gable end) and the east road (the annex). The user's outline also takes in the road and forecourt; the model follows the building in the imagery. The end towers and the canted upper walls were added 2026-10-19 from the KMITL Virtual Tour (ศูนย์กีฬา 1 and 3, at the road corner and on the walk by the football pitch) and the SIIE "Key locations" film (7:15); the east end from the user's Virtual Tour photo (สนามแบดมินตัน, from the road corner south-east of the hall).
- ลักษณะอาคารที่บันทึก: โรงยิม: ผนังล่างสีส้มสูงราว 5.5 ม. แถบผนังบนสีเทายื่นเล็กน้อย หน้าต่างบานใหญ่กรอบขาวสองแถวกับบานเกล็ดทั้งสองด้านยาว / หน้าจั่วสีเทาฐานส้ม หลังคาโลหะจั่วต่ำมีแผงโซลาร์ / ซุ้มทางเข้ากรอบเหลี่ยมผิวหินแกรนิตมุมตะวันตกเฉียงใต้ / อาคาร 2 ชั้นด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a tall hall: orange walls to about 5.5 m, then a grey upper band leaning out over them on a sloped ledge, with two rows of large white-framed windows and louvres along both long sides; grey gable ends with an orange base, each with a square grey tower at the south corner rising above the roof that carries a round cross-barred window and a grid of small square vents (a smaller tower with a round window at the north-east corner); a shallow light metal gabled roof with solar panels, ridge east-west, in two lengths a portico of square granite-faced frames over the entrance at the south-west corner a two-storey annex across the whole east end: orange ground floor with small top-hung windows and AC units, a grey upper floor with big windows in groups, a grey louvred plant box on its roof against the hall's gable

## สระว่ายน้ำ สจล. <a id="pool"></a>

*KMITL Swimming Pool / Wellness & Sports Center*

- OSM id: -2 · ไฟล์: `js/models/pool.js` · ชั้น: 1 · สูง: 9.6 ม.
- แหล่งภาพอ้างอิง: ขอบเขตจากผู้ใช้ (ไม่มีอาคารใน OSM) + ภาพดาวเทียม Google Maps (ผังสระ หลังคาโปร่งแสง สระช่วงเปิดโล่ง อาคารบริการ อาคารด้านใต้) + Street View ถนนด้านตะวันตกและด้านเหนือ + คลิป SIIE (youtu.be/lod-jYKKEZ0 8:10) อาคารทางเข้าบุไม้สีน้ำตาล แถบบานเกล็ดด้านบน 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-18 from Google Maps satellite imagery (the plan, the roof strips, the open east end of the pool, the sheds and the two-part roof of the south block) and Google Street View from the road along the west side (the pool roof over the trees, the brick entrance block and its bridge) and the road along the north side (the whole north side of the pool roof). No Street View reaches the south block; it follows the imagery and the brick of the entrance block.
- ลักษณะอาคารที่บันทึก: สระว่ายน้ำ 50 ม. 8 ลู่ บนพื้นยกราว 1 ม. มีราวกันตก / ช่วงตะวันตก 30 ม. มีโครงหลังคาเหล็กเปิดโล่ง เสากลมสีขาว หลังคาจั่วแผ่นสีขาวสลับแผ่นโปร่งแสงสีเขียว / ช่วงตะวันออกเปิดโล่ง / อาคารทางเข้าอิฐแดงชั้นเดียวด้านตะวันตก ประตูกระจกกรอบขาว สะพานข้ามรางน้ำ / อาคารบริการสีเทาและเพิงหลังคาลอนด้านตะวันออก / Wellness & Sports Center ด้านใต้ ผนังอิฐล่าง ผนังเทาด้านบน หลังคาแบนสองช่วง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): the pool sits in a concrete deck raised about 1 m, with a railing along its edges a 50 m pool, eight lanes; its west 30 m under an open-sided steel shelter: white round columns, a light gabled roof (ridge east-west) of white sheet with green translucent strips running down both slopes, a ridge cap, steel tie beams under it; the east 20 m open to the sky a single-storey entrance block at the west end, clad in brown timber boards (red brick until a refit) with a band of dark louvre windows above, a white-framed glass door and a thin flat roof, reached by a small concrete bridge with steps over the ditch along the road east of the pool: a flat-roofed grey service block and an open shed with a rusty corrugated mono-pitch roof the Wellness & Sports Center south of the pool: brick below, grey cladding with a high window band above, flat light roofs in two parts, the east part taller

## ทางเดินมีหลังคาริมทางรถไฟ <a id="railwalk"></a>

- OSM id: -3 · ไฟล์: `js/models/railwalk.js` · ชั้น: 1 · สูง: 3 ม.
- แหล่งภาพอ้างอิง: Street View ถนนริมทางรถไฟ (ผู้ใช้ชี้ตำแหน่ง ไม่มีใน OSM) + ภาพดาวเทียม Google Maps (แนวทางเดินและปลายทั้งสองด้าน)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-18 from Google Street View on the road beside it (looking east and west along it, and at the station gate) and Google Maps satellite imagery (its line, both ends; it follows the slight skew of the tracks).
- ลักษณะอาคารที่บันทึก: ทางเดินมีหลังคาริมทางรถไฟ: ยาวราว 425 ม. จากถนนใหญ่ที่จุดตัดทางรถไฟถึงทางข้ามหน้าหอพัก / หลังคาโค้งแผ่นลอนสีเขียว เสาเหล็กสีเข้มบนฐานคอนกรีตริมถนนทุก 3 ม. / รั้วทางรถไฟด้านใต้ ผนังสีครีมสูงราว 1.1 ม. ซี่เหล็กสีส้มด้านบน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a paved walk about 3 m wide; dark steel posts on small concrete bases along the road edge every 3 m, an edge beam on them; a green corrugated barrel roof (a shallow arc) spanning from the posts to the fence the railway fence along the south side: a cream wall about 1.1 m high with orange vertical bars above it no roof, posts or beams where the Sky Walk's two stairs come down on the walk (x -144.5..-99.5, user's photos 2026-10-19); the paving and the fence carry on

## สะพานลอยหน้าอาคารนวัตกรรมการเรียนรู้ <a id="footbridge"></a>

- OSM id: -4 · ไฟล์: `js/models/innov.js` · ชั้น: 1 · สูง: 8.6 ม.
- แหล่งภาพอ้างอิง: Street View ถนนฉลองกรุง (ไม่มีใน OSM) + ภาพดาวเทียม Google Maps
- ลักษณะอาคารที่บันทึก: สะพานลอยข้ามถนนฉลองกรุง: ทางเดินเหล็กสูงราว 5.8 ม. แผงข้างสีขาว หลังคาเบา บันไดลงทางทิศตะวันตกทั้งสองฝั่ง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): tower       x 255..273, z -271..-255: eleven storeys (a tall glazed ground floor, then ten of 3.8 m), each floor a projecting white slab; deep white vertical fins in front of dark glass on all faces terraces    lower wings stepping down to the east (x 273..291) and the south (z -255..-238), white slab edges and glass railings on every step steps       a broad white stepped plaza south of the building, x 261..297, z -238..-221, rising north canopy      a steel lattice sweeping from the top of the tower's east face down to a flat wedge-shaped tip about 7.5 m up at x 310, on a raking strut: chords along it, diagonal braces, cross ribs forecourt   paving with a triangle pattern and a round fountain east of the canopy, a hedge along the road signs       two dark sign walls with the faculty name on the road fence footbridge  a covered steel footbridge over ถนนฉลองกรุง at x 262..265, stairs down both footpaths

## ตึก L คณะวิศวกรรมศาสตร์ <a id="lbld"></a>

*Engineering Lecture Building L*

- OSM id: -5 · ไฟล์: `js/models/lbld.js` · ชั้น: 4 · สูง: 17.8 ม.
- แหล่งภาพอ้างอิง: ผังจากภาพดาวเทียม Google Maps (ไม่มีใน OSM) + ภาพ KMITL Virtual Tour ที่ผู้ใช้ส่งมา 19 ต.ค. 2026 (ด้านหน้าทิศใต้จากทางเดินมีหลังคาริมทางรถไฟ) ทะเบียนอาคาร EN-21
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-19 from the user's KMITL Virtual Tour photos (the south front from under the covered walk along the railway) and the imagery (flat roof with a square skylight in the middle, a row of dark plant pits along the south side).
- ลักษณะอาคารที่บันทึก: ตึก L: อาคาร 4 ชั้นผนังขาวเรียบ ด้านหน้าทิศใต้ยื่นเข้าออก ช่วงกลางร่นเข้ามีหน้าต่างชั้นละสามบาน ทางเข้ากระจกใต้กันสาดเหล็กสีเข้ม ช่วงยื่นสองข้างหน้าต่างบานใหญ่แบ่งช่อง ปลายสองด้านหน้าต่างแคบ / หลังคาแบนมีช่องแสงสี่เหลี่ยมกลางหลังคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): four storeys of plain white render; the south front steps in and out: a set-back middle with three windows a floor over a glazed entrance under a dark steel canopy, two bays standing forward on either side with big gridded windows, narrow slots of windows at the ends; steps across the entrance

## Sky Walk สจล. (สะพานลอยข้ามทางรถไฟ) <a id="skywalk"></a>

*KMITL Sky Walk*

- OSM id: -6 · ไฟล์: `js/models/skywalk.js` · ชั้น: 1 · สูง: 10.2 ม.
- แหล่งภาพอ้างอิง: เส้นทางจากภาพดาวเทียม Google Maps (ไม่มีใน OSM) + ภาพบันไดและด้านข้างสะพานที่ผู้ใช้ส่งมา + KMITL Virtual Tour สำนักบริหารข้อมูลดิจิทัล 1-8 (บนสะพาน)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-19 from the user's photo of the north stair and the bridge's west side, and from the KMITL Virtual Tour (สำนักบริหารข้อมูลดิจิทัล 1-8, on the deck: the "SKY WALK" boards, the orange frames, the lift tower).
- ลักษณะอาคารที่บันทึก: Sky Walk: สะพานทางเดินมีหลังคาสูงราว 6.8 ม. ข้ามทางรถไฟและถนนฉลองกรุง จากหน้าธนาคารและไปรษณีย์ไปสำนักบริหารข้อมูลดิจิทัลและหอสมุด / เสากลมสีขาวตั้งสลับเอียง คานสีแดงส้ม หลังคาโลหะ โครงถักเหล็กใต้พื้น ราวสเตนเลส / ตัวอักษร KMITL สีส้มด้านตะวันตก ปลายด้านเหนือหยุดที่รั้วทางรถไฟ ไม่ข้ามถนน: ชานพักบนเสาเหลี่ยมสีเทาต้นเดียว หลังคาโค้งบนเสาขาว บันไดเหล็กโล่งลงทางตะวันตก บันไดมีหลังคาจั่วผนังข้างขาวลงทางตะวันออก ทั้งสองขนานกับรั้ว
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): deck about 6.8 m up, 4 m wide, a grey steel truss under it, a stainless rail each side a row of white round columns along each side, alternately upright and leaning, carrying a shallow metal roof on red-orange beams big orange "KMITL" letters on the west side over the railway fence by the north end north end (corrected 2026-10-19 from the user's photos taken from the bank across the road): the bridge stops at the railway fence and does not cross the road; a landing on one square grey column under an arched roof on white posts, an open steel stair down westward and a covered stair (pitched roof, solid white side) down eastward, both running along the fence route: north-south from z -84 to z 6 (x -125..-121), then east to x -90, then south-east to the library

## KMITL Sky Walk (ฝั่ง CMKL) <a id="skywalkcmkl"></a>

*KMITL Sky Walk (CMKL)*

- OSM id: -7 · ไฟล์: `js/models/skywalk.js` · ชั้น: 1 · สูง: 11.6 ม.
- แหล่งภาพอ้างอิง: เส้นทางจากภาพดาวเทียม Google Maps (ไม่มีใน OSM) + คลิป KMITL Channel+ "KMITL Share Lo" EP.4 (youtu.be/HfCKpGCRyCo 0:02-0:40 ภาพโดรน)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-19 from the user's photo of the north stair and the bridge's west side, and from the KMITL Virtual Tour (สำนักบริหารข้อมูลดิจิทัล 1-8, on the deck: the "SKY WALK" boards, the orange frames, the lift tower).
- ลักษณะอาคารที่บันทึก: Sky Walk ฝั่ง CMKL: สะพานตรงข้ามทางรถไฟและถนนฉลองกรุง ขึ้นจากถนนด้านเหนือ ลงที่ด้านหน้าทิศเหนือของ CMKL / โครงถักเหล็กสีขาวสองข้าง หลังคาขาวหน้าตัดโค้ง ระดับยอดหลังคาขึ้นลงเป็นคลื่นตามความยาว เสาเทาเป็นคู่ / บันไดตรงลงทางเหนือที่ปลายด้านเหนือ
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): deck about 6.8 m up, 4 m wide, a grey steel truss under it, a stainless rail each side a row of white round columns along each side, alternately upright and leaning, carrying a shallow metal roof on red-orange beams big orange "KMITL" letters on the west side over the railway fence by the north end north end (corrected 2026-10-19 from the user's photos taken from the bank across the road): the bridge stops at the railway fence and does not cross the road; a landing on one square grey column under an arched roof on white posts, an open steel stair down westward and a covered stair (pitched roof, solid white side) down eastward, both running along the fence route: north-south from z -84 to z 6 (x -125..-121), then east to x -90, then south-east to the library

## อาคาร 2 ชั้นริมสนามบาส (หลังอาคาร HM) <a id="courtblock"></a>

- OSM id: -8 · ไฟล์: `js/models/scib.js` · ชั้น: 2 · สูง: 8.3 ม.
- แหล่งภาพอ้างอิง: ขอบเขตจากภาพดาวเทียม Google Maps (ไม่มีใน OSM) + คลิป SIIE Key locations (youtu.be/lod-jYKKEZ0 5:40 มองข้ามสนามบาส) 19 ต.ค. 2026
- ลักษณะอาคารที่บันทึก: อาคาร 2 ชั้นสีชมพูอ่อนในกรอบขาว / ส่วนตะวันตกผนังทึบมีเสาอิง / ส่วนตะวันออกทางเดินเปิดโล่งทั้งสองชั้นหลังเสาเหลี่ยมขาว ราวสีเทาเข้ม / หลังคาแบน ขอบหลังคาขาวลึก

## หอประชุมเจ้าพระยาสุรวงษ์ไวยวัฒน์ (วร บุนนาค) <a id="hall"></a>

*Chao Phya Surawongwaiwat (Worn Bunnag) Convention Hall*

- OSM id: 190697575 · ไฟล์: `js/models/hall.js` · ชั้น: 3 · สูง: 25 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังและหลังคา) + Street View: ภาพ 360 องศาจากลานจอดรถหน้าอาคาร บันไดทางเข้าระยะใกล้ มุมตะวันตกเฉียงใต้ ด้านตะวันตก ถนนด้านเหนือ มุมตะวันออกเฉียงเหนือ ถนนด้านตะวันออก + Campus Tour (youtu.be/-hBd_k2Ld5E 21:00) ป้ายชื่อตัวอักษรน้ำเงินบนแผงฟ้า เสาค้ำสแตนเลส 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roof shapes; the OSM outline is coarse and shifted, the imagery lines up with the mapped roads) and Google Street View: a 360° photo from the car park 47 m south of the front (whole south face), the entrance steps close up, the south-west corner, the west end beside the steel carport, the north face from the north road, the north-east corner and the east service road.
- ลักษณะอาคารที่บันทึก: หอประชุมเจ้าพระยาสุรวงษ์ฯ: โถงประชุมใหญ่กล่องสีขาวสูง หลังคาโค้งประทุนแนวตะวันออก-ตะวันตก ปูแผงโซลาร์ / ด้านหน้า (ใต้): หลังคาปีกยื่นยาว 4 ช่วง ชายคาแอ่นลงกลางช่วงและเชิดขึ้นที่มุมทั้งสองข้าง เสาสีขาวสูงมีค้ำเหล็กรูปตัว V ผนังกระจกสองชั้นแถบขาวด้านบน ป้ายชื่ออาคารสีน้ำเงินบนแผงขาว ตราสัญลักษณ์ด้านบน ยกพื้นมีบันได / ปลายทั้งสองข้างอิฐแดงกรอบหน้าต่างขาว แถบพื้นสีขาว / ด้านเหนือ: ชั้นล่างผนังขาวมีหน้าต่างและช่องระบายอากาศ ชั้นบนระเบียงร่น เสาอิฐแดงสูง / ปีกตะวันตกเฉียงเหนือ: ผนังขาวหน้าต่างแถบยาว หลังคาแบนยื่น หอป้ายอิฐ 'KMITL Convention Hall' / ด้านตะวันออก: อาคารบริการสองชั้นสีขาว ที่จอดขนของชั้นล่าง ทางลาดลงชั้นใต้ดิน / ด้านตะวันตก: หลังคาโครงเหล็กคลุมที่จอดรถ
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): main hall  x 90..192, z 95..149: tall plain white box under a barrel roof (ridge east-west at z 122) south front x 69..214, z 151..190: foyer block under a wing roof in four bays whose eave sags between the seams and sweeps up at both outer corners; tall white columns with V struts carry the overhang; two-storey glass wall with a white band above; the hall's name in blue on a pale blue board, emblem above; both ends in red brick with white-framed windows and white floor bands north strip x 60..190, z 87..95: white ground floor (windows, louvres), recessed balconies, brick piers north-west wing x 48..78, z 94..137: white, ribbon windows, flat overhanging roof, brick name tower east annex x 190..198: two-storey white service block with a roof terrace, loading bays below west carport x 48..70.5, z 153..170: light steel roof on slanted posts all large roofs are covered in solar panels

## อาคารปฏิบัติการรวมวิศวกรรม 1 <a id="englab1"></a>

- OSM id: 190886412 · ไฟล์: `js/models/englab1.js` · ชั้น: 6 · สูง: 25.8 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคายาว) + Street View ทางเดินและถนนรอบอาคาร: ด้านใต้ฝั่งยิมเล็ก ด้านเหนือจากลานจอดรถ ปลายทั้งสองด้าน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a long flat roof between the small gym and the car park) and Google Street View from the walks and roads all round it: the south face from the gym side, the north face from the car park, both ends.
- ลักษณะอาคารที่บันทึก: อาคารปฏิบัติการวิศวกรรม 1: 6 ชั้นยาว 115 ม. ผนังขาว / ด้านใต้ระเบียงลึกทุกชั้นกับบานเกล็ดบังแดด ครีบขาวเรียงบนขอบหลังคา / ด้านเหนือหน้าต่างกรอบเข้มเป็นคู่สลับแผงบล็อกแก้วสีเทา / หอบันไดขอบส้มปลายตะวันตก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): six storeys, 115 m long; white render south face: deep balconies on every floor with thin sunshade louvres, strip windows behind, a row of white fins standing up along the roof edge like a comb north face: large dark-framed windows in pairs between panels of grey glass block, white floor bands plain white end walls; an orange-trimmed stair block at the west end

## ภาควิชาวิศวกรรมเกษตร <a id="ageng"></a>

- OSM id: 190890102 · ไฟล์: `js/models/deps.js` · ชั้น: 2 · สูง: 10.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาโลหะสีอ่อน) + Street View ถนนด้านเหนือและด้านตะวันออก + คลิป Uni Tour แนะนำตึกเรียนวิศวะ (youtu.be/XKpuIm42uQc 5:04 ด้านยาวที่มีชื่อภาค) 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and car parks round each one.
- ลักษณะอาคารที่บันทึก: ภาควิชาวิศวกรรมเกษตร: 2 ชั้นโครงคอนกรีตขาว / ชั้นล่างประตูม้วนเต็มช่วงเสา / ชั้นบนครึ่งล่างเป็นแผงบานเกล็ดแนวนอนสีน้ำตาลอ่อน แถบผนังขาว แล้วเป็นหน้าต่างบานกระทุ้งกรอบดำสลับแผงบล็อกแก้ว / ชื่อภาควิชาบนผนัง / แผ่นหลังคาคอนกรีตแบนยื่นลึก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมวัดและควบคุม: a U of three-storey wings, white render with continuous floor slabs and strip windows in grey frames ภาควิชาวิศวกรรมเกษตร: two storeys in a white concrete frame; roller shutters on the ground floor, panels of horizontal louvres and glass block above, top-hung windows under the eaves; a low light metal roof เครื่องกล workshops: tall single-storey halls with strip windows under a deep metal roof overhang, roller doors

## อาคาร HM (อาคารเฉลิมพระเกียรติ 7 รอบ) - SIIE คณะวิศวกรรมศาสตร์ หลักสูตรนานาชาติ <a id="siie"></a>

- OSM id: 516204082 · ไฟล์: `js/models/siie.js` · ชั้น: 8 · สูง: 30.9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาสองส่วนกับแกนบันได) + Street View ถนนด้านใต้: ระยะใกล้ที่ปลายตะวันตก (บันได ทางลาด ชั้นล่างโล่ง) และห่าง 22 ม. จากปลายตะวันออก (ด้านสกัดทั้งด้าน ความสูงจากจำนวนชั้น) ด้านเหนือไม่มีภาพจากถนน + คลิป SIIE Key locations (youtu.be/lod-jYKKEZ0 1:52-2:02 ด้านใต้และทางเข้าอาคาร HM) และแผนที่ในคลิป Uni Tour (youtu.be/XKpuIm42uQc 2:22) ยืนยันว่า HM กับ SIIE เป็นอาคารเดียวกัน 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (two roof halves either side of a stair core) and Google Street View on the road along the south face: close up at the west end (entrance steps, car-park ramp, open ground floor) and from 22 m beyond the east end (whole east elevation and the south face in perspective; height from the floor count, about 30 m). The north face is not visible from any road and follows the end walls. This is also the HM building (อาคารเฉลิมพระเกียรติ 7 รอบ, "His Majesty the King's 7th Cycle Birthday Anniversary Building"): the SIIE film (youtu.be/lod-jYKKEZ0 1:52-2:02) shows the SIIE logo on the brick pier in its entrance, and the map in youtu.be/XKpuIm42uQc 2:22 puts both names on this footprint. The south face was reworked from those frames on 2026-10-19.
- ลักษณะอาคารที่บันทึก: อาคาร HM / SIIE: อาคาร 8 ชั้น ชั้นล่างสูงโล่งหลังเสาเหลี่ยมสีขาว บันไดกว้างขึ้นจากถนน เสาอิฐมีโลโก้ SIIE ทางลาดลงที่จอดรถฝั่งตะวันตก / ด้านใต้: แผ่นพื้นขอบขาว ชั้น 3-7 ระเบียงโล่งหลังผนังกันตกสีครีม ราวสีสนิม แผงระแนงนอนสีน้ำตาลเป็นแถบแนวตั้งทุก 5.6 ม. ชั้น 1-2 ระเบียงโล่งมีราว แผงจีบสีขาวที่ฐานฝั่งตะวันออก ชื่ออาคารภาษาอังกฤษสีน้ำเงินบนขอบหลังคา / ด้านสกัดและด้านเหนือ: ผนังสีเบจในกรอบสีขาว หน้าต่างเจาะเล็ก / แกนบันไดสีขาวสูงเหนือหลังคาเล็กน้อย เสาล่อฟ้า
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ground floor 5 m, open behind square white columns, with broad steps up from the road and a car-park ramp at the west; seven floors of 3.55 m above south face: white floor slabs; on floors 3-7 open balconies behind cream parapets with a rusty rail on top, and vertical strips of horizontal brown slats standing off them every 5.6 m; open balconies with rails on floors 1-2; a white pleated panel at the base of the east part; the building's English name in blue on the south fascia ends and north: beige walls in a white frame (floor bands, corner strips), small punched windows stair/lift core at x -292..-281 a little above the roof, lightning mast

## ภาคโยธา <a id="civil"></a>

- OSM id: 516204085 · ไฟล์: `js/models/civil.js` · ชั้น: 2 · สูง: 10.3 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังและหลังคาทุกหลัง) + Street View ถนนด้านเหนือ (มองตะวันตกเฉียงใต้ ใต้ ตะวันออกเฉียงใต้) ลานกลางและโรงปฏิบัติการด้านตะวันตกและใต้ไม่มีภาพจากถนน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plan and roofs) and Google Street View from the road along the north side (one car pano, looking south-west, south and south-east). The courtyard and the west and south halls are not visible from any road; they follow the roofs and the north wing.
- ลักษณะอาคารที่บันทึก: ภาคโยธา: กลุ่มอาคารเตี้ยรอบลานต้นไม้ / ปีกเหนือ 2 ชั้น ผนังครีมระหว่างเสาอิฐส้ม ประตูม้วนสีเขียวชั้นล่าง บันไดเปิดปลายตะวันออก แถบเชิงชายสีเทา หลังคาปั้นหยาสีแดง / ถัดไปทางตะวันออก อาคาร 2 ชั้นสีครีมมีป้ายภาควิชา หลังคาจั่วสีเทา และโรงปฏิบัติการหลังคาจั่วเหล็กสีอ่อน / โรงปฏิบัติการชั้นเดียวด้านตะวันตกและด้านใต้ หลังคาเหล็กลอนจั่ว / อาคารเล็กหลังคาแบนสองหลังข้างลาน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): north wing  x -419..-395, z 89..108: two storeys, cream walls between orange-brick piers, green roller shutters on the ground floor, an open stair at the east end, grey fascia band, red hipped roof north-east  x -395..-381, z 89..111: two storeys, cream walls with the department sign, grey gable roof x -381..-365, z 90..109: workshop, light metal gable roof west hall   x -441..-424, z 105..152 and south hall x -418..-370, z 125..140: single-storey workshops, light corrugated metal gable roofs two small flat-roofed blocks off the courtyard

## ตึกบูรณาการ <a id="integ"></a>

- OSM id: 190886413 · ไฟล์: `js/models/engw.js` · ชั้น: 5 · สูง: 23.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ปีกหลังคาโลหะ หอกลาง) + Street View ถนนด้านเหนือ (ด้านหน้า หอมีตราหกเหลี่ยม หลังคากันสาด) และด้านตะวันออก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads round each building.
- ลักษณะอาคารที่บันทึก: ตึกบูรณาการ: 5 ชั้น ชั้นล่าง 3 ชั้นกระเบื้องสีส้มอมชมพู หน้าต่างเจาะมีบานเกล็ดบังแดดขาว ชั้นบนสีครีม / หอกลาง 6 ชั้นมีตราหกเหลี่ยมสามวง หลังคากันสาดลึกสีน้ำตาลอ่อนด้านเหนือ / หลังคาโลหะปีกข้าง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมเครื่องกล: four storeys of white render with deep floor slabs, big windows over red-brick spandrels, a canopy on round columns over the entrance with the department's name, a round stair at the north-west corner ตึกบูรณาการ: five storeys; the lower three in salmon tile with punched windows under white sunshade louvres, the upper two in cream; a six-storey centre tower with a three-hexagon emblem, a deep tan canopy over the entrance on the north; light metal gabled roofs on the long wings ยิมเล็ก: a tall orange hall with a long band of white-framed windows on an orange ledge high up on both long sides, a light metal hipped roof with deep eaves (re-surveyed 2026-10-19, see buildGym) โรงอาหาร 3 (C): two storeys of pale peach render, shops on the ground floor under a solid cream band with a white rail, an open upper floor, a red metal hipped roof with deep eaves and a white clerestory box through it; a three-storey pink block on its east side (re-surveyed 2026-10-19, see buildCanC) ภาคอุตสาหการ: an L of two- and three-storey cream blocks with light metal gabled roofs

## ลานจอดรถ <a id="carportinteg"></a>

- OSM id: 190886415 · ไฟล์: `js/models/carports.js` · ชั้น:  · สูง: 3.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (แนวหลังคาและสี) + Street View ถนนข้างลานจอด
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the roof strips and their colours) and Google Street View from the roads beside them (steel roofs cantilevered from one row of posts down the middle).
- ลักษณะอาคารที่บันทึก: ลานจอดรถมีหลังคา: เสาเหล็กแถวเดียวกลาง คานยื่นยกขึ้นสองข้าง หลังคาเหล็กลอน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a row of steel posts down the long axis carrying beams that tilt up a little to both edges, under a corrugated metal roof: dark grey by the integration building, blue by canteen C, blue-green by the measurement and control department

## ตึกที่ติดกับหอประชุมสถาปัตยกรรมศาสตร์ <a id="archsouth"></a>

- OSM id: 190880792 · ไฟล์: `js/models/archs.js` · ชั้น: 4 · สูง: 16.3 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (อาคารหลังคาแบน) + Street View ถนนด้านตะวันตกและลานด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the two long bars and their link, the auditorium hall with its round drum and east porch, the flat-roofed block south of it) and Google Street View from the road along the west side (the auditorium's brick walls, the south block), the road to the north and the courtyard south of the south block.
- ลักษณะอาคารที่บันทึก: อาคาร 4 ชั้น ชั้นล่างอิฐแดง ชั้นบนมีแผงบานเกล็ดโลหะแนวนอนสีเทาเข้มบนโครงเหล็ก หลังคาแบน / ทางเข้ากระจกด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): lecture building: two long three-storey bars (x -265..-167) joined by a link; white walls with tall orange vertical strips between the windows, an open ground floor behind columns, light metal gabled roofs; on the street (north) face: white fins, a deep white canopy over glazed rooms and the orange AAD logo (2026-10-19) auditorium: a tall blank box of red brick crossed by thin white bands, a glazed entrance on the west; a round drum on its east half under a shallow dome, a porch on the east south block: four storeys, a red-brick ground floor, the upper floors behind dark-grey horizontal metal louvre screens on steel frames, a flat roof

## หอประชุมสถาปัตยกรรมศาสตร์ <a id="archaud"></a>

- OSM id: 190881393 · ไฟล์: `js/models/archs.js` · ชั้น:  · สูง: 16.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (โถงหอประชุม ทรงกลม มุขด้านตะวันออก) + Street View ถนนด้านตะวันตกและด้านเหนือ
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the two long bars and their link, the auditorium hall with its round drum and east porch, the flat-roofed block south of it) and Google Street View from the road along the west side (the auditorium's brick walls, the south block), the road to the north and the courtyard south of the south block.
- ลักษณะอาคารที่บันทึก: หอประชุมสถาปัตยกรรมศาสตร์: กล่องอิฐแดงทึบสูง แถบขาวบาง ทางเข้ากระจกด้านตะวันตก / ทรงกลมด้านตะวันออกหลังคาโดมเตี้ย มุขด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): lecture building: two long three-storey bars (x -265..-167) joined by a link; white walls with tall orange vertical strips between the windows, an open ground floor behind columns, light metal gabled roofs; on the street (north) face: white fins, a deep white canopy over glazed rooms and the orange AAD logo (2026-10-19) auditorium: a tall blank box of red brick crossed by thin white bands, a glazed entrance on the west; a round drum on its east half under a shallow dome, a porch on the east south block: four storeys, a red-brick ground floor, the upper floors behind dark-grey horizontal metal louvre screens on steel frames, a flat roof

## อาคารเรียนรวมสถาปัตย์ <a id="archlec"></a>

- OSM id: 516204090 · ไฟล์: `js/models/archs.js` · ชั้น: 3 · สูง: 16.3 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (อาคารยาวสองหลังกับทางเชื่อม หลังคาโลหะ) + Street View ถนนด้านเหนือ ภายในลานไม่มีภาพ Street View + คลิป ที่นี่ลาดกระบัง Cinematic EP.1 (youtu.be/3VEUZdzv2EA 2:00) ด้านถนน กันสาดขาว ครีบขาว โลโก้ AAD สีส้ม 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the two long bars and their link, the auditorium hall with its round drum and east porch, the flat-roofed block south of it) and Google Street View from the road along the west side (the auditorium's brick walls, the south block), the road to the north and the courtyard south of the south block.
- ลักษณะอาคารที่บันทึก: คณะสถาปัตยกรรมศาสตร์: ผนังขาว แถบแนวตั้งสีส้ม ใต้ถุนโล่งมีเสา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): lecture building: two long three-storey bars (x -265..-167) joined by a link; white walls with tall orange vertical strips between the windows, an open ground floor behind columns, light metal gabled roofs; on the street (north) face: white fins, a deep white canopy over glazed rooms and the orange AAD logo (2026-10-19) auditorium: a tall blank box of red brick crossed by thin white bands, a glazed entrance on the west; a round drum on its east half under a shallow dome, a porch on the east south block: four storeys, a red-brick ground floor, the upper floors behind dark-grey horizontal metal louvre screens on steel frames, a flat roof

## shop พลังงาน <a id="shoppower"></a>

- OSM id: 1243388144 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop ไม้ <a id="shopwood1"></a>

- OSM id: 1243388146 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop Textile <a id="shoptextile"></a>

- OSM id: 1243388147 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop ดำ <a id="shopblack"></a>

- OSM id: 1491133180 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop furniture <a id="shopfurn1"></a>

- OSM id: 1491133181 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop ส้ม <a id="shoporange"></a>

- OSM id: 1491133182 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop เซรามิค <a id="shopceramic2"></a>

- OSM id: 1491133183 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop เหล็ก <a id="shopsteel"></a>

- OSM id: 1491133184 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop ไม้ <a id="shopwood2"></a>

- OSM id: 1491133185 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop plastic <a id="shopplastic"></a>

- OSM id: 1491133186 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop jewelry <a id="shopjewel"></a>

- OSM id: 1491133187 · ไฟล์: `js/models/shops.js` · ชั้น: 1 · สูง: 6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop ส้มเล็ก <a id="shoporanges"></a>

- OSM id: 1491133188 · ไฟล์: `js/models/shops.js` · ชั้น: 1 · สูง: 6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop ceramic <a id="shopceramic1"></a>

- OSM id: 1491133189 · ไฟล์: `js/models/shops.js` · ชั้น: 1 · สูง: 6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop furniture <a id="shopfurn3"></a>

- OSM id: 1491133190 · ไฟล์: `js/models/shops.js` · ชั้น: 1 · สูง: 6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## shop furniture <a id="shopfurn2"></a>

- OSM id: 1491133191 · ไฟล์: `js/models/shops.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (หลังคาโลหะจั่ว ช่องแสงหลังคา) ไม่มีภาพ Street View ในลานโรงงาน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: light metal gabled roofs with ridges running east-west and rows of roof lights, two brown roofs, and two open steel frames at the south end. No Street View reaches the yard, so walls and heights are a plain reading of the roofs (taller sheds for the two-level ones in OSM).
- ลักษณะอาคารที่บันทึก: โรงงานฝึกปฏิบัติ: ผนังครีม หน้าต่างแถบสูง ประตูม้วน หลังคาโลหะจั่วสีเทาอ่อนมีช่องแสง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): cream walls with a band of high windows and roller doors; light grey corrugated gabled roofs; the steel shops at the south end are open frames of grey steel with part of the roof sheeted

## ลานเชียร์ <a id="cheer"></a>

- OSM id: 404292180 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาโลหะกว้าง) + Street View ทางเดินด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: ลานเชียร์: โถงเปิดพื้นคอนกรีตยก เสาโครงเหล็ก หลังคาโลหะกว้าง ผ้าใบสีเข้มที่ขอบหลังคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## ลานจอดรถ <a id="carportcanc2"></a>

- OSM id: 190886414 · ไฟล์: `js/models/carports.js` · ชั้น:  · สูง: 3.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (แนวหลังคาและสี) + Street View ถนนข้างลานจอด
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the roof strips and their colours) and Google Street View from the roads beside them (steel roofs cantilevered from one row of posts down the middle).
- ลักษณะอาคารที่บันทึก: ลานจอดรถมีหลังคา: เสาเหล็กแถวเดียวกลาง คานยื่นยกขึ้นสองข้าง หลังคาเหล็กลอน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a row of steel posts down the long axis carrying beams that tilt up a little to both edges, under a corrugated metal roof: dark grey by the integration building, blue by canteen C, blue-green by the measurement and control department

## ยิมเล็ก <a id="gym"></a>

- OSM id: 190886418 · ไฟล์: `js/models/engw.js` · ชั้น:  · สูง: 13.5 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาโลหะ) + Street View ถนนด้านตะวันออกและด้านเหนือ + คลิป หนูอยากรู้ ยิมเนเซียม 1 (youtu.be/xTK53jBjDFQ 0:05-0:08) ผนังส้มกับแถบหน้าต่างกรอบขาวด้านบน 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads round each building.
- ลักษณะอาคารที่บันทึก: ยิมเล็ก: โถงสูง ผนังล่างสีส้มสูงราว 4 ม. แถบช่องลมระแนงขาว ผนังบนสีเทาฟ้า หลังคาโลหะลาดต่ำ
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมเครื่องกล: four storeys of white render with deep floor slabs, big windows over red-brick spandrels, a canopy on round columns over the entrance with the department's name, a round stair at the north-west corner ตึกบูรณาการ: five storeys; the lower three in salmon tile with punched windows under white sunshade louvres, the upper two in cream; a six-storey centre tower with a three-hexagon emblem, a deep tan canopy over the entrance on the north; light metal gabled roofs on the long wings ยิมเล็ก: a tall orange hall with a long band of white-framed windows on an orange ledge high up on both long sides, a light metal hipped roof with deep eaves (re-surveyed 2026-10-19, see buildGym) โรงอาหาร 3 (C): two storeys of pale peach render, shops on the ground floor under a solid cream band with a white rail, an open upper floor, a red metal hipped roof with deep eaves and a white clerestory box through it; a three-storey pink block on its east side (re-surveyed 2026-10-19, see buildCanC) ภาคอุตสาหการ: an L of two- and three-storey cream blocks with light metal gabled roofs

## ลานจอดรถ <a id="carportcanc1"></a>

- OSM id: 190886419 · ไฟล์: `js/models/carports.js` · ชั้น:  · สูง: 3.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (แนวหลังคาและสี) + Street View ถนนข้างลานจอด
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the roof strips and their colours) and Google Street View from the roads beside them (steel roofs cantilevered from one row of posts down the middle).
- ลักษณะอาคารที่บันทึก: ลานจอดรถมีหลังคา: เสาเหล็กแถวเดียวกลาง คานยื่นยกขึ้นสองข้าง หลังคาเหล็กลอน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a row of steel posts down the long axis carrying beams that tilt up a little to both edges, under a corrugated metal roof: dark grey by the integration building, blue by canteen C, blue-green by the measurement and control department

## ภาควิชาวิศวกรรมวัดและควบคุม <a id="control"></a>

*Instrumentation and Control Engineering*

- OSM id: 190889047 · ไฟล์: `js/models/deps.js` · ชั้น: 3 · สูง: 12.5 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ปีกอาคารผังตัว U) + Street View ถนนด้านตะวันออกและด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and car parks round each one.
- ลักษณะอาคารที่บันทึก: ภาควิชาวิศวกรรมวัดและควบคุม: ปีก 3 ชั้นผังตัว U ผนังขาว แผ่นพื้นต่อเนื่อง หน้าต่างแถบกรอบเทา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมวัดและควบคุม: a U of three-storey wings, white render with continuous floor slabs and strip windows in grey frames ภาควิชาวิศวกรรมเกษตร: two storeys in a white concrete frame; roller shutters on the ground floor, panels of horizontal louvres and glass block above, top-hung windows under the eaves; a low light metal roof เครื่องกล workshops: tall single-storey halls with strip windows under a deep metal roof overhang, roller doors

## เครื่องกล workshop <a id="workshopw"></a>

- OSM id: 190889049 · ไฟล์: `js/models/deps.js` · ชั้น: 2 · สูง: 8.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคา) + Street View ลานจอดรถและถนนข้างอาคาร
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and car parks round each one.
- ลักษณะอาคารที่บันทึก: โรงปฏิบัติการเครื่องกล: โถงสูงชั้นเดียว หน้าต่างแถบใต้ชายคาหลังคาโลหะยื่นลึก ประตูม้วน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมวัดและควบคุม: a U of three-storey wings, white render with continuous floor slabs and strip windows in grey frames ภาควิชาวิศวกรรมเกษตร: two storeys in a white concrete frame; roller shutters on the ground floor, panels of horizontal louvres and glass block above, top-hung windows under the eaves; a low light metal roof เครื่องกล workshops: tall single-storey halls with strip windows under a deep metal roof overhang, roller doors

## ภาควิชาวิศวกรรมเครื่องกล <a id="mech"></a>

*Department of Mechanical Engineering*

- OSM id: 190889051 · ไฟล์: `js/models/engw.js` · ชั้น: 4 · สูง: 17.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคา บันไดวงกลมมุมตะวันตกเฉียงเหนือ) + Street View ถนนรอบอาคาร (ทางเข้าป้าย Mechanical Engineering)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads round each building.
- ลักษณะอาคารที่บันทึก: ภาควิชาวิศวกรรมเครื่องกล: ผนังขาว ฐานผนังอิฐแดง หน้าต่างกรอบไม้สีเข้มบานใหญ่
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมเครื่องกล: four storeys of white render with deep floor slabs, big windows over red-brick spandrels, a canopy on round columns over the entrance with the department's name, a round stair at the north-west corner ตึกบูรณาการ: five storeys; the lower three in salmon tile with punched windows under white sunshade louvres, the upper two in cream; a six-storey centre tower with a three-hexagon emblem, a deep tan canopy over the entrance on the north; light metal gabled roofs on the long wings ยิมเล็ก: a tall orange hall with a long band of white-framed windows on an orange ledge high up on both long sides, a light metal hipped roof with deep eaves (re-surveyed 2026-10-19, see buildGym) โรงอาหาร 3 (C): two storeys of pale peach render, shops on the ground floor under a solid cream band with a white rail, an open upper floor, a red metal hipped roof with deep eaves and a white clerestory box through it; a three-storey pink block on its east side (re-surveyed 2026-10-19, see buildCanC) ภาคอุตสาหการ: an L of two- and three-storey cream blocks with light metal gabled roofs

## เครื่องกล workshop <a id="workshope"></a>

- OSM id: 190889053 · ไฟล์: `js/models/deps.js` · ชั้น: 2 · สูง: 8.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคา) + Street View ลานจอดรถและถนนข้างอาคาร
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and car parks round each one.
- ลักษณะอาคารที่บันทึก: โรงปฏิบัติการเครื่องกล: โถงสูงชั้นเดียว หน้าต่างแถบใต้ชายคาหลังคาโลหะยื่นลึก ประตูม้วน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมวัดและควบคุม: a U of three-storey wings, white render with continuous floor slabs and strip windows in grey frames ภาควิชาวิศวกรรมเกษตร: two storeys in a white concrete frame; roller shutters on the ground floor, panels of horizontal louvres and glass block above, top-hung windows under the eaves; a low light metal roof เครื่องกล workshops: tall single-storey halls with strip windows under a deep metal roof overhang, roller doors

## โรงอาหาร 3 (C) <a id="canc"></a>

*Cafeteria 3 (C)*

- OSM id: 190890100 · ไฟล์: `js/models/engw.js` · ชั้น: 2 · สูง: 10.8 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาปั้นหยาแดง อาคารด้านตะวันออก) + Street View ถนนด้านเหนือ ตะวันออก และตะวันตก + คลิป SIIE Key locations (youtu.be/lod-jYKKEZ0 4:42) ด้านหน้าร้านค้า แถบผนังทึบ ราวขาว หลังคาแดงกับกล่องหน้าต่างกลางหลังคา 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads round each building.
- ลักษณะอาคารที่บันทึก: โรงอาหาร 3 (C): 2 ชั้นผนังสีชมพู ชั้นล่างร้านค้า ชั้นบนโล่งมีราว หลังคาโลหะปั้นหยาสีแดงชายคาลึก / อาคาร 3 ชั้นสีชมพูด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมเครื่องกล: four storeys of white render with deep floor slabs, big windows over red-brick spandrels, a canopy on round columns over the entrance with the department's name, a round stair at the north-west corner ตึกบูรณาการ: five storeys; the lower three in salmon tile with punched windows under white sunshade louvres, the upper two in cream; a six-storey centre tower with a three-hexagon emblem, a deep tan canopy over the entrance on the north; light metal gabled roofs on the long wings ยิมเล็ก: a tall orange hall with a long band of white-framed windows on an orange ledge high up on both long sides, a light metal hipped roof with deep eaves (re-surveyed 2026-10-19, see buildGym) โรงอาหาร 3 (C): two storeys of pale peach render, shops on the ground floor under a solid cream band with a white rail, an open upper floor, a red metal hipped roof with deep eaves and a white clerestory box through it; a three-storey pink block on its east side (re-surveyed 2026-10-19, see buildCanC) ภาคอุตสาหการ: an L of two- and three-storey cream blocks with light metal gabled roofs

## อาคารเรียนรวม คณะวิศวกรรมศาสตร์ (12 ชั้น) <a id="e12"></a>

*Engineering Classroom Complex (12th)*

- OSM id: 516204086 · ไฟล์: `js/models/e12.js` · ชั้น: 12 · สูง: 47.5 ม.
- แหล่งภาพอ้างอิง: Street View ฝั่งเหนือทางรถไฟ + ทางเข้าด้านใต้ + ภาพดาวเทียม Esri + คลิป SIIE (youtu.be/lod-jYKKEZ0 5:07) และ Uni Tour (youtu.be/XKpuIm42uQc 4:40) ด้านใต้ หน้าต่างสลับบล็อกแก้ว สีชมพูอ่อน 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-16: Google Street View from the road north of the railway (whole north face) and from the south entrance under the podium, Esri World Imagery for the plan and roof colours. Re-coloured 2026-10-19 from the SIIE clip (youtu.be/lod-jYKKEZ0 5:07) and the Uni Tour clip (youtu.be/XKpuIm42uQc 4:40), both from the lawn south of the podium: the tower is pale pink, and on its south face dark-framed four-pane windows alternate with glass-block panels along every floor.
- ลักษณะอาคารที่บันทึก: อาคารเรียนรวม 12 ชั้น: ตึกสูงคอนกรีตสีครีมอมชมพู พื้นยื่นเป็นแนวนอนลึก หน้าต่างแถบยาวสีน้ำเงินเข้มสลับระเบียงแอร์ / แกนบันไดกลางทะลุสองด้าน สูงเหนือหลังคา มีช่องแสงแนวตั้งและป้าย 'วิศวลาดกระบัง' สีน้ำเงิน / หอบันไดสูงที่มุมใต้ทั้งสองข้าง (ฝั่งตะวันตกมีแถบกระจกยาวตลอดความสูง) ด้านใต้หน้าต่างสลับแผงบังแดดสีเทาอ่อน / ด้านใต้: อาคาร 3 ชั้นหลังคาปั้นหยาสีแดงซ่อนหลังเชิงผนัง 4 หลังล้อมลานเล็ก โถงใต้ถุนลึกบนเสาเหลี่ยมแนวตั้ง ยกพื้นมีบันไดและราวกันตก ชั้นบนแผงอิฐสลับหน้าต่างลึก ป้าย FACULTY OF ENGINEERING / ถนนซอยลอดใต้อาคารสองหลังฝั่งเหนือ (ติดตึกสูง) ผ่านลานกลาง ด้านบนทางลอดเป็นแผงอิฐกับหน้าต่างแคบคู่
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): tower slab   x -650..-563   z 10.9..35   12 floors, pale pink concrete, deep floor bands; north face ribbon windows with recessed AC balconies, south face windows alternating with glass-block panels; gold banner panel on the west wing core         x -614.3..-601.7, projects 1.3 m north, rises above the roof, slit windows, blue sign east stair   x -563..-557   one floor lower (north half); stair towers at both south corners rise above the roof; west end wall rises as a fin at its north end podium       x -647..-575   z 35..87.5   3 storeys under four red hipped roofs round a small court; a service road runs under the two north pavilions (z 41.5..50) south front (and the SE pavilion's east side) on square piers over a tall undercroft, lettering

## ภาคอุตสาหการ <a id="indus"></a>

- OSM id: 516204087 · ไฟล์: `js/models/engw.js` · ชั้น: 3 · สูง: 14.5 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาโลหะจั่ว) + Street View ถนนด้านเหนือและลานด้านตะวันออก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads round each building.
- ลักษณะอาคารที่บันทึก: ภาคอุตสาหการ: อาคาร 2-3 ชั้นสีครีมผังตัว L หลังคาโลหะจั่วสีอ่อน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): ภาควิชาวิศวกรรมเครื่องกล: four storeys of white render with deep floor slabs, big windows over red-brick spandrels, a canopy on round columns over the entrance with the department's name, a round stair at the north-west corner ตึกบูรณาการ: five storeys; the lower three in salmon tile with punched windows under white sunshade louvres, the upper two in cream; a six-storey centre tower with a three-hexagon emblem, a deep tan canopy over the entrance on the north; light metal gabled roofs on the long wings ยิมเล็ก: a tall orange hall with a long band of white-framed windows on an orange ledge high up on both long sides, a light metal hipped roof with deep eaves (re-surveyed 2026-10-19, see buildGym) โรงอาหาร 3 (C): two storeys of pale peach render, shops on the ground floor under a solid cream band with a white rail, an open upper floor, a red metal hipped roof with deep eaves and a white clerestory box through it; a three-storey pink block on its east side (re-surveyed 2026-10-19, see buildCanC) ภาคอุตสาหการ: an L of two- and three-storey cream blocks with light metal gabled roofs

## อัฒจันทร์ สนามกีฬากลาง <a id="stad"></a>

- OSM id: 1138463206 · ไฟล์: `js/models/stad.js` · ชั้น: 3 · สูง: 17 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังอัฒจันทร์ แผงโซลาร์ คันดิน ทางเดิน) + Street View บนลู่วิ่งฝั่งตะวันตก (มองอัฒจันทร์ มองข้ามสนาม มองตามลู่วิ่งไปทางเหนือ) + ภาพ KMITL Virtual Tour "ทางเข้าอัฒจันทร์" ที่ผู้ใช้ส่งมา 19 ต.ค. 2026 (ด้านหน้าอัฒจันทร์) ตำแหน่งเสาไฟประมาณจากภาพ + คลิป KMITL Channel+ "KMITL Share Lo" EP.5 (youtu.be/z4VKHaCeOK0)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (curved grandstand plan, solar panels on its roof, the banks and their radial stair paths, the gates) and a Google Street View pano on the west straight of the track (looking west at the grandstand, east across the pitch, north along the track). The grandstand front was reworked 2026-10-19 from two photos of the KMITL Virtual Tour (ทางเข้าอัฒจันทร์, from the track in front of the stand).
- ลักษณะอาคารที่บันทึก: สนามกีฬากลาง: อัฒจันทร์ฝั่งตะวันตกผังโค้ง ฐานผนังสีน้ำเงินเทามีหน้าต่างและคอยล์แอร์ ราวสีน้ำเงิน ที่นั่งสีน้ำเงินสองชั้นคั่นด้วยทางเดิน ชั้นล่างที่นั่งสีส้มเรียงเป็นตัวอักษร KMITL สองข้างของซุ้มกลาง ผนังปิดหัวท้ายสีขาว หลังคายื่นห้อยจากคานคอนกรีตเอียง ใต้หลังคาสีเทาเข้ม ขอบหลังคาสีน้ำเงินมีราว ห้องสื่อมวลชนกระจกใต้หลังคากลางอัฒจันทร์ แผงโซลาร์บนหลังคา ซุ้มประธานสีขาวมีป้าย KMITL SPORT WORLD ป้ายตราด้านบน บันไดลงสองข้างราวสีน้ำเงิน ที่พักนักกีฬาโปร่งแสงสีเขียวสองหลัง ม้านั่งสีแดง / รอบลู่วิ่งเป็นคันดินหญ้าเตี้ยมีทางเดินบันไดแนวรัศมี ประตูทางเข้าเหนือ-ใต้ / เสาไฟสนามโครงเหล็กถัก 4 ต้น ป้ายคะแนนด้านเหนือ / ตัวอักษร KMITL สีส้มตัวใหญ่เอียงเต็มที่นั่งชั้นล่าง ซุ้มประธานมีกรอบขาวทรงจั่วกับตรา เสาธง 6 ต้นสองกลุ่มบนฐานอิฐด้านใต้ หอศาลาอิฐแดงยอดขาวกลางสวนแนวรัศมีด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): grandstand: curved in plan, about 105 m long and 20 m deep; a slate-blue podium with windows and AC units, a blue rail along its top; blue seats in two tiers split by a walkway, the lower tier spelling "KMITL" in orange on each side of the centre; white end walls; a cantilevered roof (dark soffit, blue fascia, a rail along the edge) hung from raking concrete beams over the back columns, solar panels on top; a glazed press box under the roof in the middle; a white VIP stand in front of it with "KMITL SPORT WORLD" on its face, the institute crest on a banner above and stairs down both sides; green see-through dugouts and red benches at the track edge banks: low grassed embankment round the rest of the oval four lattice floodlight towers; a scoreboard on the north bank from KMITL Channel+ "KMITL Share Lo" EP.5 (youtu.be/z4VKHaCeOK0, drone and ground shots, 2026-10-19): the KMITL letters are big, slanted and fill the lower tier; the VIP stand is crowned by a white peaked frame with the crest; two groups of six flagpoles with Thai flags on brick bases at the south end; a red-brick pavilion tower with a white top in the radial garden east of the track, on the stand's axis

## หอพักนักศึกษา อาคาร 11 <a id="dorm11"></a>

- OSM id: 1206348758 · ไฟล์: `js/models/dorms.js` · ชั้น: 10 · สูง: 36.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง แผงโซลาร์ หลังคาเอียงไปทางเหนือราว 6 ม. ในภาพ จึงเลื่อนลงใต้) + Google Maps photos (Street View บริเวณนี้ถ่ายก่อนสร้างอาคาร)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the south. Street View here predates the four tall blocks, which follow the photos and the imagery.
- ลักษณะอาคารที่บันทึก: หอพักนักศึกษาอาคาร 9–12: อาคารยาว 10 ชั้นสีขาว ระเบียงทางเดินเป็นแถบแนวนอน ผนังหัว-ท้ายและบันไดอิฐส้ม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and stair towers rising above the roof; solar panels over the roof KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in orange pierced brick, brick end walls, red tiled hipped roofs

## สำนักหอสมุดกลาง อาคารเฉลิมพระเกียรติ <a id="lib"></a>

- OSM id: 190697423 · ไฟล์: `js/models/lib.js` · ชั้น: 4 · สูง: 21 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคา ช่องแสง แผงโซลาร์ปีกตะวันตก เส้น OSM เลื่อนไปทางตะวันออกราว 10 ม.) + Street View: ถนนด้านเหนือ (ด้านเหนืออิฐแดง ชื่ออาคาร) ถนนด้านตะวันตก (อาคาร KLLC และทางเข้า)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the roofs, the skylight, the solar roof of the low west part; the OSM outline sits about 10 m east of the imagery) and Google Street View from the road along the north side (the brick north face, the name on the brick) and the road along the west side (the KLLC tower and its entrance).
- ลักษณะอาคารที่บันทึก: หอสมุดกลาง: ผนังครีม แผงบังแดดแนวตั้งสีเทาเต็มช่องหน้าต่าง แถบคานสีขาว
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): library x 66..110 / z -10..44: four tall storeys (KMITL building register LI-01) of red brick with recessed strip windows of grey glass, a white roof edge, a long raised skylight on the roof KLLC tower x 32..60 / z 30..62: seven storeys of cream render with full-height vertical fins and horizontal louvre screens over the windows, a glazed ground-floor entrance on the west a two-storey wing x 20..32 with solar panels on its roof

## หอประชุมวิศวะ <a id="eaud"></a>

- OSM id: 190868497 · ไฟล์: `js/models/eaud.js` · ชั้น: 2 · สูง: 17.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง หลังคา ลานบันได) + Street View จากลานมุมตะวันตกเฉียงใต้ (มองเหนือ ตะวันออกเฉียงเหนือ ตะวันออก ความสูงผนังจากมุมเงย) + ลานอนุสาวรีย์ด้านตะวันตก (ด้านตะวันตก: กระจกชั้นล่างใต้แถบกันสาดบาง) ด้านเหนือและตะวันออกมีปีกอาคารข้างเคียงและต้นไม้บัง
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (square plan, low hipped roof with a raised strip along the north-east diagonal, the round steps at the south-west corner) and Google Street View from the plaza at the south-west corner (looking north, north-east and east; wall height from the viewing angle, about 13 m). The other faces are behind the neighbouring wing and trees and follow the same pattern.
- ลักษณะอาคารที่บันทึก: หอประชุมวิศวะ: อาคารกล่องอิฐแดงโชว์แนวสูง ขอบบนสีขาว มีช่องลึกใกล้มุมด้านบน / ชั้นล่างผนังกระจกกรอบขาวร่นเข้าใต้กันสาดแผ่นพื้นสีขาวที่โอบมุมตะวันตกเฉียงใต้ เสากลมสีขาว / ธงชาติเรียงบนเสาธงยื่นจากผนังด้านตะวันตกและใต้ / ลานขั้นบันไดครึ่งวงกลมที่มุมตะวันตกเฉียงใต้ / หลังคาทรงปิรามิดลาดต่ำซ่อนหลังเชิงผนัง มีสันยกตามแนวทแยงจากมุมตะวันออกเฉียงเหนือ
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a tall box of exposed red brick with a white coping; two deep slots near the top of each corner ground floor glazed on the west and south: a deep white canopy on round columns along the south that turns the south-west corner, a thin white band over the rest of the west glazing (seen from the statue plaza west of the hall); Thai flags on outrigger poles on both faces near the corner semicircular stepped platform at the south-west corner roof: low concrete pyramid behind the parapet, a raised strip from the north-east corner past the apex

## หอประชุมวิศวะ <a id="ewing"></a>

- OSM id: 190868498 · ไฟล์: `js/models/ewing.js` · ชั้น: 2 · สูง: 11.3 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง ส่วนสูง ช่องแสง) + Street View จากลานอนุสาวรีย์ (มองเหนือ ตะวันออกเฉียงเหนือ ตะวันออก)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the OSM outline matches it once the imagery's lean is allowed for; the taller north block with its skylight grid; the raised hall roof on the south) and Google Street View from the statue plaza (looking north-north-west, north-east and east).
- ลักษณะอาคารที่บันทึก: ปีกอาคารรอบหอประชุมวิศวะ: อาคาร 2 ชั้นอิฐสีชมพูอมส้ม แถบพื้นชั้นบนและขอบบนสีขาว ชั้นล่างหน้าต่างกว้างกรอบขาว ชั้นบนหน้าต่างแคบสูง / ส่วนเหนือสูง 3 ชั้น มีช่องแสงบนหลังคาเป็นตาราง / ห้องประชุมด้านใต้หลังคาสูงกว่าเล็กน้อย / ลานอนุสาวรีย์ด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): two storeys of salmon-pink brick, a white band at the upper floor and a white coping ground floor: wide windows in white frames, glazed entrances; upper floor: tall narrow windows north block (x -140..-120, z 5..21) one storey higher, a grid of skylights on its roof a slightly taller meeting-hall roof on the south (x -125.5..-106, z 36..48)

## ตึกโทรคมนาคม <a id="tel"></a>

- OSM id: 190868528 · ไฟล์: `js/models/tel.js` · ชั้น: 4 · สูง: 14.8 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง หลังคา ตำแหน่งหอเสา) + Street View: ถนนลานจอดรถด้านใต้ (มองผ่านต้นไม้) ทางเดินมีหลังคาด้านเหนือและตะวันตก ถนนซอยฉลองกรุง 1 ด้านเหนือ (หอเสาและความสูงจากมุมมอง) ภาพ Street View รอบอาคารมีน้อยและต้นไม้บังมาก + คลิป Uni Tour แนะนำตึกเรียนวิศวะ (youtu.be/XKpuIm42uQc 2:24-2:34 ด้านใต้จากลานจอดรถ) ใช้แก้สีอาคารและกันสาดกระเบื้อง 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roofs, tower position) and Google Street View. Street View coverage here is thin and mostly under covered walkways: the south face was read through trees from the parking road, the ground floor of the north face across the pond, and the tower from Soi Chalong Krung 1 north of the site (its height from the viewing angle, about 46 m to the top platform's mast). Re-coloured 2026-10-19 from the Uni Tour clip (youtu.be/XKpuIm42uQc 2:24-2:34, the south face from the car park with the "อาคาร T" board and the "LAST SUPER '21" clock pillar): the walls are cream over a salmon-orange base, not blue, and every floor of the long faces has a sloped red-orange tiled canopy on timber-coloured brackets instead of a flat ledge; the roof edge is a deeper tiled eave. The tower is unchanged.
- ลักษณะอาคารที่บันทึก: ตึกโทรคมนาคม (อาคาร T): อาคาร 4 ชั้นผนังสีครีม ฐานผนังสีส้มอิฐ / ทุกชั้นด้านยาวมีกันสาดหลังคาเอียงมุงกระเบื้องสีแดงส้ม มีค้ำยันไม้ / ขอบหลังคาเป็นชายคากระเบื้องยื่นลึก / ด้านใต้: หน้าต่างแถบยาว คอยล์ร้อนแอร์ หอบันไดปลายตะวันออก ป้าย 'อาคาร T' และเสานาฬิกา 'LAST SUPER '21' หน้าอาคาร / ด้านเหนือ: หน้าต่างเจาะเป็นช่อง / หลังคาแบนช่วงตะวันตก หลังคาเหล็กจั่วลาดต่ำช่วงที่เหลือ / หอเสาโทรคมนาคมคอนกรีตคาดแดงขาว สูงราว 46 ม. ตั้งบนกลองกลมบนหลังคาฝั่งตะวันตก ชานกลมสีขาวสองชั้น จานสายอากาศ
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): south for the imagery's lean; the OSM outline is offset). four storeys, cream render over a salmon-orange base; a sloped red-orange tiled canopy on brackets at every floor on the long faces (narrower on the ends), a deeper tiled eave at the roof edge south face: ribbon windows in white frames with AC units, stair tower at the east end north face: punched windows with AC units cream parapet all round; flat roof over the west bay, low gabled metal roof over the rest red-and-white banded concrete telecom tower rising from a round drum on the west roof, two white platforms with rails near the top, a dish and panel antennas, lightning mast

## ลานจอดรถ <a id="carportctrl1"></a>

- OSM id: 190870221 · ไฟล์: `js/models/carports.js` · ชั้น:  · สูง: 3.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (แนวหลังคาและสี) + Street View ถนนข้างลานจอด
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the roof strips and their colours) and Google Street View from the roads beside them (steel roofs cantilevered from one row of posts down the middle).
- ลักษณะอาคารที่บันทึก: ลานจอดรถมีหลังคา: เสาเหล็กแถวเดียวกลาง คานยื่นยกขึ้นสองข้าง หลังคาเหล็กลอน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a row of steel posts down the long axis carrying beams that tilt up a little to both edges, under a corrugated metal roof: dark grey by the integration building, blue by canteen C, blue-green by the measurement and control department

## ลานจอดรถ <a id="carportctrl2"></a>

- OSM id: 190870222 · ไฟล์: `js/models/carports.js` · ชั้น:  · สูง: 3.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (แนวหลังคาและสี) + Street View ถนนข้างลานจอด
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the roof strips and their colours) and Google Street View from the roads beside them (steel roofs cantilevered from one row of posts down the middle).
- ลักษณะอาคารที่บันทึก: ลานจอดรถมีหลังคา: เสาเหล็กแถวเดียวกลาง คานยื่นยกขึ้นสองข้าง หลังคาเหล็กลอน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a row of steel posts down the long axis carrying beams that tilt up a little to both edges, under a corrugated metal roof: dark grey by the integration building, blue by canteen C, blue-green by the measurement and control department

## ตึกบี <a id="bbld"></a>

- OSM id: 190870224 · ไฟล์: `js/models/bbld.js` · ชั้น: 4 · สูง: 13.6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังส่วนต่างๆ หลังคา ช่องแสง แผงโซลาร์) + Street View: ถนนลานจอดรถด้านใต้ (ความสูงจากมุมเงย) ภาพ 360 องศาหน้าห้องบรรยายและบันได ด้านตะวันออกมีทางเดินมีหลังคาบัง ด้านเหนือมีต้นไม้บัง
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the parts of the plan and their roofs: the west block's translucent skylight, the solar panels, the lower north strip, the theatre block on the south) and Google Street View: the south face from the parking road (about 22 m away; height from the viewing angle, about 13.5 m) and a 360° photo on the same road in front of the theatre block and its steps. The east side is behind a covered walkway and the north side behind trees; they follow the same pattern.
- ลักษณะอาคารที่บันทึก: ตึกบี: อาคาร 4 ชั้น โครงคอนกรีตเปลือยสีเทาอ่อน ชั้นบนหน้าต่างแถบยาวเหนือแผงอิฐแดง ชั้นล่างผนังฉาบสีเทาอมฟ้า มีแถบบล็อกช่องลมและคอยล์ร้อนแอร์ / หลังคาแบนสีเข้ม มีหลังคาโปร่งแสงเป็นสันบนปีกตะวันตก แผงโซลาร์บนปีกตะวันออก / ด้านเหนือส่วน 3 ชั้นกับส่วนหน้า 1 ชั้น / ห้องบรรยายด้านใต้ยกบนเสาลอย ท้องพื้นลาดเอียง ผนังอิฐหน้าต่างเล็ก แผ่นหลังคาสีขาวยื่น ลานยกพื้นกับบันไดกว้างลงถนน เสามีตัวอักษร B
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): west block   x -324.5..-293, z 27..60.4   four storeys, translucent ridged skylight on the roof east block   x -293..-247.5, z 31..51.4   four storeys, solar panels on the roof north strip  x -293..-251,   z 18..31     three storeys; a one-storey front x -293..-255, z 9.7..18 theatre      x -293..-271.3, z 51.4..68.2 raised on pilotis over a podium with wide steps to the road, raked underside, brick walls with small windows, white overhanging roof slab Facades: exposed light-grey concrete frame; upper floors with ribbon windows over red-brick spandrels; ground floor rendered, with a band of breeze blocks and AC units.

## โรงอาหาร A คณะวิศวกรรมศาสตร์ <a id="cana"></a>

*Engineering A-Dining Hall*

- OSM id: 190880523 · ไฟล์: `js/models/cana.js` · ชั้น: 1 · สูง: 8.6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคา 3 ส่วนและส่วนต่อด้านใต้) + Street View: ถนนมุมตะวันออกเฉียงเหนือ ภาพ 360 องศาที่ทางเข้าด้านเหนือ ด้านตะวันตกและใต้มีอาคารและต้นไม้บัง
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (three roofs: a white west block, a grey central hall that reaches further north as the entrance, a white east hall, and a low annex on the south) and Google Street View: the north-east corner and east side from the road (a car pano about 25 m away) and a 360° photo at the north entrance (looking into the hall). The west and south sides are behind other buildings and trees and follow the same pattern.
- ลักษณะอาคารที่บันทึก: โรงอาหาร A คณะวิศวะ: อาคารชั้นเดียวยกพื้นสูง ด้านข้างเปิดโล่งมีผนังเตี้ยสีขาว เสาเหลี่ยมสีขาว ชายคายื่นลึก หลังคาเหล็กลาดต่ำสีเทาอ่อน / มุมตะวันออกเฉียงเหนือเป็นห้องทึบสีชมพูอ่อนมีตะแกรงเหล็ก บันไดขึ้นจากถนน / กลางอาคาร: ทางเข้าด้านเหนือใต้แผ่นพื้นยื่นลึกบนเสากลม โถงสูงหลังคาจั่วลาดต่ำ / ปีกตะวันตกผนังสีครีมมีหน้าต่าง หลังคาแบนสีขาว / ส่วนบริการเตี้ยด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): east hall   x -245.5..-224.5, z 96..117: one storey on a 1.2 m plinth, open sides with a low white parapet, square white columns, deep white eaves, low light-grey metal roof; an enclosed pink block with a steel grille at the north-east corner, steps up from the road centre      x -257..-245.5, z 89.5..120: taller hall; at the north a deep white slab on round columns over the entrance steps, behind it a high open hall with a low gabled roof west block  x -273..-257, z 96..122: cream walls with windows, flat white roof south annex x -246..-232, z 117..126: low service block garden east of the hall: two steel umbrella shades over outdoor tables, dark panels on radial ribs round a central column (SIIE "Key locations" film 1:45, 2026-10-19; their places and sizes from the round shadows in the satellite imagery at x -215 / z 95 and under the trees south-east of it)

## หอประชุมจุฬาภรณ์วลับลักษณ์ <a id="chaud"></a>

- OSM id: 265574872 · ไฟล์: `js/models/chaud.js` · ชั้น: 3 · สูง: 15.8 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาปั้นหยาสีแดงกับแผงโซลาร์) + Street View ทางเดินด้านใต้ (ด้านหน้ามีชื่ออาคาร) มุมตะวันออกเฉียงเหนือและตะวันออกเฉียงใต้ ทางเดินด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a red hipped roof with solar panels) and Google Street View from the walk on its south side (the front with the name), the north-east and south-east corners and the west walk.
- ลักษณะอาคารที่บันทึก: หอประชุมจุฬาภรณ์วลัยลักษณ์: 3 ชั้น ชั้นล่างร่นหลังเสาอิฐแดงเหลี่ยม / ผนังบนสีขาว แผงอิฐแดงที่ราวกันตก แถบครีบบานเกล็ดขาวลึก หน้าต่างแถบใต้ชายคา / ชื่ออาคารด้านใต้ / หลังคาปั้นหยาต่ำสีแดงมีแผงโซลาร์
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): three storeys: the ground floor set back behind square red-brick columns; white upper walls with red-brick parapet panels, a band of deep white louvre fins across the first floor, a row of clerestory windows under the eaves; the name on the south front; a low red hipped roof with solar panels; a covered bridge to the building to the east

## จุฬาภรณ์วลัยลักษณ์ 2 <a id="chula2"></a>

- OSM id: 265574874 · ไฟล์: `js/models/chula2.js` · ชั้น: 6 · สูง: 23.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังโค้งด้านตะวันตกเฉียงเหนือ แผงโซลาร์) + Street View ถนนด้านเหนือ ตะวันตก และตะวันออก (ด้านเหนือโค้งมีตัวอักษร SCHOOL OF SCIENCE ทางเข้าด้านตะวันออก)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the plan curving round its north-west side, solar panels on the roof) and Google Street View from the roads on the north, west and east sides (the curved north face with "SCHOOL OF SCIENCE" in red letters, the entrance on the east, the faculty's Thai name on the east end).
- ลักษณะอาคารที่บันทึก: อาคารคณะวิทยาศาสตร์ (จุฬาภรณ์วลัยลักษณ์ 2): 6 ชั้น ผนังขาว แผงกันแดดแนวนอนลึกทุกชั้น หน้าต่างแถบ / ชั้นล่างอิฐแดงหลังเสากลมสีขาว / ด้านเหนือโค้ง ตัวอักษร SCHOOL OF SCIENCE สีแดง / หลังคาแผงโซลาร์
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): six storeys; white render with deep continuous sunshade slabs at every floor and strip windows between; a red-brick ground floor behind round white columns; the plan curves round from the west end to the north-east corner; flat roof with solar panels

## ตึกปฏิบัติการณ์หลังใหม่ <a id="newlab"></a>

- OSM id: 265588799 · ไฟล์: `js/models/newlab.js` · ชั้น: 10 · สูง: 38 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาอาคารสูงกับแผงโซลาร์ เอียงไปทางเหนือราว 6 ม. ในภาพ จึงเลื่อนลงใต้) + Street View ถนนด้านใต้ ตะวันออก และเหนือ
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the tower roof with solar panels, which leans about 6 m north in the imagery and was moved south; the lower south part) and Google Street View from the roads on the south, east and north sides.
- ลักษณะอาคารที่บันทึก: อาคารสูงสีขาวล้วน กรอบบังแดดลึกเป็นตาราง ใต้ถุนมีเสากลม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): all white: a deep egg-crate of fins and slabs round recessed windows with AC units, broad pilasters every few bays, full-height strips of vertical louvres at the stairs; the ground floor is an open car park tower x 188..245 / z -150..-122, ten storeys; a four-storey part south-east x 213..251 / z -122..-102 a canopy on round columns over the entrance on the north

## โรงอาหาร คณะวิทยาศาสตร์ <a id="scican"></a>

- OSM id: 265596517 · ไฟล์: `js/models/scican.js` · ชั้น:  · สูง: 9.5 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (โถงหลังคาแผงโซลาร์ หลังคายกช่องแสงกลาง) + Street View ลานจอดรถด้านตะวันออก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a broad hall roofed in solar panels, a raised lantern along its middle) and Google Street View from the car park to the east (the open side under the tall roof, the slatted shade canopy in front).
- ลักษณะอาคารที่บันทึก: โรงอาหารคณะวิทยาศาสตร์: โถงสูงชั้นเดียวเปิดโล่ง หลังคาแบนบนเสาเหล็ก หลังคายกช่องแสงตรงกลาง แผงโซลาร์ / ห้องครัวสีขาวด้านตะวันตก / หลังคาระแนงสีขาวด้านหน้าตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a tall single-storey hall open on the sides: a flat roof on slender steel columns, a raised clerestory lantern down the middle, solar panels over the rest; a white kitchen block along the west side; a white slatted shade canopy on posts in front of the east side

## ตึก วท. <a id="witt"></a>

- OSM id: 265596518 · ไฟล์: `js/models/witt.js` · ชั้น: 2 · สูง: 9.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคายาว ส่วนเตี้ยด้านตะวันออกเฉียงเหนือ) + Street View ถนนด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a long light roof with a lower part on the north-east) and Google Street View from the road along its south side.
- ลักษณะอาคารที่บันทึก: ตึก วท.: อาคารยาว 2 ชั้นผนังขาว หน้าต่างแถบบานเกล็ดทั้งสองชั้นใต้ชายคาลึก คอยล์แอร์บนแขน / หลังคาแบนมีช่องแสงยกตรงกลาง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): two storeys of white render: strip windows of louvred glass on both floors under a deep white overhang, AC units on brackets; a flat roof with a raised clerestory strip; a single-storey part on the north-east

## สโมสรนักศึกษา <a id="club"></a>

- OSM id: 265596519 · ไฟล์: `js/models/small.js` · ชั้น: 2 · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาจั่วกระเบื้องแดงสองส่วน) + Street View ถนนด้านเหนือ (ต้นไม้บังมาก)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: สโมสรนักศึกษา: อาคาร 1-2 ชั้นผนังขาว หลังคาจั่วกระเบื้องแดง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## อาคารอิฐข้าง Sky Walk (ฝั่งเหนือทางรถไฟ) <a id="scib"></a>

- OSM id: 265596520 · ไฟล์: `js/models/scib.js` · ชั้น: 5 · สูง: 19.1 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังสี่ส่วนรอบลานเล็ก แผงโซลาร์) + คลิป Campus Tour (youtu.be/-hBd_k2Ld5E 19:40 มองจาก Sky Walk) 19 ต.ค. 2026
- ลักษณะอาคารที่บันทึก: อาคารอิฐ 5 ชั้น: ผนังอิฐแดงคาดแถบขาวทุกชั้น หน้าต่างแคบสูงช่องเดียว / ปลายตะวันตกของปีกใต้ร่นเป็นขั้น มีแผ่นพื้นขาวทุกชั้น / หลังคาแบน แผงโซลาร์บนปีกตะวันตกและปีกกลาง / ร้าน Lawson อยู่ชั้นล่างปีกตะวันตก

## Lawson 108 <a id="lawson"></a>

- OSM id: 265596521 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps + Street View ทางเดินมีหลังคาข้างร้าน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: Lawson 108: ร้านชั้นเดียวสีขาว หน้าร้านกระจก แถบสีน้ำเงินที่ชายคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## A-Building <a id="abld"></a>

- OSM id: 292807567 · ไฟล์: `js/models/abld.js` · ชั้น: 6 · สูง: 21.8 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง หลังคา หอบันไดด้านใต้) + Street View: ถนนด้านเหนือสองจุด (ด้านหน้าและทางเข้า) ถนนด้านตะวันออก (ด้านสกัดและความสูงจากมุมเงย) ด้านใต้ไม่มีภาพ Street View ทำจากภาพดาวเทียม + คลิป SIIE Key locations (youtu.be/lod-jYKKEZ0 0:57, 1:00) สีครีม ผนังหัวท้ายชมพูแซลมอนกับป้าย KMITL เสาส้ม 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roof, the three towers on the south side) and Google Street View: the north face and the entrance from Engineering Avenue (two points, 20 m and 35 m away) and the east end from the east road (its height from the viewing angle, about 21.5 m). No Street View reaches the south side (pond and trees); it is modelled from the imagery only. Re-coloured 2026-10-19 from the SIIE clip (youtu.be/lod-jYKKEZ0 0:57 the east end from the north-east, 1:00 the north face and the porte-cochère): the long faces are cream with stained cream ledges, not mustard; the ends are salmon-pink with a white strip and a white panel with "KMITL" in red at its top; the porte-cochère is a cream slab on orange columns; the roof fascia is tan.
- ลักษณะอาคารที่บันทึก: A-Building: อาคาร 6 ชั้น ด้านยาวสีเหลืองมัสตาร์ด กันสาดคอนกรีตสีเทายื่นทุกชั้น หน้าต่างแถบยาวระหว่างเสาสีเหลือง เชิงหลังคาสีเทาหนา / ด้านสกัดผนังสีครีมเรียบ แถบแนวตั้งสีม่วงอ่อน ชื่อคณะวิศวกรรมศาสตร์ที่มุมบนด้านตะวันออก / ด้านเหนือ: หลังคาคลุมทางเข้าสีม่วงอ่อนบนเสาสีม่วง มีเสาธงบนหลังคา โรงจอดรถโครงเหล็กสีเหลืองหลังคาสีน้ำเงินสองข้าง / ด้านใต้: หอบันได/ลิฟต์สีครีม 3 หอ สูงเหนือหลังคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): six storeys; long faces in cream with a stained cream concrete ledge at every floor, ribbon windows between cream piers, a heavy tan roof fascia ends: salmon-pink walls with a white vertical strip, a white panel with "KMITL" in red at the top of the east end north: cream porte-cochère slab on orange columns with flags, blue-roofed steel carports either side south: three cream stair/lift towers rising above the roof, the middle one widest, each with a white strip

## อาคารเฉลิมพระเกียรติ 55 พรรษา สมเด็จพระเทพฯ <a id="t55"></a>

- OSM id: 309556942 · ไฟล์: `js/models/t55.js` · ชั้น: 8 · สูง: 30 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง แผงโซลาร์ อาคารเตี้ยด้านตะวันออก) + Street View ถนนทางใต้ของลานจอดรถ (ด้านใต้ทั้งด้าน ระยะกว้างและซูม)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the block, solar panels on the north part of the roof, plant on the south part, a low annex along the east side, the car park to the south) and Google Street View from the road south of the car park (the whole south front, wide and zoomed).
- ลักษณะอาคารที่บันทึก: อาคารเฉลิมพระเกียรติ 55 พรรษา: อาคาร 8 ชั้นผนังฉาบสีเทาอมฟ้า / ชั้นล่างโล่งหลังเสาเหลี่ยมสีขาว บันไดและราวด้านหน้า ผนังทางเข้าแผงสีส้มแดง แถบกันสาดสีขาว / ชั้นบนแถบพื้นสีขาวลึก หน้าต่างกรอบขาวกับคอยล์ร้อนแอร์ ระเบียงร่นที่มุม แถบสีส้มใต้ชั้น 3 ขอบหลังคาสีขาว / หลังคาครึ่งเหนือปูแผงโซลาร์ ครึ่งใต้มีงานระบบ / อาคารเตี้ยด้านตะวันออก / ลานจอดรถด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): eight storeys of light blue-grey render; the ground floor open behind square white columns with steps and a rail across the front, red-orange panels on the entrance walls; a white canopy band over it upper floors: deep white floor bands, white-framed windows with AC units, recessed balconies at the corners; an orange stripe along the bottom of the third floor; a white roof edge north part of the roof with solar panels, plant on the south part; low annex on the east side

## โรงอาหาร ตึก L <a id="lcan"></a>

- OSM id: 309557500 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง) + ภาพจาก KMITL Virtual Tour ที่ผู้ใช้ส่งมา 19 ต.ค. 2026 (ด้านหน้าทิศตะวันตก มุมตะวันตกเฉียงใต้ ด้านหลัง)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: โรงอาหารตึก L: อาคารเดียวกับ 7-Eleven ผนังสีครีม แนวเสาเหลี่ยมสีน้ำตาลอ่อนด้านหน้าทิศตะวันตกและด้านใต้ หน้าต่างบานเกล็ดแนวยาวด้านบน / หลังคาแบนช่วงกลาง ปลายทั้งสองด้านยกสูง หลังคาลาดขึ้นไปทางปลาย พับลงที่มุมเป็นแผงสามเหลี่ยมโลหะลอนสีเทา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## ตึก ECC <a id="ecc"></a>

*ECC Building*

- OSM id: 309557571 · ไฟล์: `js/models/ecc.js` · ชั้น: 10 · สูง: 39.5 ม.
- แหล่งภาพอ้างอิง: Street View เดินรอบอาคาร + ภาพมุมไกล + ภาพดาวเทียม Esri
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-16: Google Street View walk-around (east entrance, north car park, west road, south path, far views from the north car park / NE / SE) for facades, Esri World Imagery for the plan and roof colours.
- ลักษณะอาคารที่บันทึก: อาคาร ECC (ปฏิบัติการรวมวิศวกรรมศาสตร์ 2): สองปีก 10 ชั้น มีลานกลาง / ด้านหน้า (ตะวันออก) หลังคาคานโค้งสีขาวมีชื่ออาคาร แถบกระจกสีน้ำเงิน ตั้งบนเสากลมสูง 2 ชั้น พร้อมบันไดทางขึ้น / หัวมุมทั้งสองเป็นหอสูงมีพื้นระเบียงยื่นเป็นขั้นบันได / ด้านเหนือ: ฐาน 4 ชั้นกระเบื้องอิฐส้มสลับแถบขาว ชั้นบนระเบียงยาวสีขาว / ปีกใต้: ระเบียงแนวนอนสีขาวซ้อนกันทุกชั้น / ด้านตะวันตก: ห้องปฏิบัติการไฟฟ้าแรงสูง โครงขาวช่องอิฐ ป้ายสีส้ม / หลังคา: ปีกเหนือสีน้ำเงินเข้ม/ฟ้าอ่อน ปีกใต้สีขาว
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): Plan (from the satellite roofs, checked against Street View distances; OSM building parts 1138463209/1138463210): west block  x -314..-294.9   z -169.2..-144.9 HV lab, 21.5 m, white frame with large brick panels podium      x -294.9..-231.3 z -169.5..-159.8 3 storeys (14.8 m), brick + white bands, AC units on a plinth north wing  x -294.9..-239.4 z -159.8..-145.3 10 floors (~35 m), set back behind the podium, balcony bands NE tower    x -239.4..-224.6 z -163.2..-145.3 floors 5-9 on round columns above the canopy south wing  x -300..-237.3   z -133.5..-117.4 10 floors, white bands wrapping a rounded SE end; west end on the road: deep balcony stack over a 2-storey brick base, shutter + ramp yard block  x -300..-287     full height, closes the open yard from the west road; blue glass strip (position fixed from Street View on the west road + its white roof on the satellite) court       z -145.3..-133.5: open yard x -314..-300, yard block, low workshops to the lobby entrance    curved white canopy (name lettering + blue glass ribbon) on round columns, facing east

## โรงอาหาร ตึกพระเทพฯ <a id="thepcan"></a>

- OSM id: 309919518 · ไฟล์: `js/models/mid.js` · ชั้น: 2 · สูง: 10.7 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาปั้นหยา แผงโซลาร์ ครีบรอบอาคาร) + Street View ทางเดินริมสระด้านใต้ (ด้านหน้า)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: โรงอาหารตึกพระเทพฯ: 2 ชั้นหันหน้าทางใต้ริมสระ / ชั้นล่างโรงอาหารกระจกหลังเสาขาว เสาอิฐแดงที่มุมใต้ บันไดขึ้นจากทางเดินริมสระ / แผ่นพื้นขาว ชั้นบนหลังครีบขาวลึกเรียงรอบอาคาร ยอดครีบเป็นฟันเลื่อย / หลังคาปั้นหยาสีเทามีแผงโซลาร์ด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## อาคารเรียนรวม สมเด็จพระเทพฯ <a id="thep"></a>

- OSM id: 309919519 · ไฟล์: `js/models/thep.js` · ชั้น: 2 · สูง: 9.4 ม.
- แหล่งภาพอ้างอิง: Street View ถนนศิลปะด้านใต้ + ลานด้านเหนือ + ภาพ 360 องศา + ภาพดาวเทียม Esri ด้านตะวันออกและตะวันตกจากลิงก์ที่ผู้ใช้ส่งมา
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Street View and photo spheres: the art street to the south (car panos at x -146 and -112, photo sphere at the entrance walkway), the plaza to the north (car panos at x -163 and -144), plus Esri World Imagery for the plan and roofs.
- ลักษณะอาคารที่บันทึก: อาคารเรียนรวมสมเด็จพระเทพฯ: ปีกตะวันออก-ตะวันตก 2 ชั้น โครงเสาคานสีขาว เสาเหลี่ยมยื่นทุก ~6.4 ม. พื้นยื่นหนา หน้าต่างกลุ่ม 4 บาน มีสระน้ำและน้ำพุทั้งด้านเหนือและใต้ / กลางอาคาร: ทางเข้าใต้ลานหน้า ระหว่างหอบันไดอิฐส้ม ชั้นล่างโล่งบนเสา ระเบียงชั้น 2 แถบตัวอักษรชั้น 3 ป้าย KMITL / ด้านเหนือ: หออิฐสูงเหนือหลังคา ทางเชื่อมลอยฟ้าชั้น 2 ไปตึก A / ปีกตะวันออกด้านเหนือ: ระเบียงเสาสูงสองชั้นใต้คานหนา ทางเดินชั้น 2 อยู่ด้านใน / ด้านตะวันออก: แผงอิฐส้มชื่ออาคาร หลังคาทางเดินคลุมบนเสาต่อไปทางใต้ ชั้นล่างผนังอิฐ / ด้านตะวันตก: ผนังอิฐส้มกรอบขาว ทางเดินมีหลังคาระดับชั้น 2 บนเสาต่อไปทางโรงอาหาร / หลังคา: ปีกตะวันตกแถบช่องแสงยาว ปีกตะวันออกช่องแสงฟันเลื่อย
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): west wing    x -179..-135.3   2 storeys (9.4 m): white frame, square piers every ~6.4 m, deep floor bands, 4-pane window groups, solid parapet; roof with long E-W skylight strips east wing    x -112.3..-63.5  same frame on the south; on the north a double-height colonnade under a deep fascia (corridor behind); east end: brick panel with the name over a low canopy; roof with N-S ridged (sawtooth) skylights centre       x -141.2..-112.3 entrance between orange-brick towers, set back to z -219.7 behind a forecourt: open ground floor on columns, level-2 balcony, lettered level-3 band, KMITL sign; north half 2 storeys on columns with brick stair towers above the roof and a level-2 skybridge to ตึก A across the plaza ponds on both long sides come from the OSM water layer

## คณะทันตแพทยศาสตร์ <a id="dent"></a>

- OSM id: 501351775 · ไฟล์: `js/models/dent.js` · ชั้น: 5 · สูง: 22.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (อาคาร 5 ชั้นแผงโซลาร์เต็มหลังคา ปีกใต้เตี้ยมีช่องแสงหลังคา ลานหน้า) + Google Maps photos + Street View ถนนด้านตะวันออก ใต้ และตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a five-storey block with solar panels over its whole roof, a lower wing on the south with a grid of small roof lights, a forecourt on the south) and Google Street View from the roads on the east, south and west sides.
- ลักษณะอาคารที่บันทึก: คณะทันตแพทยศาสตร์: อาคารขาวแนวนอน ชั้นล่างกระจก แผงสีม่วง หลังคากันสาดโค้งที่ทางเข้า
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): main block x 222..275 / z -388..-365: five storeys of white render, rows of windows in white frames with thin sunshade hoods, a stair tower stepping up on the east end south wing x 222..265 / z -365..-345: two storeys with a glazed ground floor, purple panels and a curved canopy over the entrance steps

## สโมสรนักศึกษา คณะวิศวกรรมศาสตร์ <a id="engclub"></a>

*Student Engineering Clubs*

- OSM id: 516204084 · ไฟล์: `js/models/small.js` · ชั้น: 1 · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps + Street View ถนนด้านเหนือและลานด้านตะวันออก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: สโมสรนักศึกษาคณะวิศวกรรมศาสตร์: 2 ชั้นคอนกรีตสีขาวเก่า หลังคาแบน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## ภาคอัตโนมัติ <a id="automation"></a>

- OSM id: 516204094 · ไฟล์: `js/models/mid.js` · ชั้น: 3 · สูง: 16 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาสี่เหลี่ยม) + KMITL Virtual Tour ไปรษณีย์ 5-9 (หลังปรับปรุง 2026)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: ภาคอัตโนมัติ (ปรับปรุงใหม่ BM EN-24): 3 ชั้น ผนังหุ้มสีเทาเข้ม แผงระแนงเทาแนวตั้งชั้นบน ขอบพื้นและขอบหลังคาสีส้มสนิม ชั้นล่างสีน้ำเงินเทาหน้าต่างกรอบดำ ป้ายสีส้มชื่อภาควิชาเหนือทางเข้าด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## ภาคไฟฟ้าและพลังงานไฟฟ้า <a id="elec"></a>

- OSM id: 516204095 · ไฟล์: `js/models/elec.js` · ชั้น: 2 · สูง: 11.6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง หลังคา ทรงกระบอก) + Street View 7 ภาพที่ผู้ใช้ส่ง (ด้านใต้จากถนนด้านใต้ ด้านตะวันตกจากที่จอดรถ ส่วนเหนือและทรงกระบอกจากถนนด้านตะวันตก มุมตะวันออกเฉียงใต้และอาคารสีเขียวจากด้านตะวันออก) + ภาพเก่าจากถนนด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plan, roofs, the round drum) and Google Street View: seven views supplied by the user from the roads and car park round it - the south face from the south road, the west face from the carport, the north block and the drum from the west road (two points), the south-east corner and the green hall from the east - plus an older car pano on the west road.
- ลักษณะอาคารที่บันทึก: ภาคไฟฟ้าและพลังงานไฟฟ้า / ส่วนตะวันตกเฉียงใต้: ชั้นล่างผนังสีครีมร่นหลังเสาเหลี่ยมสีเหลืองครีมบนชานยกพื้น มีบันไดทางเข้าและป้ายชื่อภาควิชา ชั้นบนสีขาวยื่นออก ครีบแนวตั้งลึกเป็นแถบด้านใต้ ด้านตะวันตกหน้าต่างยื่นเอียง 3 บาน หน้าต่างสามเหลี่ยม บนหลังคากล่องบานเกล็ดสีเทาลดหลั่นเป็นขั้น ทรงกระบอกบันไดที่มุม / ส่วนเหนือ: อาคาร 2 ชั้นหุ้มแผ่นโลหะสีเทา แถบบานเกล็ด หลังคาจั่วลาดต่ำ / ส่วนตะวันออกเฉียงใต้: อาคารชั้นเดียวทาสีเขียวสด แถบลายทแยงสีส้มสลับขาว
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): south-west block x -205..-175, z -127..-102: ground floor cream, set back behind yellow-cream square columns on a raised verandah, windows and AC units, entrance steps at the east end of the south face, the department name on the fascia upper storey white and overhanging, a band of deep vertical fins across the south face west face: three projecting angled bay windows, a strip of small windows, a triangular window roof: a stepped grey louvred clerestory box with a metal edge; round stair drum at the north-west north block x -204..-180, z -168..-138: two-storey grey metal-clad hall, louvre bands, low gable roof core x -185..-175, z -140..-127 (white) and a single-storey link along the west x -210..-204 south-east hall x -175..-142, z -132..-115: single storey, painted bright green, a band of orange and white diagonal stripes, glazed doors, low metal roof behind the parapet

## ธนาคารและไปรษณีย์ <a id="bank"></a>

- OSM id: 516204096 · ไฟล์: `js/models/mid.js` · ชั้น: 1 · สูง: 4.3 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคายาวแคบ) + Street View ทางเดินมีหลังคา
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: ธนาคารและไปรษณีย์: แถวร้านค้าชั้นเดียวยาว หลังคาคอนกรีตแบน ทางเดินมีหลังคาด้านตะวันออก / ปลายด้านใต้เป็นโถงธนาคาร ป้ายชายคาสีฟ้า ตู้ ATM ใต้ชายคา (Virtual Tour 2026)
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## นาโน <a id="nano"></a>

- OSM id: 516204097 · ไฟล์: `js/models/mid.js` · ชั้น: 2 · สูง: 9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (สองส่วน แผงโซลาร์) + Street View ถนนด้านเหนือและด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: นาโน: 2 ชั้นอิฐแดงแถบพื้นขาว กระจกสีเขียว ซุ้มทางเข้าโค้ง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## คลินิกเวชกรรม สจล. <a id="clinic"></a>

- OSM id: 516204098 · ไฟล์: `js/models/mid.js` · ชั้น: 2 · สูง: 10.9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาแบนขอบขาว) + ภาพ KMITL Virtual Tour ที่ผู้ใช้ส่งมา 19 ต.ค. 2026 (ด้านหน้าทิศเหนือ จุดรับส่งผู้ป่วย) + ภาพด้านตะวันตกจากผู้ใช้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: คลินิกเวชกรรม (ป้าย โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): อาคารขาว 2 ชั้น ฝั่งตะวันตกผนังกระจกสีอ่อนสูงสามช่องในกรอบขาว ชื่อสีแดงบนขอบหลังคา / ทางเข้ากระจกร่นเข้า บันไดกว้าง แผ่นพื้นยื่น ชั้นบนระเบียงโล่งเสาเหลี่ยม / ฝั่งตะวันออกทางเดินมีหลังคาชั้นเดียวที่จอดรับส่ง แผงโซลาร์บนหลังคา / ด้านตะวันตก: ผนังกระจกสูงสองช่องที่มุมตะวันตกเฉียงเหนือ ผนังอิฐส้มคาดแถบขาว ป้าย KMC HOSPITAL กากบาทสีเขียว ทางลาดราวขาว ชื่อบนขอบหลังคาสีส้ม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## ตึกกระจก <a id="glass"></a>

- OSM id: 516204099 · ไฟล์: `js/models/small.js` · ชั้น: 2 · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps + Street View ถนนด้านเหนือและด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: ตึกกระจก: 2 ชั้นผนังขาว หน้าต่างกระจกบานใหญ่กรอบเทา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## อาคารจอมไตร <a id="jomtrai"></a>

- OSM id: 516308731 · ไฟล์: `js/models/jomtrai.js` · ชั้น: 3 · สูง: 13.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังอาคาร ลานกลาง หลังคาปั้นหยา แผงโซลาร์ ช่องแสง) + Street View: ถนนด้านตะวันตก (อาคารตะวันตกเฉียงเหนือ หอทางเข้าอิฐ หอประชุม) ถนนด้านใต้ ถนนด้านตะวันออก มุมตะวันออกเฉียงเหนือ และทางเดินในอาคาร
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the blocks, the courtyards, the hipped hall, the solar arrays and skylights) and Google Street View: the road along the west side (north-west block, the brick entrance tower with the name, the hall), the road along the south side, the road along the east side and the north-east corner, and the indoor walkways and courtyards.
- ลักษณะอาคารที่บันทึก: อาคารคอนกรีตสีเทาอ่อน ชายคาแนวนอนลึก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): three storeys (about 12.5 m) of white render: ribbon windows of grey louvres between white floor bands with red-brick spandrels; large blank red-brick walls on a white base at the block ends and on the north hall (with tall recessed slits) west block around a planted courtyard; a long walkway block x 300..312 running the whole length; the east blocks around a second courtyard; the south block a single-storey hall with a red hipped roof and a two-storey annex with solar panels south-west north end (2026-10-19): broad steps, a four-storey glass building under a large flat steel canopy on four white round columns branching into steel struts

## สำนักงานอธิการบดี สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง <a id="pres"></a>

*KMITL President Building*

- OSM id: 516308733 · ไฟล์: `js/models/pres.js` · ชั้น: 10 · สูง: 38.8 ม.
- แหล่งภาพอ้างอิง: Street View ถนนด้านเหนือ (ใกล้-ไกล ถึงฝั่งทางหลวง) ถนนด้านตะวันออก ตะวันตก มุมตะวันตกเฉียงเหนือ + ภาพดาวเทียม Esri ด้านใต้มีต้นไม้บัง + คลิป SIIE (youtu.be/lod-jYKKEZ0 5:47) หลังคาหน้าทางเข้าพับสีขาวบนเสากลม 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Street View, picking wide views with few trees: the north face from the service road (36 m), the canal road (70 m) and across the highway (106 m); the porte-cochère close up; the east end from the east road and from the south-east; the west end from the west road; the north-west corner. The south face is screened by a garden and a neighbouring building - modelled from partial views only. Esri World Imagery for the roof.
- ลักษณะอาคารที่บันทึก: สำนักงานอธิการบดี: อาคาร 10 ชั้น / ด้านเหนือ (ทางเข้า): ฝั่งตะวันออกกรอบตารางขาว แกนบันไดกระจกสีเข้ม ช่วงระเบียงลูกกรงบล็อกช่องลมสีขาวสลับแผงสีส้ม ครีบสีน้ำเงิน ฝั่งตะวันตกตารางขาวลึกกับแผงกรอบขนาดใหญ่ / หลังคา: ชื่อสถาบันตัวอักษรสีน้ำเงินบนเชิงผนัง ห้องหลังคาสีส้มมีตราสัญลักษณ์ / ทางเข้ามีหลังคาคลุมรถหุ้มแผงสีส้มบนเสากลมสีขาว / ด้านตะวันออก: แผงอิฐในกรอบตารางขาว / ด้านตะวันตก: อิฐ ระเบียง และแกนกระจกสูงเหนือหลังคา / ด้านใต้: ระเบียงแนวนอนต่อเนื่อง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): north face (east → west): white window grid | dark glazed stair core | balcony bay with white breeze-block balustrades and orange spandrels | thin blue fin | deep white egg-crate grid with a large framed panel roof parapet with the institute's name in blue; orange penthouse with the emblem over the core porte-cochère: a white folded canopy rising to a ridge over the middle, on round white columns, in front of the west half; the name on a dark board beside the steps (2026-10-19) east end: brick panels in a white grid, few windows; west end: brick bays, balcony bays, central glazed core rising above the roof; south face: continuous balcony slabs with rails in a white frame, the west part with orange-brick balcony fronts on floors 2-7, the institute's name on the south parapet too (south face reworked 2026-10-19 from the SIIE "Key locations" film, 5:40, looking north across the garden)

## อาคารหอพระราชประวัติพระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว พระสยามเทวมหามกุฏวิทยมหาราช <a id="royal"></a>

- OSM id: 516308734 · ไฟล์: `js/models/royal.js` · ชั้น: 1 · สูง: 22 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง ลานยกพื้น ลานพระจอม ลานวงกลม) + Street View จากขอบลานพระจอมด้านใต้ (2 มุมที่ผู้ใช้ส่ง) + ภาพ 360 องศาบนแท่นอนุสาวรีย์ + ภาพถ่ายอนุสาวรีย์และด้านหน้าอาคารจาก trueplookpanya ที่ผู้ใช้ส่ง
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the U-shaped plan, the raised courtyard, the plaza, the loop road and the round court to the south), Google Street View from the south edge of the plaza (two views supplied by the user), a 360° photo on the monument platform, and a published photo of the monument and hall front supplied by the user.
- ลักษณะอาคารที่บันทึก: หอพระราชประวัติฯ: หมู่อาคารทรงไทยผังรูปตัว U / ปีกตะวันตกและตะวันออกเป็นอาคารสองชั้นจั่วคู่หันหน้าทิศใต้ หลังคาเทาซ้อนสองชั้น ปั้นลมสีแดงเลือดหมู หน้าบันสีขาวมีหน้าต่างโค้งแหลมสีแดง กรอบหน้าต่างสีแดง / ลานกลางยกพื้นเป็นฐานสีขาว ราวลูกกรงด้านหน้า ประตูสีแดง หน้าต่างกลม บันไดสองข้าง ซุ้มประตูและอาคารประธานประดับสีทอง / ลานหน้าสีขาวมีบันไดลง / ลานพระจอมพื้นหินสีเทา ล้อมด้วยทางปูอิฐสีส้มและแนวพุ่มไม้ ลานวงกลมด้านใต้ / พระบรมราชานุสาวรีย์: แท่นหินอ่อนสีชมพูบนฐานขั้นบันได แผ่นจารึก รูปหล่อสำริดยืนข้างเครื่องสูง พานพุ่มสำริดสองข้าง เรือถวายเครื่องสักการะ ราวลูกกรงโค้งด้านหลัง ช้างสำริดบนแท่นสองข้าง เสาไฟโคมกลมสีขาว
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): wings        west x 33..53, east x 78..99: two Thai halls side by side, two storeys, white walls with maroon window frames, gables facing south with maroon bargeboards, white gable panels and a red arched gable window; grey roofs, two tiers; rear halls x 42.5..50.5 and 80..88 courtyard    x 51..79, z -379..-353.5: a white podium 3.8 m high, terracotta paving on top, a balustrade along the front, red doors and a round window in the front wall, two stairs up gate         a small gold-trimmed Thai pavilion on the podium at the centre of the front court pavilion and the main north hall (x 56..76, z -396..-379) stand on the podium, gold trim terrace      white, x 55..78, z -353.5..-344, steps down to the path ลานพระจอม    grey stone plaza x 57..76.5, z -329..-308 inside a terracotta-paved U and hedges; a round court (pink paving in a grey ring) to the south, centre 67.3, -289.8 monument     facing south at 66.6, -322 (reworked 2026-10-18 in more detail from a Google Maps photo sphere in front of it and a published KMITL ceremony photo): a stepped marble platform with broad steps; a jointed marble pedestal with a bronze plaque, a round emblem and a two-step cornice; the larger-than-life bronze statue, bare-headed in a long open frock coat with a sash over chong kraben, the right hand on a cloth-draped stand topped by the tiered great crown, the left holding a sword point-down; a rounded offering base with a bronze bowl and a boat-shaped candle tray on legs; bronze lotus-bud urns on footed stands on side blocks; a curved balustrade of turned balusters behind; bronze elephants facing outwards with trunks raised on pedestals at both ends; two navy lamp posts each with a candelabra of nine white globes on tulip cups

## คณะแพทยศาสตร์ <a id="med"></a>

- OSM id: 592798785 · ไฟล์: `js/models/med.js` · ชั้น: 3 · สูง: 14.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังกากบาท แผงโซลาร์ ลานด้านใต้) + Street View ถนนด้านเหนือ (ด้านหน้า ระยะใกล้และซูม)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a cross-shaped plan of a central block with three wings, solar panels over most of the roof, the entrance court to the south) and Google Street View from the road along the north side (the north front, near and zoomed).
- ลักษณะอาคารที่บันทึก: คณะแพทยศาสตร์ (ป้าย PTEC): อาคาร 3 ชั้นผังรูปกากบาท ผนังฉาบสีขาวกับแผงกระเบื้องอิฐสีส้มแดงที่ชั้นล่างและใต้หน้าต่างชั้นบน หน้าต่างแถบยาว / ด้านหน้าทิศเหนือ หอบันไดกระจกตรงกลาง แผงผนังกระจกสูงข้างกัน ป้าย PTEC ที่มุมตะวันออกเฉียงเหนือ / หลังคาแบนปูแผงโซลาร์เกือบเต็ม / ลานทางเข้าด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): three storeys, white render with orange-red brick-tile panels: brick at ground level between white piers, a white middle band, brick again under the top-floor windows; strip windows of small grey panes a glazed stair tower in the centre of the north front, rising above the roof the PTEC sign on the parapet west of the tower; flat roof with solar panels behind a white parapet entrance court to the south with a small porch block

## CMKL University <a id="cmkl"></a>

- OSM id: 784091346 · ไฟล์: `js/models/cmkl.js` · ชั้น: 10 · สูง: 38.9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาเหลี่ยมขั้นบันได แผงโซลาร์ ขั้นบันไดโค้งหันไปหอสมุด) + Street View: ถนนด้านเหนือ (หอกระจก สะพานลอยขอบส้ม) ถนนด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the angular stepped roofs with solar panels, the curved terraces facing the library) and Google Street View from the road along the north side (the glass tower and the orange-trimmed footbridge) and the road along the west side.
- ลักษณะอาคารที่บันทึก: CMKL University: อาคารกระจกสีเขียวอมฟ้า
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): a ten-storey tower of blue-green curtain-wall glass in the north-west, its north-east corner cut at an angle a seven-storey cream block south of it with horizontal louvre screens, stepping down in solar-panelled roofs curved stepped terraces (an outdoor amphitheatre) opening south-east toward the library signs (2026-10-19, placed from the drone shots in KMITL Channel+ "KMITL Share Lo" EP.4): a white block at the west end of the north face carrying "KMITL" in tall red letters stacked one above the other at its west edge, the CMKL panel beside them and a dark "42 Bangkok" panel below it

## โรงเรียนสาธิตนานาชาติพระจอมเกล้าลาดกระบัง <a id="kmids"></a>

*King Mongkut's Institute of Technology Ladkrabang International Demonstration School*

- OSM id: 1008793634 · ไฟล์: `js/models/kmids.js` · ชั้น: 6 · สูง: 25.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง แผงโซลาร์ ขั้นบันไดด้านใต้ อาคารเตี้ย) + ภาพ 360 องศาที่ประตูทางเข้าด้านเหนือ (ด้านเหนือ มองเงยขึ้น) ภาพ Street View จากถนนถ่ายก่อนสร้างโรงเรียน
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the main block with solar arrays on its roof, the stepped seating along its south side, the low south wing, the stairs at the east end) and a 360° photo at the north gate (the north face from the drop-off, looking up). Every Street View car pano here predates the school (it shows a pond on the site). The south and west faces and the storey count were reworked 2026-10-19 from a photo the user took across the swimming pool to the south-west.
- ลักษณะอาคารที่บันทึก: โรงเรียนสาธิตนานาชาติ (KMIDS): ชั้นล่างสีเทาเข้มร่นเข้า ชั้น 2 ผนังอิฐแดงหน้าต่างกรอบขาวบนเสาเหลี่ยม / ชั้นบน 4 ชั้นผนังกระจกหลังโครงสีขาวพับไปมา ขอบพื้นแต่ละชั้นเป็นฟันปลาและค้ำเฉียงเชื่อมชั้นต่อชั้นเป็นลายข้าวหลามตัด / หลังคาเหล็กบางยื่นรอบด้าน ลาดสูงขึ้นทางทิศเหนือ ป้าย KMIDS สีทองที่เชิงชาย แผงโซลาร์บนหลังคา / หลังคาคลุมที่ส่งผู้โดยสารด้านตะวันตกเฉียงเหนือบนเสาเหล็กเอียง / ด้านใต้อัฒจันทร์ขั้นบันไดลงสวน อาคารเตี้ย 2 ชั้น / บันไดด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): for the lean). ground floor dark grey, set back; second floor red brick with white-framed windows on square columns five upper floors of glass; on the north face behind a folded white frame: every slab edge zig-zags out and in, and diagonal struts join the points of one floor to the next, so the face reads as a lattice of diamonds south face: a pale pink rendered bay with punched windows at each end (the west one standing forward), between them a screen of terracotta vertical fins whose depth swells and shrinks in waves over floors 2-5, and the top two floors glazed behind white V struts under the roof; the west and east ends pale pink render with punched windows thin steel roof overhanging on all sides, rising to the north, with the gold KMIDS sign on its fascia; solar panel rows on top north-west: a deep canopy over the drop-off on slanted steel columns south: stepped seating down to the garden, a low two-storey wing x -189..-146, z -333..-324

## อินทนิล <a id="inthanin"></a>

- OSM id: 1136346802 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (ภาพ Street View ถ่ายก่อนสร้างร้าน)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: อินทนิล: ร้านกาแฟชั้นเดียว หน้ากระจก หลังคาแบน แถบสีเขียวที่ชายคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## ตึก A <a id="tka"></a>

- OSM id: 1137554506 · ไฟล์: `js/models/tka.js` · ชั้น: 5 · สูง: 21.2 ม.
- แหล่งภาพอ้างอิง: Google Maps (ชื่อ ตึก A) + ภาพดาวเทียม Google Maps (ความยาว โถงกลาง หอบันได แผงโซลาร์) + Street View: ลานสวนด้านใต้ (มองเหนือ ตะวันออกเฉียงเหนือ ตะวันตกเฉียงเหนือ) สวนด้านเหนือปลายตะวันออก ชื่อภาษาไทยใน OSM ของเส้นนี้ผิด (ซ้ำกับอาคารเรียนรวมฯ)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (length, the central entrance block with two stair towers on the north, solar panels on both wings) and Google Street View: the south face from the garden plaza in front of it (looking north, north-east and north-west) and the north face from the garden at its east end.
- ลักษณะอาคารที่บันทึก: ตึก A: อาคารยาว 5 ชั้น คอนกรีตสีครีม / ด้านใต้: ทางเดินเปิดทุกชั้นหลังราวกันตกทึบลึก หน้าต่างบานเกล็ดสีเข้มกับประตูห้องเรียน เสาเล็กริมทางเดิน ชั้นล่างบนฐานยกมีคันหญ้า / ด้านเหนือ: หน้าต่างกรอบขาวเป็นกลุ่มใต้แผงบังแดดบาง คอยล์ร้อนแอร์ เสาเหลี่ยม / ด้านสกัด: แถบอิฐส้มตลอดความสูง / กลางอาคาร: โถงทางเข้า ด้านใต้เป็นกระจกรับสะพานเชื่อมชั้น 2 จากอาคารเรียนรวมสมเด็จพระเทพฯ หอบันไดสองหอยื่นด้านเหนือสูงเหนือหลังคา / หลังคา: แผงโซลาร์เป็นแถวทั้งสองปีก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): five storeys (ground 4.2 m, upper floors 3.5 m), cream concrete south: open corridors on every floor behind deep solid balustrades, dark louvred windows and doors behind them, thin columns at the corridor edge; the ground floor on a plinth with a grass bank north: groups of white-framed windows under thin concrete sunshades, AC units, square piers ends: orange-brick strip the full height of the wall centre x -140..-113: entrance block, glazed on the south where the skybridge arrives, two stair towers standing out on the north and rising above the roof roof: rows of solar panels on both wings

## อาคารมหาวิทยาลัย <a id="uni"></a>

- OSM id: 1138463196 · ไฟล์: `js/models/uni.js` · ชั้น: 2 · สูง: 13.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาปิรามิด หลังคาแบน ซุ้ม ทางเชื่อม) + Street View 3 ภาพที่ผู้ใช้ส่ง (แยกด้านตะวันออกเฉียงใต้ ถนนด้านตะวันออกระยะใกล้ สวนด้านตะวันตก)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (an eight-sided white pyramid roof over the north half, a flat roof over the south half, the link and the porch) and three Google Street View angles supplied by the user: from the junction south-east of it, from the road along its east side (close up), and from the garden to the west.
- ลักษณะอาคารที่บันทึก: อาคารมหาวิทยาลัย: อาคาร 2 ชั้นระหว่างสำนักงานอธิการบดีกับตึก A / ชั้นล่างกระจกร่นหลังเสากลมสีขาว ใต้แถบชายคาบานเกล็ดสีเทา / ชั้นบนอิฐแดงในกรอบเสาและพื้นสีขาว ระเบียงมีคอยล์ร้อนแอร์ที่มุมตะวันออกเฉียงเหนือ / หลังคาปิรามิดแปดเหลี่ยมสีขาวเทาครึ่งเหนือ หลังคาแบนครึ่งใต้ / ซุ้มทางเข้าด้านใต้หลังคาฟันปลาสีขาว แผ่นโปร่งแสงสีเขียว / ทางเดินมีหลังคาเชื่อมไปอาคารสำนักงานอธิการบดี
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): body x -30..-9.3, z -306.6..-267: ground floor glazed, set back behind round white columns under a grey louvred soffit band; upper storey red brick in a white frame of columns and floor slabs, balcony with AC units at the north-east corner; white roof edge north half: low eight-sided pyramid roof, light grey; south half: flat roof, dark porch x -28.8..-17, z -267..-257: white zig-zag canopy with a green translucent roof on white columns, steps; covered link x -29.8..-9.3, z -316.5..-306.6: flat roof on columns to the President building

## อาคารธนาคาร <a id="bankw"></a>

- OSM id: 1138463212 · ไฟล์: `js/models/mid.js` · ชั้น: 1 · สูง: 5.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps + ภาพ KMITL Virtual Tour ที่ผู้ใช้ส่งมา 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: อาคารธนาคารสีขาวชั้นเดียว ชายคาแบนลึก ผนังกระจกสีเขียวอ่อน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## ธนาคารกรุงศรีอยุธยา (สาขา สจล.) <a id="krungsri"></a>

*Krungsri*

- OSM id: 1138463213 · ไฟล์: `js/models/mid.js` · ชั้น: 1 · สูง: 6.3 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps + ภาพ KMITL Virtual Tour ที่ผู้ใช้ส่งมา 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: กรุงศรี: ศาลาชั้นเดียวบนฐานยก หน้ากระจกมีตู้ ATM สีเหลือง ป้ายชายคาลึกสีเทากับเหลือง เสาป้ายสีเหลืองสูงที่มุมตะวันตกเฉียงใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## 7-Eleven <a id="seven"></a>

- OSM id: 1138469403 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง) + ภาพจาก KMITL Virtual Tour ที่ผู้ใช้ส่งมา 19 ต.ค. 2026
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: 7-Eleven: ครึ่งใต้ของอาคารโรงอาหารตึก L หน้าร้านกระจกหลังแนวเสาสีน้ำตาลอ่อน บันไดขึ้นจากถนนด้านตะวันตก ป้าย 7-ELEVEN บนแถบบานเกล็ด
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## คาเฟ่ อเมซอน <a id="amazon"></a>

*Café Amazon*

- OSM id: 1138988422 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (ภาพ Street View ถ่ายก่อนสร้างร้าน)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: คาเฟ่อเมซอน: ร้านชั้นเดียว หน้ากระจก หลังคาแบน แถบสีเขียวที่ชายคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## หอพักนักศึกษา อาคาร 9 <a id="dorm9"></a>

- OSM id: 1206348756 · ไฟล์: `js/models/dorms.js` · ชั้น: 10 · สูง: 36.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง แผงโซลาร์ หลังคาเอียงไปทางเหนือราว 6 ม. ในภาพ จึงเลื่อนลงใต้) + Google Maps photos (Street View บริเวณนี้ถ่ายก่อนสร้างอาคาร)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the south. Street View here predates the four tall blocks, which follow the photos and the imagery.
- ลักษณะอาคารที่บันทึก: หอพักนักศึกษาอาคาร 9–12: อาคารยาว 10 ชั้นสีขาว ระเบียงทางเดินเป็นแถบแนวนอน ผนังหัว-ท้ายและบันไดอิฐส้ม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and stair towers rising above the roof; solar panels over the roof KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in orange pierced brick, brick end walls, red tiled hipped roofs

## อาคารนวัตกรรมการเรียนรู้ <a id="innov"></a>

- OSM id: 1561993799 · ไฟล์: `js/models/innov.js` · ชั้น: 11 · สูง: 45.7 ม.
- แหล่งภาพอ้างอิง: Street View ถนนฉลองกรุง (ด้านเหนือและโครงหลังคาจากหน้าอาคาร ด้านตะวันตกและสะพานลอยจากทางตะวันตก มุมเงยขึ้นตัวอาคาร) + ภาพดาวเทียม Google Maps (ผังตัวตึก ขั้นระเบียง โครงหลังคาเหล็ก ลานหน้าอาคารและน้ำพุ) ภาพ Street View ในวิทยาเขตถ่ายก่อนสร้างอาคาร
- ลักษณะอาคารที่บันทึก: อาคารนวัตกรรมการเรียนรู้: ตึกสูง 11 ชั้นสีขาว พื้นแต่ละชั้นยื่นเป็นแผงขาว ครีบตั้งสีขาวหน้ากระจกสีเข้มทุกด้าน / ชั้นล่างลดหลั่นเป็นระเบียงไปทางตะวันออกและใต้ ราวกระจก / โครงเหล็กถักขนาดใหญ่โค้งจากยอดตึกด้านตะวันออกลงมาเป็นปลายแผ่นแบนสูงราว 7.5 ม. มีเสาค้ำเอียง / ลานหน้าอาคารลายสามเหลี่ยม น้ำพุวงกลม / ป้ายคณะครุศาสตร์อุตสาหกรรมและเทคโนโลยีสีดำตัวอักษรทองริมถนน / ขั้นบันไดกว้างสีขาวด้านใต้
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): tower       x 255..273, z -271..-255: eleven storeys (a tall glazed ground floor, then ten of 3.8 m), each floor a projecting white slab; deep white vertical fins in front of dark glass on all faces terraces    lower wings stepping down to the east (x 273..291) and the south (z -255..-238), white slab edges and glass railings on every step steps       a broad white stepped plaza south of the building, x 261..297, z -238..-221, rising north canopy      a steel lattice sweeping from the top of the tower's east face down to a flat wedge-shaped tip about 7.5 m up at x 310, on a raking strut: chords along it, diagonal braces, cross ribs forecourt   paving with a triangle pattern and a round fountain east of the canopy, a hedge along the road signs       two dark sign walls with the faculty name on the road fence footbridge  a covered steel footbridge over ถนนฉลองกรุง at x 262..265, stairs down both footpaths

## สโมสรนักศึกษา คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี <a id="kruclub"></a>

- OSM id: 1564107227 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps + Street View ถนนด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: สโมสรนักศึกษาคณะครุศาสตร์ฯ: 2 ชั้นผนังขาว บานเกล็ดสีแดง หลังคาโลหะลอน
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## Lita cafe & roaster - KMITL <a id="lita"></a>

- OSM id: 1564107231 · ไฟล์: `js/models/lita.js` · ชั้น: 1 · สูง: 4.8 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps เท่านั้น (ตำแหน่งตามหมุด Google Maps) ภาพ Street View ของสวนนี้ถ่ายก่อนมีร้าน จึงไม่มีภาพผนังและความสูง
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery only: every Street View capture of this garden predates the cafe (it shows open lawn here), so the walls and height are not photographed; they are a plain reading of the roof shape (glass walls under a low shell roof), to be revisited if photos appear. The OSM outline is a rough rectangle overlapping ตึก A; the outline below follows the imagery.
- ลักษณะอาคารที่บันทึก: Lita cafe & roaster: ศาลาเล็กในสวนทางเหนือของตึก A หลังคาเปลือกโค้งรูปไข่สีเทาอ่อน กว้างทางเหนือ มีช่องเปิดวงรีสีเข้มใกล้ปลายเหนือ ผนังกระจกใต้ชายคา / ส่วนบริการหลังคาแบนที่ปลายใต้ / ลานไม้สีครีมครึ่งวงกลมด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): egg-shaped shell roof, smooth light grey, widest at the north (x -93.7..-84.9, z -299.8..-288.5), with a dark oval opening near its north end; glazed walls under the eaves a lower flat-roofed service block at the south tip, against the garden wall of ตึก A a cream semicircular deck to the east

## คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง <a id="it"></a>

*KMITL School of Information Technology*

- OSM id: 314204881 · ไฟล์: `js/models/it.js` · ชั้น: 8 · สูง: 32.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (อาคารหลัก แผงโซลาร์ ปีกตะวันออก อาคารด้านเหนือ โถงทางเข้าโค้ง) + Street View: ถนนด้านใต้ (ด้านใต้ ปลายตะวันตกจากประตู) ถนนด้านตะวันออก (โถงกระจกโค้ง สระน้ำ บันได หอด้านตะวันออก) ที่จอดรถชั้นล่าง ถนนด้านเหนือ
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the main block with solar rows, the east wing, the north hall, the curved entrance; tall roofs lean north in the imagery and were moved south) and Google Street View from the road along the south side (the south face over the trees, the west end from the gate) and the road along the east side (the curved glass entrance with its pool and steps, the east tower), plus the open ground-floor car park and the north road.
- ลักษณะอาคารที่บันทึก: คณะเทคโนโลยีสารสนเทศ: ผนังกระจกสีฟ้า สลับแถบพื้นสีขาว ขอบหลังคาโค้ง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): main block x 302..368 / z -366..-320: seven storeys of white render with ribbon windows of blue glass; the ground floor is an open car park behind square columns east wing x 368..400 / z -368..-350: an eight-storey white tower, plain end walls with narrow slit windows, glazed balconies stacked on its south face curved blue-glass entrance hall at the south-east, three storeys behind tall round columns, under a deep flat canopy; broad steps and a pool in front north hall x 330..375 / z -392..-366: three storeys of white tile with few windows

## KMITL Kosen Dormitory <a id="dormks"></a>

- OSM id: 516204078 · ไฟล์: `js/models/dorms.js` · ชั้น: 5 · สูง: 22.9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาปั้นหยากระเบื้องแดง) + Street View ถนนด้านตะวันออกและถนนด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the south. Street View here predates the four tall blocks, which follow the photos and the imagery.
- ลักษณะอาคารที่บันทึก: หอพัก Kosen สจล.: 5 ชั้น ผนังขาว ระเบียงทุกห้องกั้นด้วยอิฐช่องลมสีส้ม ผนังหัว-ท้ายอิฐ / หลังคาปั้นหยากระเบื้องแดง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and stair towers rising above the roof; solar panels over the roof KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in orange pierced brick, brick end walls, red tiled hipped roofs

## สมาคมศิษย์เก่า <a id="alumni"></a>

- OSM id: 516204080 · ไฟล์: `js/models/mid.js` · ชั้น: 2 · สูง: 13.7 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคา ปิรามิดกระจกกลาง ปีกด้านใต้) + Street View ถนนด้านเหนือ (ด้านหน้ามีชื่อสมาคม) และด้านตะวันออก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks round each one.
- ลักษณะอาคารที่บันทึก: สมาคมศิษย์เก่า: 2 ชั้น แผงหน้าอาคารสีขาวลึกมีชื่อสมาคมสีแดง (ไทยและอังกฤษ) ชั้นล่างกระจกหลังเสาขาวเรียว กันสาดหน้าประตู / ปิรามิดกระจกกลางหลังคา
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): สมาคมศิษย์เก่า: two storeys; a deep white fascia across the north front with the association's name in red (Thai above English), a glazed ground floor behind slim white columns, a canopy over the door; a glazed pyramid over the middle of the roof; a wing south โรงอาหาร ตึกพระเทพฯ: two storeys facing south over a pond: a glazed ground-floor canteen behind white columns with red-brick piers at the south corners and steps up from the pond walk; a white slab; the upper floor behind a ring of deep white fins whose tops rise outward into a sawtooth skyline; a grey hipped roof with solar panels on its south slope; a small service block east (front from Street View on the pond walk) นาโน: two storeys of red brick with white floor bands and green-tinted glass, an arched entrance portico ธนาคารและไปรษณีย์: a long single-storey row of shops (bank, post office, coffee) under a flat concrete roof, a covered walk along its east side; its south end is a bank hall with a light-blue fascia and ATMs under the overhang. Beside it on the road (OSM 1138463213, 1138463212; added 2026-10-19 from the user's Virtual Tour photos): a Krungsri pavilion with a grey-and-yellow fascia, a glazed ATM front on a raised plinth and a tall yellow pylon sign, and a white bank pavilion with a deep flat fascia and pale green glazing คลินิกเวชกรรม (signed โรงพยาบาลพระจอมเกล้าเจ้าคุณทหาร): white, two storeys; the west block has three tall bays of pale glazing in a white frame with the name in red on its parapet; a set-back glazed entrance with wide steps, a slab over it and an open loggia on square columns above; a single-storey colonnade over the drop-off to the east with solar panels on top (re-surveyed 2026-10-19 from the user's Virtual Tour photos) ภาคอัตโนมัติ (BM EN-24, three storeys): refurbished - re-surveyed 2026-10-19 from the KMITL Virtual Tour (ไปรษณีย์ 5-9, from the road and the post-office walk east of it): charcoal cladding with big screens of grey vertical slats on the upper floors, orange trim on every floor edge and the parapet, a slate-blue ground floor with dark-framed glazing, an orange sign box with the department's name over the entrance on the east front

## โรงอาหารถิ่นชงโค <a id="tincan"></a>

- OSM id: 1049724130 · ไฟล์: `js/models/small.js` · ชั้น:  · สูง:  ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาโลหะ) + Street View ถนนด้านตะวันตก
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans and roofs) and Google Street View from the roads and walks beside them where it reaches them; Café Amazon and Inthanin are newer than Street View there and follow the imagery.
- ลักษณะอาคารที่บันทึก: โรงอาหารถิ่นชงโค: ชั้นเดียว ผนังครีม หลังคาโลหะลอนชายคาลึก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): canteens: single storey, cream walls or open sides on columns, corrugated metal roofs with deep eaves Lawson: a small white shop box with a glazed front and the brand colours in stripes on the fascia โรงอาหาร ตึก L + 7-Eleven: see lHalf below (rebuilt 2026-10-19 from the user's KMITL Virtual Tour photos) club buildings: one or two storeys of weathered white concrete with flat roofs; the faculty club has red tiled gables café kiosks: single storey, glazed fronts under a flat roof with a coloured fascia ตึกกระจก: two storeys of white render with large grids of glazing in grey frames; ลานเชียร์: an open hall of steel posts under a broad roof

## KMITL Dormitory <a id="dormk"></a>

- OSM id: 1116753937 · ไฟล์: `js/models/dorms.js` · ชั้น: 5 · สูง: 22.9 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (หลังคาปั้นหยากระเบื้องแดง) + Street View ถนนด้านตะวันออกและถนนด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the south. Street View here predates the four tall blocks, which follow the photos and the imagery.
- ลักษณะอาคารที่บันทึก: หอพัก สจล.: 5 ชั้น ผนังขาว ระเบียงทุกห้องกั้นด้วยอิฐช่องลมสีส้ม ผนังหัว-ท้ายอิฐ / หลังคาปั้นหยากระเบื้องแดง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and stair towers rising above the roof; solar panels over the roof KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in orange pierced brick, brick end walls, red tiled hipped roofs

## หอพักนักศึกษา อาคาร 10 <a id="dorm10"></a>

- OSM id: 1206348757 · ไฟล์: `js/models/dorms.js` · ชั้น: 10 · สูง: 36.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง แผงโซลาร์ หลังคาเอียงไปทางเหนือราว 6 ม. ในภาพ จึงเลื่อนลงใต้) + Google Maps photos (Street View บริเวณนี้ถ่ายก่อนสร้างอาคาร)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the south. Street View here predates the four tall blocks, which follow the photos and the imagery.
- ลักษณะอาคารที่บันทึก: หอพักนักศึกษาอาคาร 9–12: อาคารยาว 10 ชั้นสีขาว ระเบียงทางเดินเป็นแถบแนวนอน ผนังหัว-ท้ายและบันไดอิฐส้ม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and stair towers rising above the roof; solar panels over the roof KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in orange pierced brick, brick end walls, red tiled hipped roofs

## หอพักนักศึกษา อาคาร 12 <a id="dorm12"></a>

- OSM id: 1206348759 · ไฟล์: `js/models/dorms.js` · ชั้น: 10 · สูง: 36.2 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง แผงโซลาร์ หลังคาเอียงไปทางเหนือราว 6 ม. ในภาพ จึงเลื่อนลงใต้) + Google Maps photos (Street View บริเวณนี้ถ่ายก่อนสร้างอาคาร)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (plans, solar panels on the tall blocks, red tiled hipped roofs on the low ones; the tall roofs lean about 6 m north in the imagery and were moved south), photos on Google Maps (the tall blocks), and Google Street View from the road along the east side and the road to the south. Street View here predates the four tall blocks, which follow the photos and the imagery.
- ลักษณะอาคารที่บันทึก: หอพักนักศึกษาอาคาร 9–12: อาคารยาว 10 ชั้นสีขาว ระเบียงทางเดินเป็นแถบแนวนอน ผนังหัว-ท้ายและบันไดอิฐส้ม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): หอพักนักศึกษา อาคาร 9-12: long ten-storey slabs of white render, the open corridors on one long side drawn as continuous white parapet bands, rooms with windows and AC units on the other; orange-brick end walls and stair towers rising above the roof; solar panels over the roof KMITL Dormitory and KMITL Kosen Dormitory: five storeys, white walls with a balcony per room screened in orange pierced brick, brick end walls, red tiled hipped roofs

## โรงอาหาร คณะเทคโนโลยีสารสนเทศ <a id="itcan"></a>

*Information Technology Cafeteria*

- OSM id: 314205127 · ไฟล์: `js/models/itcan.js` · ชั้น: 2 · สูง: 10.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (อาคารสี่เหลี่ยม 2 ชั้น แผงโซลาร์รอบช่องแสงกลาง บันไดวงกลม) + Street View ถนนด้านตะวันตกและถนนใหญ่ด้านใต้
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (a square two-storey block, solar panels round a central light well with a raised roof, a round stair at the south-west corner) and Google Street View from the road to the west and the main road to the south (the block behind trees, its west front and steps).
- ลักษณะอาคารที่บันทึก: โรงอาหารคณะไอที: 2 ชั้น ชั้นล่างโล่งมีร้านค้าหลังเสาขาว ชั้นบนผนังขาวหน้าต่างแถบ / แผงโซลาร์รอบหลังคายกช่องแสงกลาง / บันไดวงกลมที่มุม
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): two storeys: an open ground floor of shops and tables behind white columns, a white upper floor with a strip of windows; solar panels round a raised clerestory roof over the central well; a round stair at the corner

## คณะบริหารธุรกิจ <a id="kbs"></a>

*KMITL Business School (KBS)*

- OSM id: 516308732 · ไฟล์: `js/models/kbs.js` · ชั้น: 6 · สูง: 29.6 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผัง หลังคาโซลาร์ หอกลาง ทางเชื่อมขั้นบันได) + คลิป #ที่นี่ลาดกระบัง KMITL Business School (youtu.be/mfGSrcOlX6g 0:02-0:16 ด้านหน้าทิศเหนือหลังปรับปรุง) + Street View ถนนรอบอาคาร (ภาพก่อนปรับปรุง ใช้กับปีกใต้)
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-19 from Google Maps satellite imagery (plan, roofs: solar panels on the wings, the tower's flat roof between them, the stepped link to the south wing) and the faculty's 2026 film "#ที่นี่ลาดกระบัง KMITL Business School" (youtu.be/mfGSrcOlX6g, 0:02-0:16: the north front from across the lawn and car park to the north-east, the arched screen, the tower top). Street View on the roads round it predates the refurbishment (white banded walls); it was used for the south wing and the floor count.
- ลักษณะอาคารที่บันทึก: คณะบริหารธุรกิจ: ปีกเหนือ 5 ชั้นผนังขาวหน้าต่างแนวยาว ชั้นล่างมีแนวซุ้มโค้งสีชมพูแซลมอน ป้าย KMITL BUSINESS SCHOOL บนขอบหลังคา / หอกลาง 6 ชั้นหุ้มสีดินเผา แถบกระจกกลาง กล่องขาวบนยอดมีตราและโครงเหล็กลาดเอียง / ปีกตะวันออก 3 ชั้นหลังผนังสีชมพูแซลมอนเจาะซุ้มโค้งสูงสองซุ้ม แผงสีเทาฟ้ามีชื่อคณะ กันสาดทางเข้า / ปีกใต้ 4 ชั้นแถบขาว ครีบด้านตะวันออก
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): north wing x 356..418, z -220..-199: five storeys of white render with ribbon windows, in two parts joined by a recessed link at x 381..386; a salmon-pink arcade of small arches in front of the ground floor; "KMITL BUSINESS SCHOOL" on the parapet; solar panels on both roofs tower x 419..436: six storeys clad in terracotta with a glazed strip up the middle, a white top box with the emblem and a sloping steel trellis over it east block x 438..466: three storeys behind a salmon-pink screen wall with two tall arches, a blue-grey fascia with "คณะบริหารธุรกิจ" on top, a white canopy over the entrance south wing x 437..465, z -183..-135: four storeys of white bands, deep fins down the east face, solar roof, joined to the east block by a two-storey link with a stepped roof

## KOSEN-KMITL <a id="kosen"></a>

- OSM id: 1322811831 · ไฟล์: `js/models/kosen.js` · ชั้น: 4 · สูง: 24.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (โถงหลังคาแบนสองส่วนกับช่องแสง แกนกระจกสีเข้ม ครีบเอียงด้านตะวันออก อาคารเล็กด้านตะวันตก) + Google Maps photos + Street View ถนนใหญ่ด้านใต้ ด้านเหนือและตะวันออกเป็นที่โล่งไม่มี Street View
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (two flat-roofed halls with a skylight strip, a dark glazed spine between them and the east wing, a row of slanted fins along the east face, a small annex on the west) and Google Street View from the main road to the south. The north and east sides face an open site with no Street View.
- ลักษณะอาคารที่บันทึก: KOSEN-KMITL: ผนังแผงสีกรมท่าเทาเข้ม ครีบแนวตั้งเอียง หน้าต่างกระจกสูง ภายในมีโถงสูงหลายชั้น
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): four storeys of white render with deep dark-grey canopy slabs at each floor and a dark-grey base; strip windows; thin raised lines on the walls in a circuit-board pattern a taller glazed spine of dark navy glass x 545..555 running north-south, and along the east face a screen of slanted dark vertical fins

## อาคารเจ้าคุณทหาร คณะเทคโนโลยีการเกษตร <a id="agri"></a>

- OSM id: 2573865 · ไฟล์: `js/models/agri.js` · ชั้น: 4 · สูง: 20.4 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ผังปีกสี่เหลี่ยมหมุน 45 องศา 4 ปีก อาคารด้านตะวันตก ทางเชื่อมเหนือ-ใต้ แผงโซลาร์) + Street View: ถนนด้านตะวันตก ลานจอดรถด้านเหนือ ถนนและลานจอดรถด้านใต้ มุมตะวันออกเฉียงใต้ ด้านตะวันออกติดคลองมีต้นไม้บัง
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (four square courtyard wings turned 45°, the solar-panelled block on the west side, the links north and south of the central lawn) and Google Street View from the roads around it: the west road, the north car park, the south car park and road, the south-east corner. The east side faces a canal behind trees and is modelled like the rest.
- ลักษณะอาคารที่บันทึก: คณะเทคโนโลยีการเกษตร: พื้นยื่นแนวนอนสีครีม หน้าต่างถอยร่น หอบันไดอิฐแดง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): four diamond wings (square rings about 43 m a side, 12 m deep, around planted courtyards) at the corners of a central lawn; the two on the west have four storeys, the two on the east five cream render with deep white floor bands and ribbon windows between piers on the outer faces, open walkways with solid parapets on the courtyard faces, red-brick stair towers crossed by the white bands at the corners of each wing; a low plinth all round a four-storey block with a solar roof on the west side, and solar-panelled links north and south of the lawn

## จุฬาภรณ์วลัยลักษณ์ 1 <a id="chula1"></a>

- OSM id: 3568617 · ไฟล์: `js/models/chula1.js` · ชั้น: 7 · สูง: 28 ม.
- แหล่งภาพอ้างอิง: ภาพดาวเทียม Google Maps (ปีกอาคาร 3 ปีก แผงโซลาร์ปีกตะวันตก) + Street View ลานจอดรถในมุมตัว L (หอทางเข้ามีชื่ออาคาร) ถนนด้านตะวันออก มุมตะวันออกเฉียงเหนือ
- การสำรวจ (จากหัวไฟล์โมเดล): Surveyed 2026-10-17 from Google Maps satellite imagery (the wings, solar panels on the west wing) and Google Street View from the car park in the crook of the L (the entrance tower with the name), the road along the east side and the north-east corner.
- ลักษณะอาคารที่บันทึก: จุฬาภรณ์วลัยลักษณ์ 1: 7 ชั้น ผนังขาว แผงกันแดดแนวนอนลึกต่อเนื่องทุกชั้น หน้าต่างแถบกระจกเขียวเทา / หอทางเข้าแนวทแยงที่มุมใน แผงอิฐแดงกลาง แถบบานเกล็ดขาว ล็อบบี้กระจกบนเสากลม บันไดกว้าง
- รูปทรงที่สร้าง (จากหัวไฟล์โมเดล): seven storeys of white render: deep continuous sunshade slabs at every floor with strip windows of green-grey glass between; a plain white parapet north wing x 180..247, west wing to z -191, east wing to z -151; the entrance tower fills the inner corner on a diagonal, a red-brick panel up its middle above a band of white louvres, a glazed lobby on round columns under it, broad steps to the car park
