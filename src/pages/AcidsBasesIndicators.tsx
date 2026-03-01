import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { acidBaseExperiments } from "@/data/acidBaseExperiments";
import { useAcidBaseProgress } from "@/hooks/useAcidBaseProgress";
import { ArrowRight, CheckCircle2, FlaskConical, BookOpen, ChevronDown } from "lucide-react";

const AcidsBasesIndicators = () => {
  const experimentsRef = useRef<HTMLDivElement>(null);
  const { completedExperiments, completionPercentage, totalExperiments } = useAcidBaseProgress();

  const scrollToExperiments = () => {
    experimentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          style={{ background: "linear-gradient(135deg, hsl(280 80% 20%), hsl(320 70% 30%), hsl(260 60% 25%))" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20 animate-float"
                style={{
                  width: `${8 + Math.random() * 20}px`,
                  height: `${8 + Math.random() * 20}px`,
                  background: ["#ff6b6b", "#4ecdc4", "#a78bfa", "#fbbf24", "#60a5fa"][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          <div className="container relative z-10 text-center">
            {/* Animated beaker with pH colors */}
            <div className="mx-auto mb-8 w-24 h-32 relative animate-float">
              <svg viewBox="0 0 100 130" className="w-full h-full">
                <path d="M25 20 L25 95 Q25 110 40 110 L60 110 Q75 110 75 95 L75 20" fill="none" stroke="white" strokeWidth="3" />
                <line x1="20" y1="20" x2="80" y2="20" stroke="white" strokeWidth="3" />
                {/* pH gradient liquid */}
                <defs>
                  <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff0000" stopOpacity="0.8" />
                    <stop offset="25%" stopColor="#ff8800" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#00cc66" stopOpacity="0.8" />
                    <stop offset="75%" stopColor="#0066cc" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6600cc" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <rect x="26" y="40" width="48" height="65" fill="url(#phGrad)" rx="2">
                  <animate attributeName="y" values="40;38;40" dur="2s" repeatCount="indefinite" />
                </rect>
                {/* Litmus strips */}
                <rect x="35" y="15" width="6" height="30" fill="#e74c3c" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="55" y="15" width="6" height="30" fill="#3498db" opacity="0.9">
                  <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
                </rect>
                {/* Ion particles */}
                <circle cx="40" cy="60" r="3" fill="#ffd700" opacity="0.7">
                  <animate attributeName="cy" values="60;50;70;60" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="40;45;35;40" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="55" cy="70" r="2.5" fill="#ff69b4" opacity="0.6">
                  <animate attributeName="cy" values="70;55;75;70" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="55;50;60;55" dur="3.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Grade 8–9 CBC Chemistry
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Acids, Bases & Indicators
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Explore the colorful world of acids, bases, and indicators through five interactive experiments.
              Test pH, observe color changes, discover natural indicators, and perform neutralization reactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/80 gap-2"
                onClick={scrollToExperiments}
              >
                <FlaskConical className="w-5 h-5" /> Start Experimenting
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
                onClick={scrollToExperiments}
              >
                <BookOpen className="w-5 h-5" /> Learn the Theory
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
                Choose an <span className="text-primary">Experiment</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                5 interactive experiments covering acids, bases, and indicator chemistry
              </p>
              <div className="max-w-md mx-auto flex items-center gap-3">
                <Progress value={completionPercentage} className="flex-1" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {completedExperiments.length}/{totalExperiments} completed
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {acidBaseExperiments.map((exp, idx) => {
                const completed = completedExperiments.includes(exp.id);
                return (
                  <Link
                    key={exp.id}
                    to={`/acids-bases-indicators/${exp.id}`}
                    className="group block animate-fade-in"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="bg-card border rounded-xl overflow-hidden hover-lift h-full flex flex-col">
                      <div className="h-32 bg-gradient-to-br from-[hsl(280,80%,25%)] to-[hsl(320,70%,35%)] flex items-center justify-center relative">
                        <span className="text-4xl">{exp.icon}</span>
                        {completed ? (
                          <Badge className="absolute top-3 right-3 bg-green-600 text-white text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-xs">
                            Interactive
                          </Badge>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {exp.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {exp.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
                        >
                          Enter Experiment <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </Layout>
  );
};

export default AcidsBasesIndicators;
