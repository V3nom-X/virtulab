import { useState, useRef, useEffect } from "react";
import { Element, getCategoryColor, getPhaseIcon } from "@/data/elements";

interface DraggableElementProps {
  element: Element;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onRemove?: () => void;
  onCollision?: (otherElement: Element) => void;
  velocity?: { x: number; y: number };
  containerRef?: React.RefObject<HTMLDivElement>;
}

export function DraggableElement({
  element,
  position,
  onPositionChange,
  onRemove,
  velocity = { x: 0, y: 0 },
  containerRef
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentVelocity, setCurrentVelocity] = useState(velocity);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Apply physics simulation
  useEffect(() => {
    if (isDragging) return;
    
    const friction = 0.98;
    const gravity = 0.1;
    const minVelocity = 0.01;

    const animate = () => {
      setCurrentVelocity(prev => {
        const newVx = prev.x * friction;
        const newVy = (prev.y + gravity) * friction;

        if (Math.abs(newVx) < minVelocity && Math.abs(newVy) < minVelocity) {
          return { x: 0, y: 0 };
        }

        // Update position
        const container = containerRef?.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const elementRect = elementRef.current?.getBoundingClientRect();
          const elementSize = elementRect?.width || 60;

          let newX = position.x + newVx;
          let newY = position.y + newVy;
          let bounceVx = newVx;
          let bounceVy = newVy;

          // Bounce off walls
          if (newX < 0) {
            newX = 0;
            bounceVx = -newVx * 0.6;
          } else if (newX > rect.width - elementSize) {
            newX = rect.width - elementSize;
            bounceVx = -newVx * 0.6;
          }

          if (newY < 0) {
            newY = 0;
            bounceVy = -newVy * 0.6;
          } else if (newY > rect.height - elementSize) {
            newY = rect.height - elementSize;
            bounceVy = -newVy * 0.6;
          }

          onPositionChange({ x: newX, y: newY });
          return { x: bounceVx, y: bounceVy };
        }

        return { x: newVx, y: newVy };
      });
    };

    const intervalId = setInterval(animate, 16);
    return () => clearInterval(intervalId);
  }, [isDragging, position, onPositionChange, containerRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setCurrentVelocity({ x: 0, y: 0 });
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef?.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.current.x;
    const newY = e.clientY - containerRect.top - dragOffset.current.y;
    
    onPositionChange({ x: newX, y: newY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      // Add throw velocity based on mouse movement
      setCurrentVelocity({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const size = Math.max(50, 30 + Math.log(element.atomicMass) * 5);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl z-50' : 'shadow-lg hover:shadow-xl'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        backgroundColor: getCategoryColor(element.category),
        borderRadius: '12px',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onRemove}
    >
      <div className="w-full h-full flex flex-col items-center justify-center text-white p-1">
        <span className="text-[8px] opacity-70">{element.atomicNumber}</span>
        <span className="text-base font-bold leading-tight">{element.symbol}</span>
        <span className="text-[7px] opacity-60 flex items-center gap-0.5">
          {getPhaseIcon(element.phaseAtRTP)}
        </span>
      </div>
    </div>
  );
}
