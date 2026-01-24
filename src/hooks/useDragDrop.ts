import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  draggedItem: any | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  longPressTriggered: boolean;
}

interface UseDragDropOptions {
  longPressDelay?: number;
  onDragStart?: (item: any, e: MouseEvent | TouchEvent) => void;
  onDrag?: (item: any, position: { x: number; y: number }) => void;
  onDragEnd?: (item: any, position: { x: number; y: number }) => void;
  onDrop?: (item: any, dropTarget: Element | null, position: { x: number; y: number }) => void;
}

export function useDragDrop(options: UseDragDropOptions = {}) {
  const { longPressDelay = 300, onDragStart, onDrag, onDragEnd, onDrop } = options;
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    longPressTriggered: false,
  });
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Clear long press timer
  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Handle pointer down (mouse or touch)
  const handlePointerDown = useCallback((item: any, e: MouseEvent | TouchEvent) => {
    const point = 'touches' in e ? e.touches[0] : e;
    const pos = { x: point.clientX, y: point.clientY };
    
    dragStartPos.current = pos;
    
    // Set up long press for touch
    if ('touches' in e) {
      longPressTimer.current = setTimeout(() => {
        setDragState({
          isDragging: true,
          draggedItem: item,
          startPosition: pos,
          currentPosition: pos,
          longPressTriggered: true,
        });
        onDragStart?.(item, e);
        
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, longPressDelay);
    } else {
      // Immediate drag for mouse
      setDragState({
        isDragging: true,
        draggedItem: item,
        startPosition: pos,
        currentPosition: pos,
        longPressTriggered: false,
      });
      onDragStart?.(item, e);
    }
  }, [longPressDelay, onDragStart]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging) {
      // Check if we've moved too far before long press triggered
      if (longPressTimer.current) {
        const point = 'touches' in e ? e.touches[0] : e;
        const dx = point.clientX - dragStartPos.current.x;
        const dy = point.clientY - dragStartPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          clearLongPress();
        }
      }
      return;
    }
    
    const point = 'touches' in e ? e.touches[0] : e;
    const pos = { x: point.clientX, y: point.clientY };
    
    setDragState(prev => ({
      ...prev,
      currentPosition: pos,
    }));
    
    onDrag?.(dragState.draggedItem, pos);
  }, [dragState.isDragging, dragState.draggedItem, clearLongPress, onDrag]);

  // Handle pointer up
  const handlePointerUp = useCallback((e: MouseEvent | TouchEvent) => {
    clearLongPress();
    
    if (!dragState.isDragging) return;
    
    const point = 'changedTouches' in e ? e.changedTouches[0] : e;
    const pos = { x: point.clientX, y: point.clientY };
    
    // Find drop target
    const dropTarget = document.elementFromPoint(pos.x, pos.y);
    
    onDragEnd?.(dragState.draggedItem, pos);
    onDrop?.(dragState.draggedItem, dropTarget, pos);
    
    setDragState({
      isDragging: false,
      draggedItem: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      longPressTriggered: false,
    });
  }, [dragState, clearLongPress, onDragEnd, onDrop]);

  // Attach global event listeners when dragging
  useEffect(() => {
    if (dragState.isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        handlePointerMove(e);
      };
      
      const handleUp = (e: MouseEvent | TouchEvent) => {
        handlePointerUp(e);
      };
      
      window.addEventListener('mousemove', handleMove as any);
      window.addEventListener('mouseup', handleUp as any);
      window.addEventListener('touchmove', handleMove as any, { passive: false });
      window.addEventListener('touchend', handleUp as any);
      window.addEventListener('touchcancel', handleUp as any);
      
      return () => {
        window.removeEventListener('mousemove', handleMove as any);
        window.removeEventListener('mouseup', handleUp as any);
        window.removeEventListener('touchmove', handleMove as any);
        window.removeEventListener('touchend', handleUp as any);
        window.removeEventListener('touchcancel', handleUp as any);
      };
    }
  }, [dragState.isDragging, handlePointerMove, handlePointerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearLongPress();
  }, [clearLongPress]);

  // Create drag handlers for an item
  const createDragHandlers = useCallback((item: any) => ({
    onMouseDown: (e: React.MouseEvent) => handlePointerDown(item, e.nativeEvent),
    onTouchStart: (e: React.TouchEvent) => handlePointerDown(item, e.nativeEvent),
  }), [handlePointerDown]);

  return {
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedItem,
    currentPosition: dragState.currentPosition,
    createDragHandlers,
    cancelDrag: () => {
      clearLongPress();
      setDragState({
        isDragging: false,
        draggedItem: null,
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        longPressTriggered: false,
      });
    },
  };
}
