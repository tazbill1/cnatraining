import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { canAccessRestrictedRoute } from "@/lib/routeAccess";

export function RoleGuard({ section }: { section: "team" | "admin" }) {
  const { user, isLoading, isManager, isSuperAdmin } = useAuth();
  const allowed = canAccessRestrictedRoute(section, { isManager, isSuperAdmin });
  useEffect(() => {
    if (!isLoading && user && !allowed) toast.error("You don't have permission to view this page.", { id: "restricted-page" });
  }, [isLoading, user, allowed]);
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return allowed ? <Outlet /> : <Navigate to="/dashboard" replace />;
}