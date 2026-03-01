import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { KnowledgeCheck as KnowledgeCheckType } from "@/lib/moduleContent";

interface KnowledgeCheckProps {
  check: KnowledgeCheckType;
  onComplete: (passed: boolean) => void;
}

export function KnowledgeCheck({ check, onComplete }: KnowledgeCheckProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [reorderItems, setReorderItems] = useState<typeof check.options>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Reset state whenever the check changes
  useEffect(() => {
    setSelectedAnswers([]);
    setSubmitted(false);
    setIsCorrect(false);
    setDraggedIndex(null);
    setAttempts(0);
    if (check.type === "reorder") {
      const shuffled = [...check.options].sort(() => Math.random() - 0.5);
      setReorderItems(shuffled);
    } else {
      setReorderItems([]);
    }
  }, [check.id]);

  const handleSingleSelect = (value: string) => {
    if (!submitted) {
      setSelectedAnswers([value]);
    }
  };

  const handleMultipleSelect = (optionId: string, checked: boolean) => {
    if (submitted) return;
    if (checked) {
      setSelectedAnswers([...selectedAnswers, optionId]);
    } else {
      setSelectedAnswers(selectedAnswers.filter((id) => id !== optionId));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...reorderItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setReorderItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getCorrectAnswerText = () => {
    if (check.type === "single") {
      return check.options.find((o) => o.isCorrect)?.text || "";
    }
    if (check.type === "multiple") {
      return check.options
        .filter((o) => o.isCorrect)
        .map((o) => o.text)
        .join(", ");
    }
    return check.options.map((o) => o.text).join(" → ");
  };

  const checkAnswer = () => {
    let correct = false;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (check.type === "single") {
      const correctOption = check.options.find((o) => o.isCorrect);
      correct = selectedAnswers[0] === correctOption?.id;
    } else if (check.type === "multiple") {
      const correctIds = check.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id)
        .sort();
      const selectedSorted = [...selectedAnswers].sort();
      correct =
        correctIds.length === selectedSorted.length &&
        correctIds.every((id, i) => id === selectedSorted[i]);
    } else if (check.type === "reorder") {
      correct = reorderItems.every((item, index) => item.id === check.options[index].id);
    }

    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      onComplete(true);
    } else if (newAttempts >= 2) {
      // Failed both attempts
      onComplete(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers([]);
    setSubmitted(false);
    setIsCorrect(false);
    if (check.type === "reorder") {
      const shuffled = [...check.options].sort(() => Math.random() - 0.5);
      setReorderItems(shuffled);
    }
  };

  const isMaxAttempts = attempts >= 2;
  const showCorrectAnswer = submitted && !isCorrect && isMaxAttempts;
  const canRetry = submitted && !isCorrect && !isMaxAttempts;

  const canSubmit =
    check.type === "reorder" ||
    (check.type === "single" && selectedAnswers.length === 1) ||
    (check.type === "multiple" && selectedAnswers.length > 0);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <span className="text-primary">Knowledge Check</span>
          {attempts > 0 && !isCorrect && !isMaxAttempts && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              Attempt {attempts} of 2
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
        <p className="font-medium text-sm md:text-base text-foreground">{check.question}</p>

        {check.type === "single" && (
          <RadioGroup
            value={selectedAnswers[0] || ""}
            onValueChange={handleSingleSelect}
            className="space-y-2"
          >
            {check.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              const showOptionCorrect = submitted && option.isCorrect && (isCorrect || showCorrectAnswer);
              const showOptionIncorrect = submitted && isSelected && !option.isCorrect;

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 md:p-3 rounded-lg border transition-colors min-h-[44px]",
                    !submitted && "border-border bg-background hover:bg-muted/50",
                    !submitted && isSelected && "border-primary/50 bg-primary/5",
                    showOptionCorrect && "bg-green-500/10 border-green-500/50",
                    showOptionIncorrect && "bg-red-500/10 border-red-500/50",
                    submitted && !showOptionCorrect && !showOptionIncorrect && "border-border bg-background opacity-60"
                  )}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={submitted}
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer text-foreground"
                  >
                    {option.text}
                  </Label>
                  {showOptionCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {showOptionIncorrect && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </RadioGroup>
        )}

        {check.type === "multiple" && (
          <div className="space-y-2">
            {check.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              const showOptionCorrect = submitted && option.isCorrect && (isCorrect || showCorrectAnswer);
              const showOptionIncorrect = submitted && isSelected && !option.isCorrect;

              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors min-h-[44px]",
                    !submitted && !isSelected && "border-border bg-background hover:bg-muted/50",
                    !submitted && isSelected && "border-primary/50 bg-primary/5",
                    showOptionCorrect && "bg-green-500/10 border-green-500/50",
                    showOptionIncorrect && "bg-red-500/10 border-red-500/50",
                    submitted && !showOptionCorrect && !showOptionIncorrect && "border-border bg-background opacity-60"
                  )}
                >
                  <Checkbox
                    id={option.id}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleMultipleSelect(option.id, checked as boolean)
                    }
                    disabled={submitted}
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer text-foreground"
                  >
                    {option.text}
                  </Label>
                  {showOptionCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {showOptionIncorrect && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {check.type === "reorder" && (
          <div className="space-y-2">
            {reorderItems.map((item, index) => (
              <div
                key={item.id}
                draggable={!submitted}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  !submitted && "cursor-grab hover:bg-muted/50",
                  submitted && item.id === check.options[index].id && "bg-green-500/10 border-green-500/50",
                  submitted && item.id !== check.options[index].id && "bg-red-500/10 border-red-500/50",
                  draggedIndex === index && "opacity-50"
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <span className="text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feedback area */}
        {submitted && isCorrect && (
          <div className="p-4 rounded-lg bg-green-500/10 flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5 animate-scale-in" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                Correct!
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                {check.feedback.correct}
              </p>
            </div>
          </div>
        )}

        {submitted && !isCorrect && !isMaxAttempts && (
          <div className="p-4 rounded-lg bg-amber-500/10 flex items-start gap-3 animate-fade-in">
            <XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                Not quite.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {check.feedback.incorrect} You have one more attempt.
              </p>
            </div>
          </div>
        )}

        {submitted && !isCorrect && isMaxAttempts && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-4 rounded-lg bg-red-500/10 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  Incorrect
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {check.feedback.incorrect}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  The correct answer:
                </p>
                <p className="text-sm text-muted-foreground">
                  {getCorrectAnswerText()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {check.feedback.correct}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {canRetry && (
          <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}

        {!submitted && (
          <Button onClick={checkAnswer} disabled={!canSubmit} className="w-full">
            Check Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
