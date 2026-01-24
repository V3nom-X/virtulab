import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DragPreviewProps {
  isDragging: boolean;
  componentName?: string;
  position: { x: number; y: number };
}

export function DragPreview({ isDragging, componentName, position }: DragPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isDragging) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed z-[100] pointer-events-none transition-all duration-100",
        isDragging ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}
      style={{
        left: position.x - 40,
        top: position.y - 20,
      }}
    >
      <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary-foreground/50 animate-pulse" />
        {componentName || 'Component'}
      </div>
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary/90"
      />
    </div>
  );
}

// Hook for tracking drag position
export function useDragPreview() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [componentName, setComponentName] = useState<string | undefined>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDragPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        setDragPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  const startDrag = (name: string, x: number, y: number) => {
    setComponentName(name);
    setDragPosition({ x, y });
    setIsDragging(true);
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  return {
    isDragging,
    dragPosition,
    componentName,
    startDrag,
    endDrag,
    DragPreviewComponent: () => (
      <DragPreview
        isDragging={isDragging}
        componentName={componentName}
        position={dragPosition}
      />
    ),
  };
}
