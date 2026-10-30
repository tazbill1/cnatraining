import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { trainingVideoPath } from "@/lib/trainingVideoPath";

/** Signed URLs live 15 minutes; reuse them for 10 so playback never waits on a fresh request. */
export const SIGNED_URL_TTL_SECONDS = 900;
export const SIGNED_URL_STALE_MS = 10 * 60 * 1000;

const posters = import.meta.glob("@/assets/video-posters/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

/** Poster frame extracted from the stored video, matched by file name. */
export function trainingVideoPoster(source: string): string | undefined {
  const name = source.split("?")[0].split("/").pop()?.replace(/\.mp4$/i, "");
  if (!name) return undefined;
  const key = Object.keys(posters).find((k) => k.endsWith(`/${decodeURIComponent(name)}.jpg`));
  return key ? posters[key] : undefined;
}

export function trainingVideoUrlQuery(source: string) {
  return {
    queryKey: ["training-video-url", source] as const,
    staleTime: SIGNED_URL_STALE_MS,
    gcTime: SIGNED_URL_STALE_MS,
    retry: 1,
    queryFn: async (): Promise<string> => {
      const path = trainingVideoPath(source, import.meta.env.VITE_SUPABASE_URL);
      if (!path) return source;
      const { data, error } = await supabase.storage.from("training-videos").createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (error || !data?.signedUrl) throw error ?? new Error("No signed URL");
      return data.signedUrl;
    },
  };
}

export function prefetchTrainingVideoUrls(client: QueryClient, sources: Array<string | null | undefined>) {
  for (const s of sources) if (s) void client.prefetchQuery(trainingVideoUrlQuery(s));
}
