import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { checkPrerequisitesMet, getModuleById } from "@/lib/modules";
import { toast } from "sonner";

/**
 * Hook that checks if the current user has met prerequisites for a module.
 * Redirects to /learn with a toast if prerequisites aren't met.
 * Returns { isChecking, isAllowed } so the page can show a loader or render content.
 */
export function useModuleAccessGuard(moduleId: string | undefined) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!moduleId || !user) {
      setIsChecking(false);
      return;
    }

    const module = getModuleById(moduleId);

    // Unknown module or always accessible — allow
    if (!module || module.alwaysAccessible || module.prerequisiteIds.length === 0) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    const checkAccess = async () => {
      try {
        const { data } = await supabase
          .from("module_completions")
          .select("module_id")
          .eq("user_id", user.id);

        const completedIds = data?.map((r) => r.module_id) || [];
        const allowed = checkPrerequisitesMet(moduleId, completedIds);

        if (!allowed) {
          toast.error("Complete the prerequisites first to unlock this module.");
          navigate("/learn", { replace: true });
          return;
        }

        setIsAllowed(true);
      } catch {
        // On error, allow access (fail open for usability)
        setIsAllowed(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [moduleId, user, navigate]);

  return { isChecking, isAllowed };
}
