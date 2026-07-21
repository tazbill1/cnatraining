import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TrainingInterface } from "@/components/training/TrainingInterface";
import {
  getScenarioById,
  Scenario,
  normalizeScenarioCategory,
  normalizeBuyerType,
} from "@/lib/scenarios";
import { supabase } from "@/integrations/supabase/client";

export default function Training() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scenarioId) {
      navigate("/scenarios");
      return;
    }

    if (scenarioId.startsWith("custom-")) {
      const uuid = scenarioId.replace("custom-", "");
      const fetchCustom = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("custom_scenarios")
          .select("*")
          .eq("id", uuid)
          .single();

        if (error || !data) {
          navigate("/scenarios");
          return;
        }

        const row = data;
        // Fall back to raw category (e.g. "showroom", "internet") so scenarios
        // whose category isn't in scenarioCategories still load instead of bouncing.
        const category = (normalizeScenarioCategory(row.category) || row.category) as Scenario["category"];

        if (!category) {
          navigate("/scenarios");
          return;
        }

        const isObjectionHandling = category === "objection-handling";
        setScenario({
          id: `custom-${row.id}`,
          name: row.name,
          description: row.description || "",
          personality: row.personality || "",
          difficulty: row.difficulty as Scenario["difficulty"],
          estimatedTime: row.estimated_time || "8-12 min",
          icon: Users,
          systemPrompt: row.system_prompt,
          openingLine: row.opening_line,
          category,
          buyerType: normalizeBuyerType(row.buyer_type),
          customerName: row.customer_name,
          tradeVehicle: row.trade_vehicle || undefined,
          tradeValue: row.trade_value || undefined,
          customerOpens: isObjectionHandling,
        });
        setLoading(false);
      };
      fetchCustom();
    } else {
      const found = getScenarioById(scenarioId);
      if (!found) {
        navigate("/scenarios");
        return;
      }
      setScenario(found);
      setLoading(false);
    }
  }, [scenarioId, navigate]);

  const handleComplete = (results: any) => {
    navigate("/results", { state: { results } });
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AuthGuard>
    );
  }

  if (!scenario) return null;

  return (
    <AuthGuard>
      <TrainingInterface scenario={scenario} onComplete={handleComplete} />
    </AuthGuard>
  );
}
