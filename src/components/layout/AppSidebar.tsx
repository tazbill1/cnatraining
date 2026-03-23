import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, TrendingUp, Settings, Users, LogOut, GraduationCap, Wrench, History, Shield, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import { cn } from "@/lib/utils";
import werkandmeLogo from "@/assets/werkandme-logo.png";
import { DealershipSwitcher } from "./DealershipSwitcher";

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", featureKey: null },
  { icon: GraduationCap, label: "Learn", path: "/learn", featureKey: null },
  { icon: MessageSquare, label: "Practice", path: "/scenarios", featureKey: null },
  { icon: Wrench, label: "Toolbox", path: "/toolbox", featureKey: null },
  { icon: TrendingUp, label: "Training Progress", path: "/progress", featureKey: null },
  { icon: History, label: "Session History", path: "/history", featureKey: null },
  { icon: Award, label: "Certificates", path: "/certificates", featureKey: "certificates_enabled" as const },
  { icon: Settings, label: "Settings", path: "/settings", featureKey: null },
];

const managerItems = [
  { icon: Users, label: "Team", path: "/team" },
];

const adminItems = [
  { icon: Shield, label: "Admin", path: "/admin" },
];

export function AppSidebar() {
  const { profile, isManager, isSuperAdmin, signOut } = useAuth();
  const { settings } = useDealershipSettings();
  const { previewDealership, selectedDealership } = useDealershipContext();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const hasDealershipLogo = !!(settings?.logo_url?.trim());
  const activeDealershipName =
    settings?.dealership_tagline ||
    previewDealership?.name ||
    selectedDealership?.name ||
    profile?.dealership_name ||
    "Dealership";

  const navItems = baseNavItems.filter(item => {
    if (!item.featureKey) return true;
    if (!settings) return true; // default: show all
    return (settings as any)[item.featureKey] !== false;
  });

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-2">
          {hasDealershipLogo ? (
            <>
              <img
                src={settings!.logo_url!}
                  alt={activeDealershipName}
                className="h-12 w-auto max-w-[180px] object-contain"
              />
              <div className="flex items-center gap-1.5 opacity-50">
                <span className="text-[10px] text-sidebar-foreground/50">powered by</span>
                <img
                  src={werkandmeLogo}
                  alt="Werkandme"
                  className="h-4 w-auto"
                />
              </div>
            </>
          ) : (
            <img
              src={werkandmeLogo}
              alt="Werkandme"
              className="h-10 w-auto"
            />
          )}
        </div>
      </div>

      {/* Dealership Switcher (super admin only) */}
      <DealershipSwitcher />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {isManager && (
          <>
            <div className="pt-4 pb-2 px-4">
              <span className="text-xs uppercase tracking-wider text-sidebar-foreground/40">
                Manager
              </span>
            </div>
            {managerItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        {isSuperAdmin && (
          <>
            <div className="pt-4 pb-2 px-4">
              <span className="text-xs uppercase tracking-wider text-sidebar-foreground/40">
                Admin
              </span>
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-primary">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
                {activeDealershipName}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
