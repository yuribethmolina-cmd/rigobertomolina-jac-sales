/**
 * Portada del panel privado (solo administradores).
 * Reúne los accesos a las secciones administrativas del sitio.
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Users, BarChart3, Home } from "lucide-react";

const sections = [
  {
    to: "/admin/catalogos",
    icon: FolderOpen,
    title: "Catálogos",
    description: "Subir y publicar los catálogos de precios de cada plan.",
  },
  {
    to: "/admin/documentos",
    icon: FileText,
    title: "Documentos de clientes",
    description: "Ver y descargar los documentos que envían los clientes.",
  },
  {
    to: "/admin/crm",
    icon: Users,
    title: "Contactos (CRM)",
    description: "Todos los contactos del sitio, sus estados y notas privadas.",
  },
  {
    to: "/estadisticas",
    icon: BarChart3,
    title: "Estadísticas",
    description: "Visitas, contactos y exportación de datos.",
  },
];

const AdminHome = () => (
  <div className="min-h-screen bg-background px-4 py-10">
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Panel de administración</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <Home className="mr-1 h-4 w-4" /> Volver al sitio
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <s.icon className="mb-3 h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default AdminHome;
