import {  Scene, PerspectiveCamera, WebGLRenderer, Mesh, PlaneGeometry, ShaderMaterial, Matrix4 } from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Further inspiration and references:
// https://threejs.org/examples/webgl_postprocessing_dof2.html
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_dof2.html
// https://threejs.org/examples/#webgl_postprocessing_unreal_bloom
// https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
// https://simonharris.co/making-a-noise-film-grain-post-processing-effect-from-scratch-in-threejs/
// https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/
// https://www.google.com/search?q=infinity+clocks&tbm=isch&ved=2ahUKEwj1xsjUvKL-AhVfhv0HHWeRCKAQ2-cCegQIABAA&oq=infinity&gs_lcp=CgNpbWcQARgBMgUIABCABDIHCAAQigUQQzIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEUKcEWN8VYJ8haAJwAHgAgAG9AYgB_AeSAQM5LjKYAQCgAQGqAQtnd3Mtd2l6LWltZ7ABAMABAQ&sclient=img&ei=Cak1ZLWeMt-M9u8P56KigAo&bih=1330&biw=1280&client=firefox-b-d
// https://cocopon.github.io/tweakpane/

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbitControls = new OrbitControls(camera, renderer.domElement);

camera.position.z = 3.5;

const degToRad = (degrees: number) => degrees * (Math.PI / 180);
const radToDeg = (radians: number) => radians * (180 / Math.PI);

orbitControls.enableDamping = true;

const minAzimuthAngle = -40;
const maxAzimuthAngle = 40;
const minPolarAngle = 40;
const maxPolarAngle = 140;

orbitControls.minAzimuthAngle = degToRad(minAzimuthAngle);
orbitControls.maxAzimuthAngle = degToRad(maxAzimuthAngle);
orbitControls.minPolarAngle = degToRad(minPolarAngle);
orbitControls.maxPolarAngle = degToRad(maxPolarAngle);

const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
});

const copies = 12;

material.uniforms.uCopies = { value: copies };

for (let i = 0; i < copies; i += 1) {
  const geometry = new PlaneGeometry(5, 5);
  const transformationMatrix = new Matrix4();

  transformationMatrix.makeTranslation(0, 0, i + 1);
  geometry.applyMatrix4(transformationMatrix);

  const plane = new Mesh(geometry, material);

  plane.position.z = -copies;
  scene.add(plane);
}

function animate() {
	requestAnimationFrame(animate);
  setCurrentTime();
  setCurrentCameraAngle();
  orbitControls.update();
  renderer.render(scene, camera);
}
animate();

function setCurrentTime() {
  const now = new Date();

  material.uniforms.uMilliseconds = { value: now.getMilliseconds() };
  material.uniforms.uSeconds = { value: now.getSeconds() };
  material.uniforms.uMinutes = { value: now.getMinutes() };
  material.uniforms.uHours = { value: now.getHours() };
}

function setCurrentCameraAngle() {
  const azimuthalAngle = radToDeg(orbitControls.getAzimuthalAngle());
  const polarAngle = radToDeg(orbitControls.getPolarAngle());
  const normalizedAA = Math.abs(((azimuthalAngle - minAzimuthAngle) / (maxAzimuthAngle - minAzimuthAngle) - 0.5) * 2);
  const normalizedPA = Math.abs(((polarAngle - minPolarAngle) / (maxPolarAngle - minPolarAngle) - 0.5) * 2);

  material.uniforms.uCameraAngleCoef = { value: Math.max(normalizedAA, normalizedPA) };
}

window.addEventListener('mousedown', () => document.body.style.cursor = 'grabbing');
window.addEventListener('mouseup', () => document.body.style.cursor = 'default');