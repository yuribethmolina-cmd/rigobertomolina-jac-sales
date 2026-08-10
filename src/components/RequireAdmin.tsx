import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: React.ReactNode;
}

const RequireAdmin = ({ children }: Props) => {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied" | "anon">("loading");

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!active) return;
      if (!user) {
        setStatus("anon");
        return;
      }
      const isAdmin = async () => {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        return !error && !!data;
      };

      const allowed = await isAdmin();

      if (!active) return;
      setStatus(allowed ? "allowed" : "denied");

    };

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    check();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return <main className="section-container py-24 text-muted-foreground">Verificando acceso...</main>;
  }

  if (status === "anon") {
    return <Navigate to="/acceso" replace />;
  }

  if (status === "denied") {
    return (
      <main className="section-container py-24 space-y-4">
        <h1 className="font-heading text-2xl font-bold">Sin permiso</h1>
        <p className="text-muted-foreground">Esta cuenta no tiene acceso al panel de estadísticas.</p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-lg bg-primary text-primary-foreground font-heading font-bold px-5 py-2"
        >
          Cerrar sesión
        </button>
      </main>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
