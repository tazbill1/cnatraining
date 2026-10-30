export function canAccessRestrictedRoute(section: "team" | "admin", roles: { isManager: boolean; isSuperAdmin: boolean }) {
  // This app's administrator role is super_admin; manager is dealership-scoped.
  return roles.isSuperAdmin || (section === "team" && roles.isManager);
}