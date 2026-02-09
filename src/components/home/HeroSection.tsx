import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-[15%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-8 animate-fade-in backdrop-blur-sm border border-gold/30">
            <Sparkles className="w-4 h-4" />
            <span>200+ Interactive Science Experiments</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Science Comes{" "}
            <span className="text-gradient">Alive</span>
            <br />
            in Your Browser
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            Explore physics, chemistry, biology, and earth science through immersive 
            virtual experiments. Learn by doing with real-time simulations and interactive controls.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
            <Link to="/library">
              <Button size="xl" variant="glow" className="group">
                Start Exploring
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/workspace">
              <Button size="xl" variant="outline" className="group gap-2">
                <Play className="w-5 h-5" />
                Try Demo Experiment
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/50 animate-fade-in stagger-3">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">200+</div>
              <div className="text-sm text-muted-foreground mt-1">Experiments</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">4</div>
              <div className="text-sm text-muted-foreground mt-1">Science Fields</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Free Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
