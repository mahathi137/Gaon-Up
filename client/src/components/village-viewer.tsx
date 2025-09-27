import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Spinner } from "@/components/ui/spinner";
import { Home, Users, Droplets, TreePine, Gauge } from "lucide-react";

interface VillageData {
  id: number;
  name: string;
  stateId: number;
  population: number;
  waterBodies: number;
  greenCover: number;
  development: number;
  description: string;
}

interface VillageViewerProps {
  villageId: number;
  dayMode: boolean;
}

export default function VillageViewer({ villageId, dayMode }: VillageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  // Fetch village data
  const { data: villageData, isLoading: isLoadingVillage, error } = useQuery<VillageData>({
    queryKey: ["/api/villages", villageId],
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Default background
    scene.background = new THREE.Color(0xd4f1f9); // Light sky blue
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 8, 10);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffd500, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Clean up
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Update scene with village data
  useEffect(() => {
    if (!sceneRef.current || !villageData) return;
    
    const scene = sceneRef.current;
    
    // Clear existing village objects
    scene.children = scene.children.filter(child => 
      child instanceof THREE.Light || child instanceof THREE.GridHelper
    );
    
    // Create terrain
    const terrainSize = 50;
    const terrainSegments = 100;
    const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    
    // Add some gentle hills and variations to the terrain
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      // Add low rolling hills
      const x = vertices[i];
      const z = vertices[i + 2];
      
      // Distance from center, more flat in the center for the village
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const centerFlatteningFactor = Math.max(0, (distanceFromCenter - 10) / 20);
      
      // Random hills with simplex-like noise (simplified)
      const hillHeight = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5;
      
      // Add small random variations
      const noise = Math.sin(x * 0.5) * Math.sin(z * 0.5) * 0.1;
      
      // Combine all height factors
      vertices[i + 1] = hillHeight * centerFlatteningFactor + noise;
    }
    
    terrainGeometry.computeVertexNormals();
    
    // Create varied materials for the terrain
    const terrainMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355, // Sandy/dirt color
      roughness: 0.9,
      metalness: 0.1,
      flatShading: false
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    // Add terrain details
    // Add grass patches
    const grassTextureCount = Math.floor(villageData.greenCover / 10);
    for (let i = 0; i < grassTextureCount; i++) {
      const patchSize = 1 + Math.random() * 3;
      const patchGeometry = new THREE.CircleGeometry(patchSize, 8);
      const greenIntensity = 0.4 + Math.random() * 0.6;
      const patchMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(0.2, 0.4 + greenIntensity * 0.3, 0.1),
        roughness: 0.8
      });
      
      const patch = new THREE.Mesh(patchGeometry, patchMaterial);
      patch.rotation.x = -Math.PI / 2;
      
      // Position randomly but avoid center and water
      let patchX, patchZ;
      do {
        patchX = (Math.random() - 0.5) * 40;
        patchZ = (Math.random() - 0.5) * 40;
      } while (Math.sqrt(patchX * patchX + patchZ * patchZ) < 5); // Keep away from center
      
      patch.position.set(patchX, 0.02, patchZ); // Slightly above ground
      scene.add(patch);
    }
    
    // Add central village area
    const centerAreaGeometry = new THREE.CircleGeometry(10, 32);
    const centerAreaMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xB8860B, // Dark golden soil color
      roughness: 0.8,
      metalness: 0.1
    });
    const centerArea = new THREE.Mesh(centerAreaGeometry, centerAreaMaterial);
    centerArea.rotation.x = -Math.PI / 2;
    centerArea.position.y = 0.01; // Slightly above terrain to avoid z-fighting
    scene.add(centerArea);
    
    // Add Indian village elements
    
    // Create central temple/community structure
    const templeGroup = new THREE.Group();
    
    // Base platform
    const platformGeometry = new THREE.BoxGeometry(5, 0.5, 5);
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xFDFDFD }); // White stone
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25;
    platform.receiveShadow = true;
    platform.castShadow = true;
    templeGroup.add(platform);
    
    // Main temple structure
    const templeBaseGeometry = new THREE.BoxGeometry(4, 1.5, 4);
    const templeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFECB3 }); // Light cream color
    const templeBase = new THREE.Mesh(templeBaseGeometry, templeBaseMaterial);
    templeBase.position.y = 1.25;
    templeBase.receiveShadow = true;
    templeBase.castShadow = true;
    templeGroup.add(templeBase);
    
    // Temple dome
    const domeGeometry = new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Gold
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 3;
    dome.castShadow = true;
    templeGroup.add(dome);
    
    // Temple spire
    const spireGeometry = new THREE.ConeGeometry(0.4, 1.5, 16);
    const spireMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Gold
    const spire = new THREE.Mesh(spireGeometry, spireMaterial);
    spire.position.y = 4;
    spire.castShadow = true;
    templeGroup.add(spire);
    
    // Temple steps
    const stepsGeometry = new THREE.BoxGeometry(2, 0.3, 1);
    const stepsMaterial = new THREE.MeshStandardMaterial({ color: 0xFDFDFD }); // White stone
    const steps = new THREE.Mesh(stepsGeometry, stepsMaterial);
    steps.position.set(0, 0.15, 2.5);
    steps.receiveShadow = true;
    templeGroup.add(steps);
    
    // Position temple near center
    templeGroup.position.set(0, 0, -2);
    scene.add(templeGroup);
    
    // Add huts/houses based on population
    // Calculate number of buildings based on village size
    const population = villageData.population;
    const hutCount = Math.max(5, Math.min(20, Math.floor(population / 150)));
    
    // Create circular arrangement of huts around the central area
    for (let i = 0; i < hutCount; i++) {
      const angle = (i / hutCount) * Math.PI * 2;
      const radius = 5 + Math.random() * 3; // Distance from center
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Create Indian-style hut
      const hutGroup = new THREE.Group();
      
      // Determine if this is a modern house or traditional hut based on development level
      const isModernHouse = Math.random() < (villageData.development / 100);
      
      if (isModernHouse) {
        // Modern house
        const houseBaseGeometry = new THREE.BoxGeometry(1.8, 1.4, 1.8);
        const houseBaseMaterial = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(0.9, 0.9, 0.8 + Math.random() * 0.2) 
        });
        const houseBase = new THREE.Mesh(houseBaseGeometry, houseBaseMaterial);
        houseBase.position.y = 0.7;
        houseBase.castShadow = true;
        houseBase.receiveShadow = true;
        hutGroup.add(houseBase);
        
        // Flat roof
        const roofGeometry = new THREE.BoxGeometry(2, 0.2, 2);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.5;
        roof.castShadow = true;
        hutGroup.add(roof);
        
        // Door
        const doorGeometry = new THREE.PlaneGeometry(0.5, 0.8);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.5, 0.91);
        hutGroup.add(door);
        
        // Windows
        const windowGeometry = new THREE.PlaneGeometry(0.3, 0.3);
        const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6 });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(0.5, 0.8, 0.91);
        hutGroup.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(-0.5, 0.8, 0.91);
        hutGroup.add(window2);
      } else {
        // Traditional mud hut with thatched roof
        // Hut base/walls (cylinder)
        const wallGeometry = new THREE.CylinderGeometry(1, 1, 1.2, 16);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(0.6 + Math.random() * 0.2, 0.4 + Math.random() * 0.1, 0.2)
        }); // Varying earth tones
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.y = 0.6;
        wall.castShadow = true;
        wall.receiveShadow = true;
        hutGroup.add(wall);
        
        // Hut roof (cone)
        const roofGeometry = new THREE.ConeGeometry(1.4, 1.2, 16);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(0.5 + Math.random() * 0.15, 0.3 + Math.random() * 0.1, 0.1)
        }); // Varying thatch brown
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.7;
        roof.castShadow = true;
        hutGroup.add(roof);
        
        // Door cutout
        const doorGeometry = new THREE.PlaneGeometry(0.6, 0.8);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.4, 1.01);
        hutGroup.add(door);
      }
      
      // Add small variation to each hut
      hutGroup.rotation.y = Math.random() * Math.PI * 2;
      hutGroup.scale.set(
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4
      );
      
      // Position the hut
      hutGroup.position.set(x, 0, z);
      
      scene.add(hutGroup);
      
      // Add small compound wall or fence around some houses
      if (Math.random() > 0.5) {
        const fenceRadius = 1.5 + Math.random() * 0.5;
        const fenceHeight = 0.3;
        const fenceSegments = 8;
        
        for (let j = 0; j < fenceSegments; j++) {
          const fenceAngle = (j / fenceSegments) * Math.PI * 2;
          const nextFenceAngle = ((j + 1) / fenceSegments) * Math.PI * 2;
          
          const fx1 = Math.cos(fenceAngle) * fenceRadius;
          const fz1 = Math.sin(fenceAngle) * fenceRadius;
          
          const fx2 = Math.cos(nextFenceAngle) * fenceRadius;
          const fz2 = Math.sin(nextFenceAngle) * fenceRadius;
          
          // Create fence segment as a box between the two points
          const segmentLength = Math.sqrt(Math.pow(fx2 - fx1, 2) + Math.pow(fz2 - fz1, 2));
          const fenceGeometry = new THREE.BoxGeometry(segmentLength, fenceHeight, 0.1);
          const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0xCD853F });
          const fenceSegment = new THREE.Mesh(fenceGeometry, fenceMaterial);
          
          // Position at midpoint
          fenceSegment.position.set(
            x + (fx1 + fx2) / 2,
            fenceHeight / 2,
            z + (fz1 + fz2) / 2
          );
          
          // Rotate to face center
          fenceSegment.rotation.y = Math.atan2(fz1 - fz2, fx1 - fx2);
          
          fenceSegment.castShadow = true;
          fenceSegment.receiveShadow = true;
          
          scene.add(fenceSegment);
        }
        
        // Add gate opening
        const gateAngle = Math.random() * Math.PI * 2;
        const gateX = x + Math.cos(gateAngle) * fenceRadius;
        const gateZ = z + Math.sin(gateAngle) * fenceRadius;
        
        const gateGeometry = new THREE.BoxGeometry(0.6, fenceHeight * 1.2, 0.1);
        const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const gate = new THREE.Mesh(gateGeometry, gateMaterial);
        
        gate.position.set(gateX, fenceHeight / 2, gateZ);
        gate.rotation.y = gateAngle + Math.PI / 2;
        gate.castShadow = true;
        
        scene.add(gate);
      }
    }
    
    // Add trees (more realistic Indian trees)
    const treeCount = Math.round((villageData.greenCover / 100) * 40); // Max 40 trees at 100% green cover
    
    for (let i = 0; i < treeCount; i++) {
      // Randomize position - keep away from central village area
      let x, z, distanceFromCenter;
      do {
        x = (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * 40;
        distanceFromCenter = Math.sqrt(x * x + z * z);
      } while (distanceFromCenter < 7); // Keep away from village center
      
      // Create different types of trees
      const treeGroup = new THREE.Group();
      
      // Random tree types common in Indian villages
      const treeType = Math.floor(Math.random() * 4);
      
      if (treeType === 0) {
        // Banyan/Peepal style tree (wide, dense foliage)
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Multiple foliage layers
        for (let j = 0; j < 3; j++) {
          const size = 1.8 - j * 0.4;
          const height = 1.8 + j * 0.5;
          
          const foliageGeometry = new THREE.SphereGeometry(size, 8, 8);
          const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(0.1, 0.4 + Math.random() * 0.2, 0.1) 
          });
          const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
          foliage.position.y = height;
          foliage.castShadow = true;
          treeGroup.add(foliage);
        }
        
        // Hanging roots
        for (let j = 0; j < 4; j++) {
          const rootAngle = (j / 4) * Math.PI * 2;
          const rootGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 4);
          const rootMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
          const root = new THREE.Mesh(rootGeometry, rootMaterial);
          
          root.position.set(
            Math.cos(rootAngle) * 0.8,
            1.5,
            Math.sin(rootAngle) * 0.8
          );
          
          root.castShadow = true;
          treeGroup.add(root);
        }
      } else if (treeType === 1) {
        // Coconut palm
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Palm fronds
        for (let j = 0; j < 7; j++) {
          const frondAngle = (j / 7) * Math.PI * 2;
          const frondGeometry = new THREE.ConeGeometry(0.2, 2, 4);
          const frondMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
          const frond = new THREE.Mesh(frondGeometry, frondMaterial);
          
          frond.position.set(
            Math.cos(frondAngle) * 0.8,
            3,
            Math.sin(frondAngle) * 0.8
          );
          
          // Rotate fronds outward
          frond.rotation.x = Math.PI / 4;
          frond.rotation.y = -frondAngle;
          
          frond.castShadow = true;
          treeGroup.add(frond);
        }
        
        // Coconuts
        for (let j = 0; j < 3; j++) {
          const nutAngle = (j / 3) * Math.PI * 2;
          const nutGeometry = new THREE.SphereGeometry(0.15, 8, 8);
          const nutMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
          const nut = new THREE.Mesh(nutGeometry, nutMaterial);
          
          nut.position.set(
            Math.cos(nutAngle) * 0.3,
            2.8,
            Math.sin(nutAngle) * 0.3
          );
          
          nut.castShadow = true;
          treeGroup.add(nut);
        }
      } else {
        // Standard tree (Neem/Mango)
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Tree foliage
        const foliageGeometry = new THREE.SphereGeometry(1.2, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(0.1, 0.4 + Math.random() * 0.2, 0.1)
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 2.5;
        foliage.castShadow = true;
        treeGroup.add(foliage);
      }
      
      // Add random scaling for variety
      const scale = 0.8 + Math.random() * 0.7;
      treeGroup.scale.set(scale, scale, scale);
      
      // Position the tree
      treeGroup.position.set(x, 0, z);
      
      scene.add(treeGroup);
    }
    
    // Add water bodies based on waterBodies percentage
    const waterCount = Math.ceil(villageData.waterBodies / 20); // 1-5 water bodies
    
    for (let i = 0; i < waterCount; i++) {
      // Randomize position away from center
      let x, z, distanceFromCenter;
      do {
        const angle = Math.random() * Math.PI * 2;
        const distance = 12 + Math.random() * 15; // 12-27 units from center
        x = Math.cos(angle) * distance;
        z = Math.sin(angle) * distance;
        distanceFromCenter = Math.sqrt(x * x + z * z);
      } while (distanceFromCenter < 10); // Keep away from village center
      
      // Randomize size based on waterBodies percentage
      const size = 3 + (villageData.waterBodies / 15); // Size 3-10
      
      // Create natural-shaped water body with multiple segments
      const waterGroup = new THREE.Group();
      
      // Main pond/lake
      const waterGeometry = new THREE.CircleGeometry(size, 32);
      const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4169e1, // Royal blue
        metalness: 0.1,
        roughness: 0.2,
      });
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.05; // Slightly above ground to avoid z-fighting
      waterGroup.add(water);
      
      // Add shore/mud around the water
      const shoreGeometry = new THREE.RingGeometry(size, size + 0.5, 32);
      const shoreMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const shore = new THREE.Mesh(shoreGeometry, shoreMaterial);
      shore.rotation.x = -Math.PI / 2;
      shore.position.y = 0.06;
      waterGroup.add(shore);
      
      // Add small boats or objects near the water
      if (Math.random() > 0.5) {
        const boatGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.4);
        const boatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const boat = new THREE.Mesh(boatGeometry, boatMaterial);
        
        // Position on water
        const boatAngle = Math.random() * Math.PI * 2;
        const boatDistance = Math.random() * (size - 0.5);
        boat.position.set(
          Math.cos(boatAngle) * boatDistance,
          0.1,
          Math.sin(boatAngle) * boatDistance
        );
        
        boat.rotation.y = Math.random() * Math.PI * 2;
        boat.castShadow = true;
        waterGroup.add(boat);
      }
      
      // Position the water body
      waterGroup.position.set(x, 0, z);
      
      scene.add(waterGroup);
    }
    
    // Add village roads/paths
    const roadCount = 3 + Math.floor(villageData.development / 20); // 3-8 roads depending on development
    
    for (let i = 0; i < roadCount; i++) {
      // Create paths radiating from center
      const angle = (i / roadCount) * Math.PI * 2;
      const length = 15 + (villageData.development / 10); // Length 15-25 based on development
      
      const roadGeometry = new THREE.PlaneGeometry(1.5, length);
      const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: villageData.development > 50 ? 0x808080 : 0xd2b48c, // Gray if developed, tan if not
        roughness: villageData.development > 50 ? 0.5 : 0.9,
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      
      // Position the road from center outward
      road.position.set(
        Math.cos(angle) * length/2, 
        0.05,  // Slightly above ground
        Math.sin(angle) * length/2
      );
      
      // Rotate to point outward
      road.rotation.z = -angle;
      
      scene.add(road);
      
      // Add sidewalks or borders to paved roads
      if (villageData.development > 50) {
        const borderGeometry = new THREE.PlaneGeometry(0.2, length);
        const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
        
        const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        leftBorder.rotation.x = -Math.PI / 2;
        leftBorder.position.set(
          Math.cos(angle) * length/2 + Math.cos(angle + Math.PI/2) * 0.85, 
          0.06,
          Math.sin(angle) * length/2 + Math.sin(angle + Math.PI/2) * 0.85
        );
        leftBorder.rotation.z = -angle;
        scene.add(leftBorder);
        
        const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        rightBorder.rotation.x = -Math.PI / 2;
        rightBorder.position.set(
          Math.cos(angle) * length/2 - Math.cos(angle + Math.PI/2) * 0.85, 
          0.06,
          Math.sin(angle) * length/2 - Math.sin(angle + Math.PI/2) * 0.85
        );
        rightBorder.rotation.z = -angle;
        scene.add(rightBorder);
      }
    }
    
    // Add fields/crops around the village
    const fieldCount = 5 + Math.floor(villageData.greenCover / 20);
    
    for (let i = 0; i < fieldCount; i++) {
      // Create fields in the outskirts
      let x, z, distanceFromCenter;
      do {
        x = (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * 40;
        distanceFromCenter = Math.sqrt(x * x + z * z);
      } while (distanceFromCenter < 15 || distanceFromCenter > 30); // Keep in outskirts
      
      const fieldSize = 2 + Math.random() * 3;
      const fieldGeometry = new THREE.PlaneGeometry(fieldSize, fieldSize);
      
      // Different crop colors based on season/type
      const cropColors = [
        0xADFF2F, // Green Yellow (young crops)
        0x556B2F, // Dark Olive Green (mature crops)
        0xDAA520, // Golden Rod (wheat/mature rice)
        0x228B22  // Forest Green
      ];
      
      const fieldMaterial = new THREE.MeshStandardMaterial({ 
        color: cropColors[Math.floor(Math.random() * cropColors.length)],
        roughness: 0.9
      });
      
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.rotation.x = -Math.PI / 2;
      field.position.set(x, 0.05, z);
      field.rotation.z = Math.random() * Math.PI * 2; // Random orientation
      
      scene.add(field);
      
      // Add plot boundaries
      const boundaryGeometry = new THREE.EdgesGeometry(fieldGeometry);
      const boundaryMaterial = new THREE.LineBasicMaterial({ color: 0x8B4513 });
      const boundary = new THREE.LineSegments(boundaryGeometry, boundaryMaterial);
      boundary.rotation.x = -Math.PI / 2;
      boundary.position.set(x, 0.06, z);
      boundary.rotation.z = field.rotation.z;
      
      scene.add(boundary);
    }
    
    // Add small details to make the village more alive
    
    // Add a few cattle/livestock
    const cattleCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < cattleCount; i++) {
      // Position near huts but not too central
      let x, z, distanceFromCenter;
      do {
        x = (Math.random() - 0.5) * 15;
        z = (Math.random() - 0.5) * 15;
        distanceFromCenter = Math.sqrt(x * x + z * z);
      } while (distanceFromCenter < 5 || distanceFromCenter > 12);
      
      // Cow/buffalo shape
      const cattleGroup = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.4);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: Math.random() > 0.5 ? 0x000000 : 0x8B4513 // Black or brown
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.25;
      body.castShadow = true;
      cattleGroup.add(body);
      
      // Head
      const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const headMaterial = new THREE.MeshStandardMaterial({ color: bodyMaterial.color });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.set(0.5, 0.4, 0);
      head.castShadow = true;
      cattleGroup.add(head);
      
      // Legs
      for (let j = 0; j < 4; j++) {
        const legX = (j < 2 ? 0.25 : -0.25);
        const legZ = (j % 2 === 0 ? 0.15 : -0.15);
        
        const legGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const legMaterial = new THREE.MeshStandardMaterial({ color: bodyMaterial.color });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(legX, 0.15, legZ);
        leg.castShadow = true;
        cattleGroup.add(leg);
      }
      
      cattleGroup.position.set(x, 0, z);
      cattleGroup.rotation.y = Math.random() * Math.PI * 2;
      
      scene.add(cattleGroup);
    }
    
    // Add small shrines or landmarks
    if (Math.random() > 0.5) {
      const shrineGroup = new THREE.Group();
      
      // Base
      const baseGeometry = new THREE.BoxGeometry(1, 0.2, 1);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0.1;
      base.receiveShadow = true;
      shrineGroup.add(base);
      
      // Shrine structure
      const shrineGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
      const shrineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
      const shrine = new THREE.Mesh(shrineGeometry, shrineMaterial);
      shrine.position.y = 0.6;
      shrine.castShadow = true;
      shrineGroup.add(shrine);
      
      // Top
      const topGeometry = new THREE.ConeGeometry(0.4, 0.4, 4);
      const topMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 1.2;
      top.castShadow = true;
      shrineGroup.add(top);
      
      // Position randomly but not in center
      const angle = Math.random() * Math.PI * 2;
      const distance = 7 + Math.random() * 5;
      shrineGroup.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );
      
      scene.add(shrineGroup);
    }
    
    // Add well
    const wellGroup = new THREE.Group();
    
    // Well circular base
    const wellBaseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const wellBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const wellBase = new THREE.Mesh(wellBaseGeometry, wellBaseMaterial);
    wellBase.position.y = 0.25;
    wellBase.castShadow = true;
    wellBase.receiveShadow = true;
    wellGroup.add(wellBase);
    
    // Well water
    const wellWaterGeometry = new THREE.CircleGeometry(0.6, 16);
    const wellWaterMaterial = new THREE.MeshStandardMaterial({ color: 0x4682B4 });
    const wellWater = new THREE.Mesh(wellWaterGeometry, wellWaterMaterial);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.y = 0.51;
    wellGroup.add(wellWater);
    
    // Well structure (optional based on development)
    if (villageData.development > 40) {
      // Add well roof
      const wellRoofGroup = new THREE.Group();
      
      // Posts
      for (let i = 0; i < 2; i++) {
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(i === 0 ? -0.8 : 0.8, 0.75, 0);
        post.castShadow = true;
        wellRoofGroup.add(post);
      }
      
      // Crossbeam
      const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const beamMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.y = 1.5;
      beam.rotation.z = Math.PI / 2;
      beam.castShadow = true;
      wellRoofGroup.add(beam);
      
      // Rope
      const ropeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
      const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
      rope.position.set(0, 1.1, 0);
      rope.castShadow = true;
      wellRoofGroup.add(rope);
      
      // Bucket
      const bucketGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.2, 8);
      const bucketMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
      const bucket = new THREE.Mesh(bucketGeometry, bucketMaterial);
      bucket.position.set(0, 0.7, 0);
      bucket.castShadow = true;
      wellRoofGroup.add(bucket);
      
      wellGroup.add(wellRoofGroup);
    }
    
    // Position the well
    wellGroup.position.set(3, 0, 4);
    scene.add(wellGroup);
    
  }, [villageData]);
  
  // Handle day/night toggle
  useEffect(() => {
    if (!sceneRef.current) return;
    
    if (dayMode) {
      // Day mode
      sceneRef.current.background = new THREE.Color(0xd4f1f9); // Light sky blue
      // Find and adjust ambient light
      const ambientLight = sceneRef.current.children.find(
        child => child instanceof THREE.AmbientLight
      ) as THREE.AmbientLight;
      if (ambientLight) ambientLight.intensity = 0.5;
      
      // Find and adjust directional light
      const directionalLight = sceneRef.current.children.find(
        child => child instanceof THREE.DirectionalLight
      ) as THREE.DirectionalLight;
      if (directionalLight) {
        directionalLight.intensity = 0.8;
        directionalLight.color.set(0xffd500); // Sunlight yellow
      }
    } else {
      // Night mode
      sceneRef.current.background = new THREE.Color(0x000033); // Dark blue
      // Find and adjust ambient light
      const ambientLight = sceneRef.current.children.find(
        child => child instanceof THREE.AmbientLight
      ) as THREE.AmbientLight;
      if (ambientLight) ambientLight.intensity = 0.1;
      
      // Find and adjust directional light
      const directionalLight = sceneRef.current.children.find(
        child => child instanceof THREE.DirectionalLight
      ) as THREE.DirectionalLight;
      if (directionalLight) {
        directionalLight.intensity = 0.2;
        directionalLight.color.set(0xb0c4de); // Light blue for moonlight
      }
    }
    // This effect handles the day/night toggle
    // The main effect will re-run when dayMode changes
  }, [dayMode]);
  
  return (
    <div className="relative h-96">
      {isLoadingVillage && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-10">
          <Spinner className="h-12 w-12 text-primary" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive bg-opacity-10 z-10">
          <div className="bg-white p-4 rounded shadow-lg text-center">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page.</p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ visibility: isLoadingVillage ? 'hidden' : 'visible' }}
      ></div>
      
      {/* Village Info Overlay */}
      {villageData && !isLoadingVillage && (
        <div className="absolute bottom-2 left-2 right-2 lg:right-auto lg:w-72 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-lg p-3 shadow-lg z-10">
          <h3 className="text-lg font-semibold mb-1 text-primary flex items-center gap-1">
            <Home className="w-4 h-4" /> {villageData.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{villageData.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" /> Population
              </p>
              <p className="font-medium">{villageData.population.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Gauge className="w-3 h-3 text-orange-500" /> Development
              </p>
              <p className="font-medium">{villageData.development}%</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <TreePine className="w-3 h-3 text-green-600" /> Green Cover
              </p>
              <p className="font-medium">{villageData.greenCover}%</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500" /> Water Bodies
              </p>
              <p className="font-medium">{villageData.waterBodies}%</p>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-muted flex gap-2">
            <button 
              className="flex-1 text-xs py-1 px-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1"
            >
              <Gauge className="w-3 h-3" /> Develop
            </button>
            <button 
              className="flex-1 text-xs py-1 px-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center justify-center gap-1"
            >
              <TreePine className="w-3 h-3" /> View Sectors
            </button>
          </div>
        </div>
      )}
    </div>
  );
}