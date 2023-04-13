import {  Scene, PerspectiveCamera, WebGLRenderer, Mesh, PlaneGeometry, ShaderMaterial, Matrix4, Vector2 } from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import finalPassVertexShader from './shaders/finalPassVertex.glsl';
import finalPassFragmentShader from './shaders/finalPassFragment.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// Further inspiration and references:
// https://threejs.org/examples/webgl_postprocessing_dof2.html
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_dof2.html
// https://threejs.org/examples/#webgl_postprocessing_unreal_bloom
// https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
// https://simonharris.co/making-a-noise-film-grain-post-processing-effect-from-scratch-in-threejs/
// https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
const bloomComposer = new EffectComposer(renderer);

renderer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbitControls = new OrbitControls(camera, renderer.domElement);
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);

camera.position.z = 3.5;

const degToRad = (degrees: number) => degrees * (Math.PI / 180);

orbitControls.enableDamping = true;

orbitControls.minAzimuthAngle = -degToRad(40);
orbitControls.maxAzimuthAngle = degToRad(40);
orbitControls.minPolarAngle = degToRad(40);
orbitControls.maxPolarAngle = degToRad(140);

bloomPass.threshold = 0;
bloomPass.strength = 1.25;
bloomPass.radius = 0.3;

bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
bloomComposer.renderToScreen = false;

const finalPass = new ShaderPass(
	new ShaderMaterial({
		uniforms: {
			baseTexture: { value: null },
			bloomTexture: { value: bloomComposer.renderTarget2.texture }
		},
		vertexShader: finalPassVertexShader,
		fragmentShader: finalPassFragmentShader,
		defines: {}
	}),
  'baseTexture'
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);

const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  // To support back side, uncomment:
  // side: DoubleSide,
  // alphaToCoverage: true, // or depthWrite: false,
});

const darkMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
});

const copies = 12;

material.uniforms.uCopies = { value: copies };
material.uniforms.uIsDark = { value: false };
darkMaterial.uniforms.uCopies = { value: copies };
darkMaterial.uniforms.uIsDark = { value: true };

let lastPlane: Mesh;
for (let i = 0; i < copies; i += 1) {
  const geometry = new PlaneGeometry(5, 5);
  const transformationMatrix = new Matrix4();

  transformationMatrix.makeTranslation(0, 0, i + 1);
  geometry.applyMatrix4(transformationMatrix);

  const plane = new Mesh(geometry, material);

  // To support back side, we would need to dynamically re-assign renderOrder:
  // plane.renderOrder = copies - i;
  plane.position.z = -copies;
  scene.add(plane);

  lastPlane = plane;
}

function animate() {
	requestAnimationFrame(animate);
  setCurrentTime();
  orbitControls.update();
  lastPlane.material = darkMaterial;
  bloomComposer.render();
  lastPlane.material = material;
  finalComposer.render();
}
animate();

function setCurrentTime() {
  const now = new Date();

  material.uniforms.uMilliseconds = { value: now.getMilliseconds() };
  material.uniforms.uSeconds = { value: now.getSeconds() };
  material.uniforms.uMinutes = { value: now.getMinutes() };
  material.uniforms.uHours = { value: now.getHours() };

  darkMaterial.uniforms.uMilliseconds = { value: now.getMilliseconds() };
  darkMaterial.uniforms.uSeconds = { value: now.getSeconds() };
  darkMaterial.uniforms.uMinutes = { value: now.getMinutes() };
  darkMaterial.uniforms.uHours = { value: now.getHours() };
}

window.addEventListener('mousedown', () => document.body.style.cursor = 'grabbing');
window.addEventListener('mouseup', () => document.body.style.cursor = 'default');