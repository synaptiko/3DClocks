import { Mesh, PlaneGeometry, ShaderMaterial, Matrix4, Scene } from 'three';
import clockVertexShader from './shaders/clock.vert.glsl';
import clockFragmentShader from './shaders/clock.frag.glsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function createClocks({ scene, orbitControls, copies }: { scene: Scene, orbitControls: OrbitControls, copies: number }) {
  const material = new ShaderMaterial({
    vertexShader: clockVertexShader,
    fragmentShader: clockFragmentShader,
    transparent: true,
  });
  const { uniforms } = material;
  const { minAzimuthAngle, maxAzimuthAngle, minPolarAngle, maxPolarAngle } = orbitControls;
  
  uniforms.uCopies = { value: copies };
  
  for (let i = 0; i < copies; i += 1) {
    const geometry = new PlaneGeometry(5, 5);
    const transformationMatrix = new Matrix4();
  
    transformationMatrix.makeTranslation(0, 0, i + 1);
    geometry.applyMatrix4(transformationMatrix);
  
    const plane = new Mesh(geometry, material);
  
    plane.position.z = -copies;
    scene.add(plane);
  }

  return {
    updateTime() {
      const now = new Date();
    
      uniforms.uMilliseconds = { value: now.getMilliseconds() };
      uniforms.uSeconds = { value: now.getSeconds() };
      uniforms.uMinutes = { value: now.getMinutes() };
      uniforms.uHours = { value: now.getHours() };
    },
    updateCameraAngle() {
      const azimuthalAngle = orbitControls.getAzimuthalAngle();
      const polarAngle = orbitControls.getPolarAngle();
      const normalizedAA = Math.abs(((azimuthalAngle - minAzimuthAngle) / (maxAzimuthAngle - minAzimuthAngle) - 0.5) * 2);
      const normalizedPA = Math.abs(((polarAngle - minPolarAngle) / (maxPolarAngle - minPolarAngle) - 0.5) * 2);
    
      uniforms.uCameraAngleCoef = { value: Math.max(normalizedAA, normalizedPA) };
    }
  };
}