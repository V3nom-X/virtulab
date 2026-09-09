/**
 * Pointer-based drag-and-drop bus for the experiment builder.
 *
 * HTML5 drag events do not fire on touch screens, so palette items start a
 * pointer drag through this small store instead: it tracks the dragged payload
 * and the live pointer position, renders-ready state for a floating ghost, and
 * notifies drop targets when the pointer is released.
 */

export interface BuilderDragPayload {
  id: string;
  name: string;
  icon: string;
  defaultProps?: Record<string, unknown>;
}

export interface BuilderDragState {
  payload: BuilderDragPayload | null;
  x: number;
  y: number;
  /** True once the pointer has moved far enough to count as a real drag. */
  moved: boolean;
}

type DropHandler = (payload: BuilderDragPayload, x: number, y: number) => void;

const DRAG_THRESHOLD = 6;

let state: BuilderDragState = { payload: null, x: 0, y: 0, moved: false };
const stateListeners = new Set<(s: BuilderDragState) => void>();
const dropHandlers = new Set<DropHandler>();
let origin = { x: 0, y: 0 };
let detach: (() => void) | null = null;

function emit() {
  stateListeners.forEach((listener) => listener(state));
}

function finish(dropped: boolean) {
  const { payload, x, y, moved } = state;
  detach?.();
  detach = null;
  state = { payload: null, x: 0, y: 0, moved: false };
  emit();
  if (dropped && payload && moved) {
    dropHandlers.forEach((handler) => handler(payload, x, y));
  }
}

/** Begin dragging a palette component from a pointer or touch position. */
export function startBuilderDrag(payload: BuilderDragPayload, x: number, y: number) {
  if (detach) detach();
  origin = { x, y };
  state = { payload, x, y, moved: false };
  emit();

  const onMove = (event: PointerEvent) => {
    const moved =
      state.moved ||
      Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > DRAG_THRESHOLD;
    state = { ...state, x: event.clientX, y: event.clientY, moved };
    emit();
    if (moved) event.preventDefault();
  };
  const onUp = () => finish(true);
  const onCancel = () => finish(false);
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') finish(false);
  };

  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
  window.addEventListener('keydown', onKey);
  document.body.style.userSelect = 'none';
  document.body.style.touchAction = 'none';

  detach = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    window.removeEventListener('keydown', onKey);
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  };
}

export function cancelBuilderDrag() {
  if (state.payload) finish(false);
}

export function subscribeBuilderDrag(listener: (s: BuilderDragState) => void) {
  stateListeners.add(listener);
  listener(state);
  return () => stateListeners.delete(listener);
}

/** Register a drop target. Handlers receive viewport coordinates. */
export function registerBuilderDropTarget(handler: DropHandler) {
  dropHandlers.add(handler);
  return () => dropHandlers.delete(handler);
}

export function getBuilderDragState() {
  return state;
}
