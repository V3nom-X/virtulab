import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Move, RotateCcw, Maximize2 } from 'lucide-react';

export type TransformMode = 'translate' | 'rotate' | 'scale';

interface TransformGizmoProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  selectedObject: THREE.Object3D | null;
  mode: TransformMode;
  onTransformChange?: (object: THREE.Object3D, type: TransformMode) => void;
}

const AXIS_COLORS = {
  x: 0xff4444,
  y: 0x44ff44,
  z: 0x4444ff,
};

export function createTransformGizmo(mode: TransformMode): THREE.Group {
  const gizmo = new THREE.Group();
  gizmo.name = 'transformGizmo';
  
  const size = 1.5;
  
  if (mode === 'translate') {
    // Create arrows for translation
    ['x', 'y', 'z'].forEach((axis, i) => {
      const dir = new THREE.Vector3();
      dir.setComponent(i, 1);
      
      const color = AXIS_COLORS[axis as keyof typeof AXIS_COLORS];
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(), size, color, 0.2, 0.1);
      arrow.name = `translate_${axis}`;
      arrow.userData = { axis, mode: 'translate' };
      gizmo.add(arrow);
    });
    
    // Add planes for 2-axis movement
    const planeSize = 0.3;
    const planeMaterial = (color: number) => new THREE.MeshBasicMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide 
    });
    
    const xyPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), planeMaterial(0xffff00));
    xyPlane.position.set(planeSize / 2, planeSize / 2, 0);
    xyPlane.name = 'translate_xy';
    xyPlane.userData = { axis: 'xy', mode: 'translate' };
    gizmo.add(xyPlane);
    
    const xzPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), planeMaterial(0xff00ff));
    xzPlane.rotation.x = Math.PI / 2;
    xzPlane.position.set(planeSize / 2, 0, planeSize / 2);
    xzPlane.name = 'translate_xz';
    xzPlane.userData = { axis: 'xz', mode: 'translate' };
    gizmo.add(xzPlane);
    
    const yzPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), planeMaterial(0x00ffff));
    yzPlane.rotation.y = Math.PI / 2;
    yzPlane.position.set(0, planeSize / 2, planeSize / 2);
    yzPlane.name = 'translate_yz';
    yzPlane.userData = { axis: 'yz', mode: 'translate' };
    gizmo.add(yzPlane);
    
  } else if (mode === 'rotate') {
    // Create rotation rings
    const ringGeo = new THREE.TorusGeometry(size, 0.02, 8, 64);
    
    ['x', 'y', 'z'].forEach((axis, i) => {
      const color = AXIS_COLORS[axis as keyof typeof AXIS_COLORS];
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color }));
      ring.name = `rotate_${axis}`;
      ring.userData = { axis, mode: 'rotate' };
      
      if (axis === 'x') ring.rotation.y = Math.PI / 2;
      if (axis === 'z') ring.rotation.x = Math.PI / 2;
      
      gizmo.add(ring);
    });
    
  } else if (mode === 'scale') {
    // Create scale handles (boxes at ends of lines)
    ['x', 'y', 'z'].forEach((axis, i) => {
      const color = AXIS_COLORS[axis as keyof typeof AXIS_COLORS];
      
      // Line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3().setComponent(i, size)
      ]);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color }));
      gizmo.add(line);
      
      // Handle box
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.MeshBasicMaterial({ color })
      );
      box.position.setComponent(i, size);
      box.name = `scale_${axis}`;
      box.userData = { axis, mode: 'scale' };
      gizmo.add(box);
    });
    
    // Uniform scale center
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    centerSphere.name = 'scale_uniform';
    centerSphere.userData = { axis: 'uniform', mode: 'scale' };
    gizmo.add(centerSphere);
  }
  
  return gizmo;
}

export function useTransformControls(
  scene: THREE.Scene | null,
  camera: THREE.Camera | null,
  renderer: THREE.WebGLRenderer | null,
  selectedObject: THREE.Object3D | null,
  mode: TransformMode,
  onTransformChange?: (object: THREE.Object3D, type: TransformMode) => void
) {
  const gizmoRef = useRef<THREE.Group | null>(null);
  const draggingRef = useRef<{ axis: string; startPos: THREE.Vector3; startValue: THREE.Vector3 | THREE.Euler } | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Create/update gizmo when mode or selection changes
  useEffect(() => {
    if (!scene) return;

    // Remove existing gizmo
    if (gizmoRef.current) {
      scene.remove(gizmoRef.current);
      gizmoRef.current = null;
    }

    // Create new gizmo if object selected
    if (selectedObject) {
      const gizmo = createTransformGizmo(mode);
      gizmo.position.copy(selectedObject.position);
      scene.add(gizmo);
      gizmoRef.current = gizmo;
    }

    return () => {
      if (gizmoRef.current && scene) {
        scene.remove(gizmoRef.current);
      }
    };
  }, [scene, selectedObject, mode]);

  // Update gizmo position when object moves
  useEffect(() => {
    if (gizmoRef.current && selectedObject) {
      gizmoRef.current.position.copy(selectedObject.position);
    }
  }, [selectedObject?.position.x, selectedObject?.position.y, selectedObject?.position.z]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!renderer || !camera || !gizmoRef.current || !selectedObject) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(gizmoRef.current.children, true);

    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target && !target.userData.axis) {
        target = target.parent as THREE.Object3D;
      }

      if (target?.userData.axis) {
        draggingRef.current = {
          axis: target.userData.axis,
          startPos: intersects[0].point.clone(),
          startValue: mode === 'rotate' 
            ? selectedObject.rotation.clone() 
            : mode === 'scale'
            ? selectedObject.scale.clone()
            : selectedObject.position.clone()
        };
        event.stopPropagation();
      }
    }
  }, [renderer, camera, selectedObject, mode]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!draggingRef.current || !renderer || !camera || !selectedObject || !gizmoRef.current) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    
    const plane = new THREE.Plane();
    const { axis, startPos, startValue } = draggingRef.current;
    
    // Create appropriate plane based on axis
    if (axis === 'y' || axis === 'xy' || axis === 'yz') {
      plane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion),
        gizmoRef.current.position
      );
    } else {
      plane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0),
        gizmoRef.current.position
      );
    }
    
    const intersection = new THREE.Vector3();
    if (!raycaster.current.ray.intersectPlane(plane, intersection)) return;

    const delta = intersection.clone().sub(startPos);
    
    if (mode === 'translate') {
      const newPos = (startValue as THREE.Vector3).clone();
      if (axis.includes('x')) newPos.x += delta.x;
      if (axis.includes('y')) newPos.y += delta.y;
      if (axis.includes('z')) newPos.z += delta.z;
      
      // Snap to grid
      newPos.x = Math.round(newPos.x * 2) / 2;
      newPos.y = Math.max(0, Math.round(newPos.y * 2) / 2);
      newPos.z = Math.round(newPos.z * 2) / 2;
      
      selectedObject.position.copy(newPos);
      gizmoRef.current.position.copy(newPos);
      
    } else if (mode === 'rotate') {
      const angle = delta.length() * 2;
      const newRot = (startValue as THREE.Euler).clone();
      
      if (axis === 'x') newRot.x += angle * Math.sign(delta.y);
      if (axis === 'y') newRot.y += angle * Math.sign(delta.x);
      if (axis === 'z') newRot.z += angle * Math.sign(delta.x);
      
      selectedObject.rotation.copy(newRot);
      
    } else if (mode === 'scale') {
      const scaleFactor = 1 + delta.length() * Math.sign(delta.x + delta.y) * 0.5;
      const newScale = (startValue as THREE.Vector3).clone();
      
      if (axis === 'uniform') {
        newScale.multiplyScalar(scaleFactor);
      } else {
        if (axis === 'x') newScale.x *= scaleFactor;
        if (axis === 'y') newScale.y *= scaleFactor;
        if (axis === 'z') newScale.z *= scaleFactor;
      }
      
      // Clamp scale
      newScale.x = Math.max(0.1, Math.min(10, newScale.x));
      newScale.y = Math.max(0.1, Math.min(10, newScale.y));
      newScale.z = Math.max(0.1, Math.min(10, newScale.z));
      
      selectedObject.scale.copy(newScale);
    }

    onTransformChange?.(selectedObject, mode);
  }, [renderer, camera, selectedObject, mode, onTransformChange]);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  // Attach event listeners
  useEffect(() => {
    if (!renderer) return;

    const element = renderer.domElement;
    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [renderer, handleMouseDown, handleMouseMove, handleMouseUp]);

  return gizmoRef;
}

interface TransformToolbarProps {
  mode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  className?: string;
}

export function TransformToolbar({ mode, onModeChange, className }: TransformToolbarProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-lg p-1", className)}>
      <Button
        variant={mode === 'translate' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onModeChange('translate')}
        title="Move (G)"
      >
        <Move className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'rotate' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onModeChange('rotate')}
        title="Rotate (R)"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'scale' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => onModeChange('scale')}
        title="Scale (S)"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
