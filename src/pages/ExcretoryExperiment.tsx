import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkinSimulation } from "@/components/excretory/SkinSimulation";
import { UrinarySystemSimulation } from "@/components/excretory/UrinarySystemSimulation";
import { KidneySimulation } from "@/components/excretory/KidneySimulation";
import { excretoryExperiments } from "@/data/excretorySystemData";
import { ArrowLeft, CheckCircle2, Globe, BookOpen, FlaskConical, Trophy } from "lucide-react";
import { useState } from "react";
import { useExcretoryProgress } from "@/hooks/useExcretoryProgress";

const getSimulationComponent = (experimentId: string) => {
  switch (experimentId) {
    case "human-skin": return <SkinSimulation />;
    case "urinary-system": return <UrinarySystemSimulation />;
    case "human-kidney": return <KidneySimulation />;
    default: return <SkinSimulation />;
  }
};

const ExcretoryExperiment = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const experiment = excretoryExperiments.find((e) => e.id === experimentId);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const { markComplete } = useExcretoryProgress();

  if (!experiment) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Experiment not found</h1>
          <Link to="/excretory-system"><Button>Back to module</Button></Link>
        </div>
      </Layout>
    );
  }

  const quizScore = quizSubmitted
    ? experiment.quizQuestions.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;

  const nextExperiment = excretoryExperiments[excretoryExperiments.findIndex((e) => e.id === experimentId) + 1];

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="py-6 border-b" style={{ background: "linear-gradient(135deg, hsl(0 60% 20% / 0.08), transparent)" }}>
          <div className="container">
            <Link to="/excretory-system" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to experiments
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{experiment.icon}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{experiment.title}</h1>
                <p className="text-muted-foreground">{experiment.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="container">
            <Tabs defaultValue="overview">
              <TabsList className="mb-6 flex-wrap h-auto gap-1">
                <TabsTrigger value="overview" className="gap-1"><BookOpen className="w-4 h-4" />Overview</TabsTrigger>
                <TabsTrigger value="concepts" className="gap-1"><BookOpen className="w-4 h-4" />Concepts</TabsTrigger>
                <TabsTrigger value="applications" className="gap-1"><Globe className="w-4 h-4" />Applications</TabsTrigger>
                <TabsTrigger value="simulation" className="gap-1"><FlaskConical className="w-4 h-4" />Simulation</TabsTrigger>
                <TabsTrigger value="summary" className="gap-1"><Trophy className="w-4 h-4" />Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {experiment.overview.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">How It Works (Step-by-Step)</h3>
                  <div className="space-y-3">
                    {experiment.howItWorks.map((step) => (
                      <div key={step.step} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{step.step}</div>
                        <div>
                          <p className="font-medium">{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="concepts">
                <Accordion type="single" collapsible className="w-full">
                  {experiment.keyConcepts.map((concept, i) => (
                    <AccordionItem key={i} value={`concept-${i}`}>
                      <AccordionTrigger className="text-left font-medium">{concept.title}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{concept.description}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="applications">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {experiment.applications.map((app, i) => (
                    <div key={i} className="p-4 bg-card border rounded-lg">
                      <h4 className="font-semibold mb-2">{app.title}</h4>
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="simulation">
                {getSimulationComponent(experiment.id)}
              </TabsContent>

              <TabsContent value="summary" className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {experiment.summary.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Check Your Understanding</h3>
                  <div className="space-y-6">
                    {experiment.quizQuestions.map((q, qi) => (
                      <div key={qi}>
                        <p className="font-medium mb-2">{qi + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => {
                            const selected = quizAnswers[qi] === oi;
                            const correct = quizSubmitted && oi === q.correctIndex;
                            const wrong = quizSubmitted && selected && oi !== q.correctIndex;
                            return (
                              <button key={oi} onClick={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))} disabled={quizSubmitted}
                                className={`text-left p-3 rounded-lg border text-sm transition-colors ${correct ? "bg-green-100 dark:bg-green-900/30 border-green-500" : wrong ? "bg-red-100 dark:bg-red-900/30 border-red-500" : selected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!quizSubmitted ? (
                    <Button className="mt-4" onClick={() => {
                      setQuizSubmitted(true);
                      const score = experiment.quizQuestions.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0), 0);
                      if (score >= Math.ceil(experiment.quizQuestions.length / 2) && experimentId) markComplete(experimentId);
                    }} disabled={Object.keys(quizAnswers).length < experiment.quizQuestions.length}>
                      Submit Answers
                    </Button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Progress value={(quizScore / experiment.quizQuestions.length) * 100} className="flex-1" />
                        <span className="font-semibold">{quizScore}/{experiment.quizQuestions.length}</span>
                      </div>
                      {quizScore === experiment.quizQuestions.length && <Badge className="bg-primary text-primary-foreground">🏆 Perfect Score!</Badge>}
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}>Retry Quiz</Button>
                        {nextExperiment && (
                          <Link to={`/excretory-system/${nextExperiment.id}`}>
                            <Button>Next: {nextExperiment.title} →</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
      <Footer />
    </Layout>
  );
};

export default ExcretoryExperiment;
