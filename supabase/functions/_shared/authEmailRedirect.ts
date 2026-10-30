// Keep the managed verification endpoint and token intact; normalize only its return address.
export function authEmailRedirect(verificationUrl: string, recovery = false): string {
  const url = new URL(verificationUrl);
  if (url.searchParams.has("redirect_to")) {
    url.searchParams.set("redirect_to", `https://automotivesalespro.com/auth${recovery ? "?type=recovery" : ""}`);
  }
  return url.toString();
}