import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Loaders
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Update all materials
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
    }
  });
};

// Environment Map
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.jpg', // positive x
  '/textures/environmentMaps/0/nx.jpg', // negative x
  '/textures/environmentMaps/0/py.jpg',
  '/textures/environmentMaps/0/ny.jpg',
  '/textures/environmentMaps/0/pz.jpg',
  '/textures/environmentMaps/0/nz.jpg',
]);
environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;
scene.environment = environmentMap; // applies the envMap to every compatible material in the scene

debugObject.envMapIntensity = 1;
gui
  .add(debugObject, 'envMapIntensity')
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

// Models
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
  gltf.scene.scale.set(10, 10, 10);
  gltf.scene.position.set(0, -4, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  gui
    .add(gltf.scene.rotation, 'y')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name('rotation');

  updateAllMaterials();
});

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
// By default ThreeJS uses linear encoding - all textures that we can see directly (e.g. the envMap background, the baseColor maps for the helmet, but not the normalMaps or bumpMaps etc. for the helmet) should have THREE.sRGBEncoding
// However, the GLTFLoader automatically fixed the textures for the gltf model
renderer.outputEncoding = THREE.sRGBEncoding;
// tone mapping is usually used to convert HDR textures to standard RGB values
// we aren't using any HDR textures, but changing the toneMapping makes some nice differences
renderer.toneMapping = THREE.ACESFilmicToneMapping;

gui
  .add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    updateAllMaterials();
  });

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
