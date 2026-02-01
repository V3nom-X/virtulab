import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuizSystem } from '@/components/quiz/QuizSystem';
import { 
  labSafetyGuidelines, 
  chemistryTutorials, 
  chemistryFacts,
  getRandomFact,
  ChemistryTutorial,
  ChemistryFact
} from '@/data/chemistryEducation';
import { getQuizByTutorialId, safetyQuiz } from '@/data/chemistryQuizzes';
import { 
  ShieldAlert, 
  GraduationCap, 
  Lightbulb, 
  ChevronRight,
  Clock,
  Beaker,
  AlertTriangle,
  Info,
  Sparkles,
  Trophy,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ChemistryEducationPanelProps {
  onStartTutorial?: (tutorial: ChemistryTutorial) => void;
  className?: string;
}

export function ChemistryEducationPanel({ onStartTutorial, className }: ChemistryEducationPanelProps) {
  const [selectedTab, setSelectedTab] = useState('safety');
  const [currentFact, setCurrentFact] = useState<ChemistryFact>(getRandomFact());
  const [expandedSafety, setExpandedSafety] = useState<string | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ tutorialId: string; title: string } | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());

  const severityColors = {
    critical: 'bg-destructive/20 text-destructive border-destructive/30',
    important: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    recommended: 'bg-blue-500/20 text-blue-600 border-blue-500/30'
  };

  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-600',
    intermediate: 'bg-yellow-500/20 text-yellow-600',
    advanced: 'bg-red-500/20 text-red-600'
  };

  const handleStartQuiz = (tutorialId: string, title: string) => {
    setActiveQuiz({ tutorialId, title });
    setQuizDialogOpen(true);
  };

  const handleQuizComplete = (score: number, total: number, passed: boolean) => {
    if (passed && activeQuiz) {
      setCompletedQuizzes(prev => new Set([...prev, activeQuiz.tutorialId]));
      toast.success(`Congratulations! You passed the ${activeQuiz.title}!`);
    }
  };

  const getActiveQuizQuestions = () => {
    if (!activeQuiz) return null;
    if (activeQuiz.tutorialId === 'lab-safety') {
      return safetyQuiz;
    }
    return getQuizByTutorialId(activeQuiz.tutorialId);
  };

  const quizData = getActiveQuizQuestions();

  return (
    <div className={className}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="safety" className="text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="text-xs sm:text-sm">
            <GraduationCap className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="facts" className="text-xs sm:text-sm">
            <Lightbulb className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Facts</span>
          </TabsTrigger>
        </TabsList>

        {/* Safety Guidelines Tab */}
        <TabsContent value="safety" className="mt-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold">Lab Safety Guidelines</h3>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStartQuiz('lab-safety', 'Lab Safety Quiz')}
                  className="flex items-center gap-1"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Take Quiz</span>
                  {completedQuizzes.has('lab-safety') && (
                    <Trophy className="w-4 h-4 text-yellow-500 ml-1" />
                  )}
                </Button>
              </div>
              
              {labSafetyGuidelines.map((guideline) => (
                <Card 
                  key={guideline.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    expandedSafety === guideline.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setExpandedSafety(
                    expandedSafety === guideline.id ? null : guideline.id
                  )}
                >
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{guideline.icon}</span>
                        <div>
                          <CardTitle className="text-sm">{guideline.title}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] mt-1 ${severityColors[guideline.severity]}`}
                          >
                            {guideline.severity}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        expandedSafety === guideline.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </CardHeader>
                  
                  {expandedSafety === guideline.id && (
                    <CardContent className="pt-0 px-4 pb-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        {guideline.description}
                      </p>
                      <ul className="space-y-2">
                        {guideline.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="mt-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Interactive Tutorials</h3>
              </div>
              
              {chemistryTutorials.map((tutorial) => {
                const hasQuiz = !!getQuizByTutorialId(tutorial.id);
                const quizCompleted = completedQuizzes.has(tutorial.id);
                
                return (
                  <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{tutorial.title}</CardTitle>
                            {quizCompleted && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <CardDescription className="text-xs mt-1">
                            {tutorial.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={difficultyColors[tutorial.difficulty]}>
                          {tutorial.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration} min
                        </Badge>
                        {hasQuiz && (
                          <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
                            <ClipboardCheck className="w-3 h-3" />
                            Quiz
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      {tutorial.expectedReaction && (
                        <div className="bg-muted rounded-lg p-2 mb-3">
                          <span className="text-xs text-muted-foreground">Expected:</span>
                          <p className="font-mono text-sm">{tutorial.expectedReaction}</p>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mb-2">
                        {tutorial.steps.length} steps
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => onStartTutorial?.(tutorial)}
                        >
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Start Tutorial
                        </Button>
                        {hasQuiz && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStartQuiz(tutorial.id, `${tutorial.title} Quiz`)}
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Facts Tab */}
        <TabsContent value="facts" className="mt-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Featured Fact */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-sm">Did You Know?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">{currentFact.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentFact.fact}</p>
                  <Badge variant="outline" className="mt-3 capitalize">
                    {currentFact.category}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => setCurrentFact(getRandomFact())}
                  >
                    Show Another Fact
                  </Button>
                </CardContent>
              </Card>

              {/* All Facts */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Chemistry Facts
                </h3>
                {chemistryFacts.map((fact) => (
                  <Card key={fact.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm mb-1">{fact.title}</h4>
                          <p className="text-xs text-muted-foreground">{fact.fact}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {fact.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeQuiz?.title || 'Quiz'}</DialogTitle>
          </DialogHeader>
          {quizData && (
            <QuizSystem
              title={quizData.title}
              questions={quizData.questions}
              passingScore={quizData.passingScore}
              onComplete={handleQuizComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
