import { Mesh, PlaneGeometry, ShaderMaterial, Scene, Vector2 } from 'three';
import clockVertexShader from './shaders/clock.vert.glsl';
import clockFragmentShader from './shaders/clock.frag.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function createClocks({ scene, orbitControls, count }: { scene: Scene, orbitControls: OrbitControls, count: number }) {
  const material = new ShaderMaterial({
    vertexShader: clockVertexShader,
    fragmentShader: clockFragmentShader,
  });
  const { uniforms } = material;
  const { minAzimuthAngle, maxAzimuthAngle, minPolarAngle, maxPolarAngle } = orbitControls;
  const geometry = new PlaneGeometry(5, 5);
  const plane = new Mesh(geometry, material);
  
  uniforms.uCount = { value: count };
  uniforms.resolution = { value: new Vector2(window.innerWidth, window.innerHeight) },
  uniforms.uMinAzimuthAngle = { value: minAzimuthAngle };
  uniforms.uMaxAzimuthAngle = { value: maxAzimuthAngle };
  uniforms.uMinPolarAngle = { value: minPolarAngle };
  uniforms.uMaxPolarAngle = { value: maxPolarAngle };

  scene.add(plane);

  return {
    updateTime() {
      const now = new Date();
    
      uniforms.uMilliseconds = { value: now.getMilliseconds() };
      uniforms.uSeconds = { value: now.getSeconds() };
      uniforms.uMinutes = { value: now.getMinutes() };
      uniforms.uHours = { value: now.getHours() };
    },
    updateCameraAngle() {
      uniforms.uAzimuthalAngle = { value: orbitControls.getAzimuthalAngle() };
      uniforms.uPolarAngle = { value: orbitControls.getPolarAngle() };
    }
  };
}