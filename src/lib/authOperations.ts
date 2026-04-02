import { supabase } from "@/integrations/supabase/client";

export async function signInWithPassword(email: string, password: string) {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Update last_active_at on successful login
  if (!error && data.user) {
    supabase
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("user_id", data.user.id)
      .then(() => {});
  }

  return { error };
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const redirectUrl = `${window.location.origin}/`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  });
  return { error };
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  dealership_name: string | null;
  dealership_id: string | null;
  voice_enabled: boolean;
  difficulty_default: string;
  coaching_intensity: string;
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let profile: Profile | null = null;
  if (!error && data) {
    profile = data as Profile;
  }

  // Check roles
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const isManager = roleData?.some((r) => r.role === "manager") ?? false;
  const isSuperAdmin = roleData?.some((r) => r.role === "super_admin") ?? false;

  return { profile, isManager, isSuperAdmin };
}
