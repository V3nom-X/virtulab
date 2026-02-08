import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomLoader } from "@/components/ui/CustomLoader";

interface SimulationLoaderProps {
  children: ReactNode;
  simulationName?: string;
}

export function SimulationLoader({ children, simulationName = "Simulation" }: SimulationLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, [simulationName]);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="sim-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm rounded-xl"
          >
            <CustomLoader size="md" />
            <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
              Loading {simulationName}...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
