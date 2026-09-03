import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { experiment101List } from "@/data/experiment101Data";
import { useExperiment101Progress } from "@/hooks/useExperiment101Progress";
import { RemoteSensingSimulation } from "@/components/experiment101/RemoteSensingSimulation";
import { CurvedMirrorsSimulation } from "@/components/experiment101/CurvedMirrorsSimulation";
import { PuritySimulation } from "@/components/experiment101/PuritySimulation";
import { ChangesInSubstancesSimulation } from "@/components/experiment101/ChangesInSubstancesSimulation";
import { ClassesOfFireSimulation } from "@/components/experiment101/ClassesOfFireSimulation";
import { CellExplorerSimulation } from "@/components/experiment101/CellExplorerSimulation";
import { ReportDownload } from "@/components/experiment101/ReportDownload";
import { enqueue, flushOutbox } from "@/lib/offlineOutbox";
import { ArrowLeft, BookOpen, CheckCircle2, FlaskConical, Globe, Trophy } from "lucide-react";


const getSimulation = (id: string) => {
  switch (id) {
    case "remote-sensing": return <RemoteSensingSimulation />;
    case "curved-mirrors": return <CurvedMirrorsSimulation />;
    case "pure-and-impure-substances": return <PuritySimulation />;
    case "temporary-and-permanent-changes": return <ChangesInSubstancesSimulation />;
    case "classes-of-fire": return <ClassesOfFireSimulation />;
    case "plant-and-animal-cell": return <CellExplorerSimulation />;
    default: return null;
  }
};

const Experiment101Detail = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const experiment = experiment101List.find((e) => e.id === experimentId);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const { record, saveResult } = useExperiment101Progress(experimentId);

  if (!experiment) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Experiment not found</h1>
          <Link to="/experiment-101"><Button>Back to Experiment 101</Button></Link>
        </div>
      </Layout>
    );
  }

  const totalQuestions = experiment.quizQuestions.length;
  const quizScore = quizSubmitted
    ? experiment.quizQuestions.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;
  const passMark = Math.ceil(totalQuestions / 2);

  const currentIndex = experiment101List.findIndex((e) => e.id === experiment.id);
  const nextExperiment = experiment101List[currentIndex + 1];

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    const score = experiment.quizQuestions.reduce(
      (acc, q, i) => acc + (quizAnswers[i] === q.correctIndex ? 1 : 0),
      0,
    );
    const passed = score >= passMark;
    if (passed || score > record.quizScore) {
      // Local record first so progress survives with no network at all.
      saveResult(score, totalQuestions, passed || record.completed);
    }
    // Queue the cloud write; the outbox replays it on reconnect.
    void enqueue({
      kind: "progress",
      experimentId: experiment.id,
      completed: passed,
    })
      .then(() => flushOutbox())
      .then((result) => setPendingSync(result.remaining > 0))
      .catch(() => setPendingSync(true));
  };


  return (
    <Layout>
      <div className="min-h-screen">
        <section className="py-6 border-b" style={{ background: "linear-gradient(135deg, hsl(220 60% 25% / 0.08), transparent)" }}>
          <div className="container">
            <Link to="/experiment-101" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Experiment 101
            </Link>
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-3xl shrink-0">{experiment.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-3xl font-bold break-words">{experiment.title}</h1>
                  {record.completed && (
                    <Badge className="bg-primary text-primary-foreground shrink-0">Completed</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm md:text-base break-words">{experiment.description}</p>
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
                <TabsTrigger value="quiz" className="gap-1"><Trophy className="w-4 h-4" />Summary & Quiz</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {experiment.overview.map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Learning Outcomes</h3>
                  <ul className="space-y-2">
                    {experiment.learningOutcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">How It Works (Step-by-Step)</h3>
                  <div className="space-y-3">
                    {experiment.howItWorks.map((step) => (
                      <div key={step.step} className="flex gap-3 p-3 bg-muted/50 rounded-lg min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{step.step}</div>
                        <div className="min-w-0">
                          <p className="font-medium break-words">{step.title}</p>
                          <p className="text-sm text-muted-foreground break-words">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Variables You Control</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {experiment.parameters.map((p, i) => (
                      <div key={i} className="p-3 border rounded-lg min-w-0">
                        <p className="font-medium text-sm break-words">{p.name}</p>
                        <p className="text-xs text-muted-foreground break-words">{p.controls}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Procedure</h3>
                  <ol className="space-y-2 list-decimal pl-5">
                    {experiment.procedure.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground break-words">{s}</li>
                    ))}
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="concepts">
                <Accordion type="single" collapsible className="w-full">
                  {experiment.keyConcepts.map((concept, i) => (
                    <AccordionItem key={i} value={`concept-${i}`}>
                      <AccordionTrigger className="text-left font-medium">{concept.title}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground break-words">{concept.description}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {experiment.applications.map((app, i) => (
                    <div key={i} className="p-4 bg-card border rounded-lg min-w-0">
                      <h4 className="font-semibold mb-2 break-words">{app.title}</h4>
                      <p className="text-sm text-muted-foreground break-words">{app.description}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Why Simulate This?</h3>
                  <ul className="space-y-2">
                    {experiment.advantages.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="simulation">
                {getSimulation(experiment.id)}
              </TabsContent>

              <TabsContent value="quiz" className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {experiment.summary.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-lg p-4 md:p-6">
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <h3 className="font-semibold text-lg">Check Your Understanding</h3>
                    {record.quizTotal > 0 && !quizSubmitted && (
                      <span className="text-xs text-muted-foreground">
                        Best so far: {record.quizScore}/{record.quizTotal}
                      </span>
                    )}
                  </div>
                  <div className="space-y-6">
                    {experiment.quizQuestions.map((q, qi) => (
                      <fieldset key={qi} className="min-w-0 border-0 p-0 m-0">
                        <legend className="font-medium mb-2 break-words">
                          {qi + 1}. {q.question}
                        </legend>
                        <div
                          role="radiogroup"
                          aria-label={`Question ${qi + 1}: ${q.question}`}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                        >
                          {q.options.map((opt, oi) => {
                            const selected = quizAnswers[qi] === oi;
                            const correct = quizSubmitted && oi === q.correctIndex;
                            const wrong = quizSubmitted && selected && oi !== q.correctIndex;
                            // Roving tabindex: one stop per question, arrows move within it.
                            const isTabStop = selected || (quizAnswers[qi] === undefined && oi === 0);
                            return (
                              <button
                                key={oi}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                tabIndex={isTabStop ? 0 : -1}
                                data-testid={`q${qi}-opt${oi}`}
                                onClick={() =>
                                  !quizSubmitted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))
                                }
                                onKeyDown={(e) => {
                                  if (quizSubmitted) return;
                                  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
                                  if (!keys.includes(e.key)) return;
                                  e.preventDefault();
                                  const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                                  const next =
                                    (oi + step + q.options.length) % q.options.length;
                                  setQuizAnswers((p) => ({ ...p, [qi]: next }));
                                  const group = e.currentTarget.parentElement;
                                  const target = group?.querySelectorAll<HTMLButtonElement>(
                                    '[role="radio"]',
                                  )[next];
                                  target?.focus();
                                }}
                                disabled={quizSubmitted}
                                className={`text-left p-3 min-h-11 rounded-lg border text-sm break-words transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${correct ? "bg-green-100 dark:bg-green-900/30 border-green-500" : wrong ? "bg-red-100 dark:bg-red-900/30 border-red-500" : selected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
                              >
                                <span className="flex items-start gap-2">
                                  <span aria-hidden="true" className="shrink-0 font-semibold">
                                    {String.fromCharCode(65 + oi)}.
                                  </span>
                                  <span className="min-w-0">{opt}</span>
                                  {quizSubmitted && (correct || wrong) && (
                                    <span className="sr-only">
                                      {correct ? " (correct answer)" : " (your answer, incorrect)"}
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <Button
                      className="mt-4 w-full sm:w-auto"
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < totalQuestions}
                    >
                      Submit Answers
                    </Button>
                  ) : (
                    <div className="mt-4 space-y-3" role="status" aria-live="polite">
                      <div className="flex items-center gap-3">
                        <Progress
                          value={(quizScore / totalQuestions) * 100}
                          aria-label="Quiz score"
                          className="flex-1"
                        />
                        <span className="font-semibold shrink-0">{quizScore}/{totalQuestions}</span>
                      </div>
                      <p data-testid="quiz-result" className="text-sm text-muted-foreground">
                        {quizScore >= passMark
                          ? "Passed — this experiment is marked complete."
                          : `You need at least ${passMark} correct to complete this experiment.`}
                      </p>
                      {pendingSync && (
                        <p className="text-xs text-muted-foreground">
                          Saved offline — your result will sync when you reconnect.
                        </p>
                      )}
                      {quizScore === totalQuestions && (
                        <Badge className="bg-primary text-primary-foreground">🏆 Perfect Score!</Badge>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}>
                          Retry Quiz
                        </Button>
                        {nextExperiment && (
                          <Link to={`/experiment-101/${nextExperiment.id}`}>
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

export default Experiment101Detail;
