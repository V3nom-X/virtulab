import { useState, useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FlipFadeText } from "@/components/ui/FlipFadeText";
import { useReducedMotion } from "@/hooks/useAccessibility";

const LOADING_DURATION = 1200;

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const prevKeyRef = useRef(location.key);
  const routeChanged = prevKeyRef.current !== location.key;
  // Reduced motion: skip the loader entirely.
  const [isLoading, setIsLoading] = useState(reduced ? false : routeChanged);

  if (routeChanged && !isLoading && !reduced) {
    setIsLoading(true);
  }

  useEffect(() => {
    if (prevKeyRef.current === location.key && !isLoading) return;
    prevKeyRef.current = location.key;
    if (reduced) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), LOADING_DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, reduced]);

  return (
    <>
      <AnimatePresence>
        {isLoading && !reduced && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            <FlipFadeText
              words={["LOADING", "PREPARING", "BUILDING", "RENDERING", "READY"]}
              interval={300}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ visibility: isLoading && !reduced ? "hidden" : "visible" }}>
        {children}
      </div>
    </>
  );
}
