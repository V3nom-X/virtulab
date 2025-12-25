import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoRedoOptions {
  maxHistory?: number;
}

export function useUndoRedo<T>(initialState: T, options: UseUndoRedoOptions = {}) {
  const { maxHistory = 50 } = options;
  
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if we're in the middle of a batch update
  const batchRef = useRef(false);
  const batchStartState = useRef<T | null>(null);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newState: T | ((prev: T) => T), recordHistory = true) => {
    setHistory(prev => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev.present) 
        : newState;

      // If in batch mode, don't record to history yet
      if (batchRef.current) {
        return { ...prev, present: nextState };
      }

      if (!recordHistory) {
        return { ...prev, present: nextState };
      }

      // Add current state to past, limit history size
      const newPast = [...prev.past, prev.present].slice(-maxHistory);
      
      return {
        past: newPast,
        present: nextState,
        future: [], // Clear future on new changes
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  // Start a batch update (multiple changes counted as one undo step)
  const startBatch = useCallback(() => {
    batchRef.current = true;
    batchStartState.current = history.present;
  }, [history.present]);

  // End batch and record the combined change
  const endBatch = useCallback(() => {
    if (batchRef.current && batchStartState.current !== null) {
      setHistory(prev => ({
        past: [...prev.past, batchStartState.current as T].slice(-maxHistory),
        present: prev.present,
        future: [],
      }));
    }
    batchRef.current = false;
    batchStartState.current = null;
  }, [maxHistory]);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    startBatch,
    endBatch,
    historyLength: history.past.length,
  };
}

// Simpler hook for component arrays specifically
export function useComponentHistory<T>(initialComponents: T[]) {
  const undoRedo = useUndoRedo<T[]>(initialComponents);
  
  const addComponent = useCallback((component: T) => {
    undoRedo.set(prev => [...prev, component]);
  }, [undoRedo]);

  const removeComponent = useCallback((predicate: (item: T) => boolean) => {
    undoRedo.set(prev => prev.filter(item => !predicate(item)));
  }, [undoRedo]);

  const updateComponent = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
    undoRedo.set(prev => prev.map(item => predicate(item) ? updater(item) : item));
  }, [undoRedo]);

  return {
    components: undoRedo.state,
    setComponents: undoRedo.set,
    addComponent,
    removeComponent,
    updateComponent,
    undo: undoRedo.undo,
    redo: undoRedo.redo,
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    reset: undoRedo.reset,
  };
}
