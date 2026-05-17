import { Parallax } from "@/components/ui/Parallax";
import { useReducedMotion } from "@/hooks/useAccessibility";
import videoAsset from "../../../public/videos/parallax-hero.mp4.asset.json";

export function ParallaxVideoSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-background">
      <Parallax speed={0.3} enableOnMobile className="absolute inset-0 -top-[10%] -bottom-[10%]">
        <video
          src={videoAsset.url}
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </Parallax>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background)/0.7)_100%)] pointer-events-none" />

      {/* Centered overlay text */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary mb-4 animate-fade-in">
            Computational Science · Live Simulations
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            A laboratory that lives <span className="text-gradient">in your browser</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto animate-slide-up stagger-1">
            Real reactions, real physics, real feedback — rendered in real time.
          </p>
        </div>
      </div>
    </section>
  );
}
