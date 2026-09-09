import { useEffect, useState } from 'react';
import { subscribeBuilderDrag, type BuilderDragState } from '@/lib/builderDrag';

/**
 * Floating preview that follows the pointer/finger while a palette component is
 * being dragged onto the canvas.
 */
export function BuilderDragGhost() {
  const [drag, setDrag] = useState<BuilderDragState>({ payload: null, x: 0, y: 0, moved: false });

  useEffect(() => subscribeBuilderDrag(setDrag), []);

  if (!drag.payload || !drag.moved) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[100] flex items-center gap-2 rounded-xl border border-primary bg-card/95 px-3 py-2 shadow-xl backdrop-blur"
      style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -50%) scale(1.04)' }}
    >
      <span className="text-lg">{drag.payload.icon}</span>
      <span className="text-sm font-medium">{drag.payload.name}</span>
    </div>
  );
}
