import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Profile,
  fetchUserProfile,
  signInWithPassword,
  signUpWithEmail,
  signOutUser,
} from "@/lib/authOperations";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isManager: boolean;
  isSuperAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAuthState = () => {
    setProfile(null);
    setIsManager(false);
    setIsSuperAdmin(false);
  };

  const loadProfile = async (userId: string) => {
    const result = await fetchUserProfile(userId);
    setProfile(result.profile);
    setIsManager(result.isManager);
    setIsSuperAdmin(result.isSuperAdmin);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let profileFetchedForUser: string | null = null;

    const handleProfile = (userId: string) => {
      void loadProfile(userId).finally(() => {
        if (isMounted) setIsLoading(false);
      });
    };

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return;

      if (sessionError) {
        setError(sessionError.message);
        clearAuthState();
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const initialSession = data.session;
      setError(null);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        profileFetchedForUser = initialSession.user.id;
        handleProfile(initialSession.user.id);
      } else {
        clearAuthState();
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;

        setError(null);
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          if (profileFetchedForUser === nextSession.user.id) {
            setIsLoading(false);
            return;
          }
          profileFetchedForUser = nextSession.user.id;
          setIsLoading(true);
          setTimeout(() => handleProfile(nextSession.user.id), 0);
        } else {
          profileFetchedForUser = null;
          clearAuthState();
          setError(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithPassword(email, password);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    return signUpWithEmail(email, password, fullName);
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    clearAuthState();
  };

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, isLoading, isManager, isSuperAdmin,
        error, signIn, signUp, signOut, refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
