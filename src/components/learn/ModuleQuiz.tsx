import { useState } from "react";
import { CheckCircle2, XCircle, Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@/lib/moduleContent";

interface ModuleQuizProps {
  questions: QuizQuestion[];
  passingScore: number;
  onComplete: (passed: boolean, score: number) => void;
}

export function ModuleQuiz({ questions, passingScore, onComplete }: ModuleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers({ ...answers, [questionId]: answerId });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correct = 0;
      questions.forEach((q) => {
        const correctOption = q.options.find((o) => o.isCorrect);
        if (answers[q.id] === correctOption?.id) {
          correct++;
        }
      });
      const finalScore = Math.round((correct / questions.length) * 100);
      setScore(finalScore);
      setShowResults(true);
      onComplete(finalScore >= passingScore, finalScore);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const passed = score >= passingScore;

  if (showResults) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              passed ? "bg-green-500/20" : "bg-amber-500/20"
            )}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-green-500" />
            ) : (
              <RefreshCw className="w-10 h-10 text-amber-500" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {passed ? "Congratulations!" : "Almost there!"}
            </h2>
            <p className="text-muted-foreground">
              {passed
                ? "You've successfully completed this module."
                : `You need ${passingScore}% to pass. Keep learning and try again!`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">{score}%</div>
            <p className="text-sm text-muted-foreground">
              {Math.round((score / 100) * questions.length)} of {questions.length}{" "}
              questions correct
            </p>
          </div>

          {!passed && (
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border transition-colors hover:bg-muted/50",
                  answers[question.id] === option.id && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                <Label
                  htmlFor={`${question.id}-${option.id}`}
                  className="flex-1 cursor-pointer text-foreground"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!answers[question.id]}
          className="px-8"
        >
          {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      </div>
    </div>
  );
}
