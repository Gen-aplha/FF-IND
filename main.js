import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c9e8);
scene.fog = new THREE.Fog(0x91c9e8, 35, 125);
const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 250);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#game').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff2ff,0x566044,2.0));
const sun = new THREE.DirectionalLight(0xffedcf,2.2);
sun.position.set(-25,40,20); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat=(color,roughness=.9)=>new THREE.MeshStandardMaterial({color,roughness});
const sand=mat(0xd9c5a0), road=mat(0x343b43), stone=mat(0xd8c6a9), trim=mat(0xb48d62), green=mat(0x39734b), water=mat(0x287eaa,.45);
function box(w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),sand);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
// Arabian Sea and curved coastal edge
const sea=new THREE.Mesh(new THREE.PlaneGeometry(180,62),water);sea.rotation.x=-Math.PI/2;sea.position.set(0,.03,-58);scene.add(sea);
box(180,.18,5,mat(0xc9b28d),0,.05,-27);
// Main promenade and roads
box(100,.12,9,road,0,.08,-9);
for(let x=-45;x<48;x+=8) box(.18,.02,3,mat(0xe8dfc9),x,.16,-9);
// Gateway-inspired landmark: original simplified stone arch
const gx=0,gz=-22;
box(13,1,3,stone,gx,0.55,gz);
box(3.1,9,2.5,stone,gx-4.7,5,gz);
box(3.1,9,2.5,stone,gx+4.7,5,gz);
box(6.6,2.2,2.4,stone,gx,8.6,gz);
box(8,1,3.1,trim,gx,10.2,gz);
box(2.2,1.2,2.4,stone,gx,11.25,gz);
const arch=new THREE.Mesh(new THREE.TorusGeometry(3.05,0.48,8,32,Math.PI),trim);arch.position.set(gx,4.1,gz+1.3);scene.add(arch);
// Buildings along the waterfront
for(let i=0;i<13;i++){const x=-48+i*8;const h=5+(i%4)*2.5;box(5,h,5,mat([0xd9bda0,0xc5cbd0,0xe0d1bb][i%3]),x,h/2,-2);for(let y=1.5;y<h-1;y+=1.7)for(let xx=-1.4;xx<=1.4;xx+=1.4)box(.45,.7,.06,mat(0x536a78),x+xx,y,0.55-2)}
// palms
function palm(x,z){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,4,7),mat(0x86603b));trunk.position.set(x,2,z);scene.add(trunk);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=new THREE.Mesh(new THREE.ConeGeometry(.28,3,5),green);leaf.position.set(x+Math.cos(a)*1.05,4.1+Math.sin(a)*.25,z+Math.sin(a)*1.05);leaf.rotation.z=-Math.cos(a)*.9;leaf.rotation.x=Math.sin(a)*.9;scene.add(leaf)}}
for(let x=-42;x<=42;x+=8)palm(x,-15);
for(let x=-38;x<=38;x+=12)palm(x,9);
// Player placeholder character
const player=new THREE.Group();scene.add(player);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.95,4,8),mat(0x243e70));body.position.y=1.05;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),mat(0xc98f68));head.position.y=1.95;player.add(head);
const pack=new THREE.Mesh(new THREE.BoxGeometry(.55,.7,.28),mat(0xe18a32));pack.position.set(0,1.1,.48);player.add(pack);
player.position.set(0,0,17);
let heading=0, moveX=0, moveY=0, cameraYaw=0, started=false;
camera.position.set(0,5,25);
function showToast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
const intro=document.querySelector('#intro');
document.querySelector('#startBtn').addEventListener('click',()=>{intro.classList.add('hidden');started=true;showToast('Explore the Mumbai coast!')});
document.querySelector('#helpBtn').onclick=()=>document.querySelector('#help').classList.remove('hidden');
document.querySelector('#closeHelp').onclick=()=>document.querySelector('#help').classList.add('hidden');
document.querySelector('#leftBtn').onpointerdown=()=>cameraYaw+=.22;
document.querySelector('#rightBtn').onpointerdown=()=>cameraYaw-=.22;
const joy=document.querySelector('#joystick'),stick=document.querySelector('#stick');let joyPointer=null;
function joystickMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=31,len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}stick.style.transform=`translate(${dx}px,${dy}px)`;moveX=dx/max;moveY=dy/max}
joy.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);joystickMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)joystickMove(e)});
function resetJoy(){joyPointer=null;moveX=0;moveY=0;stick.style.transform='translate(0,0)'}
joy.addEventListener('pointerup',resetJoy);joy.addEventListener('pointercancel',resetJoy);
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
if(started){let mx=moveX+(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);let my=moveY+(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
const len=Math.hypot(mx,my);if(len>.08){mx/=Math.max(1,len);my/=Math.max(1,len);const angle=Math.atan2(mx,my)+cameraYaw;player.position.x+=Math.sin(angle)*dt*7;player.position.z+=Math.cos(angle)*dt*7;player.rotation.y=angle+Math.PI}
player.position.x=THREE.MathUtils.clamp(player.position.x,-65,65);player.position.z=THREE.MathUtils.clamp(player.position.z,-45,48);
}
const target=new THREE.Vector3(player.position.x,3.2,player.position.z+8);
const camOffset=new THREE.Vector3(Math.sin(cameraYaw)*13,6,Math.cos(cameraYaw)*13);
camera.position.lerp(target.clone().add(camOffset),.08);camera.lookAt(player.position.x,1.2,player.position.z-2);
renderer.render(scene,camera)}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
