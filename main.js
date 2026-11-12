import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc9e4);
scene.fog = new THREE.Fog(0x9bc9e4, 95, 330);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 700);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.querySelector('#game').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff3ff, 0x71604a, 2.15));
const sun = new THREE.DirectionalLight(0xffe2b4, 3.0);
sun.position.set(-85, 130, 65);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -140; sun.shadow.camera.right = 140;
sun.shadow.camera.top = 140; sun.shadow.camera.bottom = -140;
scene.add(sun);

const mat = (color, roughness = .86, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const stone = mat(0xd9c6a7), pale = mat(0xe8dfca), sandstone = mat(0xb98c60);
const darkStone = mat(0x756b60), roadMat = mat(0x343a40), asphaltLine = mat(0xe7d9b7);
const glass = mat(0x668b9b, .35, .25), green = mat(0x2d7047), leaf = mat(0x43834f);
const seaMat = new THREE.MeshStandardMaterial({ color: 0x247da6, roughness: .32, metalness: .12 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), mat(0xc7b18d));
ground.rotation.x = -Math.PI / 2; ground.position.y = -.2; ground.receiveShadow = true; scene.add(ground);

function box(w, h, d, material, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
function cylinder(rt, rb, h, material, x, y, z, sides = 16, parent = scene) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
  m.position.set(x, y + h / 2, z); m.castShadow = true; parent.add(m); return m;
}
function line(points, material, radius = .12) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 6, false), material);
  mesh.castShadow = true; scene.add(mesh); return mesh;
}
function dome(x, z, radius, height, material, parent = scene) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), material);
  m.scale.y = height / radius; m.position.set(x, height, z); m.castShadow = true; parent.add(m);
  cylinder(radius * .72, radius * .72, .45, material, x, height - .1, z, 20, parent);
  return m;
}
function tree(x, z, scale = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); scene.add(g);
  cylinder(.18, .27, 3.3, mat(0x765037), 0, 0, 0, 8, g);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(.32, 2.6, 6), green);
    frond.position.set(Math.cos(a) * .85, 3.5, Math.sin(a) * .85);
    frond.rotation.z = -Math.cos(a) * .75; frond.rotation.x = Math.sin(a) * .75; g.add(frond);
  }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.7, 10, 8), leaf);
  crown.position.y = 3.6; crown.scale.y = .45; g.add(crown);
}
function label(text, x, y, z, color = '#fff') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = 'rgba(8,18,30,.78)';
  ctx.roundRect(3, 3, 506, 90, 18); ctx.fill();
  ctx.font = 'bold 34px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = color;
  ctx.fillText(text, 256, 61);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.position.set(x, y, z); sprite.scale.set(17, 3.2, 1); scene.add(sprite);
}
function road(x, z, w, d, rot = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat);
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, .015, z); scene.add(m);
  return m;
}

// Arabian Sea, shoreline and Marine Drive promenade.
const sea = new THREE.Mesh(new THREE.PlaneGeometry(520, 180), seaMat);
sea.rotation.x = -Math.PI / 2; sea.position.set(0, -.08, -155); scene.add(sea);
box(520, .45, 4, pale, 0, 0, -64);
road(0, -51, 300, 15);
road(0, -38, 300, 3);
for (let x = -145; x <= 145; x += 8) {
  box(.18, .05, 2.4, asphaltLine, x, .06, -51);
  cylinder(.13, .13, 1.1, sandstone, x, .2, -43, 8);
}
// Marine Drive's sweeping curve and Queen's Necklace lamp posts.
const curvePts = [];
for (let i = 0; i <= 24; i++) {
  const a = Math.PI * .08 + i / 24 * Math.PI * .84;
  curvePts.push([Math.cos(a) * 125, .1, -5 - Math.sin(a) * 48]);
}
line(curvePts, roadMat, 5.5);
line(curvePts.map(([x,y,z]) => [x,y+.04,z-6]), pale, .22);
for (let i = 0; i <= 24; i++) {
  const a = Math.PI * .08 + i / 24 * Math.PI * .84;
  const x = Math.cos(a) * 125, z = -5 - Math.sin(a) * 48;
  cylinder(.08, .1, 4.3, darkStone, x, .1, z, 8);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.3, 8, 8), mat(0xffe1a0, .25, .1));
  lamp.position.set(x, 4.45, z); scene.add(lamp);
}

// Gateway of India: monumental basalt-coloured Indo-Saracenic arch.
const gx = -28, gz = -92;
box(22, 1.2, 5, darkStone, gx, 0, gz);
box(4.2, 15, 4, stone, gx - 8.5, 0, gz);
box(4.2, 15, 4, stone, gx + 8.5, 0, gz);
box(13, 3.2, 4, stone, gx, 12.5, gz);
box(17, 1, 5, sandstone, gx, 15.5, gz);
box(9, 1.1, 4, stone, gx, 16.4, gz);
const archRing = new THREE.Mesh(new THREE.TorusGeometry(6.3, .62, 12, 48, Math.PI), sandstone);
archRing.position.set(gx, 7.1, gz + 2.05); scene.add(archRing);
for (const sx of [-8.5, 8.5]) {
  for (const zoff of [-1.7, 1.7]) {
    cylinder(.42, .5, 12.2, sandstone, gx + sx, 1, gz + zoff, 12);
    cylinder(.7, .7, .6, stone, gx + sx, 12.8, gz + zoff, 12);
  }
}
for (const sx of [-1, 1]) {
  const turretX = gx + sx * 7.2;
  dome(turretX, gz, 1.8, 18.2, sandstone);
  cylinder(.12, .12, 2, sandstone, turretX, 19.4, gz, 8);
}
label('GATEWAY OF INDIA', gx, 23, gz - 3, '#ffe0a6');

// Taj Mahal Palace-inspired waterfront hotel, with red dome and corner towers.
const hx = 15, hz = -84;
box(27, 13, 13, mat(0xc8b69a), hx, 0, hz);
box(17, 19, 12, mat(0xd6c4a7), hx - 1, 0, hz - 1);
for (let floor = 2; floor < 17; floor += 3) {
  for (let x = hx - 8; x <= hx + 7; x += 3.5) {
    box(.9, 1.35, .12, glass, x, floor, hz - 7.1);
  }
}
dome(hx - 1, hz - 1, 4.3, 24, mat(0x9d5543));
for (const [x,z] of [[hx-11,hz-5],[hx+11,hz-5],[hx-11,hz+5],[hx+11,hz+5]]) {
  cylinder(1.15, 1.35, 16, mat(0xd1bea0), x, 0, z, 16);
  dome(x, z, 1.5, 18, mat(0x9e5442));
}
label('TAJ MAHAL PALACE', hx, 28, hz - 9, '#ffe0b5');

// CSMT-inspired Victorian Gothic station on the inland side.
const sx = 82, sz = 12;
box(42, 11, 14, mat(0xc6a77e), sx, 0, sz);
box(28, 16, 12, mat(0xd0b58f), sx, 0, sz - 1);
box(8, 23, 10, mat(0xc4a27a), sx, 0, sz - 2);
const tower = new THREE.Mesh(new THREE.ConeGeometry(4.2, 10, 8), mat(0x80634b));
tower.position.set(sx, 28, sz - 2); scene.add(tower);
for (let x = sx - 17; x <= sx + 17; x += 5.5) {
  box(1.1, 6, .3, mat(0x765c45), x, 2, sz - 7.2);
  const win = new THREE.Mesh(new THREE.CircleGeometry(.55, 12), glass);
  win.position.set(x, 6, sz - 7); scene.add(win);
}
for (const x of [sx - 14, sx + 14]) {
  cylinder(.55, .75, 12, mat(0x9a7958), x, 0, sz - 3, 10);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.8, 8), sandstone);
  cap.position.set(x, 13, sz - 3); scene.add(cap);
}
label('CSMT • MUMBAI', sx, 32, sz - 10, '#fff0d5');

// Bandra-Worli Sea Link: deck, pylons and fan cables across the water.
const bridgeMat = mat(0x929da5, .48, .45);
const bridgeZ = -143;
box(150, 1.5, 7, bridgeMat, 20, 10, bridgeZ);
for (const px of [-24, 64]) {
  box(2.2, 38, 2.2, pale, px, 10, bridgeZ);
  box(2.2, 2, 9, pale, px, 46, bridgeZ);
  for (const side of [-1, 1]) {
    for (let k = 0; k < 7; k++) {
      const endX = px + side * (7 + k * 5.1);
      const startY = 45 - k * 1.8;
      line([[px, startY, bridgeZ], [endX, 10.8, bridgeZ + (side * .2)]], bridgeMat, .075);
    }
  }
}
label('BANDRA–WORLI SEA LINK', 20, 53, bridgeZ - 4, '#f4f7fa');

// Neighbourhood blocks, apartment buildings and street grid.
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 11; col++) {
    const x = -145 + col * 27, z = 5 + row * 24;
    if (Math.abs(x - sx) < 28 && row === 0) continue;
    const h = 10 + ((row * 7 + col * 3) % 5) * 4;
    const colors = [0xb7a28b, 0xcfc3b1, 0x9cabb0, 0xd5c6aa];
    box(15, h, 13, mat(colors[(row + col) % colors.length]), x, 0, z);
    for (let yy = 3; yy < h - 1; yy += 3.2) {
      for (let xx = -5; xx <= 5; xx += 5) box(1.5, 1.4, .12, glass, x + xx, yy, z - 6.6);
    }
  }
}
road(0, 30, 280, 10);
road(-80, 70, 10, 110);
road(65, 70, 10, 110);
for (let x = -130; x < 130; x += 22) { tree(x, -30, .9); tree(x, 43, .85); }
for (let x = -120; x <= 120; x += 16) tree(x, -60, .75);

// Small fishing boats on the harbour.
function boat(x, z, scale = 1) {
  const g = new THREE.Group(); g.position.set(x, .15, z); g.scale.setScalar(scale); scene.add(g);
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(.8, 5, 4, 8), mat(0x654632));
  hull.rotation.z = Math.PI / 2; hull.scale.set(1, .45, .65); hull.position.y = .25; g.add(hull);
  box(.12, 3, .12, pale, 0, .5, 0, g);
  const sail = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.7, 3), mat(0xf0e6d0));
  sail.position.set(.3, 2.1, 0); sail.rotation.z = -.2; g.add(sail);
}
boat(-75, -130, 1.3); boat(10, -125, .9); boat(70, -160, 1.1);

// Player avatar (temporary original placeholder model).
const player = new THREE.Group(); scene.add(player);
const shirt = mat(0x234b77), skin = mat(0xb97e5b), trousers = mat(0x252a35), orange = mat(0xe18a32);
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.55, .9, 5, 10), shirt);
torso.position.y = 1.35; torso.castShadow = true; player.add(torso);
const head = new THREE.Mesh(new THREE.SphereGeometry(.36, 16, 12), skin); head.position.y = 2.35; player.add(head);
const legs = new THREE.Group(); legs.position.y = .62; player.add(legs);
for (const x of [-.25, .25]) {
  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.19, .75, 4, 8), trousers);
  leg.position.set(x, -.25, 0); legs.add(leg);
}
const pack = new THREE.Mesh(new THREE.BoxGeometry(.7, .8, .35), orange); pack.position.set(0, 1.35, .58); player.add(pack);
player.position.set(-5, 0, -18);

const startTarget = new THREE.Vector3(player.position.x, 2.8, player.position.z);
camera.position.set(-5, 8, 13);
let cameraYaw = 0, moveX = 0, moveY = 0, started = false;
const intro = document.querySelector('#intro');
const toast = document.querySelector('#toast');
function showToast(message) {
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
document.querySelector('#startBtn').addEventListener('click', () => {
  intro.classList.add('hidden'); started = true; showToast('Welcome to the Mumbai waterfront!');
});
document.querySelector('#helpBtn').onclick = () => document.querySelector('#help').classList.remove('hidden');
document.querySelector('#closeHelp').onclick = () => document.querySelector('#help').classList.add('hidden');
document.querySelector('#leftBtn').onpointerdown = () => { cameraYaw += .18; };
document.querySelector('#rightBtn').onpointerdown = () => { cameraYaw -= .18; };
const joy = document.querySelector('#joystick'), stick = document.querySelector('#stick');
let joyPointer = null;
function joystickMove(e) {
  const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let dx = e.clientX - cx, dy = e.clientY - cy; const max = 31, len = Math.hypot(dx, dy);
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  stick.style.transform = `translate(${dx}px,${dy}px)`; moveX = dx / max; moveY = dy / max;
}
joy.addEventListener('pointerdown', e => { joyPointer = e.pointerId; joy.setPointerCapture(e.pointerId); joystickMove(e); });
joy.addEventListener('pointermove', e => { if (e.pointerId === joyPointer) joystickMove(e); });
function resetJoy() { joyPointer = null; moveX = 0; moveY = 0; stick.style.transform = 'translate(0,0)'; }
joy.addEventListener('pointerup', resetJoy); joy.addEventListener('pointercancel', resetJoy);
const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04);
  if (started) {
    let mx = moveX + (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    let my = moveY + (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
    const length = Math.hypot(mx, my);
    if (length > .08) {
      mx /= Math.max(1, length); my /= Math.max(1, length);
      const angle = Math.atan2(mx, my) + cameraYaw;
      player.position.x += Math.sin(angle) * dt * 9;
      player.position.z += Math.cos(angle) * dt * 9;
      player.rotation.y = angle + Math.PI;
      legs.rotation.x = Math.sin(performance.now() * .012) * .18;
    } else legs.rotation.x *= .8;
    player.position.x = THREE.MathUtils.clamp(player.position.x, -170, 170);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -185, 115);
  }
  const target = new THREE.Vector3(player.position.x, 3.5, player.position.z + 1);
  const offset = new THREE.Vector3(Math.sin(cameraYaw) * 14, 7.5, Math.cos(cameraYaw) * 14);
  camera.position.lerp(target.clone().add(offset), .075);
  camera.lookAt(player.position.x, 2.0, player.position.z - 5);
  renderer.render(scene, camera);
}
animate();
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
