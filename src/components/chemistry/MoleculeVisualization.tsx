import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Atom {
  symbol: string;
  position: [number, number, number];
  color: string;
  radius: number;
}

interface Bond {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

interface MoleculeData {
  atoms: Atom[];
  bonds: Bond[];
}

interface MoleculeVisualizationProps {
  molecule: string;
  className?: string;
}

const moleculeData: Record<string, MoleculeData> = {
  H2O: {
    atoms: [
      { symbol: 'O', position: [0, 0, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'H', position: [-0.8, 0.6, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [0.8, 0.6, 0], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
    ],
  },
  CO2: {
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'O', position: [-1.2, 0, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [1.2, 0, 0], color: '#ff0000', radius: 0.6 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
    ],
  },
  NaCl: {
    atoms: [
      { symbol: 'Na', position: [-0.6, 0, 0], color: '#ab82ff', radius: 0.9 },
      { symbol: 'Cl', position: [0.6, 0, 0], color: '#00ff00', radius: 0.8 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
    ],
  },
  NH3: {
    atoms: [
      { symbol: 'N', position: [0, 0, 0], color: '#3050f8', radius: 0.55 },
      { symbol: 'H', position: [0, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.8, -0.45, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [0.8, -0.45, 0.4], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
    ],
  },
  CH4: {
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'H', position: [0.6, 0.6, 0.6], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.6, -0.6, 0.6], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [0.6, -0.6, -0.6], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.6, 0.6, -0.6], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
    ],
  },
  H2: {
    atoms: [
      { symbol: 'H', position: [-0.4, 0, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [0.4, 0, 0], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
    ],
  },
  O2: {
    atoms: [
      { symbol: 'O', position: [-0.6, 0, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [0.6, 0, 0], color: '#ff0000', radius: 0.6 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
    ],
  },
  N2: {
    atoms: [
      { symbol: 'N', position: [-0.55, 0, 0], color: '#3050f8', radius: 0.55 },
      { symbol: 'N', position: [0.55, 0, 0], color: '#3050f8', radius: 0.55 },
    ],
    bonds: [
      { from: 0, to: 1, order: 3 },
    ],
  },
  HCl: {
    atoms: [
      { symbol: 'H', position: [-0.65, 0, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'Cl', position: [0.65, 0, 0], color: '#00ff00', radius: 0.8 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
    ],
  },
  H2SO4: {
    atoms: [
      { symbol: 'S', position: [0, 0, 0], color: '#ffff30', radius: 0.65 },
      { symbol: 'O', position: [0, 1.2, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [0, -1.2, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [1, 0, 0.6], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [-1, 0, 0.6], color: '#ff0000', radius: 0.6 },
      { symbol: 'H', position: [1.6, 0, 1], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.6, 0, 1], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 3, to: 5, order: 1 },
      { from: 4, to: 6, order: 1 },
    ],
  },
  C2H6: {
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0.77, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'H', position: [-1.15, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, -0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0, -0.9], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.15, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.15, -0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.15, 0, -0.9], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
    ],
  },
  // Ethanol (C2H5OH)
  C2H5OH: {
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0.77, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'O', position: [1.5, 0, 1], color: '#ff0000', radius: 0.6 },
      { symbol: 'H', position: [2.2, 0, 1.5], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, -0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0, -0.9], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.15, 0.9, -0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.15, -0.9, -0.4], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 1, to: 8, order: 1 },
    ],
  },
  // Benzene (C6H6) - hexagonal ring
  C6H6: {
    atoms: [
      { symbol: 'C', position: [1.4, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: '#333333', radius: 0.5 },
      { symbol: 'H', position: [2.5, 0, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.25, 2.17, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.25, 2.17, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-2.5, 0, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.17, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.17, 0], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 2 },
      { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 },
    ],
  },
  // Glucose (C6H12O6) - simplified ring form
  C6H12O6: {
    atoms: [
      // Ring carbons
      { symbol: 'C', position: [1.2, 0.5, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0.6, 1.4, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [-0.6, 1.4, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [-1.2, 0.5, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [-0.6, -0.4, 0], color: '#333333', radius: 0.5 },
      { symbol: 'O', position: [0.6, -0.4, 0], color: '#ff0000', radius: 0.6 },
      // CH2OH group
      { symbol: 'C', position: [2.0, 0.5, 0.8], color: '#333333', radius: 0.5 },
      // OH groups
      { symbol: 'O', position: [1.0, 2.2, 0.5], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [-1.0, 2.2, -0.5], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [-2.0, 0.5, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [-0.6, -1.2, 0.5], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [2.8, 0.5, 0.2], color: '#ff0000', radius: 0.6 },
      // Hydrogens on OH groups
      { symbol: 'H', position: [1.5, 2.8, 0.5], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.5, 2.8, -0.5], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-2.5, 0.5, 0.5], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.6, -1.8, 1], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [3.4, 0.5, 0.7], color: '#ffffff', radius: 0.35 },
      // CH2 hydrogens
      { symbol: 'H', position: [2.0, 1.2, 1.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [2.0, -0.2, 1.4], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
      { from: 6, to: 11, order: 1 },
      { from: 7, to: 12, order: 1 },
      { from: 8, to: 13, order: 1 },
      { from: 9, to: 14, order: 1 },
      { from: 10, to: 15, order: 1 },
      { from: 11, to: 16, order: 1 },
      { from: 6, to: 17, order: 1 },
      { from: 6, to: 18, order: 1 },
    ],
  },
  // Acetic Acid (CH3COOH)
  CH3COOH: {
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0.77, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'O', position: [1.2, 1.1, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'O', position: [1.4, -1, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'H', position: [2.1, -1.3, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, -0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0, -0.9], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
    ],
  },
  // Methanol (CH3OH)
  CH3OH: {
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'O', position: [1.2, 0, 0], color: '#ff0000', radius: 0.6 },
      { symbol: 'H', position: [1.7, 0.7, 0], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.5, 0.9, 0.3], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.5, -0.9, 0.3], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-0.5, 0, -0.9], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
    ],
  },
  // Propane (C3H8)
  C3H8: {
    atoms: [
      { symbol: 'C', position: [-1.27, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [0, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'C', position: [1.27, 0, 0], color: '#333333', radius: 0.5 },
      { symbol: 'H', position: [-1.7, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.7, -0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [-1.7, 0, -0.9], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [0, 0.9, 0.5], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [0, -0.9, 0.5], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.7, 0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.7, -0.9, 0.4], color: '#ffffff', radius: 0.35 },
      { symbol: 'H', position: [1.7, 0, -0.9], color: '#ffffff', radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 2, to: 9, order: 1 },
      { from: 2, to: 10, order: 1 },
    ],
  },
};

export function MoleculeVisualization({ molecule, className = '' }: MoleculeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create molecule
    const data = moleculeData[molecule];
    if (data) {
      const moleculeGroup = new THREE.Group();

      // Create atoms
      data.atoms.forEach((atom) => {
        const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: atom.color,
          shininess: 100,
          specular: 0x444444,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(...atom.position);
        moleculeGroup.add(sphere);
      });

      // Create bonds
      data.bonds.forEach((bond) => {
        const from = new THREE.Vector3(...data.atoms[bond.from].position);
        const to = new THREE.Vector3(...data.atoms[bond.to].position);
        const direction = new THREE.Vector3().subVectors(to, from);
        const length = direction.length();

        const bondOffset = bond.order === 1 ? 0 : 0.1;
        
        for (let i = 0; i < bond.order; i++) {
          const offset = (i - (bond.order - 1) / 2) * bondOffset * 2;
          const geometry = new THREE.CylinderGeometry(0.08, 0.08, length, 16);
          const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
          const cylinder = new THREE.Mesh(geometry, material);

          cylinder.position.copy(from).add(to).multiplyScalar(0.5);
          cylinder.position.x += offset * (Math.abs(direction.y) > 0.1 ? 1 : 0);
          cylinder.position.y += offset * (Math.abs(direction.x) > 0.1 ? 1 : 0);
          cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
          );

          moleculeGroup.add(cylinder);
        }
      });

      scene.add(moleculeGroup);

      // Animation
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        moleculeGroup.rotation.y += 0.01;
        moleculeGroup.rotation.x += 0.003;
        renderer.render(scene, camera);
      };
      animate();
    }

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [molecule]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
}

export const availableMolecules = Object.keys(moleculeData);
