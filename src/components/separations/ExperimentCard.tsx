import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { SeparationExperiment } from "@/data/separationExperiments";

interface ExperimentCardProps {
  experiment: SeparationExperiment;
  index: number;
}

export const ExperimentCard = ({ experiment, index }: ExperimentCardProps) => {
  return (
    <Link
      to={`/separation-of-mixtures/${experiment.id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="bg-card border rounded-xl overflow-hidden hover-lift h-full flex flex-col">
        <div className="h-32 bg-gradient-to-br from-[hsl(120,100%,20%)] to-[hsl(140,60%,30%)] flex items-center justify-center relative">
          <span className="text-4xl">{experiment.icon}</span>
          <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-xs">
            Interactive
          </Badge>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {experiment.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            {experiment.description}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[hsl(120,100%,20%)] text-[hsl(120,100%,20%)] hover:bg-[hsl(120,100%,20%)] hover:text-white gap-2"
          >
            Enter Experiment <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
};
