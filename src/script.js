import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Loaders
const gltfLoader = new GLTFLoader();


/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial()
);
scene.add(testSphere);

// Models
gltfLoader.load(
  '/models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) => {
    scene.add(gltf.scene)
  }
)

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('lightIntensity');

gui
  .add(directionalLight.position, 'x')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightX');

gui
  .add(directionalLight.position, 'y')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightY');

gui
  .add(directionalLight.position, 'z')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightZ');

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// the default threeJS light intensities are based on an arbitrary scale unit and don't reflect real-world values. By setting 'physicallyCorrectLights' to true, it makes it easier to match across softwares (e.g. other softwares could use their own arbitrary unit system or set them to use physically correct units - when importing lights in from Blender, the lights will look similar in ThreeJS too)
renderer.physicallyCorrectLights = true;

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
