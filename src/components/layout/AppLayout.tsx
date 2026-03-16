import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { settings } = useDealershipSettings();

  // Set --dealership-color CSS variable for downstream use
  const dealershipStyle = settings?.primary_color
    ? { "--dealership-color": settings.primary_color } as React.CSSProperties
    : undefined;

  return (
    <div className="flex min-h-screen w-full bg-background" style={dealershipStyle}>
      {/* Desktop: Fixed sidebar */}
      {!isMobile && <AppSidebar />}
      
      {/* Mobile: Sheet-based nav */}
      {isMobile && (
        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      )}
      
      <main className="flex-1 overflow-auto">
        {/* Mobile header with menu trigger */}
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="font-semibold text-lg">CNA Training</span>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
