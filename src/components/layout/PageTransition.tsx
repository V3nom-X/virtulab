import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FlipFadeText } from "@/components/ui/FlipFadeText";

const LOADING_DURATION = 4000; // 4 seconds

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [currentKey, setCurrentKey] = useState(location.key);

  useEffect(() => {
    // Skip loading on initial mount
    if (currentKey === location.key) return;

    setShowContent(false);
    setIsLoading(true);
    setCurrentKey(location.key);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, [location.key, currentKey]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            <FlipFadeText
              words={["LOADING", "PREPARING", "BUILDING", "RENDERING", "READY"]}
              interval={800}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showContent && (
        <motion.div
          key={currentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
