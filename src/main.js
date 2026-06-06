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
    currentPosition: new THREE.Vector3(0, 0, 0),
    targetPosition: new THREE.Vector3(0, 0, 0),
    direction: new THREE.Vector3(0, 0, 1),
    nextTargetTime: 0,
    targetChangeInterval: 3, // seconds between new targets
};

// Tank boundaries
const tankBounds = {
    x: { min: -30, max: 30 },
    y: { min: -20, max: 20 },
    z: { min: -30, max: 30 },
};

// Generate random target position within tank bounds
function getRandomTarget() {
    return new THREE.Vector3(
        Math.random() * (tankBounds.x.max - tankBounds.x.min) + tankBounds.x.min,
        0, // Keep at fixed height, no vertical movement
        Math.random() * (tankBounds.z.max - tankBounds.z.min) + tankBounds.z.min
    );
}

// Set initial target
animationState.targetPosition = getRandomTarget();

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

// Swimming animation system with random movement
function updateSwimmingAnimation() {
    if (!fish) return;

    animationState.time += 0.016 * animationState.swimSpeed; // ~60fps

    // Update target position periodically
    if (animationState.time > animationState.nextTargetTime) {
        animationState.targetPosition = getRandomTarget();
        animationState.nextTargetTime = animationState.time + animationState.targetChangeInterval;
    }

    // Calculate direction to target
    const directionToTarget = new THREE.Vector3();
    directionToTarget.subVectors(animationState.targetPosition, animationState.currentPosition);
    const distanceToTarget = directionToTarget.length();

    // If close to target, pick a new one sooner
    if (distanceToTarget < 5) {
        animationState.targetPosition = getRandomTarget();
        animationState.nextTargetTime = animationState.time + animationState.targetChangeInterval;
    }

    // Smooth movement towards target
    const moveSpeed = 0.015 * animationState.swimSpeed;
    if (distanceToTarget > 0.1) {
        directionToTarget.normalize();
        animationState.currentPosition.addScaledVector(directionToTarget, moveSpeed);
    }

    // Add horizontal wiggling (side to side like a fish)
    const wiggleAmount = Math.sin(animationState.time * 3) * 2;
    
    fish.position.copy(animationState.currentPosition);
    // Don't add artificial sway - just let it swim naturally toward the target
    
    // Rotate fish to face direction of movement
    if (distanceToTarget > 0.1) {
        const targetRotationY = Math.atan2(directionToTarget.x, directionToTarget.z);
        fish.rotation.y += (targetRotationY - fish.rotation.y) * 0.1;
    }
    
    // Keep fish level - no nodding or rolling
    fish.rotation.x = 0;
    fish.rotation.z = 0;
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
