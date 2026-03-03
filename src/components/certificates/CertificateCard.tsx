import { useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import werkandmeLogo from "@/assets/werkandme-logo.png";

interface CertificateCardProps {
  moduleName: string;
  userName: string;
  completionDate: string;
  score: number | null;
  compact?: boolean;
}

export function CertificateCard({ moduleName, userName, completionDate, score, compact }: CertificateCardProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `certificate-${moduleName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate certificate image:", err);
    }
  };

  const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (compact) {
    return (
      <button
        onClick={handleDownload}
        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 15l-3 3m0 0l-3-3m3 3V9m12 3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 3h6M12 3v3" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-xs font-medium text-center leading-tight line-clamp-2">{moduleName.replace(/^Module \d+: /, "")}</span>
        {score !== null && (
          <span className="text-[10px] text-muted-foreground">{score}%</span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={certRef}
        className="relative bg-card border-2 border-border rounded-xl p-8 md:p-12 overflow-hidden"
        style={{ aspectRatio: "1.414" }}
      >
        {/* Subtle corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/20 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-primary/20 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-primary/20 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/20 rounded-br-xl" />

        <div className="flex flex-col items-center justify-between h-full text-center">
          {/* Top: Logo */}
          <div>
            <img src={werkandmeLogo} alt="WerkandMe" className="h-8 mx-auto mb-2" />
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">
              Certificate of Completion
            </p>
          </div>

          {/* Middle: Details */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {userName}
            </p>
            <p className="text-sm text-muted-foreground">has successfully completed</p>
            <p className="text-lg md:text-xl font-semibold text-primary">
              {moduleName}
            </p>
            {score !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Score:</span>
                <span className="text-lg font-bold text-foreground">{score}%</span>
              </div>
            )}
          </div>

          {/* Bottom: Date */}
          <div>
            <div className="w-32 h-px bg-border mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      </div>

      <Button onClick={handleDownload} variant="outline" size="sm" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download Certificate
      </Button>
    </div>
  );
}
