import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "vendor" | "admin";

export interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
}

export function useAuth(): AuthState & {
  isAuthenticated: boolean;
  hasRole: (r: AppRole) => boolean;
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const loadRoles = async (userId: string): Promise<AppRole[]> => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      return (data ?? []).map((r) => r.role as AppRole);
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const roles = session?.user ? await loadRoles(session.user.id) : [];
      if (!mounted) return;
      setState({ user: session?.user ?? null, session, roles, loading: false });
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const roles = session?.user ? await loadRoles(session.user.id) : [];
      if (!mounted) return;
      setState({ user: session?.user ?? null, session, roles, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.user,
    hasRole: (r) => state.roles.includes(r),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
