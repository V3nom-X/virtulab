import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from "lucide-react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizSystemProps {
  title: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number, passed: boolean) => void;
  passingScore?: number;
}

export function QuizSystem({ 
  title, 
  questions, 
  onComplete,
  passingScore = 70 
}: QuizSystemProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [...prev, {
      questionId: question.id,
      selected: selectedAnswer,
      correct: isCorrect
    }]);
    
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const finalScore = score + (selectedAnswer === question.correctAnswer ? 1 : 0);
      const percentage = (finalScore / questions.length) * 100;
      const passed = percentage >= passingScore;
      setIsComplete(true);
      onComplete?.(finalScore, questions.length, passed);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  };

  if (isComplete) {
    const finalScore = score;
    const percentage = (finalScore / questions.length) * 100;
    const passed = percentage >= passingScore;

    return (
      <div className="bg-card border rounded-xl p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {passed ? (
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-green-500" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-orange-500" />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground">
            You scored {finalScore} out of {questions.length} ({percentage.toFixed(0)}%)
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Score</span>
            <Badge variant={passed ? "default" : "secondary"}>
              {passed ? "Passed" : "Not Passed"}
            </Badge>
          </div>
          <Progress value={percentage} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Passing score: {passingScore}%
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="font-medium">Question Summary</h3>
          {questions.map((q, idx) => {
            const answer = answers[idx];
            return (
              <div 
                key={q.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  answer?.correct ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                {answer?.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm flex-1 truncate">{q.question}</span>
              </div>
            );
          })}
        </div>

        <Button onClick={handleRestart} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{title}</Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">{question.question}</h2>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let optionClass = "border-border hover:border-primary/50";
            
            if (isAnswered) {
              if (idx === question.correctAnswer) {
                optionClass = "border-green-500 bg-green-500/10";
              } else if (idx === selectedAnswer && idx !== question.correctAnswer) {
                optionClass = "border-red-500 bg-red-500/10";
              }
            } else if (idx === selectedAnswer) {
              optionClass = "border-primary bg-primary/10";
            }
            
            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                disabled={isAnswered}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${optionClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    selectedAnswer === idx ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                  {isAnswered && idx === question.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                  {isAnswered && idx === selectedAnswer && idx !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {isAnswered && question.explanation && (
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-1">Explanation</h3>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Score: {score}/{currentQuestion + (isAnswered ? 1 : 0)}
        </div>
        {isAnswered ? (
          <Button onClick={handleNextQuestion}>
            {currentQuestion < questions.length - 1 ? (
              <>
                Next Question
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              "See Results"
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
}
