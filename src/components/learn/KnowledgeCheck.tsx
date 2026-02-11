import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, GripVertical } from "lucide-react";
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

  // Reset state whenever the check changes (e.g., navigating between sections)
  useEffect(() => {
    setSelectedAnswers([]);
    setSubmitted(false);
    setIsCorrect(false);
    setDraggedIndex(null);
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

  const checkAnswer = () => {
    let correct = false;

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
    onComplete(correct);
  };

  const canSubmit =
    check.type === "reorder" ||
    (check.type === "single" && selectedAnswers.length === 1) ||
    (check.type === "multiple" && selectedAnswers.length > 0);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-primary">Knowledge Check</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-foreground">{check.question}</p>

        {check.type === "single" && (
          <RadioGroup
            value={selectedAnswers[0] || ""}
            onValueChange={handleSingleSelect}
            className="space-y-2"
          >
            {check.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              // Only show correct/incorrect AFTER user submits
              const showCorrect = submitted && option.isCorrect;
              const showIncorrect = submitted && isSelected && !option.isCorrect;
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                    // Before submission: all options look the same (neutral)
                    !submitted && "border-border bg-background hover:bg-muted/50",
                    // Selected state before submission - subtle highlight only
                    !submitted && isSelected && "border-primary/50 bg-primary/5",
                    // ONLY AFTER SUBMISSION: show correct answer in green
                    showCorrect && "bg-green-500/10 border-green-500/50",
                    // ONLY AFTER SUBMISSION: show incorrect selection in red
                    showIncorrect && "bg-red-500/10 border-red-500/50",
                    // ONLY AFTER SUBMISSION: dim unselected wrong answers
                    submitted && !showCorrect && !showIncorrect && "border-border bg-background opacity-60"
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
                </div>
              );
            })}
          </RadioGroup>
        )}

        {check.type === "multiple" && (
          <div className="space-y-2">
            {check.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              const showCorrect = submitted && option.isCorrect;
              const showIncorrect = submitted && isSelected && !option.isCorrect;
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                    // Default neutral state
                    !submitted && !isSelected && "border-border bg-background hover:bg-muted/50",
                    // Selected but not submitted
                    !submitted && isSelected && "border-primary/50 bg-primary/5",
                    // After submission - correct answer
                    showCorrect && "bg-green-500/10 border-green-500/50",
                    // After submission - incorrect selection
                    showIncorrect && "bg-red-500/10 border-red-500/50",
                    // After submission - not selected and not correct (neutral)
                    submitted && !showCorrect && !showIncorrect && "border-border bg-background opacity-60"
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

        {submitted && (
          <div
            className={cn(
              "p-4 rounded-lg flex items-start gap-3",
              isCorrect ? "bg-green-500/10" : "bg-amber-500/10"
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <p className={cn("text-sm", isCorrect ? "text-green-700" : "text-amber-700")}>
              {isCorrect ? check.feedback.correct : check.feedback.incorrect}
            </p>
          </div>
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
