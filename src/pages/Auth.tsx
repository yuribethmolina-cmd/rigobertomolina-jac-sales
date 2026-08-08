import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/estadisticas", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/estadisticas", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/estadisticas` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Revisa tu correo para confirmar la cuenta.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Acceso privado · Rigoberto Molina</title>
        <meta name="description" content="Inicio de sesión para el panel privado de estadísticas." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="section-container py-16 max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <h1 className="font-heading text-3xl font-bold mt-6 flex items-center gap-3">
          <Lock className="text-primary" /> Acceso privado
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === "signin"
            ? "Inicia sesión para ver las estadísticas de contacto."
            : "Crea la cuenta de administrador del panel."}
        </p>

        <form onSubmit={handleSubmit} className="card-glow p-6 mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-secondary border-2 border-border px-4 py-3 text-foreground focus:border-primary outline-none"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-secondary border-2 border-border px-4 py-3 text-foreground focus:border-primary outline-none"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground font-heading font-bold py-3 disabled:opacity-60"
          >
            {loading ? "Procesando..." : mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "signin" ? "No tengo cuenta todavía" : "Ya tengo cuenta"}
          </button>
        </form>
      </main>
    </>
  );
};

export default Auth;
