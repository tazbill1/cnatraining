import { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onComplete?: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({
  videoUrl,
  title,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleComplete = useCallback(() => {
    if (!hasCompleted && onComplete) {
      setHasCompleted(true);
      onComplete();
    }
  }, [hasCompleted, onComplete]);

  // Track 90% completion
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasCompleted) return;
    if (video.duration > 0 && video.currentTime / video.duration >= 0.9) {
      handleComplete();
    }
  }, [hasCompleted, handleComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(
            video.duration,
            video.currentTime + 5
          );
          break;
        case "m":
        case "M":
          e.preventDefault();
          video.muted = !video.muted;
          setIsMuted(video.muted);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const setSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  if (hasError) {
    return (
      <Card className="border border-border shadow-md">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm font-medium">Failed to load video</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={containerRef}
      className="border border-border shadow-md overflow-hidden"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AspectRatio ratio={16 / 9} className="bg-foreground/5">
          {isLoading && (
            <Skeleton className="absolute inset-0 z-10 rounded-none" />
          )}
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            className="h-full w-full object-contain"
            onCanPlay={() => setIsLoading(false)}
            onLoadedData={() => setIsLoading(false)}
            onError={(e) => {
              console.error("Video load error:", e);
              setIsLoading(false);
              setHasError(true);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
          />
        </AspectRatio>

        {/* Custom controls bar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/50 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <div className="ml-auto flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            {PLAYBACK_SPEEDS.map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs",
                  playbackSpeed === speed && "font-semibold"
                )}
                onClick={() => setSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
