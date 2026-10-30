export const AUTH_EMAIL_REDIRECT = "https://automotivesalespro.com/auth";
export const googleDestination = (origin: string) => `${origin}/dashboard`;
export const googleCallback = (origin: string) => `${origin}/auth`;
export function isRecoveryLink(url: URL) {
  return url.searchParams.get("type") === "recovery" || new URLSearchParams(url.hash.slice(1)).get("type") === "recovery";
}