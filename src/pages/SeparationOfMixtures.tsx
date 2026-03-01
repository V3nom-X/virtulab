import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExperimentCard } from "@/components/separations/ExperimentCard";
import { separationExperiments } from "@/data/separationExperiments";
import { useSeparationProgress } from "@/hooks/useSeparationProgress";
import { FlaskConical, BookOpen, Globe, ChevronDown } from "lucide-react";

const SeparationOfMixtures = () => {
  const experimentsRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<"experiments" | "theory" | "applications">("experiments");
  const { completedExperiments, completionPercentage, totalExperiments } = useSeparationProgress();

  const scrollToExperiments = () => {
    experimentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "linear-gradient(135deg, hsl(120 100% 15%), hsl(140 60% 25%), hsl(120 80% 20%))" }}>
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20 animate-float"
                style={{
                  width: `${8 + Math.random() * 20}px`,
                  height: `${8 + Math.random() * 20}px`,
                  background: ["#fff", "#4fd1c5", "#63b3ed", "#f6ad55", "#fc8181"][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          <div className="container relative z-10 text-center">
            {/* Animated beaker */}
            <div className="mx-auto mb-8 w-24 h-32 relative animate-float">
              <svg viewBox="0 0 100 130" className="w-full h-full">
                {/* Beaker */}
                <path d="M25 20 L25 95 Q25 110 40 110 L60 110 Q75 110 75 95 L75 20" fill="none" stroke="white" strokeWidth="3" />
                <line x1="20" y1="20" x2="80" y2="20" stroke="white" strokeWidth="3" />
                {/* Liquid layers */}
                <rect x="26" y="70" width="48" height="20" fill="hsl(200, 80%, 60%)" opacity="0.7">
                  <animate attributeName="height" values="20;22;20" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="26" y="50" width="48" height="20" fill="hsl(45, 90%, 55%)" opacity="0.7">
                  <animate attributeName="y" values="50;48;50" dur="2.5s" repeatCount="indefinite" />
                </rect>
                <rect x="26" y="90" width="48" height="15" fill="hsl(0, 70%, 55%)" opacity="0.7" />
                {/* Crystal shapes */}
                <polygon points="35,100 38,95 41,100" fill="white" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
                </polygon>
                <polygon points="55,98 58,93 61,98" fill="white" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </polygon>
                {/* Vapour bubbles */}
                <circle cx="40" cy="45" r="3" fill="white" opacity="0.5">
                  <animate attributeName="cy" values="45;25;10" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.3;0" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="55" cy="50" r="2" fill="white" opacity="0.4">
                  <animate attributeName="cy" values="50;30;15" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.2;0" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Grade 8–9 CBC Chemistry
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Separation of Mixtures
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Learn to separate solids, liquids, and dyes safely using virtual experiments.
              Explore seven interactive simulations with real-time animations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/80 gap-2"
                onClick={scrollToExperiments}
              >
                <FlaskConical className="w-5 h-5" /> Start Experiment
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
                onClick={() => { setActiveSection("theory"); scrollToExperiments(); }}
              >
                <BookOpen className="w-5 h-5" /> Theory & Concepts
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
                onClick={() => { setActiveSection("applications"); scrollToExperiments(); }}
              >
                <Globe className="w-5 h-5" /> Applications in Real Life
              </Button>
            </div>

            <button onClick={scrollToExperiments} className="mt-10 text-white/60 hover:text-white transition-colors animate-bounce">
              <ChevronDown className="w-8 h-8 mx-auto" />
            </button>
          </div>
        </section>

        {/* Experiment Selection */}
        <section ref={experimentsRef} className="py-12">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">
                Choose an <span className="text-gold">Experiment</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                7 interactive experiments covering key separation techniques
              </p>
              {/* Progress bar */}
              <div className="max-w-md mx-auto flex items-center gap-3">
                <Progress value={completionPercentage} className="flex-1" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {completedExperiments.length}/{totalExperiments} completed
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {separationExperiments.map((exp, idx) => (
                <ExperimentCard key={exp.id} experiment={exp} index={idx} completed={completedExperiments.includes(exp.id)} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </Layout>
  );
};

export default SeparationOfMixtures;
