import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { experiment101List } from "@/data/experiment101Data";
import { useExperiment101Records } from "@/hooks/useExperiment101Progress";
import { ReportDownload } from "@/components/experiment101/ReportDownload";

import { ArrowLeft, CheckCircle2 } from "lucide-react";

const ids = experiment101List.map((e) => e.id);

const Experiment101 = () => {
  const { records, completedCount, total } = useExperiment101Records(ids);
  const progress = total ? (completedCount / total) * 100 : 0;

  return (
    <Layout>
      <div className="min-h-screen">
        <section
          className="py-10 md:py-12 border-b"
          style={{ background: "linear-gradient(135deg, hsl(220 60% 25% / 0.12), hsl(45 80% 40% / 0.06))" }}
        >
          <div className="container">
            <Link
              to="/library"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </Link>
            <div className="flex items-start gap-3 mb-4 min-w-0">
              <span className="text-4xl shrink-0">🔬</span>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold break-words">Experiment 101</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Six standalone experiments — each with its own simulation, quiz and progress
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 w-full max-w-md">
                <Progress value={progress} className="flex-1" />
                <span className="text-sm font-medium shrink-0">
                  {completedCount}/{total}
                </span>
              </div>
              <ReportDownload />
            </div>

          </div>
        </section>

        <section className="py-8">
          <div className="container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {experiment101List.map((exp) => {
                const isComplete = !!records[exp.id]?.completed;
                return (
                  <Link
                    key={exp.id}
                    to={`/experiment-101/${exp.id}`}
                    className="group block bg-card border rounded-xl overflow-hidden hover-lift"
                  >
                    <div className="h-28 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-5xl">
                      {exp.icon}
                    </div>
                    <div className="p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold break-words group-hover:text-primary transition-colors">
                          {exp.title}
                        </h3>
                        {isComplete && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{exp.subtitle}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3 break-words">{exp.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge variant="secondary" className="text-[11px] max-w-full truncate">
                          {exp.subject}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] max-w-full truncate">
                          {exp.level}
                        </Badge>
                      </div>
                      <Button className="w-full mt-4" size="sm">
                        {isComplete ? "Revisit experiment" : "Start experiment"}
                      </Button>
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

export default Experiment101;
