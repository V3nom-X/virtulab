import { useRef, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { CanvasComponent } from './DragDropCanvas';
import { Variable } from './VariableControls';
import { Connection } from './BuilderPreview';

interface Builder3DPreviewProps {
  components: CanvasComponent[];
  variables: Variable[];
  connections: Connection[];
  isRunning: boolean;
  onDataPoint?: (data: { time: number; [key: string]: number }) => void;
  className?: string;
}

// CPK colors for atoms
const atomColors: Record<string, number> = {
  H: 0xffffff, C: 0x333333, N: 0x3050f8, O: 0xff0000,
  S: 0xffff30, P: 0xff8000, Cl: 0x00ff00, Na: 0xab82ff,
};

export function Builder3DPreview({
  components,
  variables,
  connections,
  isRunning,
  onDataPoint,
  className = ''
}: Builder3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number>(0);
  const objectsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const velocitiesRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const startTimeRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Get variable value by name
  const getVarValue = useCallback((name: string): number => {
    const v = variables.find(v => v.name.toLowerCase() === name.toLowerCase() || v.id === name);
    return v?.value ?? 0;
  }, [variables]);

  // Create 3D objects from components
  const createObject3D = useCallback((comp: CanvasComponent): THREE.Object3D => {
    const group = new THREE.Group();
    const props = comp.properties;

    switch (comp.type) {
      case 'projectile': {
        // Sphere for projectile/particle
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x22d3ee,
          shininess: 80,
          specular: 0x444444
        });
        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);
        
        // Arrow for velocity vector
        const velocity = props.velocity || 5;
        const angle = (props.angle || 45) * Math.PI / 180;
        const dir = new THREE.Vector3(
          Math.cos(angle) * velocity,
          Math.sin(angle) * velocity,
          0
        ).normalize();
        const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), velocity / 5, 0xff6b6b, 0.1, 0.05);
        group.add(arrow);
        break;
      }
      case 'pendulum': {
        // Bob (sphere)
        const mass = props.mass || 1;
        const bobGeometry = new THREE.SphereGeometry(0.2 + mass * 0.1, 32, 32);
        const bobMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xa855f7,
          shininess: 100
        });
        const bob = new THREE.Mesh(bobGeometry, bobMaterial);
        
        // String (cylinder)
        const length = props.length || 2;
        const stringGeometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
        const stringMaterial = new THREE.MeshPhongMaterial({ color: 0x94a3b8 });
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.y = length / 2;
        
        bob.position.y = -length;
        group.add(string);
        group.add(bob);
        
        // Initial angle
        const angle = (props.angle || 45) * Math.PI / 180;
        group.rotation.z = angle;
        break;
      }
      case 'collision': {
        // Two spheres for collision
        const mass1 = props.mass || 1;
        const geometry1 = new THREE.SphereGeometry(0.2 + mass1 * 0.1, 32, 32);
        const material1 = new THREE.MeshPhongMaterial({ color: 0x22c55e, shininess: 80 });
        const sphere1 = new THREE.Mesh(geometry1, material1);
        sphere1.position.x = -1;
        group.add(sphere1);
        
        const mass2 = props.mass2 || 1;
        const geometry2 = new THREE.SphereGeometry(0.2 + mass2 * 0.1, 32, 32);
        const material2 = new THREE.MeshPhongMaterial({ color: 0xf97316, shininess: 80 });
        const sphere2 = new THREE.Mesh(geometry2, material2);
        sphere2.position.x = 1;
        group.add(sphere2);
        break;
      }
      case 'spring': {
        // Spring visualization
        const coils = 8;
        const springRadius = 0.15;
        const springHeight = 2;
        const points: THREE.Vector3[] = [];
        
        for (let i = 0; i <= coils * 32; i++) {
          const t = i / (coils * 32);
          points.push(new THREE.Vector3(
            Math.cos(i * 0.2) * springRadius,
            t * springHeight - springHeight / 2,
            Math.sin(i * 0.2) * springRadius
          ));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 200, 0.02, 8, false);
        const tubeMaterial = new THREE.MeshPhongMaterial({ color: 0x22c55e, shininess: 80 });
        const spring = new THREE.Mesh(tubeGeometry, tubeMaterial);
        group.add(spring);
        
        // Mass at bottom
        const massGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const massMaterial = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
        const massBox = new THREE.Mesh(massGeometry, massMaterial);
        massBox.position.y = -springHeight / 2 - 0.2;
        massBox.name = 'mass';
        group.add(massBox);
        break;
      }
      case 'ramp': {
        // Inclined plane
        const angle = (props.angle || 30) * Math.PI / 180;
        const geometry = new THREE.BoxGeometry(3, 0.1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x64748b, shininess: 20 });
        const ramp = new THREE.Mesh(geometry, material);
        ramp.rotation.z = -angle;
        group.add(ramp);
        break;
      }
      case 'beaker':
      case 'flask': {
        // Beaker/flask visualization
        const geometry = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 32, 1, true);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x88ccff, 
          transparent: true, 
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        const beaker = new THREE.Mesh(geometry, material);
        group.add(beaker);
        
        // Liquid inside
        const liquidGeometry = new THREE.CylinderGeometry(0.28, 0.23, 0.4, 32);
        const liquidMaterial = new THREE.MeshPhongMaterial({ 
          color: props.color || 0x00aaff, 
          transparent: true, 
          opacity: 0.7 
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.y = -0.2;
        group.add(liquid);
        break;
      }
      default: {
        // Generic component as box
        const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const material = new THREE.MeshPhongMaterial({ color: 0x475569, shininess: 30 });
        const box = new THREE.Mesh(geometry, material);
        group.add(box);
      }
    }

    return group;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1b26);
    scene.fog = new THREE.Fog(0x1a1b26, 10, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x22d3ee, 0.5, 20);
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b,
      side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create 3D objects from components
    components.forEach((comp, index) => {
      const object = createObject3D(comp);
      // Position based on canvas position, normalized
      object.position.x = (comp.x - 400) / 100;
      object.position.z = (comp.y - 300) / 100;
      object.userData.componentId = comp.id;
      object.userData.type = comp.type;
      object.userData.properties = comp.properties;
      scene.add(object);
      objectsRef.current.set(comp.id, object);
      
      // Initialize velocities
      if (comp.type === 'projectile') {
        const velocity = comp.properties.velocity || 5;
        const angle = (comp.properties.angle || 45) * Math.PI / 180;
        velocitiesRef.current.set(comp.id, new THREE.Vector3(
          Math.cos(angle) * velocity * 0.1,
          Math.sin(angle) * velocity * 0.1,
          0
        ));
      }
    });

    // Draw connections as lines
    connections.forEach(conn => {
      const fromObj = objectsRef.current.get(conn.fromId);
      const toObj = objectsRef.current.get(conn.toId);
      if (fromObj && toObj) {
        const points = [fromObj.position, toObj.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x22d3ee });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    });

    // Handle resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Simple mouse controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      camera.position.x -= dx * 0.01;
      camera.position.y += dy * 0.01;
      camera.lookAt(0, 0, 0);
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(3, Math.min(20, camera.position.z + e.deltaY * 0.01));
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      objectsRef.current.clear();
      velocitiesRef.current.clear();
    };
  }, [components, connections, createObject3D]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const clock = clockRef.current;
    const gravity = getVarValue('gravity') || 9.8;

    startTimeRef.current = Date.now();
    clock.start();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (isRunning) {
        // Update physics for each object
        objectsRef.current.forEach((object, id) => {
          const type = object.userData.type;
          const props = object.userData.properties || {};

          switch (type) {
            case 'pendulum': {
              // Simple pendulum motion
              const length = props.length || 2;
              const damping = props.damping || 0.01;
              const omega = Math.sqrt(gravity / length);
              const initialAngle = (props.angle || 45) * Math.PI / 180;
              const angle = initialAngle * Math.cos(omega * elapsed) * Math.exp(-damping * elapsed);
              object.rotation.z = angle;
              break;
            }
            case 'projectile': {
              let velocity = velocitiesRef.current.get(id);
              if (!velocity) {
                // Initialize velocity if not set
                const props = object.userData.properties || {};
                const vel = props.velocity || 5;
                const angle = (props.angle || 45) * Math.PI / 180;
                velocity = new THREE.Vector3(
                  Math.cos(angle) * vel * 0.1,
                  Math.sin(angle) * vel * 0.1,
                  0
                );
                velocitiesRef.current.set(id, velocity);
              }
              
              // Apply gravity
              velocity.y -= gravity * delta * 0.01;
              
              // Update position
              object.position.x += velocity.x * delta;
              object.position.y += velocity.y * delta;
              
              // Ground collision
              if (object.position.y < -1.8) {
                object.position.y = -1.8;
                velocity.y = -velocity.y * 0.6; // Bounce with energy loss
              }
              break;
            }
            case 'spring': {
              // Simple harmonic motion
              const k = props.k || 50;
              const mass = props.mass || 1;
              const omega = Math.sqrt(k / mass);
              const amplitude = props.displacement || 0.5;
              const damping = props.damping || 0.05;
              const y = amplitude * Math.cos(omega * elapsed) * Math.exp(-damping * elapsed);
              
              const massBox = object.getObjectByName('mass');
              if (massBox) {
                massBox.position.y = -1 + y;
              }
              break;
            }
            case 'collision': {
              // Simple oscillation between objects
              const children = object.children;
              if (children.length >= 2) {
                children[0].position.x = -1 + Math.sin(elapsed * 2) * 0.5;
                children[1].position.x = 1 - Math.sin(elapsed * 2) * 0.5;
              }
              break;
            }
          }
        });

        // Report data
        if (onDataPoint && objectsRef.current.size > 0) {
          const dataPoint: { time: number; [key: string]: number } = { 
            time: Number(elapsed.toFixed(2)) 
          };
          
          objectsRef.current.forEach((object, id) => {
            if (object && object.position) {
              dataPoint.x = Number(object.position.x.toFixed(2));
              dataPoint.y = Number(object.position.y.toFixed(2));
              const velocity = velocitiesRef.current.get(id);
              if (velocity) {
                dataPoint.velocity = Number(velocity.length().toFixed(2));
              }
            }
          });
          
          onDataPoint(dataPoint);
        }
      }

      // Auto-rotate camera slightly when not running
      if (!isRunning) {
        camera.position.x = Math.sin(elapsed * 0.2) * 0.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      clock.stop();
    };
  }, [isRunning, getVarValue, onDataPoint]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full cursor-grab active:cursor-grabbing ${className}`}
    />
  );
}
