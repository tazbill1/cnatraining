import { describe, it, expect } from "vitest";
import { SIGNED_URL_STALE_MS, SIGNED_URL_TTL_SECONDS, trainingVideoPoster } from "@/lib/trainingVideoUrl";
describe("training video url cache", () => {
  it("reuses signed URLs only while they are still valid", () => {
    expect(SIGNED_URL_STALE_MS).toBeLessThan(SIGNED_URL_TTL_SECONDS * 1000);
  });
  it("finds the poster for a stored video", () => {
    expect(trainingVideoPoster("training-videos/global/phone-skills-1.mp4")).toBeTruthy();
    expect(trainingVideoPoster("training-videos/global/unknown.mp4")).toBeUndefined();
  });
});
