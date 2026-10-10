import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FlaskConical } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LabExperimentSimulation } from "@/components/lab/LabExperimentSimulation";
import {
  getLabExperiment,
  gradeLabQuiz,
  LAB_PASS_MARK,
  readLabProgress,
  writeLabProgress,
} from "@/data/labExperiments";
import { LAB_STORAGE_KEY, queueLabSync } from "@/lib/labSync";
import NotFound from "./NotFound";

const LabExperimentDetail = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const exp = getLabExperiment(labId);
  const initial = useMemo(() => (exp ? readLabProgress()[exp.id] : undefined), [exp]);
  const [steps, setSteps] = useState<number[]>(initial?.stepsDone ?? []);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (!exp) return <NotFound />;
  const best = initial?.quizScore ?? 0;

  const toggleStep = (i: number) => {
    const next = steps.includes(i) ? steps.filter((s) => s !== i) : [...steps, i];
    setSteps(next);
    const rec = readLabProgress()[exp.id];
    writeLabProgress(exp.id, { quizScore: rec?.quizScore ?? 0, completed: rec?.completed ?? false, stepsDone: next });
  };

  const submit = () => {
    const r = gradeLabQuiz(exp, answers);
    setResult(r);
    const rec = readLabProgress()[exp.id];
    const completed = r.passed || !!rec?.completed;
    writeLabProgress(exp.id, { quizScore: Math.max(r.score, rec?.quizScore ?? 0), completed, stepsDone: steps });
    if (r.passed) void queueLabSync({ completedLabs: [exp.id] });
  };

  const loadBench = () => {
    const setup = {
      name: exp.title,
      mode: "2d",
      components: exp.bench.map((b, i) => ({ ...b, id: `lab_${exp.id}_${i}`, width: 150, height: 80 })),
      bench3D: [],
      variables: [
        { id: "gravity", name: "Gravity", value: 9.8, min: 0, max: 20, step: 0.1, unit: "m/s²" },
        { id: "friction", name: "Friction", value: 0.3, min: 0, max: 1, step: 0.01 },
      ],
    };
    localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(setup));
    navigate("/lab");
  };

  return (
    <Layout>
      <main id="main-content" className="container py-6 space-y-6 max-w-4xl">
        <Link to="/lab" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to the lab
        </Link>
        <header className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden>{exp.icon}</span>
          <div className="min-w-0">
            <Badge variant="secondary">{exp.subject}</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">{exp.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{exp.objective}</p>
          </div>
        </header>

        <Card>
          <CardHeader><CardTitle className="text-lg">Apparatus</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {exp.apparatus.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
            <Button size="sm" className="ml-auto" onClick={loadBench}>
              <FlaskConical className="w-4 h-4 mr-1" /> Set up on my bench
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Procedure ({steps.length}/{exp.procedure.length})</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {exp.procedure.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Checkbox id={`step-${i}`} checked={steps.includes(i)} onCheckedChange={() => toggleStep(i)} className="mt-0.5" />
                  <Label htmlFor={`step-${i}`} className="text-sm leading-relaxed font-normal">
                    <span className="font-semibold mr-1">{i + 1}.</span>{p}
                  </Label>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Simulation</CardTitle></CardHeader>
          <CardContent><LabExperimentSimulation id={exp.id} /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quiz</CardTitle>
            <p className="text-sm text-muted-foreground">Pass mark {LAB_PASS_MARK}/{exp.quiz.length}. Best so far: {best}/{exp.quiz.length}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {exp.quiz.map((q, qi) => (
              <fieldset key={qi} className="space-y-2">
                <legend className="font-medium text-sm">{qi + 1}. {q.question}</legend>
                <RadioGroup
                  value={answers[qi]?.toString() ?? ""}
                  onValueChange={(v) => { const n = [...answers]; n[qi] = Number(v); setAnswers(n); setResult(null); }}
                >
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <RadioGroupItem id={`q${qi}o${oi}`} value={String(oi)} />
                      <Label htmlFor={`q${qi}o${oi}`} className="font-normal">{o}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {result && (
                  <p className={`text-xs ${answers[qi] === q.correctIndex ? "text-primary" : "text-destructive"}`}>
                    {answers[qi] === q.correctIndex ? "Correct. " : "Not quite. "}{q.explanation}
                  </p>
                )}
              </fieldset>
            ))}
            <Button onClick={submit} disabled={answers.filter((a) => a !== undefined).length < exp.quiz.length}>Submit answers</Button>
            {result && (
              <p role="status" className="text-sm font-medium flex items-center gap-1">
                {result.passed && <CheckCircle2 className="w-4 h-4 text-primary" />}
                You scored {result.score}/{exp.quiz.length}. {result.passed ? "Lab complete!" : "Review and try again."}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </Layout>
  );
};

export default LabExperimentDetail;
