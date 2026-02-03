import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOADER_DELAY_MS = 150;
const TIMEOUT_MS = 5000;

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, error } = useAuth();
  const [showLoader, setShowLoader] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);

  // Delay showing loader to prevent flash for fast auth checks
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (isLoading) {
        setShowLoader(true);
      }
    }, LOADER_DELAY_MS);

    return () => clearTimeout(loaderTimer);
  }, [isLoading]);

  // Safety timeout - show manual navigation after 5 seconds
  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true);
      }
    }, TIMEOUT_MS);

    return () => clearTimeout(timeoutTimer);
  }, [isLoading]);

  // Hide timeout message when auth resolves
  useEffect(() => {
    if (!isLoading) {
      setShowTimeout(false);
      setShowLoader(false);
    }
  }, [isLoading]);

  // Redirect logic - navigate is stable, excluded from deps intentionally
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4 max-w-md">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <h2 className="text-lg font-semibold">Authentication Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="default">
            <Link to="/auth">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fast auth - no loader needed
  if (!showLoader && isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  // Show loader only after delay
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        {showLoader && isLoading && (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        )}
        
        {showTimeout && isLoading && (
          <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Taking longer than expected...</span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Go to Login</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
