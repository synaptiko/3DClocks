import { Scene, PerspectiveCamera, WebGLRenderer, sRGBEncoding, ACESFilmicToneMapping } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { degToRad } from './utils';
import { createClocks } from './clocks';

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
const scene = new Scene();
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000000);
const orbitControls = new OrbitControls(camera, renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;

camera.position.z = 3.75;

orbitControls.enableDamping = true;
orbitControls.minAzimuthAngle = degToRad(-40);
orbitControls.maxAzimuthAngle = degToRad(40);
orbitControls.minPolarAngle = degToRad(40);
orbitControls.maxPolarAngle = degToRad(140);

const clocks = createClocks({ scene, orbitControls, copies: 12 });

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
};

function animate() {
	requestAnimationFrame(animate);
  orbitControls.update();
  clocks.updateTime();
  clocks.updateCameraAngle();
  renderer.render(scene, camera);
}

window.addEventListener('resize', onResize);
window.addEventListener('mousedown', () => document.body.style.cursor = 'grabbing');
window.addEventListener('mouseup', () => document.body.style.cursor = 'default');

document.body.appendChild(renderer.domElement);

onResize();
animate();