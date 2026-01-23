import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cn } from '@/lib/utils';
import { builder3DComponents, Builder3DComponent, searchComponents, getCategories } from '@/data/builder3DComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransformToolbar, TransformMode, useTransformControls } from './TransformGizmo';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Trash2, 
  RotateCcw,
  Grid3X3,
  Move,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export interface PlacedObject {
  id: string;
  componentId: string;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  properties: Record<string, any>;
}

interface Builder3DCanvasProps {
  className?: string;
  onObjectSelect?: (object: PlacedObject | null) => void;
  onObjectsChange?: (objects: PlacedObject[]) => void;
}

const GRID_SIZE = 0.5; // Snap-to-grid size

export function Builder3DCanvas({ 
  className, 
  onObjectSelect,
  onObjectsChange 
}: Builder3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['physics', 'containers']));
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<Builder3DComponent | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  
  // Get selected object mesh
  const selectedObject = placedObjects.find(o => o.id === selectedObjectId);
  
  // Use transform controls hook
  useTransformControls(
    sceneRef.current,
    cameraRef.current,
    rendererRef.current,
    selectedObject?.mesh || null,
    transformMode,
    (obj, mode) => {
      // Update placed object when transformed
      setPlacedObjects(prev => prev.map(o => {
        if (o.mesh === obj) {
          return {
            ...o,
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone()
          };
        }
        return o;
      }));
    }
  );

  // Create geometry based on component config
  const createGeometry = useCallback((config: Builder3DComponent['primitiveConfig']) => {
    if (!config) return new THREE.BoxGeometry(1, 1, 1);
    
    switch (config.geometry) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.5, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      case 'cone':
        return new THREE.ConeGeometry(0.5, 1, 32);
      case 'torus':
        return new THREE.TorusGeometry(0.5, 0.15, 16, 100);
      case 'plane':
        return new THREE.PlaneGeometry(1, 1);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, []);

  // Create mesh from component definition
  const createMeshFromComponent = useCallback((component: Builder3DComponent): THREE.Object3D => {
    const group = new THREE.Group();
    
    if (component.modelType === 'primitive' && component.primitiveConfig) {
      const geometry = createGeometry(component.primitiveConfig);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(component.primitiveConfig.color),
        transparent: component.category === 'containers',
        opacity: component.category === 'containers' ? 0.6 : 1,
        roughness: 0.4,
        metalness: 0.2,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(
        component.primitiveConfig.scale[0],
        component.primitiveConfig.scale[1],
        component.primitiveConfig.scale[2]
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    
    group.userData = { componentId: component.id, componentName: component.name };
    return group;
  }, [createGeometry]);

  // Snap position to grid
  const snapToGrid = (position: THREE.Vector3): THREE.Vector3 => {
    return new THREE.Vector3(
      Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      Math.max(0, Math.round(position.y / GRID_SIZE) * GRID_SIZE),
      Math.round(position.z / GRID_SIZE) * GRID_SIZE
    );
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4aa, 0.5, 20);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 40, 0x444466, 0x333344);
    gridHelper.name = 'grid';
    scene.add(gridHelper);

    // Ground plane (invisible, for raycasting)
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.5 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Toggle grid visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    const grid = sceneRef.current.getObjectByName('grid');
    if (grid) {
      grid.visible = showGrid;
    }
  }, [showGrid]);

  // Handle drag start from sidebar
  const handleDragStart = (e: React.DragEvent, component: Builder3DComponent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    setDraggedComponent(component);
  };

  // Handle drag over canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!sceneRef.current || !cameraRef.current || !canvasRef.current) return;

    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/json')) as Builder3DComponent;
      
      // Calculate drop position using raycasting
      const rect = canvasRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Find intersection with ground plane
      const ground = sceneRef.current.getObjectByName('ground');
      if (!ground) return;

      const intersects = raycaster.intersectObject(ground);
      if (intersects.length === 0) return;

      const intersectionPoint = intersects[0].point;
      const snappedPosition = snapToGrid(intersectionPoint);
      
      // Account for object height
      if (componentData.primitiveConfig) {
        snappedPosition.y = componentData.primitiveConfig.scale[1] / 2;
      }

      // Create the 3D object
      const mesh = createMeshFromComponent(componentData);
      mesh.position.copy(snappedPosition);
      sceneRef.current.add(mesh);

      // Create placed object record
      const placedObject: PlacedObject = {
        id: `obj_${Date.now()}`,
        componentId: componentData.id,
        mesh,
        position: snappedPosition.clone(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1),
        properties: Object.fromEntries(
          Object.entries(componentData.properties).map(([key, prop]) => [key, prop.default])
        ),
      };

      setPlacedObjects(prev => {
        const updated = [...prev, placedObject];
        onObjectsChange?.(updated);
        return updated;
      });

    } catch (error) {
      console.error('Drop error:', error);
    }

    setDraggedComponent(null);
  };

  // Handle canvas click for object selection
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!sceneRef.current || !cameraRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Get all placed object meshes
    const meshes = placedObjects.map(obj => obj.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      // Find the parent object
      let selectedMesh = intersects[0].object;
      while (selectedMesh.parent && !selectedMesh.userData.componentId) {
        selectedMesh = selectedMesh.parent as THREE.Object3D;
      }

      const selectedObj = placedObjects.find(obj => obj.mesh === selectedMesh || obj.mesh.children.includes(selectedMesh as THREE.Object3D));
      if (selectedObj) {
        setSelectedObjectId(selectedObj.id);
        onObjectSelect?.(selectedObj);
      }
    } else {
      setSelectedObjectId(null);
      onObjectSelect?.(null);
    }
  };

  // Delete selected object
  const handleDeleteSelected = () => {
    if (!selectedObjectId || !sceneRef.current) return;

    const obj = placedObjects.find(o => o.id === selectedObjectId);
    if (obj) {
      sceneRef.current.remove(obj.mesh);
      setPlacedObjects(prev => {
        const updated = prev.filter(o => o.id !== selectedObjectId);
        onObjectsChange?.(updated);
        return updated;
      });
      setSelectedObjectId(null);
      onObjectSelect?.(null);
    }
  };

  // Reset camera
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(8, 8, 8);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  // Clear all objects
  const handleClearAll = () => {
    if (!sceneRef.current) return;
    placedObjects.forEach(obj => sceneRef.current!.remove(obj.mesh));
    setPlacedObjects([]);
    setSelectedObjectId(null);
    onObjectsChange?.([]);
  };

  // Get filtered components
  const filteredComponents = searchQuery 
    ? searchComponents(searchQuery)
    : builder3DComponents;

  // Group components by category
  const groupedComponents = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, Builder3DComponent[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* Collapsible Sidebar */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 z-10 bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground mb-2">Component Library</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Component List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {Object.entries(groupedComponents).map(([category, components]) => (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors capitalize"
                >
                  {category}
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    expandedCategories.has(category) && "rotate-90"
                  )} />
                </button>
                
                {expandedCategories.has(category) && (
                  <div className="mt-1 space-y-1">
                    {components.map(component => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        className="flex items-center gap-2 px-2 py-2 mx-1 rounded-md bg-muted/30 hover:bg-muted cursor-grab active:cursor-grabbing transition-colors border border-transparent hover:border-primary/30"
                      >
                        <span className="text-lg">{component.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{component.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{component.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "absolute z-20 top-4 bg-card border border-border rounded-r-lg p-2 hover:bg-muted transition-all",
          sidebarOpen ? "left-64" : "left-0"
        )}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 relative transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full h-full"
        />

        {/* Transform Toolbar */}
        {selectedObjectId && (
          <TransformToolbar
            mode={transformMode}
            onModeChange={setTransformMode}
            className="absolute top-4 left-1/2 -translate-x-1/2"
          />
        )}

        {/* Canvas Toolbar */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <Grid3X3 className={cn("w-4 h-4", showGrid && "text-primary")} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleResetCamera}
            title="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleDeleteSelected}
            disabled={!selectedObjectId}
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Object Count */}
        <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-muted-foreground">
          {placedObjects.length} object{placedObjects.length !== 1 ? 's' : ''} placed
        </div>

        {/* Controls Guide */}
        <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>Drag to rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className="w-3 h-3" />
            <span>Scroll to zoom</span>
          </div>
        </div>

        {/* Drop Zone Indicator */}
        {draggedComponent && (
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center">
            <div className="bg-card px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm font-medium">Drop {draggedComponent.name} here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Builder3DCanvas;
