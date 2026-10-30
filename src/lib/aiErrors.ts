export class AIRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AIRequestError";
  }
}

export async function aiResponseError(response: Response, fallback: string) {
  const body: unknown = await response.clone().json().catch(() => null);
  const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
    ? body.error : fallback;
  return new AIRequestError(message, response.status);
}

export async function aiInvokeError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "context" in error && error.context instanceof Response) {
    return aiResponseError(error.context, fallback);
  }
  return error instanceof AIRequestError ? error : new Error(fallback);
}