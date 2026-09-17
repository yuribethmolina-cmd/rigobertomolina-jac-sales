import { useEffect, useState } from "react";
import { loadActiveCatalogs } from "@/data/catalogStore";

/**
 * Carga los catálogos ACTIVOS antes de pintar el sitio, para que ninguna
 * pantalla muestre montos de un catálogo anterior. Si la carga falla,
 * el sitio arranca igual con los datos de respaldo.
 */
const CatalogGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadActiveCatalogs().finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
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
