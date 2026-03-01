import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { excretoryExperiments } from "@/data/excretorySystemData";
import { useExcretoryProgress } from "@/hooks/useExcretoryProgress";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const ExcretorySystem = () => {
  const { completed, total } = useExcretoryProgress();
  const progress = (completed.length / total) * 100;

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="py-12 border-b" style={{ background: "linear-gradient(135deg, hsl(0 60% 20% / 0.1), hsl(30 60% 20% / 0.05))" }}>
          <div className="container">
            <Link to="/library" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🫘</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Human Excretory System</h1>
                <p className="text-muted-foreground">Explore skin, urinary system, and kidney structure & function</p>
              </div>
            </div>
            <div className="flex items-center gap-3 max-w-md">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium">{completed.length}/{total}</span>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {excretoryExperiments.map((exp, i) => {
                const isComplete = completed.includes(exp.id);
                return (
                  <Link key={exp.id} to={`/excretory-system/${exp.id}`} className="group block animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="bg-card rounded-xl border overflow-hidden hover-lift h-full">
                      <div className="h-32 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(0 50% 25%), hsl(30 50% 20%))" }}>
                        <span className="text-5xl">{exp.icon}</span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{exp.title}</h3>
                          {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Biology</Badge>
                          {isComplete && <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Completed</Badge>}
                        </div>
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

export default ExcretorySystem;
