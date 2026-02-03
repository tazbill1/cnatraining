import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIMEOUT_MS = 5000;

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Safety timeout - show manual navigation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true);
      }
    }, TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        
        {showTimeout && (
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
