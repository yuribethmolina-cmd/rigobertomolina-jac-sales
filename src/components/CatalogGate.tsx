import { useEffect, useState } from "react";
import { loadActiveCatalogs } from "@/data/catalogStore";

/** Tiempo máximo de espera antes de mostrar el sitio con los datos de respaldo. */
const MAX_WAIT_MS = 2500;

/**
 * Intenta cargar los catálogos ACTIVOS antes de pintar el sitio. Si la base
 * tarda o no responde, el sitio se muestra igual con los datos de respaldo y
 * se refresca solo cuando la carga termine.
 */
const CatalogGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) setReady(true);
    }, MAX_WAIT_MS);

    loadActiveCatalogs().finally(() => {
      if (active) {
        window.clearTimeout(timer);
        setReady(true);
      }
    });

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default CatalogGate;
