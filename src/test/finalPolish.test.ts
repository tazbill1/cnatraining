import { describe, expect, it } from "vitest";
import { displayUserName } from "@/lib/userDisplay";
import { isActiveInLastWeek } from "@/lib/teamActivity";
import { AUTH_EMAIL_REDIRECT, googleDestination, googleCallback, isRecoveryLink } from "@/lib/authLinks";
describe("final polish rules", () => {
  it("uses email prefix for Unknown users", () => expect(displayUserName("Unknown", "derek@example.com")).toBe("derek"));
  it("uses Invited user without a name or email", () => expect(displayUserName(null, null)).toBe("Invited user"));
  it("keeps a real name", () => expect(displayUserName("Derek Mulvey", "derek@example.com")).toBe("Derek Mulvey"));
  it("counts exactly seven days as active but not 25 days", () => {
    const now = Date.parse("2026-10-30T16:04:00Z");
    expect(isActiveInLastWeek("2026-10-23T16:04:00Z", now)).toBe(true);
    expect(isActiveInLastWeek("2026-10-23T16:03:59Z", now)).toBe(false);
    expect(isActiveInLastWeek("2026-10-05T16:04:00Z", now)).toBe(false);
    expect(isActiveInLastWeek(null, now)).toBe(false);
  });
  it("uses the owned domain for email links", () => expect(AUTH_EMAIL_REDIRECT).toBe("https://automotivesalespro.com/auth"));
  it("lands Google users on dashboard through a public callback", () => {
    expect(googleDestination("https://automotivesalespro.com")).toBe("https://automotivesalespro.com/dashboard");
    expect(googleCallback("https://automotivesalespro.com")).toBe("https://automotivesalespro.com/auth");
  });
  it("recognizes recovery links arriving on auth", () => {
    expect(isRecoveryLink(new URL("https://automotivesalespro.com/auth#type=recovery&access_token=test"))).toBe(true);
    expect(isRecoveryLink(new URL("https://automotivesalespro.com/auth?type=recovery&code=test"))).toBe(true);
    expect(isRecoveryLink(new URL("https://automotivesalespro.com/auth?code=test"))).toBe(false);
  });
});