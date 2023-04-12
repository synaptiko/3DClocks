import {  Scene, PerspectiveCamera, WebGLRenderer, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 5;

const geometry = new PlaneGeometry(5, 5);
const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
});
const plane = new Mesh(geometry, material);

scene.add(plane);

function animate() {
	requestAnimationFrame(animate);
  setCurrentTime();
	renderer.render(scene, camera);
}
animate();

function setCurrentTime() {
  const now = new Date();

  material.uniforms.uSeconds = { value: now.getSeconds() };
  material.uniforms.uMinutes = { value: now.getMinutes() };
  material.uniforms.uHours = { value: now.getHours() };
}