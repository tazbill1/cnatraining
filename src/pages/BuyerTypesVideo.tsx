import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/learn/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function BuyerTypesVideo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    const getVideoUrl = async () => {
      const { data } = await supabase.storage
        .from("training-videos")
        .createSignedUrl("The_Trust-Building_Script.mp4", 3600);
      if (data?.signedUrl) {
        setVideoUrl(data.signedUrl);
      }
    };
    getVideoUrl();
  }, []);

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
        setVideoWatched(true);
      }
    };
    checkCompletion();
  }, [user]);

  const handleVideoComplete = () => {
    setVideoWatched(true);
  };

  const handleMarkComplete = async () => {
    if (!user) return;
    try {
      await supabase.from("module_completions").upsert(
        { user_id: user.id, module_id: "base-statement-video" },
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
                  Module 2: The Trust-Building Script
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
                  Watch this video to understand how building trust from the first interaction sets the foundation for every buyer conversation.
                </p>
              </div>

              {videoUrl ? (
                <VideoPlayer
                  videoUrl={videoUrl}
                  title="The Trust-Building Script"
                  onComplete={handleVideoComplete}
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Loading video...</p>
                </div>
              )}

              {videoWatched && (
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Video watched</span>
                  </div>
                  {!alreadyCompleted ? (
                    <Button size="lg" onClick={handleMarkComplete} className="px-8">
                      Complete & Unlock Buyer Types Module
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
