import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BookOpen, 
  Lightbulb, 
  Wrench, 
  Target, 
  CheckCircle2, 
  ChevronDown,
  ChevronRight,
  X,
  Calculator
} from "lucide-react";
import { getExperimentEducation, ExperimentEducation as EducationType } from "@/data/experimentEducation";

interface ExperimentEducationProps {
  experimentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExperimentEducation({ experimentId, isOpen, onClose }: ExperimentEducationProps) {
  const [openSections, setOpenSections] = useState<string[]>(['overview', 'how-it-works']);
  const education = getExperimentEducation(experimentId);

  if (!isOpen || !education) return null;

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookOpen, content: 'overview' },
    { id: 'how-it-works', title: 'How It Works', icon: Wrench, content: 'howItWorks' },
    { id: 'key-concepts', title: 'Key Concepts', icon: Lightbulb, content: 'keyConcepts' },
    { id: 'applications', title: 'Real-World Applications', icon: Target, content: 'applications' },
    { id: 'equations', title: 'Key Equations', icon: Calculator, content: 'equations' },
    { id: 'conclusion', title: 'Conclusion', icon: CheckCircle2, content: 'conclusion' },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Mobile overlay */}
      <div className="lg:hidden absolute inset-0 bg-black/50" onClick={onClose} />
      
      <Card className="absolute right-0 top-0 bottom-0 w-full max-w-md lg:max-w-none lg:relative lg:w-80 xl:w-96 bg-card border-l shadow-xl lg:shadow-none overflow-hidden flex flex-col">
        <CardHeader className="py-3 px-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Learn
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {sections.map((section) => {
              // Skip equations if not present
              if (section.id === 'equations' && !education.equations?.length) return null;
              
              const isOpen = openSections.includes(section.id);
              const Icon = section.icon;
              
              return (
                <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between h-auto py-3 px-3 hover:bg-muted/50"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="w-4 h-4 text-primary" />
                        {section.title}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="px-3 pb-3">
                    <div className="pt-2 space-y-3">
                      {section.id === 'overview' && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {education.overview}
                        </p>
                      )}
                      
                      {section.id === 'how-it-works' && (
                        <ol className="space-y-2">
                          {education.howItWorks.map((step, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                                {idx + 1}
                              </span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                      
                      {section.id === 'key-concepts' && (
                        <div className="space-y-2">
                          {education.keyConcepts.map((concept, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-muted/30 border border-border/50">
                              <h4 className="text-sm font-medium text-foreground mb-1">
                                {concept.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {concept.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.id === 'applications' && (
                        <div className="space-y-2">
                          {education.applications.map((app, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Badge variant="secondary" className="h-fit text-xs px-2 py-0.5 flex-shrink-0">
                                {idx + 1}
                              </Badge>
                              <div>
                                <h4 className="text-sm font-medium">{app.title}</h4>
                                <p className="text-xs text-muted-foreground">{app.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.id === 'equations' && education.equations && (
                        <div className="space-y-2">
                          {education.equations.map((eq, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">{eq.name}</span>
                              </div>
                              <code className="text-sm font-mono font-semibold text-primary">
                                {eq.formula}
                              </code>
                              <p className="text-xs text-muted-foreground mt-1">{eq.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {section.id === 'conclusion' && (
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/50 pl-3">
                          {education.conclusion}
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
