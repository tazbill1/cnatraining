import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/learn/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const VIDEO_FILES = [
  { url: "/videos/The_Base_Statement1-2.mp4", title: "The Base Statement — The Why" },
  { url: "/videos/basestatementhow.mp4", title: "The Base Statement — The How" },
];

export default function BuyerTypesVideo() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [watchedParts, setWatchedParts] = useState<boolean[]>(VIDEO_FILES.map(() => false));
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Check if already completed
  useEffect(() => {
    if (!user) return;
    const checkCompletion = async () => {
      const { data } = await supabase
        .from("module_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("module_id", "base-statement-video")
        .maybeSingle();
      if (data) {
        setAlreadyCompleted(true);
        setWatchedParts(VIDEO_FILES.map(() => true));
      }
    };
    checkCompletion();
  }, [user]);

  const handlePartComplete = (index: number) => {
    setWatchedParts((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const allWatched = watchedParts.every(Boolean);

  const handleMarkComplete = async () => {
    if (!user) return;
    try {
      await supabase.from("module_completions").upsert(
        { user_id: user.id, module_id: "base-statement-video", dealership_id: profile?.dealership_id || null },
        { onConflict: "user_id,module_id" }
      );
      toast.success("Video complete! You've unlocked the Base Statement module.");
      navigate("/learn");
    } catch {
      toast.error("Could not save progress. Please try again.");
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="h-full flex flex-col">
          <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate("/learn")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Learn
                </Button>
                <span className="text-sm text-muted-foreground">
                  Module 2: Introducing the Base Statement
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
              <div className="text-center space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  The Trust-Building Script
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Watch both parts to understand how building trust from the first interaction sets the foundation for every buyer conversation.
                </p>
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2">
                  {VIDEO_FILES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-16 rounded-full transition-colors ${
                        watchedParts[i] ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {VIDEO_FILES.map((video, index) => {
                const isUnlocked = index === 0 || watchedParts[index - 1];

                return (
                  <div key={video.url} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>Part {index + 1} of {VIDEO_FILES.length}</span>
                      {watchedParts[index] && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    {isUnlocked ? (
                      <VideoPlayer
                        videoUrl={video.url}
                        title={video.title}
                        onComplete={() => handlePartComplete(index)}
                      />
                    ) : (
                      <div className="aspect-video bg-muted/50 rounded-lg border border-border flex flex-col items-center justify-center gap-2">
                        <Lock className="w-8 h-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Watch Part {index} to unlock
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {allWatched && (
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">All parts watched</span>
                  </div>
                  {!alreadyCompleted ? (
                    <Button size="lg" onClick={handleMarkComplete} className="px-8">
                      Complete & Unlock Base Statement Module
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button size="lg" onClick={() => navigate("/learn/base-statement")}>
                        Continue to Base Statement Module
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => navigate("/learn")}>
                        Return to Learn
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
