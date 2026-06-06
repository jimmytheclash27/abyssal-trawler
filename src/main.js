import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Tank environment
scene.background = new THREE.Color(0x1a4d6d);
scene.fog = new THREE.Fog(0x1a4d6d, 100, 200);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Tank geometry (invisible container)
const tankGeometry = new THREE.BoxGeometry(80, 60, 80);
const tankMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a8ab5,
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
});
const tankMesh = new THREE.Mesh(tankGeometry, tankMaterial);
tankMesh.position.y = 0;
scene.add(tankMesh);

// Tank bottom
const bottomGeometry = new THREE.PlaneGeometry(80, 80);
const bottomMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d5a6c,
    metalness: 0.2,
    roughness: 0.9,
});
const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
bottom.rotation.x = -Math.PI / 2;
bottom.position.y = -30;
bottom.receiveShadow = true;
scene.add(bottom);

// Load fish model
const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
let fish;
const animationState = {
    time: 0,
    swimSpeed: 1.0,
    swimPath: 0,
};

// Load the tuna texture
const tunaTexture = textureLoader.load('assets/crimsontuna.png');

loader.load('assets/models/textured_mesh.glb', (gltf) => {
    fish = gltf.scene;
    fish.scale.set(1, 1, 1);
    fish.position.set(0, 0, 0);
    
    // Apply tuna texture to all meshes
    fish.traverse((node) => {
        if (node.isMesh) {
            node.material = new THREE.MeshStandardMaterial({
                map: tunaTexture,
                metalness: 0.2,
                roughness: 0.8,
            });
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    
    scene.add(fish);
    document.getElementById('status').textContent = 'Swimming...';
    
    animate();
}, undefined, (error) => {
    console.error('Error loading model:', error);
    document.getElementById('status').textContent = 'Error loading model';
});

// Swimming animation system
function updateSwimmingAnimation() {
    if (!fish) return;

    animationState.time += 0.01 * animationState.swimSpeed;

    // Circular swimming pattern (Lissajous curve)
    const radius = 20;
    const x = Math.sin(animationState.time * 0.5) * radius;
    const z = Math.cos(animationState.time * 0.7) * radius;
    const y = Math.sin(animationState.time * 0.3) * 15; // Vertical bobbing

    fish.position.set(x, y, z);

    // Fish rotation to face direction of movement
    const nextX = Math.sin((animationState.time + 0.01) * 0.5) * radius;
    const nextZ = Math.cos((animationState.time + 0.01) * 0.7) * radius;
    
    const dirX = nextX - x;
    const dirZ = nextZ - z;
    
    // Yaw rotation (horizontal)
    fish.rotation.y = Math.atan2(dirX, dirZ);
    
    // Pitch rotation (vertical swimming)
    const dirY = Math.sin((animationState.time + 0.01) * 0.3) * 15 - y;
    const horizontalSpeed = Math.sqrt(dirX * dirX + dirZ * dirZ);
    fish.rotation.x = Math.atan2(dirY, horizontalSpeed) * 0.3;
    
    // Tail fin animation (side-to-side)
    const tailWave = Math.sin(animationState.time * 4) * 0.3;
    fish.rotation.z = tailWave * 0.2;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    updateSwimmingAnimation();

    // Rotate camera slowly around the tank
    const cameraDistance = 50;
    const cameraAngle = Date.now() * 0.0001;
    camera.position.x = Math.cos(cameraAngle) * cameraDistance;
    camera.position.y = 15;
    camera.position.z = Math.sin(cameraAngle) * cameraDistance;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        animationState.swimSpeed = animationState.swimSpeed > 0 ? 0 : 1;
    }
    if (e.key === 'ArrowUp') animationState.swimSpeed = Math.min(2, animationState.swimSpeed + 0.1);
    if (e.key === 'ArrowDown') animationState.swimSpeed = Math.max(0, animationState.swimSpeed - 0.1);
});
