export function displayUserName(name?: string | null, email?: string | null): string {
  const cleaned = name?.trim();
  if (cleaned && cleaned.toLowerCase() !== "unknown") return cleaned;
  return email?.trim().split("@")[0] || "Invited user";
}