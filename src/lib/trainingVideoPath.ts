/** Accept stable bucket references and this project's old public/signed URLs. */
export function trainingVideoPath(source: string, storageOrigin: string): string | null {
  let path: string;
  if (source.startsWith("training-videos/")) {
    path = source.slice("training-videos/".length);
  } else {
    try {
      const url = new URL(source);
      if (url.origin !== new URL(storageOrigin).origin) return null;
      const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/training-videos\/(.+)$/);
      if (!match) return null;
      path = decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }
  if (!path || path.split("/").some(part => !part || part === "." || part === "..") || path.includes("\\")) return null;
  return path;
}