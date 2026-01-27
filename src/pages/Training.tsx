import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TrainingInterface } from "@/components/training/TrainingInterface";
import { getScenarioById } from "@/lib/scenarios";

export default function Training() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;

  if (!scenario) {
    navigate("/scenarios");
    return null;
  }

  const handleComplete = (results: any) => {
    // Navigate to results with session data
    navigate("/results", { state: { results } });
  };

  return (
    <AuthGuard>
      <TrainingInterface scenario={scenario} onComplete={handleComplete} />
    </AuthGuard>
  );
}
