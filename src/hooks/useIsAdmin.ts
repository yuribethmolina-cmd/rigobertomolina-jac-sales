/**
 * Devuelve true solo cuando la cuenta conectada tiene permiso de
 * administrador. Se apoya en la tabla de roles, nunca en almacenamiento local.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useIsAdmin = (): boolean => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!active) return;
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!error && !!data);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    check();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
};
