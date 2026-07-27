import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Car, CheckCircle2 } from "lucide-react";

interface TopicStat {
  topic: string;
  correct: number;
  total: number;
}

const TOPIC_LABELS: Record<string, string> = {
  awd: "All-Wheel Drive",
  cargo: "Cargo & Storage",
  capability: "Capability & Terrain",
  drivetrain: "Drivetrain",
  engine: "Engines",
  fuel: "Fuel Economy",
  interior: "Interior",
  offroad: "Off-Road",
  ownership: "Ownership & Service",
  positioning: "Positioning",
  power: "Power",
  process: "Sales Process",
  ride: "Ride & Handling",
  safety: "Safety & EyeSight",
  seating: "Seating",
  size: "Sizing & Fit",
  technology: "Technology",
  towing: "Towing",
  transmission: "Transmission",
  trims: "Trim Levels",
  clearance: "Ground Clearance",
};

const label = (t: string) => TOPIC_LABELS[t] || t.replace(/_/g, " ");

const PRODUCT_DRILLS = ["product-quiz", "wrong-claim", "comparison"];

/** Shows which product-knowledge topics the user misses most, based on recent game answers. */
export function WeakTopics({ userId, limit = 5 }: { userId: string | null; limit?: number }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TopicStat[]>([]);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [answered, setAnswered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("drill_question_attempts")
        .select("topic, vehicle, is_correct, drill_key")
        .eq("user_id", userId)
        .in("drill_key", PRODUCT_DRILLS)
        .order("created_at", { ascending: false })
        .limit(300);

      if (cancelled) return;
      if (error || !data) {
        setStats([]);
        setIsLoading(false);
        return;
      }

      const byTopic = new Map<string, TopicStat>();
      let vehicleLabel: string | null = null;
      data.forEach((row) => {
        if (row.vehicle && !vehicleLabel) vehicleLabel = row.vehicle;
        const topic = row.topic || "general";
        const entry = byTopic.get(topic) || { topic, correct: 0, total: 0 };
        entry.total += 1;
        if (row.is_correct) entry.correct += 1;
        byTopic.set(topic, entry);
      });

      setVehicle(vehicleLabel);
      setAnswered(data.length);
      setStats(
        Array.from(byTopic.values())
          .filter((s) => s.total >= 2)
          .sort((a, b) => a.correct / a.total - b.correct / b.total)
      );
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="card-premium p-6">
        <div className="h-4 w-40 bg-muted rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const weak = stats.filter((s) => s.correct / s.total < 1).slice(0, limit);
  const strong = stats.filter((s) => s.correct / s.total === 1).length;

  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground leading-tight">Product Knowledge Gaps</h2>
            <p className="text-xs text-muted-foreground">
              {vehicle ? `${vehicle} · ` : ""}
              {answered} recent answers
            </p>
          </div>
        </div>
        {vehicle && (
          <Badge variant="outline" className="text-xs shrink-0">
            {vehicle}
          </Badge>
        )}
      </div>

      {answered === 0 ? (
        <div className="text-sm text-muted-foreground">
          Play a product game and your weakest topics will show up here.
          <Button size="sm" className="mt-3 block" onClick={() => navigate("/drills/product-quiz")}>
            Start Timed Product Quiz
          </Button>
        </div>
      ) : weak.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-success" />
          No weak topics yet — you're answering everything correctly so far.
        </div>
      ) : (
        <div className="space-y-4">
          {weak.map((s) => {
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <div key={s.topic}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium flex items-center gap-1.5">
                    {pct < 50 && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                    {label(s.topic)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {s.correct}/{s.total} · {pct}%
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {strong} topic{strong === 1 ? "" : "s"} mastered
            </span>
            <Button size="sm" variant="outline" onClick={() => navigate("/drills/product-quiz")}>
              Practice again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
