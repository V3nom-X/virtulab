import { Construction, Sparkles } from "lucide-react";
import { CustomLoader } from "@/components/ui/CustomLoader";

interface ComingSoonOverlayProps {
  title?: string;
  description?: string;
}

export function ComingSoonOverlay({ 
  title = "Coming Soon", 
  description = "We're working hard to bring you this feature. Stay tuned!"
}: ComingSoonOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center px-6 max-w-md">
        {/* Animated construction icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Construction className="w-12 h-12 text-primary" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-primary/60 animate-pulse delay-150" />
        </div>

        {/* Custom loader */}
        <CustomLoader size="md" className="mb-6" />

        {/* Title */}
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          {title}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-6">
          {description}
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <div className="bg-card border rounded-lg p-3 text-left">
            <div className="text-sm font-medium">Drag & Drop</div>
            <div className="text-xs text-muted-foreground">Build experiments visually</div>
          </div>
          <div className="bg-card border rounded-lg p-3 text-left">
            <div className="text-sm font-medium">2D & 3D Modes</div>
            <div className="text-xs text-muted-foreground">Physics simulations</div>
          </div>
          <div className="bg-card border rounded-lg p-3 text-left">
            <div className="text-sm font-medium">Custom Scripts</div>
            <div className="text-xs text-muted-foreground">JavaScript-powered logic</div>
          </div>
          <div className="bg-card border rounded-lg p-3 text-left">
            <div className="text-sm font-medium">Share & Collaborate</div>
            <div className="text-xs text-muted-foreground">Cloud-synced experiments</div>
          </div>
        </div>
      </div>
    </div>
  );
}
