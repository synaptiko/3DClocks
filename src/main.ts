import { Scene, PerspectiveCamera, WebGLRenderer, MathUtils } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createClocks } from "./clocks";
import Stats from "stats.js";

const stats = new Stats();
const renderer = new WebGLRenderer({ antialias: true });
const scene = new Scene();
const camera = new PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const orbitControls = new OrbitControls(camera, renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);

camera.position.z = 8.0;

const maxAngle = 25;

orbitControls.minAzimuthAngle = MathUtils.degToRad(-maxAngle);
orbitControls.maxAzimuthAngle = MathUtils.degToRad(maxAngle);
orbitControls.minPolarAngle = MathUtils.degToRad(90 - maxAngle);
orbitControls.maxPolarAngle = MathUtils.degToRad(90 + maxAngle);
orbitControls.enableDamping = true;

const clocks = createClocks({ scene, orbitControls, count: 7 });

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function animate() {
  stats.begin();
  orbitControls.update();
  clocks.updateTime();
  clocks.updateCameraAngle();
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", onResize);
window.addEventListener(
  "mousedown",
  () => (document.body.style.cursor = "grabbing")
);
window.addEventListener(
  "mouseup",
  () => (document.body.style.cursor = "default")
);

document.body.appendChild(renderer.domElement);

// uncomment for debugging
//stats.showPanel(0)
//document.body.appendChild(stats.dom)

onResize();
animate();
