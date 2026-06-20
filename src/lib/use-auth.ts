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

/** Fetch user roles with a 4 s timeout so a slow query never freezes the app. */
async function fetchRoles(userId: string): Promise<AppRole[]> {
  const timeout = new Promise<AppRole[]>((resolve) =>
    setTimeout(() => resolve([]), 4000)
  );
  const query = (async () => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      return (data ?? []).map((r) => r.role as AppRole);
    } catch {
      return [] as AppRole[];
    }
  })();

  return Promise.race([query, timeout]);
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

    const applySession = async (session: Session | null) => {
      if (!session?.user) {
        if (mounted) setState({ user: null, session: null, roles: [], loading: false });
        return;
      }

      // Set user immediately (reads from cache — never hangs)
      if (mounted) {
        setState({ user: session.user, session, roles: [], loading: false });
      }

      // Load roles in the background; if slow, timeout returns []
      const roles = await fetchRoles(session.user.id);
      if (mounted) {
        setState((prev) => ({ ...prev, roles }));
      }
    };

    // getSession() reads from localStorage — instant, no network request
    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
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
