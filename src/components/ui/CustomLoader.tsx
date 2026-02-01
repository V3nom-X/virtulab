import { cn } from "@/lib/utils";

interface CustomLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CustomLoader({ className, size = "md" }: CustomLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-4 h-4"
  };

  return (
    <div className={cn("loader relative flex items-center justify-center", sizeClasses[size], className)}>
      <span className="absolute w-full h-full rounded-full border-4 border-transparent border-t-primary animate-[loader-spin_2s_linear_infinite]" />
      <div className={cn("dot absolute rounded-full bg-primary animate-[dot-1_2s_linear_infinite]", dotSizes[size])} style={{ animationDelay: "0s" }} />
      <div className={cn("dot absolute rounded-full bg-primary animate-[dot-2_2s_linear_infinite]", dotSizes[size])} style={{ animationDelay: "0.4s" }} />
      <div className={cn("dot absolute rounded-full bg-primary animate-[dot-3_2s_linear_infinite]", dotSizes[size])} style={{ animationDelay: "0.8s" }} />
      <div className={cn("dot absolute rounded-full bg-primary animate-[dot-4_2s_linear_infinite]", dotSizes[size])} style={{ animationDelay: "1.2s" }} />
      <div className={cn("dot absolute rounded-full bg-primary animate-[dot-5_2s_linear_infinite]", dotSizes[size])} style={{ animationDelay: "1.6s" }} />
    </div>
  );
}
